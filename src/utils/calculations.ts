import type {
  AfaAsset,
  AfaResult,
  AfaScheduleEntry,
  CapitalGainEntry,
  PortfolioEvent,
  TaxSummary,
  TaxYearData,
  WerbungskostenData,
} from "../types";
import { runTaxEngine } from "./taxEngine";
import type { EngineRunResult } from "./taxEngine";

export const GWG_LIMIT = 1000;

export function genId() {
  return Math.random().toString(36).slice(2);
}

export const DEFAULT_USEFUL_LIFE: Record<string, number> = {
  computer: 3,
  monitor: 5,
  furniture: 10,
  other: 5,
};

export const KEST_RATE = 0.275;
export const DEGRESSIVE_RATE = 0.3;

const EUR_FMT = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_FMT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatEUR = (value: number): string => EUR_FMT.format(value);
export const formatUSD = (value: number): string => USD_FMT.format(value);

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// §16 Abs. 1 Z 8 lit. b EStG — Halbjahres-AfA für Arbeitnehmer (Werbungskosten):
// Kauf Jänner–Juni (1. Halbjahr): volle Jahres-AfA im Kaufjahr.
// Kauf Juli–Dezember (2. Halbjahr): halbe Jahres-AfA im Kaufjahr +
//   ein zusätzliches letztes Jahr mit der verbleibenden halben AfA.
// NICHT die monatsgenaue Abschreibung nach §7 EStG (gilt nur für Betriebsvermögen).
export function isPurchaseH2(purchaseDate: string): boolean {
  return new Date(purchaseDate).getMonth() >= 6; // Juli = Index 6
}

export function calculateAfa(asset: AfaAsset, forYear: number): AfaResult {
  const purchaseYear = new Date(asset.purchaseDate).getFullYear();
  const baseCost = (asset.pricePaidEUR * asset.businessUsePercent) / 100;
  const isGWG = asset.pricePaidEUR <= GWG_LIMIT;

  if (isGWG) {
    const deductionForYear = purchaseYear === forYear ? baseCost : 0;
    return {
      asset,
      isGWG: true,
      immediateDeduction: baseCost,
      yearlyLinearDeduction: baseCost,
      deductionForYear,
      remainingBookValue: deductionForYear > 0 ? 0 : baseCost,
      schedule: [{ year: purchaseYear, deduction: baseCost, bookValueEnd: 0 }],
    };
  }

  const h2 = isPurchaseH2(asset.purchaseDate);
  const annualLinear = r2(baseCost / asset.usefulLifeYears);
  const schedule: AfaScheduleEntry[] = [];

  if (asset.depreciationMethod === "linear") {
    // Halbjahres-AfA (§16 Abs. 1 Z 8 lit. b EStG):
    // H1-Kauf → volle Jahres-AfA; H2-Kauf → halbe Jahres-AfA + letztes halbes Jahr
    const firstYearDeduction = h2 ? r2(annualLinear / 2) : annualLinear;
    let bookValue = baseCost;

    // Kaufjahr
    const y1 = Math.min(firstYearDeduction, bookValue);
    bookValue = r2(bookValue - y1);
    schedule.push({
      year: purchaseYear,
      deduction: y1,
      bookValueEnd: Math.max(0, bookValue),
    });

    // Volle Jahre 2 bis N (usefulLifeYears − 1 Stück)
    for (let i = 1; i < asset.usefulLifeYears && bookValue > 0.005; i++) {
      const d = r2(Math.min(annualLinear, bookValue));
      bookValue = r2(bookValue - d);
      schedule.push({
        year: purchaseYear + i,
        deduction: d,
        bookValueEnd: Math.max(0, bookValue),
      });
    }

    // Letztes halbes Jahr (nur bei H2-Kauf)
    if (h2 && bookValue > 0.005) {
      const d = r2(Math.min(annualLinear / 2, bookValue));
      bookValue = r2(bookValue - d);
      schedule.push({
        year: purchaseYear + asset.usefulLifeYears,
        deduction: d,
        bookValueEnd: Math.max(0, bookValue),
      });
    }
  } else {
    // Degressive AfA (30%) — Halbjahres-AfA gilt auch hier
    let bookValue = baseCost;
    const firstRate = h2 ? DEGRESSIVE_RATE / 2 : DEGRESSIVE_RATE;
    const y1 = r2(Math.min(bookValue * firstRate, bookValue));
    bookValue = r2(bookValue - y1);
    schedule.push({
      year: purchaseYear,
      deduction: y1,
      bookValueEnd: Math.max(0, bookValue),
    });

    let currentYear = purchaseYear + 1;
    const safetyLimit = purchaseYear + asset.usefulLifeYears + 6;

    while (bookValue > 0.005 && currentYear <= safetyLimit) {
      const yearsRemaining =
        asset.usefulLifeYears - (currentYear - purchaseYear);
      const degressive = bookValue * DEGRESSIVE_RATE;
      // Wechsel auf linear, sobald linear höher wäre
      const linear =
        yearsRemaining > 0 ? bookValue / yearsRemaining : bookValue;
      const d = r2(Math.min(Math.max(degressive, linear), bookValue));
      bookValue = r2(bookValue - d);
      schedule.push({
        year: currentYear,
        deduction: d,
        bookValueEnd: Math.max(0, bookValue),
      });
      currentYear++;
    }
  }

  const yearEntry = schedule.find((s) => s.year === forYear);
  return {
    asset,
    isGWG: false,
    immediateDeduction: 0,
    yearlyLinearDeduction: annualLinear,
    deductionForYear: yearEntry?.deduction ?? 0,
    remainingBookValue: yearEntry?.bookValueEnd ?? 0,
    schedule,
  };
}

