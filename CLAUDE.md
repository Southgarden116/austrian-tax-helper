# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (localhost:5173)
npm run build    # tsc type-check + Vite production build → dist/
npm run preview  # serve the dist/ folder locally
```

No test suite is configured. Type correctness is the primary correctness mechanism — run `npx tsc --noEmit` for a standalone type check.

## Architecture

**Steuerhelfer** is a fully client-side React SPA for Austrian tax return preparation (Arbeitnehmerveranlagung). All data lives in `localStorage` under the key `steuerhelfer-at-v1` — there is no backend.

### State & data flow

`TaxContext` ([src/context/TaxContext.tsx](src/context/TaxContext.tsx)) is the single source of truth. It uses `useReducer` with a typed `Action` union and auto-persists to `localStorage` on every state change. The state shape is:

```
State
  selectedYear: number          ← which tax year the user is viewing
  years: TaxYearData[]          ← one entry per year, created on demand
```

Each `TaxYearData` contains: `afaAssets`, `werbungskosten`, and the per-year `otherBroker*` fields. Pages read `selectedYearData` (the pre-selected slice) from context rather than filtering themselves.

`State` also carries a top-level **`portfolioEvents: PortfolioEvent[]`** — a single, cross-year list of every share movement (RSU `VEST`, ESPP `BUY`, `EXERCISE`, `SELL`). This is **not** partitioned by year because the Austrian moving-average cost basis (Gleitender Durchschnittspreis, §27a EStG) is a running figure across the entire holding period: a sale's gain depends on every acquisition that preceded it. Mutated via `ADD_PORTFOLIO_EVENTS` / `DELETE_PORTFOLIO_EVENT` / `DELETE_ALL_PORTFOLIO_EVENTS`.

`LanguageContext` ([src/context/LanguageContext.tsx](src/context/LanguageContext.tsx)) wraps `react-intl`'s `IntlProvider`. All user-facing strings must use `useIntl().formatMessage({ id: '...' })` with keys defined in [src/i18n/de.ts](src/i18n/de.ts) and [src/i18n/en.ts](src/i18n/en.ts). Add new keys to both files.

### Pages (routes under `<Layout>`)

Routes are defined in [src/App.tsx](src/App.tsx); the index route (`/`) renders the FinanzOnline guide — there is no separate dashboard.

| Route | File | Purpose |
|---|---|---|
| `/` (index) | [src/pages/FinanzOnlineGuide.tsx](src/pages/FinanzOnlineGuide.tsx) | Step-by-step FinanzOnline filing guide + computed KZ summary for the selected year |
| `/etrade` | [src/pages/EtradeSection.tsx](src/pages/EtradeSection.tsx) | Portfolio ledger (vests/buys/sells) + moving-average gains; imports eTrade files |
| `/afa` | [src/pages/AfaCalculator.tsx](src/pages/AfaCalculator.tsx) | Depreciation (AfA) asset management |
| `/werbungskosten` | [src/pages/WerbungskostenSection.tsx](src/pages/WerbungskostenSection.tsx) | Employee expense deductions |

### Tax calculations ([src/utils/calculations.ts](src/utils/calculations.ts))

All tax logic lives here. Key functions:

- `calculateAfa(asset, forYear)` — implements §16 Abs. 1 Z 8 lit. b EStG half-year rule: H1 purchase → full annual AfA; H2 purchase → half first year + extra trailing half year. GWG (≤ €1 000) → immediate full deduction. Supports linear and degressive (30%) methods with automatic switch-to-linear.
- `calculateWerbungskosten(data, totalAfaDeductions)` — applies Austrian statutory limits (ergonomic furniture capped at €300/year including prior-year carry-over).
- `calculateCapitalGains(portfolioEvents, year)` — runs the moving-average engine over the **whole** event history, then slices out the realized sells and vests that fall in `year`. Returns the year's gains/losses, the realized-sale entries (`CapitalGainEntry`), and the full engine ledger.
- `calculateTaxSummary(data, portfolioEvents)` — assembles the complete `TaxSummary` with all KZ fields (KZ 158, 169, 277, 717, 720, 721, 722, 724, 994). KZ 994/892 now come from `calculateCapitalGains`, not per-sale cost bases.

`TaxSummary` fields map 1:1 to FinanzOnline Kennzahlen (KZ). When adding a new deduction category, add it to `TaxSummary`, compute it in `calculateTaxSummary`, and surface it in [FinanzOnlineGuide](src/pages/FinanzOnlineGuide.tsx) / [TaxSummaryPrint](src/components/TaxSummaryPrint.tsx).

### Moving-average engine ([src/utils/taxEngine.ts](src/utils/taxEngine.ts))

`runTaxEngine(events)` implements the Austrian moving-average cost basis (Gleitender Durchschnittspreis, §27a EStG) — a faithful TS port of the `tax-etrade` Python `TaxEngine`. Events are sorted by date with acquisitions before sells on the same day (VEST=0, BUY/EXERCISE=1, SELL=2, for sell-to-cover). Acquisitions recompute `avg = (oldTotalCost + newCost) / (oldShares + newShares)`; sells realize `(sellPriceEUR − avg) × shares` and leave the average unchanged; a depot check flags selling more than held. All money is rounded to 4 decimals half-away-from-zero to match the Python `Decimal` behaviour. Verified to produce identical per-year gains/losses to the reference tool.

### eTrade import ([src/utils/parseEtradeFiles.ts](src/utils/parseEtradeFiles.ts))

Parses the source files the moving-average method needs. **All acquisitions come from `BenefitHistory.xlsx`; sells come from Trade Confirmation PDFs:**
- **BenefitHistory.xlsx** (`parseBenefitHistory`) parses two sheets:
  - sheet **"ESPP"** (`parseEsppSheet`), `Record Type === "Purchase"` rows → `BUY`; cost basis = *Purchase Date FMV* (not the discounted price paid).
  - sheet **"Restricted Stock"** (`parseRestrictedStockSheet`) → `VEST`. This sheet is a flattened dump that reuses columns per record type, so it's read **positionally** by column index (`RS_COL`). Three row kinds are correlated by grant number: `Event`/"Shares released" gives the **net** shares that enter the depot, `Vest Schedule` gives the vest date + **gross** vested qty, `Tax Withholding` gives the *Taxable Gain*. The vest FMV per share isn't stored directly but equals `TaxableGain ÷ grossVestedQty`; the acquisition uses the **net** released shares at that FMV. Verified to reproduce the RSU confirmation PDFs exactly (incl. sell-to-cover grants where gross ≠ net).
- **Trade Confirmation PDFs** (`parseTradeConfirmations`, via `pdfjs-dist`) — → `SELL`; one transaction per page, extracts Trade Date / Quantity / gross *Price* from each `Sold`/`Sold Short` confirmation (skips boilerplate pages). This is the only sell source: it carries the **gross** execution price, which is the legally-correct figure (transaction costs are not deductible at the 27.5% special rate, §27a Abs 4 / §20 Abs 2 EStG). The Orders-page `orders.xlsx` and the Gain & Loss report were dropped — the former rounds the price to whole cents, the latter only gives net-of-fee proceeds. RSU confirmation PDFs were also dropped, since the Restricted Stock sheet carries the same vest data.

`parseEtradeInputFile` dispatches by extension; `.pdf` files are parsed as Trade Confirmations, `.xlsx`/`.xls` as BenefitHistory. The [PortfolioImport](src/components/PortfolioImport.tsx) modal accepts multiple files at once, skips files already added (by name+size), fetches ECB rates, runs the engine for a live preview (full ledger + per-year summary), and commits only the new events. Import into the app is fully manual; the optional `npm run etrade:download` helper ([public/etrade-download.mjs](public/etrade-download.mjs), Playwright) only automates downloading the files from eTrade.

### ECB exchange rates ([src/utils/ecbRates.ts](src/utils/ecbRates.ts))

Fetches USD/EUR reference rates from the ECB SDMX API. Inverts ECB's "USD per EUR" to "EUR per USD". Caches in a module-level `Map`. Weekend/holiday gaps are filled by walking back up to 10 days. Batch fetching (`fetchEcbRatesBatch`) minimises API calls when importing many transactions.

### UI conventions

- Tailwind CSS with a custom `at-red` color (Austrian red). Shared component classes (`card`, `btn-primary`, `input`, `label`, `th`/`td`, `kz-badge`, …) are defined in [src/index.css](src/index.css) via `@layer components`; small shared React components (PageHeader, SectionHeader, EmptyState, FormActions, Collapsible, InfoTooltip, LegalRef) live in [src/components/](src/components/).
- `lucide-react` for icons.
- The sidebar (`Layout`) exposes year selector (hardcoded years: 2022–2025) and DE/EN language toggle.
- Available years list in [src/components/Layout.tsx](src/components/Layout.tsx) (`AVAILABLE_YEARS`) must be updated each year.
