import type {
  EngineResult,
  EngineYearSummary,
  PortfolioEvent,
  PortfolioEventType,
  ProcessedPortfolioEvent,
} from "../types";

// Austrian moving-average cost basis engine (Gleitender Durchschnittspreis,
// §27a EStG). Faithful port of tax-etrade's tax_engine.py.
//
// Rules:
//  A. Acquisitions (VEST / BUY / EXERCISE) recalculate the running average:
//       new_avg = (old_total_cost + new_cost) / (old_shares + new_shares)
//  B. Sells do NOT change the average; they realize
//       gain = (sell_price_eur - avg_cost) * shares
//  C. Depot check: you cannot sell more shares than you currently hold.
//
// The average is a single running figure across the ENTIRE history (all years).
// A sale's gain therefore depends on every acquisition that preceded it,
// which is why this cannot be computed per-year in isolation.

// Round to 4 decimals, half-away-from-zero, matching Python's
// Decimal.quantize(ROUND_HALF_UP) for both positive and negative values.
function round4(n: number): number {
  return (Math.sign(n) * Math.round(Math.abs(n) * 1e4)) / 1e4;
}

const TYPE_PRIORITY: Record<PortfolioEventType, number> = {
  VEST: 0,
  BUY: 1,
  EXERCISE: 1,
  SELL: 2,
};

// Sort by date, then acquisitions before sells on the same day. This is
// critical for sell-to-cover (vest and same-day sale): the vest must establish
// cost basis before the sale consumes it.
function sortEvents(events: PortfolioEvent[]): PortfolioEvent[] {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
  });
}

export interface EngineError {
  event: PortfolioEvent;
  message: string;
}

export interface EngineRunResult extends EngineResult {
  errors: EngineError[];
}

export function runTaxEngine(events: PortfolioEvent[]): EngineRunResult {
  const sorted = sortEvents(events);
  const processed: ProcessedPortfolioEvent[] = [];
  const byYear: Record<number, EngineYearSummary> = {};
  const errors: EngineError[] = [];

  let totalShares = 0;
  let avgCost = 0; // moving-average cost basis per share, in EUR

  for (const event of sorted) {
    const priceEUR = round4(event.pricePerShareUSD * event.ecbRateUSDEUR);

    if (event.type === "SELL") {
      // Rule C: depot check (allow a tiny rounding tolerance).
      if (event.shares > totalShares + 1e-6) {
        errors.push({
          event,
          message:
            `Verkauf von ${event.shares} Stück am ${event.date} nicht möglich – ` +
            `nur ${round4(totalShares)} Stück im Depot. ` +
            `Fehlt ein Vesting/ESPP-Kauf in den importierten Daten?`,
        });
        // Skip this sell so the rest of the ledger stays consistent.
        processed.push({
          event,
          pricePerShareEUR: priceEUR,
          totalSharesAfter: totalShares,
          avgCostEURAfter: avgCost,
          realizedGainLossEUR: 0,
          totalPortfolioCostEURAfter: round4(totalShares * avgCost),
        });
        continue;
      }

      const gain = round4((priceEUR - avgCost) * event.shares);
      totalShares -= event.shares;
      // Selling everything (or rounding dust) resets the position.
      if (totalShares <= 1e-4) {
        totalShares = 0;
        avgCost = 0;
      }

      processed.push({
        event,
        pricePerShareEUR: priceEUR,
        totalSharesAfter: totalShares,
        avgCostEURAfter: avgCost,
        realizedGainLossEUR: gain,
        totalPortfolioCostEURAfter: round4(totalShares * avgCost),
      });

      const year = Number(event.date.slice(0, 4));
      const summary = (byYear[year] ??= {
        year,
        totalGainsEUR: 0,
        totalLossesEUR: 0,
      });
      if (gain > 0) summary.totalGainsEUR += gain;
      else if (gain < 0) summary.totalLossesEUR += -gain;
    } else {
      // Acquisition: update the moving average.
      const newCost = round4(event.shares * priceEUR);
      const oldTotalCost = totalShares * avgCost;
      const newTotalCost = oldTotalCost + newCost;
      const newTotalShares = totalShares + event.shares;
      totalShares = newTotalShares;
      avgCost = newTotalShares > 0 ? round4(newTotalCost / newTotalShares) : 0;

      processed.push({
        event,
        pricePerShareEUR: priceEUR,
        totalSharesAfter: totalShares,
        avgCostEURAfter: avgCost,
        realizedGainLossEUR: 0,
        totalPortfolioCostEURAfter: round4(newTotalCost),
      });
    }
  }

  // Round the accumulated yearly sums to cents.
  for (const y of Object.values(byYear)) {
    y.totalGainsEUR = round4(y.totalGainsEUR);
    y.totalLossesEUR = round4(y.totalLossesEUR);
  }

  return {
    processed,
    byYear,
    finalShares: round4(totalShares),
    finalAvgCostEUR: avgCost,
    errors,
  };
}