// Result of the moving-average engine for a single tax year.
export interface YearCapitalResult {
  capitalGains: CapitalGainEntry[]; // realized sells in this year
  totalGainsEUR: number;
  totalLossesEUR: number; // absolute value
  rsuIncomeEUR: number; // FMV of vests in this year (informational, Lohnsteuer)
  engine: EngineRunResult; // full cross-year ledger
}

// Runs the moving-average engine over the WHOLE portfolio history, then slices
// out the realized sells and vests that fall in `year`. The engine must see
// every event (all years) so the running average is correct at sale time.
export function calculateCapitalGains(
  portfolioEvents: PortfolioEvent[],
  year: number,
): YearCapitalResult {
  const engine = runTaxEngine(portfolioEvents);

  const capitalGains: CapitalGainEntry[] = [];
  let totalGainsEUR = 0;
  let totalLossesEUR = 0;
  let rsuIncomeEUR = 0;

  for (const pe of engine.processed) {
    const eYear = Number(pe.event.date.slice(0, 4));
    if (eYear !== year) continue;

    if (pe.event.type === "SELL") {
      const g = pe.realizedGainLossEUR;
      if (g > 0) totalGainsEUR += g;
      else if (g < 0) totalLossesEUR += -g;
      capitalGains.push({
        id: pe.event.id,
        date: pe.event.date,
        shares: pe.event.shares,
        salePricePerShareUSD: pe.event.pricePerShareUSD,
        salePriceEUR: pe.pricePerShareEUR,
        avgCostEUR: pe.event.shares
          ? pe.pricePerShareEUR - g / pe.event.shares
          : 0,
        costBasisTotalEUR: pe.event.shares
          ? r2((pe.pricePerShareEUR - g / pe.event.shares) * pe.event.shares)
          : 0,
        gainLossEUR: g,
        description:
          [pe.event.symbol, pe.event.notes].filter(Boolean).join(" ") ||
          "Verkauf",
      });
    } else if (pe.event.type === "VEST") {
      rsuIncomeEUR += pe.event.shares * pe.pricePerShareEUR;
    }
  }

  return {
    capitalGains,
    totalGainsEUR: r2(totalGainsEUR),
    totalLossesEUR: r2(totalLossesEUR),
    rsuIncomeEUR: r2(rsuIncomeEUR),
    engine,
  };
}

export function calculateWerbungskosten(
  data: WerbungskostenData,
  totalAfaDeductions: number,
): {
  ergonomicFurnitureDeduction: number;
  internetDeduction: number;
  otherArbeitsmittelDeduction: number;
  gewerkschaftDeduction: number;
  fachliteraturDeduction: number;
  reisekostenDeduction: number;
  fortbildungDeduction: number;
  otherWerbungskostenDeduction: number;
  total: number;
} {
  // §16 Abs. 1 Z 7a EStG: Ergonomisches Mobiliar max. €300/Jahr.
  // Übertrag aus Vorjahr (ergoFurnitureCarryOver) fließt in das aktuelle Jahr ein,
  // aber das Jahreslimit bleibt €300 gesamt.
  const ergoThisYear =
    (data.ergonomicFurnitureCost || 0) + (data.ergoFurnitureCarryOver || 0);
  const ergonomicFurnitureDeduction = Math.min(ergoThisYear, 300);
  const internetDeduction =
    data.internetMonthlyGross * 12 * (data.internetWorkPercent / 100);
  const otherArbeitsmittelDeduction = data.otherArbeitsmittelCost || 0;
  const gewerkschaftDeduction = data.gewerkschaftCost || 0;
  const fachliteraturDeduction = data.fachliteraturCost || 0;
  const reisekostenDeduction = data.reisekostenCost || 0;
  const fortbildungDeduction = data.fortbildungCost || 0;
  const otherWerbungskostenDeduction = data.otherWerbungskostenCost || 0;

  const total =
    ergonomicFurnitureDeduction +
    internetDeduction +
    otherArbeitsmittelDeduction +
    gewerkschaftDeduction +
    fachliteraturDeduction +
    reisekostenDeduction +
    fortbildungDeduction +
    otherWerbungskostenDeduction +
    totalAfaDeductions;

  return {
    ergonomicFurnitureDeduction,
    internetDeduction,
    otherArbeitsmittelDeduction,
    gewerkschaftDeduction,
    fachliteraturDeduction,
    reisekostenDeduction,
    fortbildungDeduction,
    otherWerbungskostenDeduction,
    total,
  };
}

