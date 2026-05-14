// ECB SDMX API — daily USD/EUR reference rates
// Returns OBS_VALUE = USD per 1 EUR (e.g. 1.0912)
// We invert to get EUR per 1 USD (e.g. 0.9164)

const cache = new Map<string, number>();

async function fetchRangeRaw(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const url =
    `https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A` +
    `?startPeriod=${startDate}&endPeriod=${endDate}&format=csvdata`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`ECB API error: ${resp.status}`);
  const text = await resp.text();

  const result = new Map<string, number>();
  const lines = text.trim().split("\n");
  if (lines.length < 2) return result;

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const timePeriodIdx = headers.indexOf("TIME_PERIOD");
  const obsValueIdx = headers.indexOf("OBS_VALUE");
  if (timePeriodIdx === -1 || obsValueIdx === -1) return result;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    const date = cols[timePeriodIdx];
    const rate = parseFloat(cols[obsValueIdx]);
    if (date && !isNaN(rate) && rate > 0) {
      // Store as EUR per USD (inverted)
      result.set(date, 1 / rate);
    }
  }
  return result;
}

// Returns EUR per 1 USD for the given date.
// If no rate (weekend/holiday), returns rate from nearest previous business day (up to 7 days back).
export async function fetchEcbRate(date: string): Promise<number | null> {
  if (cache.has(date)) return cache.get(date)!;

  // Fetch a 10-day window ending on the requested date to cover weekends
  const end = date;
  const startD = new Date(date);
  startD.setDate(startD.getDate() - 10);
  const start = startD.toISOString().slice(0, 10);

  const rates = await fetchRangeRaw(start, end);
  if (rates.size === 0) return null;

  // Find closest available date <= requested date
  const sorted = [...rates.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  let found: number | null = null;
  for (const [d, r] of sorted) {
    if (d <= date) found = r;
  }
  if (found !== null) cache.set(date, found);
  return found;
}

// Batch-fetch rates for multiple dates in one API call
export async function fetchEcbRatesBatch(
  dates: string[],
): Promise<Map<string, number>> {
  if (dates.length === 0) return new Map();

  const unique = [...new Set(dates)].sort();
  const uncached = unique.filter((d) => !cache.has(d));
  const result = new Map<string, number>();

  if (uncached.length > 0) {
    const startD = new Date(uncached[0]);
    startD.setDate(startD.getDate() - 10); // buffer for weekends
    const start = startD.toISOString().slice(0, 10);
    const end = uncached[uncached.length - 1];

    try {
      const rates = await fetchRangeRaw(start, end);
      const sortedRates = [...rates.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      for (const date of uncached) {
        let found: number | null = null;
        for (const [d, r] of sortedRates) {
          if (d <= date) found = r;
        }
        if (found !== null) {
          cache.set(date, found);
          result.set(date, found);
        }
      }
    } catch {
      // Return whatever we have cached
    }
  }

  for (const date of unique) {
    if (cache.has(date)) result.set(date, cache.get(date)!);
  }
  return result;
}
