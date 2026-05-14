# Austrian Tax Helper

A fully client-side React app for Austrian employee tax return preparation (_Arbeitnehmerveranlagung_). No backend, no account — all data lives in your browser's `localStorage`.

> ⚠️ **Disclaimer — not tax advice.** This is a free, non-commercial hobby project. It does **not** constitute tax, legal or financial advice and is no substitute for a qualified tax advisor. Calculations are provided **without any warranty** as to correctness, completeness or timeliness — tax law changes and results may contain errors. **Use at your own risk:** you alone are responsible for verifying every figure before submitting it to the tax authority. To the extent permitted by law, the author accepts no liability for any damages arising from use of, or inaccuracy in, the results.

## Features

| Section                | What it does                                                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FinanzOnline Guide** | Start page — step-by-step filing guide with all computed _Kennzahlen_ (KZ) and one-click copy for each value                                                                       |
| **eTrade portfolio**   | Imports `BenefitHistory.xlsx` (RSU vests, ESPP buys) and Trade Confirmation PDFs (sales); computes capital gains with the Austrian moving-average cost basis (§27a EStG); fetches historical USD→EUR rates from the ECB |
| **Flatex import**      | Reads the Flatex annual tax report PDF for domestic gains, losses and withheld KeSt                                                                                                |
| **AfA Calculator**     | Depreciation schedule for home-office assets (§16 EStG), including GWG immediate deduction and degressive method; pre-fills from PDF invoices                                      |
| **Werbungskosten**     | Employee expense deductions — ergonomic furniture, internet, and more                                                                                        |

## Getting started

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

```bash
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ locally
npx tsc --noEmit   # standalone type check
```

## Tech stack

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **react-intl** — full DE/EN localisation
- **SheetJS** — XLSX parsing for broker exports
- **pdf.js** — trade confirmation, Flatex report and invoice parsing
- **ECB SDMX API** — historical EUR/USD exchange rates

## eTrade download helper

`npm run etrade:download` (after `npm run etrade:setup`) opens a real Chromium window via Playwright: you log in to eTrade yourself (incl. 2FA), then it downloads `BenefitHistory.xlsx` and the yearly trade confirmation PDFs automatically. Everything stays on your machine.

## Data & privacy

All data is stored exclusively in `localStorage` under the key `steuerhelfer-at-v1`. Nothing is sent to any server except the ECB exchange-rate API (read-only, no personal data). Clear your browser storage to reset the app completely.