export function calculateTaxSummary(
  data: TaxYearData,
  portfolioEvents: PortfolioEvent[] = [],
): TaxSummary {
  const { year, afaAssets, werbungskosten } = data;

  const cap = calculateCapitalGains(portfolioEvents, year);
  const { capitalGains, totalGainsEUR, totalLossesEUR, rsuIncomeEUR } = cap;
  const netCapitalGainsEUR = Math.max(0, totalGainsEUR - totalLossesEUR);
  const otherBrokerGainsEUR = data.otherBrokerGainsEUR ?? 0;
  const otherBrokerLossesEUR = data.otherBrokerLossesEUR ?? 0;
  const otherBrokerPaidKestEUR = data.otherBrokerPaidKestEUR ?? 0;

  // E1kv Punkt 1.3 — Ausländische Kapitaleinkünfte (eTrade)
  const kz994 = totalGainsEUR;
  const kz892 = totalLossesEUR;

  // E1kv Punkt 1.2 — Inländische Kapitaleinkünfte (Flatex)
  const kz981 = otherBrokerGainsEUR;
  const kz891 = otherBrokerLossesEUR;

  // E1kv Punkt 1.4 — Einbehaltene Steuern
  const kz899 = otherBrokerPaidKestEUR;

  const combinedNet =
    totalGainsEUR - totalLossesEUR + (otherBrokerGainsEUR - otherBrokerLossesEUR);
  const kestDueEUR = Math.max(0, combinedNet) * KEST_RATE - kz899;

  const afaResults = afaAssets.map((a) => calculateAfa(a, year));
  const totalAfaDeductionsEUR = afaResults.reduce(
    (sum, r) => sum + r.deductionForYear,
    0,
  );

  const wk = calculateWerbungskosten(werbungskosten, totalAfaDeductionsEUR);

  // KZ 169: Digitale Arbeitsmittel = AfA on devices + internet + other Arbeitsmittel (§16 Abs. 1 Z 8)
  const digitalAfaDeductions = afaResults
    .filter((r) => ["computer", "monitor"].includes(r.asset.category))
    .reduce((sum, r) => sum + r.deductionForYear, 0);
  const kz169 =
    digitalAfaDeductions +
    wk.internetDeduction +
    wk.otherArbeitsmittelDeduction;

  // KZ 158: Ergonomisches Mobiliar (max €300) — §16 Abs. 1 Z 7a EStG
  const kz158 = wk.ergonomicFurnitureDeduction;

  // KZ 717: Gewerkschaft & Berufsverbände — §16 Abs. 1 Z 3 EStG
  const kz717 = wk.gewerkschaftDeduction;

  // KZ 720: Fachliteratur — §16 Abs. 1 Z 6 EStG
  const kz720 = wk.fachliteraturDeduction;

  // KZ 721: Berufliche Reisekosten — §16 Abs. 1 Z 9 EStG
  const kz721 = wk.reisekostenDeduction;

  // KZ 722: Fortbildungs- / Ausbildungskosten — §16 Abs. 1 Z 10 EStG
  const kz722 = wk.fortbildungDeduction;

  // KZ 724: Sonstige Werbungskosten (Betriebsratsumlage, Bewerbungskosten etc.)
  const furnitureAfaDeductions = afaResults
    .filter((r) => ["furniture", "other"].includes(r.asset.category))
    .reduce((sum, r) => sum + r.deductionForYear, 0);
  const kz724 = wk.otherWerbungskostenDeduction + furnitureAfaDeductions;

  return {
    year,
    rsuIncomeEUR,
    capitalGains,
    totalGainsEUR,
    totalLossesEUR,
    netCapitalGainsEUR,
    otherBrokerGainsEUR,
    otherBrokerLossesEUR,
    kestDueEUR,
    kz994,
    kz892,
    kz981,
    kz891,
    kz899,
    afaResults,
    totalAfaDeductionsEUR,
    ergonomicFurnitureDeduction: wk.ergonomicFurnitureDeduction,
    internetDeduction: wk.internetDeduction,
    otherArbeitsmittelDeduction: wk.otherArbeitsmittelDeduction,
    gewerkschaftDeduction: wk.gewerkschaftDeduction,
    fachliteraturDeduction: wk.fachliteraturDeduction,
    reisekostenDeduction: wk.reisekostenDeduction,
    fortbildungDeduction: wk.fortbildungDeduction,
    otherWerbungskostenDeduction: wk.otherWerbungskostenDeduction,
    totalWerbungskostenEUR: wk.total,
    kz169,
    kz158,
    kz717,
    kz720,
    kz721,
    kz722,
    kz724,
  };
}
