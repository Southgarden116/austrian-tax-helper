import type { PortfolioEvent, PortfolioEventType } from "../types";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { getPdfjs } from "./pdfWorker";

// A parsed share event before ECB rates are attached. Comes from two inputs:
//   - ESPP buys ← BenefitHistory.xlsx     (sheet "ESPP", Record Type "Purchase")
//   - RSU vests ← BenefitHistory.xlsx     (sheet "Restricted Stock")
//   - Sells     ← Trade Confirmation PDFs (gross execution Price)
export interface RawPortfolioEvent {
  date: string; // YYYY-MM-DD
  type: PortfolioEventType;
  shares: number;
  pricePerShareUSD: number;
  symbol?: string;
  source: string;
  notes?: string;
}

export interface FileParseResult {
  events: RawPortfolioEvent[];
  warnings: string[];
}

const MONTHS: Record<string, string> = {
  JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
  JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
};

// Accepts the date shapes eTrade emits: "05-JUN-2024", "06/05/2024" (MM/DD/YYYY),
// "05-15-2021" (MM-DD-YYYY), ISO, Excel serial numbers, and Date.
function normalizeDate(raw: unknown): string {
  if (raw == null) return "";
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return `${raw.getUTCFullYear()}-${String(raw.getUTCMonth() + 1).padStart(2, "0")}-${String(raw.getUTCDate()).padStart(2, "0")}`;
  }
  const s = String(raw).trim();
  if (!s) return "";

  // 05-JUN-2024
  const dmy = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmy) {
    const mon = MONTHS[dmy[2].toUpperCase()];
    if (mon) return `${dmy[3]}-${mon}-${dmy[1].padStart(2, "0")}`;
  }

  // MM/DD/YYYY
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;

  // MM-DD-YYYY
  const usDash = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (usDash)
    return `${usDash[3]}-${usDash[1].padStart(2, "0")}-${usDash[2].padStart(2, "0")}`;

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // Excel serial date
  const num = Number(s);
  if (!isNaN(num) && num > 40000 && num < 60000) {
    const d = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime()))
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }

  return "";
}

function parseMoney(raw: unknown): number {
  if (raw == null) return NaN;
  const s = String(raw).replace(/[$,€\s]/g, "").trim();
  if (s === "" || s === "--" || s.toUpperCase() === "N/A") return NaN;
  return parseFloat(s);
}

function parseQty(raw: unknown): number {
  if (raw == null) return NaN;
  const s = String(raw).replace(/,/g, "").trim();
  if (s === "" || s === "--" || s.toUpperCase() === "N/A") return NaN;
  return parseFloat(s);
}

// ---------------------------------------------------------------------------
// BenefitHistory.xlsx → ESPP purchases + RSU vests
// ---------------------------------------------------------------------------
// One file carries both acquisition types on separate sheets: "ESPP" holds the
// ESPP purchases, "Restricted Stock" holds the RSU vest schedule. Parsing both
// here means the user only needs this single spreadsheet for all acquisitions.
type XlsxModule = typeof import("xlsx");
type Workbook = ReturnType<XlsxModule["read"]>;

export async function parseBenefitHistory(
  file: File,
): Promise<FileParseResult> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });

  const warnings: string[] = [];
  const events: RawPortfolioEvent[] = [];

  const espp = parseEsppSheet(XLSX, wb, warnings);
  events.push(...espp);

  const rsu = parseRestrictedStockSheet(XLSX, wb, warnings);
  events.push(...rsu);

  if (events.length === 0)
    warnings.push(
      "Keine ESPP-Käufe oder RSU-Vestings in BenefitHistory.xlsx gefunden.",
    );
  return { events, warnings };
}

