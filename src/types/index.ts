// A single share movement in the portfolio. The moving-average cost basis
// (Gleitender Durchschnittspreis, §27a EStG) is computed over the full,
// chronological list of these events across ALL years — acquisitions update
// the running average, sells realize gains against it.
export type PortfolioEventType = "VEST" | "BUY" | "EXERCISE" | "SELL";

export interface PortfolioEvent {
  id: string;
  date: string; // YYYY-MM-DD
  type: PortfolioEventType;
  shares: number;
  pricePerShareUSD: number;
  ecbRateUSDEUR: number; // EUR per 1 USD on the event date
  symbol?: string;
  source?: string; // "ESPP" | "RSU" | "Orders" | "Manual"
  notes?: string;
}

// Result of running one PortfolioEvent through the moving-average engine.
export interface ProcessedPortfolioEvent {
  event: PortfolioEvent;
  pricePerShareEUR: number;
  totalSharesAfter: number;
  avgCostEURAfter: number; // moving average cost basis after this event
  realizedGainLossEUR: number; // non-zero only for SELL
  totalPortfolioCostEURAfter: number;
}

export interface EngineYearSummary {
  year: number;
  totalGainsEUR: number; // sum of positive realized gains
  totalLossesEUR: number; // absolute value of negative realized gains
}

export interface EngineResult {
  processed: ProcessedPortfolioEvent[];
  byYear: Record<number, EngineYearSummary>;
  finalShares: number;
  finalAvgCostEUR: number;
}

export type AssetCategory = "computer" | "monitor" | "furniture" | "other";

export interface AfaAsset {
  id: string;
  description: string;
  purchaseDate: string;
  pricePaidEUR: number;
  category: AssetCategory;
  usefulLifeYears: number;
  businessUsePercent: number;
  depreciationMethod: "linear" | "degressive";
}

export interface WerbungskostenData {
  ergonomicFurnitureCost: number;
  // §16 Abs. 1 Z 7a EStG: Übertrag nicht verbrauchter Ergonomie-Kosten aus dem Vorjahr
  ergoFurnitureCarryOver: number;
  internetMonthlyGross: number;
  internetWorkPercent: number;
  otherArbeitsmittelCost: number;
  // KZ 717: Gewerkschaft & Berufsverbände
  gewerkschaftCost: number;
  // KZ 720: Fachliteratur
  fachliteraturCost: number;
  // KZ 721: Berufliche Reisekosten
  reisekostenCost: number;
  // KZ 722: Fortbildungs- / Ausbildungskosten
  fortbildungCost: number;
  // KZ 724: Sonstige Werbungskosten (echter Sammelposten)
  otherWerbungskostenCost: number;
}

export interface TaxYearData {
  year: number;
  afaAssets: AfaAsset[];
  werbungskosten: WerbungskostenData;
  otherBrokerGainsEUR?: number;
  otherBrokerLossesEUR?: number;
  otherBrokerPaidKestEUR?: number;
}

export interface AfaScheduleEntry {
  year: number;
  deduction: number;
  bookValueEnd: number;
}

export interface AfaResult {
  asset: AfaAsset;
  isGWG: boolean;
  immediateDeduction: number;
  yearlyLinearDeduction: number;
  deductionForYear: number;
  remainingBookValue: number;
  schedule: AfaScheduleEntry[];
}

// One realized sale, valued with the moving-average cost basis.
export interface CapitalGainEntry {
  id: string;
  date: string;
  shares: number;
  salePricePerShareUSD: number;
  salePriceEUR: number; // per share, in EUR
  avgCostEUR: number; // moving-average cost basis per share at sale time
  costBasisTotalEUR: number;
  gainLossEUR: number;
  description: string;
}

export interface TaxSummary {
  year: number;
  rsuIncomeEUR: number;
  capitalGains: CapitalGainEntry[];
  totalGainsEUR: number;
  totalLossesEUR: number;
  netCapitalGainsEUR: number;
  otherBrokerGainsEUR: number;
  otherBrokerLossesEUR: number;
  kestDueEUR: number;
  kz994: number;
  kz892: number;
  kz981: number;
  kz891: number;
  kz899: number;
  afaResults: AfaResult[];
  totalAfaDeductionsEUR: number;
  ergonomicFurnitureDeduction: number;
  internetDeduction: number;
  otherArbeitsmittelDeduction: number;
  gewerkschaftDeduction: number;
  fachliteraturDeduction: number;
  reisekostenDeduction: number;
  fortbildungDeduction: number;
  otherWerbungskostenDeduction: number;
  totalWerbungskostenEUR: number;
  kz169: number;
  kz158: number;
  kz717: number;
  kz720: number;
  kz721: number;
  kz722: number;
  kz724: number;
}
