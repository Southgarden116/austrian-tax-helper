const en: Record<string, string> = {
  // Common
  "common.edit": "Edit",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.total": "Total",
  "common.currentYear": "(current year)",
  "common.purchaseYear": "(purchase year)",

  // Categories
  "category.computer": "Computer (Laptop, Phone, Tablet)",
  "category.monitor": "Monitor",
  "category.furniture": "Furniture (Desk, Chair)",
  "category.other": "Other",

  // Layout
  "layout.taxYear": "Tax Year",
  "layout.menu": "Menu",
  "layout.subtitle": "Austria — Income Tax Return (E1)",
  "layout.privacy": "Data stored locally. There is no data sharing.",
  "layout.github": "GitHub",
  "layout.legal": "Legal notice & privacy",
  "nav.etrade": "eTrade Stocks",

  // Legal page
  "legal.title": "Legal Notice & Privacy",
  "legal.subtitle": "Imprint and data protection",
  "legal.impressum.title": "Imprint (§ 25(5) MedienG)",
  "legal.impressum.body":
    "Media owner: Areen Said\nLocation: Vienna, Austria\nContact: areen.said@outlook.com\nSubject: A free, non-commercial, private helper tool for preparing the Austrian income tax return (Einkommensteuererklärung).",
  "legal.privacy.title": "Data Protection",
  "legal.privacy.controller":
    "Controller under the GDPR: Areen Said, Vienna, Austria, areen.said@outlook.com.",
  "legal.privacy.local":
    "All data you enter is stored solely in your browser's local storage on your own device and never leaves it. It is not transmitted to any server; the controller has no access to it.",
  "legal.privacy.host":
    "The site runs on the web host World4You Internet Services GmbH, which, to deliver and secure it, may process technical access data (in particular the IP address) in server log files (legitimate interest, Art. 6(1)(f) GDPR). To retrieve exchange rates, a connection is made to the European Central Bank API, which receives your IP address.",
  "legal.privacy.rights":
    "You have the right to access, rectification, erasure, restriction of processing and the right to object (Art. 21 GDPR) to processing based on legitimate interest. You also have the right to lodge a complaint with the Austrian Data Protection Authority (Datenschutzbehörde).",
  "legal.disclaimer.title": "Disclaimer",
  "legal.disclaimer.body":
    "This tool does not constitute tax, legal or financial advice and is no substitute for advice from a qualified tax advisor. Calculations are provided to the best of knowledge but without any warranty as to their correctness, completeness or timeliness. Tax law changes, and the results may contain errors. Use is at your own risk: you alone are responsible for verifying every figure yourself before submitting it to the tax authority. To the extent permitted by law, the media owner accepts no liability for any damages arising from the use of, or any inaccuracy in, the results.",

  "nav.afa": "Depreciation (AfA)",
  "nav.werbungskosten": "Work Expenses",
  "nav.finanzonline": "FinanzOnline",

  // eTrade
  "etrade.title": "eTrade Stocks & RSUs",
  "etrade.subtitle": "Tax Year {year} — E1kv",
  "etrade.summary.title": "Capital Gains Summary {year}",
  "etrade.summary.totalGains": "Total Capital Gains",
  "etrade.summary.totalLosses": "Total Capital Losses",
  "etrade.summary.netGains": "Net Capital Gains",
  "etrade.summary.kest": "Capital Gains Tax (27.5%)",

  // Portfolio / moving-average cost basis
  "portfolio.info.title": "How is the gain calculated?",
  "portfolio.info.avgLabel": "Moving-average cost basis:",
  "portfolio.info.avgText":
    "Austria requires the moving-average cost basis (<eStgLink>§ 27a EStG</eStgLink>). Every acquisition (RSU vest, ESPP purchase) updates a running average cost across your entire holding period; a sale's gain is measured against that average. eTrade's Gain & Loss reports (FIFO/lot selection) are NOT permitted for this.",
  "portfolio.info.sourcesLabel": "Files required:",
  "portfolio.info.sourcesText":
    "BenefitHistory.xlsx (ESPP buys and RSU vests) and Trade Confirmation PDFs (sales). The average is only correct with the full acquisition history.",
  "portfolio.info.currencyText":
    "Use the <link>ECB reference rate</link> for each day.",
  "portfolio.info.lossText":
    "<b>Losses</b> can offset gains within the same year.",
  "portfolio.type.VEST": "RSU vesting",
  "portfolio.type.BUY": "ESPP purchase",
  "portfolio.type.EXERCISE": "Option exercise",
  "portfolio.type.SELL": "Sale",
  "portfolio.deleteAll": "Delete all",
  "portfolio.section.title": "Portfolio movements",
  "portfolio.section.subtitle":
    "All vests, ESPP buys and sales across all years — moving average, basis for Kennzahl 994/892",
  "portfolio.importBtn": "Import eTrade files",
  "portfolio.addManual": "Add manually",
  "portfolio.empty":
    "No portfolio movements yet. Import your eTrade files (BenefitHistory.xlsx + Trade Confirmations).",
  "portfolio.deleteAllConfirm":
    "Really delete ALL portfolio movements? This affects every year.",
  "portfolio.col.date": "Date",
  "portfolio.col.type": "Type",
  "portfolio.col.shares": "Shares",
  "portfolio.col.priceUSD": "Price (USD)",
  "portfolio.col.priceEUR": "Price (EUR)",
  "portfolio.col.rate": "ECB rate",
  "portfolio.col.totalShares": "Holding",
  "portfolio.col.avgCost": "Avg cost (EUR)",
  "portfolio.col.gainLoss": "Gain/Loss",
  "portfolio.col.year": "Year",
  "portfolio.col.gains": "Gains",
  "portfolio.col.losses": "Losses",
  "portfolio.col.kest": "KESt (27.5%)",
  "portfolio.import.title": "Import eTrade files",
  "portfolio.import.subtitle":
    "Upload BenefitHistory.xlsx and Trade Confirmation PDFs — the moving average is computed automatically",
  "portfolio.import.processing": "Processing files …",
  "portfolio.import.drag": "Drag files here or click (multiple allowed)",
  "portfolio.import.formats": "BenefitHistory.xlsx · Trade Confirmations",
  "portfolio.import.where.title": "Which files do you need?",
  "portfolio.import.where.espp":
    "BenefitHistory.xlsx — ESPP buys and RSU vests (download the expanded version, not the collapsed one).",
  "portfolio.import.where.orders":
    'Trade Confirmation PDFs — sales (filter the document type to "Trade Confirmation", pick the timeframe, apply, and download all of one year as a single PDF; repeat per year).',
  "portfolio.import.openOnEtrade": "Open on eTrade",
  "portfolio.import.where.note":
    "Important: import the FULL history from the first vest/purchase — otherwise the average is wrong.",
  "portfolio.import.script.title": "Prefer to download automatically?",
  "portfolio.import.script.desc":
    "Optional helper script (Node + Playwright). It opens a real browser window, you log in yourself (incl. 2FA), then it downloads BenefitHistory.xlsx and the trade confirmations (one file per year) automatically. Everything stays on your machine. Run it in an empty folder:",
  "portfolio.import.script.download":
    "Download helper script (etrade-download.mjs)",
  "portfolio.import.loadedFiles": "Loaded files",
  "portfolio.import.duplicateFile": "{name}: already added — skipped.",
  "portfolio.import.ratesError": "Could not load ECB rates: {error}",
  "portfolio.import.missingRates":
    "Missing an ECB rate for: {dates}. Please retry or add the rate manually.",
  "portfolio.import.yearSummary": "Preview: capital gains per year",
  "portfolio.import.finalPosition":
    "Current holding: {shares} shares · avg cost {avg}",
  "portfolio.import.commit": "Import {count} new movements",
  "portfolio.import.cancel": "Cancel",
  "portfolio.manual.title": "Add portfolio movement manually",
  "portfolio.manual.type": "Type",
  "portfolio.manual.date": "Date",
  "portfolio.manual.shares": "Shares",
  "portfolio.manual.priceUSD": "Price per share (USD)",
  "portfolio.manual.ecbRate": "ECB rate USD→EUR on date",
  "portfolio.manual.notes": "Note (optional)",
  "portfolio.manual.priceEURPreview": "Price in EUR",

  "etrade.otherBroker.title": "Loss Offset with Other Brokers",
  "etrade.otherBroker.subtitle":
    "e.g. Flatex, Dadat, BAWAG — Austrian brokers with automatic KeSt withholding",
  "etrade.otherBroker.gainsLabel": "Capital Gains (EUR)",
  "etrade.otherBroker.gainsHint":
    "Realised gains from your Austrian broker's annual statement",
  "etrade.otherBroker.lossesLabel": "Capital Losses (EUR)",
  "etrade.otherBroker.lossesHint":
    "Realised losses from your Austrian broker's annual statement",
  "etrade.otherBroker.paidKestLabel": "KeSt Already Paid (EUR)",
  "etrade.otherBroker.paidKestHint":
    "KeSt your broker automatically remitted to the tax authority",

  "flatexImport.button": "Import Flatex PDF",
  "flatexImport.drag": "Drop Flatex Tax Certificate PDF here or click",
  "flatexImport.processing": "Analysing PDF...",
  "flatexImport.scanned":
    "Scanned PDF detected — text extraction not possible. Please fill in fields manually.",
  "flatexImport.fetchError": "Error reading PDF: {error}",
  "flatexImport.gains": "Realised Gains",
  "flatexImport.losses": "Realised Losses",
  "flatexImport.net": "Net Gain/Loss",
  "flatexImport.paidKest": "KeSt Paid",
  "flatexImport.apply": "Apply values",
  "flatexImport.showRaw": "Show PDF text (for verification)",
  "flatexImport.loadOther": "Load different PDF",
  "flatexImport.warning":
    "Please verify values before applying — automatic detection is not always exact.",

  // AfA
  "afa.title": "Depreciation (AfA)",
  "afa.subtitle": "Tax Year {year} — Work Equipment & Assets",
  "afa.assets.title": "Assets",
  "afa.assets.add": "Add new asset",
  "afa.form.title": "Add Asset",
  "afa.form.description": "Description",
  "afa.form.category": "Category",
  "afa.form.purchaseDate": "Purchase Date",
  "afa.form.price": "Purchase Price gross (EUR incl. VAT)",
  "afa.form.usefulLife": "Useful Life (years)",
  "afa.form.usefulLifeHint": "Default: {years} years for {category}",
  "afa.form.businessUse": "Work Use (%)",
  "afa.form.businessUseHint": "At 100% work use the deduction is maximum",
  "afa.form.method": "Depreciation Method",
  "afa.form.methodLinear": "Linear (straight-line)",
  "afa.form.methodDegressive":
    "Degressive (30% declining, for purchases from July 2020)",
  "afa.form.gwgTitle": "Minor Asset (immediate write-off)",
  "afa.form.gwgText":
    "— Immediate deduction of {amount} in purchase year possible.",
  "afa.form.afaRequired": "Depreciation required (price over €{limit})",
  "afa.form.totalDeductible": "Total deductible amount:",
  "afa.form.annualLinear": "Annual depreciation (linear):",
  "afa.form.h1":
    "Purchase in H1 (Jan–Jun) → full annual depreciation: {amount} from purchase year (§16 Abs. 1 Z 8 lit. b EStG)",
  "afa.form.h2":
    "Purchase in H2 (Jul–Dec) → half-year depreciation: {amount} in purchase year + {rest} in final year (§16 Abs. 1 Z 8 lit. b EStG)",

  "afa.col.name": "Name",
  "afa.col.category": "Category",
  "afa.col.categoryHint":
    '<b>Furniture:</b> Only expenses for a tax-recognised home office room may be depreciated here — a dedicated, clearly separated space used almost exclusively for work. For home office furniture (desk, chair, etc.) please enter on the "Work Expenses" page (deductible up to €300/year). (<link16>§16 Abs. 1 Z 7a EStG</link16>; <link20>§20 Abs. 1 Z 2 lit. d</link20>)',
  "afa.col.date": "Purchase Date",
  "afa.col.price": "Price",
  "afa.col.business": "Work Use",
  "afa.col.type": "Type",
  "afa.col.deduction": "Deduction {year}",
  "afa.gwgBadge": "Immediate write-off",
  "afa.afaBadge": "AfA {years} yr.",
  "afa.plan.title": "Depreciation Schedule",
  "afa.plan.year": "Year",
  "afa.plan.deduction": "Depreciation",
  "afa.plan.bookValue": "Book Value",
  "afa.total": "Total AfA Deduction {year}",
  "afa.empty": "No assets added yet",
  "afa.emptySubtitle": "Add e.g. a phone, laptop or furniture",
  "afa.summary.title": "AfA Deduction Tax Year {year}",
  "afa.summary.note":
    "Flows into Field 169 (digital work tools) or 724 (other work expenses)",

  // Work Expenses
  "wk.title": "Work Expenses",
  "wk.subtitle": "Tax Year {year} — Deductible Expenses as Employee",

  "wk.furniture.title": "Ergonomic Furniture",
  "wk.furniture.subtitle":
    "Home office equipment — max. €300 per year — Field 158",
  "wk.furniture.law":
    "§16 Abs. 1 Z 7a EStG — only with at least 26 home office days",
  "wk.furniture.cost": "Ergonomic furniture expenses this year (EUR)",
  "wk.furniture.costHint":
    "Desk, office chair, lighting — actual costs (keep receipts!)",
  "wk.furniture.carryOver": "Carry-over from prior year (EUR)",
  "wk.furniture.carryOverHint": "Unused amount from the previous year",
  "wk.furniture.available": "Total available",
  "wk.furniture.deduction": "Deduction this year",
  "wk.furniture.nextCarryOver": "Carry-over to next year",
  "wk.furniture.carryOverNote": "Carried over to next year",

  "wk.internet.title": "Internet",
  "wk.internet.subtitle": "Work-related share of internet costs — Field 169",
  "wk.internet.law": "§16 Abs. 1 Z 8 EStG",
  "wk.internet.monthly": "Monthly internet costs (gross)",
  "wk.internet.monthlyHint": "Total cost of your internet connection per month",
  "wk.internet.workPercent": "Work use percentage",
  "wk.internet.workPercentHint": "Typically 50–80% with regular home office",
  "wk.internet.annual": "Annual costs:",
  "wk.internet.workShare": "Work share ({pct}%):",

  "wk.union.title": "Union & Professional Associations",
  "wk.union.subtitle": "Membership fees — Field 717",
  "wk.union.law": "§16 Abs. 1 Z 3 EStG — fully deductible, no €132 deductible",
  "wk.union.label": "Annual membership fees total (EUR)",
  "wk.union.labelHint": "Union and professional association memberships",
  "wk.union.examples": "Examples:",
  "wk.union.exNote": "Note: works council levy belongs in Field 724",
  "wk.union.ex1": "• Union membership (GPA, vida, etc.)",
  "wk.union.ex2": "• Professional association membership",
  "wk.union.ex3": "• Interest representation fees",

  "wk.literature.title": "Professional Literature",
  "wk.literature.subtitle": "Books & journals required for work — Field 720",
  "wk.literature.law": "§16 Abs. 1 Z 6 EStG — must have professional relevance",
  "wk.literature.label": "Professional literature expenses (EUR)",
  "wk.literature.labelHint":
    "Only work-relevant literature — general books are not deductible",
  "wk.literature.examples": "Examples:",
  "wk.literature.ex1": "• Technical books (e.g. programming books)",
  "wk.literature.ex2": "• Trade journals & magazines",
  "wk.literature.ex3": "• Online professional databases (annual subscription)",

  "wk.training.title": "Further & Vocational Training",
  "wk.training.subtitle": "Courses, seminars, retraining — Field 722",
  "wk.training.law": "§16 Abs. 1 Z 10 EStG — must be professionally relevant",
  "wk.training.label": "Training costs total (EUR)",
  "wk.training.labelHint":
    "Course fees, seminar costs, exam fees — keep receipts",
  "wk.training.examples": "Examples:",
  "wk.training.exNote":
    "Requirement: course must be useful for your current profession",
  "wk.training.ex1": "• Language courses (if professionally necessary)",
  "wk.training.ex2": "• Specialist courses & certifications",
  "wk.training.ex3": "• Online learning platforms (Udemy, Coursera etc.)",
  "wk.training.ex4": "• Congresses & professional conferences",

  "wk.travel.title": "Business Travel Expenses",
  "wk.travel.subtitle": "Business trips not reimbursed by employer — Field 721",
  "wk.travel.law":
    "§16 Abs. 1 Z 9 EStG — commuting does not belong here (→ commuter allowance Field 718)",
  "wk.travel.label": "Unreimbursed travel expenses (EUR)",
  "wk.travel.labelHint":
    "Transport costs, daily allowances and accommodation for business trips",
  "wk.travel.examples": "What belongs here:",
  "wk.travel.exNote": "Only the portion not reimbursed by the employer",
  "wk.travel.ex1":
    "• Transport for business trips (train, flight, km allowance)",
  "wk.travel.ex2": "• Daily allowance for trips over 25 km",
  "wk.travel.ex3": "• Accommodation costs",

  "wk.other.title": "Other Work Expenses",
  "wk.other.subtitle": "Everything not covered above — Field 724",
  "wk.other.law": "§16 Abs. 1 EStG — catch-all category",
  "wk.other.label": "Other work expenses total (EUR)",
  "wk.other.examples": "What belongs here:",
  "wk.other.ex1": "• Works council levy",
  "wk.other.ex2": "• Application costs",
  "wk.other.ex3": "• Work clothing (specific work attire only)",

  "wk.summary.title": "Work Expenses Overview {year}",
  "wk.summary.furniture": "Ergonomic Furniture",
  "wk.summary.internet": "Internet (work share)",
  "wk.summary.union": "Union & Professional Associations",
  "wk.summary.literature": "Professional Literature",
  "wk.summary.training": "Training Costs",
  "wk.summary.travel": "Business Travel Expenses",
  "wk.summary.other": "Other Work Expenses",
  "wk.summary.afaNote": "+ AfA Depreciation (see AfA page)",
  "wk.summary.subtotal": "Subtotal Work Expenses",
  "wk.summary.hint":
    "Note: The automatic work expense lump sum (€132) is applied by the tax office — only if your expenses exceed this does the breakdown pay off.",

  // FinanzOnline
  "fo.title": "FinanzOnline Guide",
  "fo.subtitle": "Tax Year {year} — Step-by-Step Instructions",
  "fo.open": "Open FinanzOnline",
  "fo.openSubtitle": "Income tax return (E1) {year}",
  "fo.openButton": "FinanzOnline",
  "fo.overview.title": "Your Fields at a Glance",
  "fo.kz994": "Foreign Capital Gains (E1kv)",
  "fo.kz892": "Foreign Capital Losses (E1kv)",
  "fo.kz981": "Domestic Capital Gains (E1kv)",
  "fo.kz891": "Domestic Capital Losses (E1kv)",
  "fo.kz899": "Domestic KESt Withheld (E1kv)",
  "fo.kz158": "Ergonomic Furniture",
  "fo.kz169": "Digital Work Tools + Internet",
  "fo.kz717": "Union & Professional Associations",
  "fo.kz720": "Professional Literature",
  "fo.kz722": "Training Costs",
  "fo.kz721": "Business Travel Expenses",
  "fo.kz724": "Other Work Expenses + Furniture AfA",
  "fo.steps.title": "Step-by-Step Guide",
  "fo.step1.title": "Log in to FinanzOnline",
  "fo.step1.1": "1. Go to finanzonline.bmf.gv.at",
  "fo.step1.2": "2. Log in with Handy-Signatur, ID Austria or your credentials",
  "fo.step1.3": '3. Click on "Erklärungen" → "Einkommensteuererklärung (E1)"',
  "fo.step3.title": "Capital Gains",
  "fo.step3.text":
    'You find capital income under "Außerbetriebliche Einkunftsarten" → "Einkünfte aus Kapitalvermögen — Beilage E1kv". This supplement is for domestic and foreign capital income.',
  "fo.step3.formTitle": "Einkünfte aus Kapitalvermögen — Beilage E1kv",
  "fo.step3.foreignSection": "Foreign Capital Income",
  "fo.step3.domesticSection": "Domestic Capital Income",
  "fo.step3.taxesSection": "Withheld Taxes",
  "fo.step3.kz994label":
    "Realised capital gains from foreign capital investments",
  "fo.step3.kz994note":
    "Total gains from sales at foreign brokers (e.g. eTrade)",
  "fo.step3.kz892label":
    "Losses from realised capital gains from foreign capital investments",
  "fo.step3.kz892note": "Total losses from sales at foreign brokers",
  "fo.step3.kz981label":
    "Realised capital gains from domestic capital investments",
  "fo.step3.kz981note":
    "Total gains from sales at Austrian brokers (e.g. Flatex)",
  "fo.step3.kz891label":
    "Losses from realised capital gains from domestic capital investments",
  "fo.step3.kz891note": "Total losses from sales at Austrian brokers",
  "fo.step3.kz899label": "Domestic capital gains tax withheld",
  "fo.step3.kz899note":
    "KeSt already remitted by Austrian broker (e.g. Flatex) — credited by tax authority",
  "fo.step3.howTitle": "How to determine the value (eTrade):",
  "fo.step3.totalGains": "Total capital gains: {amount}",
  "fo.step3.totalLosses": "− Total capital losses: −{amount}",
  "fo.step3.netGains": "= Net capital gains: {amount}",
  "fo.step3.kest":
    "The tax office calculates capital gains tax (27.5%) automatically: {amount}",
  "fo.step3.transTitle": "Individual transactions (for your records):",
  "fo.step3.col.date": "Date",
  "fo.step3.col.description": "Description",
  "fo.step3.col.shares": "Shares",
  "fo.step3.col.revenueEUR": "Proceeds (EUR)",
  "fo.step3.col.gainLoss": "Gain/Loss",
  "fo.step3.shares": "{shares} shares",
  "fo.step4.title": "Work Expenses",
  "fo.step4.text":
    'You find Werbungskosten under "Außerbetriebliche Einkunftsarten" → "Einkünfte aus nichtselbständiger Arbeit (Werbungskosten)". Enter the following amounts there:',
  "fo.step4.formTitle":
    "Einkünfte aus nichtselbständiger Arbeit (Werbungskosten)",
  "fo.step4.kz169label":
    "Digital Work Tools (device AfA + internet + accessories)",
  "fo.step4.kz169note":
    "Computer, phone, tablet, monitor (AfA) + internet (work share) + accessories",
  "fo.step4.kz158label": "Ergonomic Furniture (home office)",
  "fo.step4.kz158note": "Desk, office chair — max. €300 per year",
  "fo.step4.kz717label": "Union & Professional Associations",
  "fo.step4.kz717note": "Union fees, professional association memberships",
  "fo.step4.kz720label": "Professional Literature",
  "fo.step4.kz720note": "Books and journals required for work",
  "fo.step4.kz722label": "Further & Vocational Training",
  "fo.step4.kz722note":
    "Courses, seminars, language courses (work-related), certifications",
  "fo.step4.kz721label": "Business Travel Expenses",
  "fo.step4.kz721note":
    "Business trips — only the portion not reimbursed by employer",
  "fo.step4.kz724label": "Other Work Expenses",
  "fo.step4.kz724note": "Works council levy, application costs + furniture AfA",
  "fo.stepFinal.title": "Submit and Wait",
  "fo.stepFinal.1": "1. Review all entries once more",
  "fo.stepFinal.2": '2. Click "Vorschau" to preview the declaration',
  "fo.stepFinal.3": '3. Click "Einreichen" to submit',
  "fo.stepFinal.4":
    "4. You will receive the tax assessment within a few weeks by post or in FinanzOnline",
  "fo.stepFinal.deadline":
    "<b>Deadline:</b> For a mandatory assessment (e.g. foreign capital gains without KESt withholding above €730), the income tax return must be filed by 30 April of the following year — or 30 June when submitted electronically via FinanzOnline.",
  "fo.copy": "Copy",

  // PDF Export
  "pdf.export": "Export as PDF",
  "pdf.generated": "Generated on {date}",
  "pdf.footer": "Created with Steuerhelfer",
  "pdf.description": "Description",
  "pdf.amount": "Amount (EUR)",
  "pdf.formE1kv": "Form E1kv — Capital Gains",
  "pdf.formE1": "Form E1 — Work Expenses",
  "pdf.capital.title": "Capital Gains (E1kv)",
  "pdf.kestEstimate": "Estimated Capital Gains Tax (27.5%)",
  "pdf.wk.detail": "Work Expenses Breakdown",
  "pdf.afa.title": "Depreciation (AfA)",

  // PDF import (used in AssetForm)
  "invoiceImport.drag": "Drag invoice (PDF) here or click",
  "invoiceImport.processing": "Analysing PDF...",
  "invoiceImport.onlyPdf": "Only PDF files are supported.",
  "invoiceImport.fetchError": "Error reading PDF: {error}",
  "invoiceImport.scanned":
    "Scanned PDF detected — text extraction not possible. Please fill in fields manually.",
  "invoiceImport.success":
    "PDF successfully analysed. Please check values and correct if needed.",
  "invoiceImport.showRaw": "Show extracted PDF text (for verification)",
  "invoiceImport.loadOther": "Load different PDF",

  // Confidence
  "confidence.high": "Detected with confidence",
  "confidence.medium": "Uncertain — please check",
  "confidence.low": "Not found",
};

export default en;
