import type { PDFDocumentProxy } from "pdfjs-dist";
import { getPdfjs } from "./pdfWorker";

export interface FlatexExtraction {
  gains: number;
  losses: number;
  netGainLoss: number; // gains - losses (can be negative)
  paidKest: number;
  confidence: {
    gains: "high" | "medium" | "low";
    losses: "high" | "medium" | "low";
    paidKest: "high" | "medium" | "low";
  };
  rawText: string;
  isScanned: boolean;
}

// Austrian/German number format: 1.234,56 → 1234.56
function parseAtAmount(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", "."));
}

const AT_AMOUNT_RE = /(\d{1,3}(?:\.\d{3})*,\d{2})/g;

function findAmountsInLine(line: string): number[] {
  const results: number[] = [];
  AT_AMOUNT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = AT_AMOUNT_RE.exec(line)) !== null) {
    const v = parseAtAmount(m[1]);
    if (v > 0) results.push(v);
  }
  return results;
}

// Flatex Steuerbescheinigung: the "Saldo" row contains
// [total income, foreign QSt (optional), KeSt] as columns.
// Returns { income, paidKest } when found.
function extractFlatexSaldo(
  lines: string[],
): { income: number; paidKest: number } | null {
  for (const line of lines) {
    if (/\bsaldo\b/i.test(line)) {
      const amounts = findAmountsInLine(line);
      if (amounts.length >= 2) {
        return { income: amounts[0], paidKest: amounts[amounts.length - 1] };
      }
    }
  }
  return null;
}

function extractGains(lines: string[]): {
  value: number;
  confidence: "high" | "medium" | "low";
} {
  // Primary: "realisierte Gewinne", "Kursgewinne", "Gewinne aus Veräußerungen"
  const HIGH_RE =
    /realisierte?\s*(?:kurs)?gewinne?|kursgewinne?|gewinne?\s*aus\s*ver[äa]u|gewinne?\s*gesamt/i;
  const amounts: number[] = [];
  for (const line of lines) {
    if (HIGH_RE.test(line)) amounts.push(...findAmountsInLine(line));
  }
  if (amounts.length > 0)
    return { value: Math.max(...amounts), confidence: "high" };

  // Fallback: any line with "Gewinne" but not "Verluste"
  const fallback: number[] = [];
  for (const line of lines) {
    if (/\bgewinne?\b/i.test(line) && !/verlust/i.test(line))
      fallback.push(...findAmountsInLine(line));
  }
  if (fallback.length > 0)
    return { value: Math.max(...fallback), confidence: "medium" };

  return { value: 0, confidence: "low" };
}

function extractLosses(lines: string[]): {
  value: number;
  confidence: "high" | "medium" | "low";
} {
  // Primary: "realisierte Verluste", "Kursverluste"
  const HIGH_RE =
    /realisierte?\s*(?:kurs)?verluste?|kursverluste?|verluste?\s*aus\s*ver[äa]u|verluste?\s*gesamt/i;
  const amounts: number[] = [];
  for (const line of lines) {
    if (HIGH_RE.test(line)) amounts.push(...findAmountsInLine(line));
  }
  if (amounts.length > 0)
    return { value: Math.max(...amounts), confidence: "high" };

  // Fallback: any line with "Verluste" but not "Gewinne"
  const fallback: number[] = [];
  for (const line of lines) {
    if (/\bverluste?\b/i.test(line) && !/gewinn/i.test(line))
      fallback.push(...findAmountsInLine(line));
  }
  if (fallback.length > 0)
    return { value: Math.max(...fallback), confidence: "medium" };

  return { value: 0, confidence: "low" };
}

function extractPaidKest(lines: string[]): {
  value: number;
  confidence: "high" | "medium" | "low";
} {
  // Primary: "Kapitalertragsteuer", "KApESt", "KESt 27", "KESt"
  const HIGH_RE = /kapitalertragsteuer|kap\.?\s*est\b|kapest\b|\bkest\b/i;
  const amounts: number[] = [];
  for (const line of lines) {
    if (HIGH_RE.test(line)) amounts.push(...findAmountsInLine(line));
  }
  if (amounts.length > 0)
    return { value: Math.max(...amounts), confidence: "high" };

  // Fallback: "angerechnete", "einbehaltene", "abgeführte" Steuer
  const fallback: number[] = [];
  for (const line of lines) {
    if (/angerechnete|einbehaltene|abgef[üu]hrte/i.test(line))
      fallback.push(...findAmountsInLine(line));
  }
  if (fallback.length > 0)
    return { value: Math.max(...fallback), confidence: "medium" };

  return { value: 0, confidence: "low" };
}

async function extractLinesFromPdf(
  file: File,
): Promise<{ lines: string[]; rawText: string; isScanned: boolean }> {
  const pdfjsLib = await getPdfjs();

  const arrayBuffer = await file.arrayBuffer();
  let doc: PDFDocumentProxy;
  try {
    doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
      .promise;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`PDF konnte nicht gelesen werden: ${msg}`);
  }

  const allLines: string[] = [];

  for (let p = 1; p <= Math.min(doc.numPages, 10); p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();

    const lineGroups: Map<number, { x: number; text: string }[]> = new Map();
    for (const item of content.items as {
      str: string;
      transform: number[];
    }[]) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lineGroups.has(y)) lineGroups.set(y, []);
      lineGroups.get(y)!.push({ x: item.transform[4], text: item.str });
    }

    const pageLines = [...lineGroups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((i) => i.text)
          .join(" "),
      );

    allLines.push(...pageLines);
  }

  const rawText = allLines.join("\n");
  const isScanned = allLines.length < 5 || rawText.trim().length < 50;
  return { lines: allLines, rawText, isScanned };
}

export async function parseFlatexReport(file: File): Promise<FlatexExtraction> {
  const { lines, rawText, isScanned } = await extractLinesFromPdf(file);

  if (isScanned) {
    return {
      gains: 0,
      losses: 0,
      netGainLoss: 0,
      paidKest: 0,
      confidence: { gains: "low", losses: "low", paidKest: "low" },
      rawText,
      isScanned: true,
    };
  }

  // Flatex Steuerbescheinigung: prefer the Saldo row which gives the
  // authoritative net total income and total KeSt in one place.
  const saldo = extractFlatexSaldo(lines);
  if (saldo) {
    return {
      gains: saldo.income,
      losses: 0,
      netGainLoss: saldo.income,
      paidKest: saldo.paidKest,
      confidence: { gains: "high", losses: "high", paidKest: "high" },
      rawText,
      isScanned: false,
    };
  }

  const gains = extractGains(lines);
  const losses = extractLosses(lines);
  const paidKest = extractPaidKest(lines);

  return {
    gains: gains.value,
    losses: losses.value,
    netGainLoss: gains.value - losses.value,
    paidKest: paidKest.value,
    confidence: {
      gains: gains.confidence,
      losses: losses.confidence,
      paidKest: paidKest.confidence,
    },
    rawText,
    isScanned: false,
  };
}