// Sheet "ESPP" → BUY events. Cost basis under Austrian law is the fair market
// value at purchase (Purchase Date FMV), NOT the discounted price actually paid
// — the discount is taxed separately as a payroll benefit. Matches tax-etrade.
function parseEsppSheet(
  XLSX: XlsxModule,
  wb: Workbook,
  warnings: string[],
): RawPortfolioEvent[] {
  const sheetName = wb.SheetNames.find((n) => n.trim().toLowerCase() === "espp");
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    wb.Sheets[sheetName],
    { defval: "" },
  );

  const events: RawPortfolioEvent[] = [];
  for (const row of rows) {
    if (String(row["Record Type"]).trim() !== "Purchase") continue;

    const date = normalizeDate(row["Purchase Date"]);
    const shares = parseQty(row["Purchased Qty."]);
    const priceUSD = parseMoney(row["Purchase Date FMV"]);

    if (!date || !(shares > 0) || !(priceUSD > 0)) {
      warnings.push(
        `ESPP-Zeile übersprungen (Datum/Menge/Preis unvollständig): ${date || "?"}`,
      );
      continue;
    }
    events.push({
      date,
      type: "BUY",
      shares,
      pricePerShareUSD: priceUSD,
      symbol: String(row["Symbol"] ?? "").trim() || undefined,
      source: "ESPP",
      notes: "ESPP-Kauf",
    });
  }
  return events;
}

// Sheet "Restricted Stock" → VEST events. This sheet is a flattened dump where
// each record type reuses columns, so it's read positionally (by column index)
// rather than by header name. Three row kinds are correlated by grant number:
//   - "Event" / "Shares released"  → NET shares that actually enter the depot
//   - "Vest Schedule"              → vest date + GROSS vested qty (per schedule)
//   - "Tax Withholding"            → Taxable Gain for that schedule
// The FMV per share at vest (the cost basis) is not stored directly, but the
// taxable income recognised at vest equals grossVestedQty × FMV, so
//   FMV = TaxableGain ÷ grossVestedQty.
// The depot acquisition uses the NET released shares (sell-to-cover shares never
// land in the depot) at that FMV. Verified to reproduce the RSU PDFs exactly.
const RS_COL = {
  recordType: 0,
  grant: 10,
  eventDate: 21,
  eventType: 22,
  eventQty: 23,
  schedulePeriod: 24,
  scheduleVestDate: 25,
  scheduleGrossQty: 27,
  taxableGain: 39,
} as const;

function parseRestrictedStockSheet(
  XLSX: XlsxModule,
  wb: Workbook,
  warnings: string[],
): RawPortfolioEvent[] {
  const sheetName = wb.SheetNames.find(
    (n) => n.trim().toLowerCase() === "restricted stock",
  );
  if (!sheetName) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    defval: "",
  });

  // NET released shares, keyed by `${grant}|${vestDate}`.
  const released = new Map<string, number>();
  // Per-schedule vest date + GROSS vested qty, keyed by `${grant}|${period}`.
  const schedules = new Map<string, { date: string; grossQty: number }>();
  // Taxable gain, keyed by `${grant}|${period}`.
  const gains = new Map<string, number>();

  for (const row of rows) {
    const recordType = String(row[RS_COL.recordType] ?? "").trim();
    const grant = String(row[RS_COL.grant] ?? "").trim();

    if (recordType === "Event") {
      if (String(row[RS_COL.eventType] ?? "").trim() !== "Shares released")
        continue;
      const date = normalizeDate(row[RS_COL.eventDate]);
      const qty = parseQty(row[RS_COL.eventQty]);
      if (date && qty > 0) released.set(`${grant}|${date}`, qty);
    } else if (recordType === "Vest Schedule") {
      const period = String(row[RS_COL.schedulePeriod] ?? "").trim();
      const date = normalizeDate(row[RS_COL.scheduleVestDate]);
      const grossQty = parseQty(row[RS_COL.scheduleGrossQty]);
      if (period && date) schedules.set(`${grant}|${period}`, { date, grossQty });
    } else if (recordType === "Tax Withholding") {
      const period = String(row[RS_COL.schedulePeriod] ?? "").trim();
      const gain = parseMoney(row[RS_COL.taxableGain]);
      if (period && gain > 0) gains.set(`${grant}|${period}`, gain);
    }
  }

  const events: RawPortfolioEvent[] = [];
  for (const [key, schedule] of schedules) {
    const gain = gains.get(key);
    const grant = key.split("|")[0];
    // No taxable gain or no gross qty → not yet vested/released. Skip silently.
    if (gain == null || !(schedule.grossQty > 0)) continue;

    const netShares = released.get(`${grant}|${schedule.date}`);
    // Vested but nothing released into the depot (e.g. fully withheld) → no
    // acquisition. Skip silently.
    if (netShares == null || !(netShares > 0)) continue;

    events.push({
      date: schedule.date,
      type: "VEST",
      shares: netShares,
      pricePerShareUSD: gain / schedule.grossQty,
      source: "RSU",
      notes: `RSU-Vesting (BenefitHistory, Grant ${grant})`,
    });
  }

  if (schedules.size > 0 && events.length === 0)
    warnings.push(
      'Tabellenblatt "Restricted Stock" gefunden, aber keine freigegebenen RSU-Vestings ableitbar.',
    );
  return events;
}

// ---------------------------------------------------------------------------
// PDF text extraction
// ---------------------------------------------------------------------------
// Returns one joined text string per page. Reads all pages: trade-confirmation
// PDFs bundle many confirmations (one transaction per page).
async function extractPdfPages(file: File): Promise<string[]> {
  const pdfjsLib = await getPdfjs();

  const arrayBuffer = await file.arrayBuffer();
  let doc: PDFDocumentProxy;
  try {
    doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
      .promise;
  } catch (e) {
    throw new Error(
      `PDF konnte nicht gelesen werden: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(
      (content.items as { str: string }[]).map((i) => i.str).join(" "),
    );
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Trade Confirmation PDF → sell orders
// ---------------------------------------------------------------------------
// eTrade's per-trade confirmations carry the GROSS execution price ("Price" /
// "Principal"), which is the figure Austrian tax requires (transaction costs
// are not deductible at the 27.5% special rate, §27a Abs 4 / §20 Abs 2 EStG).
// This is the compliant sell source — unlike the G&L report, which only gives
// net proceeds. Each confirmation is one transaction on its own page; the
// "Conditions and Disclosures" pages have no "Transaction Type:" line.
function parseTradeConfirmations(
  pages: string[],
  fileName: string,
): FileParseResult {
  const warnings: string[] = [];
  const events: RawPortfolioEvent[] = [];

  for (const page of pages) {
    const typeMatch = page.match(
      /Transaction Type:\s*(Sold(?:\s+Short)?|Bought)/i,
    );
    if (!typeMatch) continue; // boilerplate / non-transaction page

    // Only sales feed the moving-average engine; acquisitions come from
    // BenefitHistory.xlsx (ESPP buys + RSU vests).
    if (!/^Sold/i.test(typeMatch[1].trim())) continue;

    // Data row: "<TradeDate> <SettlementDate> <Quantity> <Price>". The two
    // consecutive dates uniquely identify it on the page.
    const row = page.match(
      /(\d{2}\/\d{2}\/\d{4})\s+\d{2}\/\d{2}\/\d{4}\s+([\d,]+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/,
    );
    if (!row) {
      warnings.push(`${fileName}: Handelszeile nicht gefunden (übersprungen).`);
      continue;
    }

    const date = normalizeDate(row[1]);
    const shares = parseQty(row[2]);
    const priceUSD = parseMoney(row[3]);

    if (!date || !(shares > 0) || !(priceUSD > 0)) {
      warnings.push(`${fileName}: Werte ungültig (Datum/Menge/Preis).`);
      continue;
    }

    const symbol = page
      .match(/Symbol\s*\/\s*CUSIP[^:]*:\s*([A-Za-z.]+)/)?.[1]
      ?.trim();

    events.push({
      date,
      type: "SELL",
      shares,
      pricePerShareUSD: priceUSD,
      symbol: symbol || undefined,
      source: "Confirmation",
      notes: "Verkauf (Trade Confirmation)",
    });
  }

  if (events.length === 0)
    warnings.push(`${fileName}: Keine Verkaufs-Bestätigungen gefunden.`);
  return { events, warnings };
}

// Dispatch a dropped/selected file to the right parser by extension + content.
export async function parseEtradeInputFile(
  file: File,
): Promise<FileParseResult> {
  const name = file.name.toLowerCase();
  // PDFs are Trade Confirmations (sells). Acquisitions (ESPP buys + RSU vests)
  // come from BenefitHistory.xlsx, so no other PDF type is expected.
  if (name.endsWith(".pdf")) {
    const pages = await extractPdfPages(file);
    return parseTradeConfirmations(pages, file.name);
  }

  // The only spreadsheet input is BenefitHistory.xlsx (ESPP buys + RSU vests).
  // Sells come exclusively from Trade Confirmation PDFs (gross execution price).
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseBenefitHistory(file);
  }

  return {
    events: [],
    warnings: [
      `${file.name}: nicht unterstütztes Format (erwartet .xlsx oder .pdf).`,
    ],
  };
}

