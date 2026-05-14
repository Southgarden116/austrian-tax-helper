import { getPdfjs } from "./pdfWorker";

export interface InvoiceExtraction {
  date: string        // YYYY-MM-DD or ''
  totalGross: number  // Bruttobetrag inkl. MwSt., 0 if not found
  description: string // Artikelbezeichnung, '' if not found
  confidence: {
    date: 'high' | 'medium' | 'low'
    amount: 'high' | 'medium' | 'low'
    description: 'high' | 'medium' | 'low'
  }
  rawText: string     // For debugging / manual review
  isScanned: boolean  // True if PDF appears to be an image-only scan
}

// Austrian number format: 1.234,56 → 1234.56
function parseAtAmount(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'))
}

// DD.MM.YYYY → YYYY-MM-DD
function toIsoDate(d: string, m: string, y: string): string {
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// ---- Date extraction ----
// Austrian invoices use DD.MM.YYYY. Find the date closest to a date-keyword.
function extractDate(lines: string[]): { value: string; confidence: 'high' | 'medium' | 'low' } {
  const DATE_RE = /\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g
  const LABEL_RE = /rechnungsdatum|datum|ausstellungsdatum|invoice\s*date|date/i

  // First pass: find a date on a line that contains a date label
  for (const line of lines) {
    if (LABEL_RE.test(line)) {
      const m = line.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/)
      if (m) return { value: toIsoDate(m[1], m[2], m[3]), confidence: 'high' }
    }
  }

  // Second pass: collect all dates found in the document, pick the earliest plausible one
  const allDates: string[] = []
  for (const line of lines) {
    DATE_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = DATE_RE.exec(line)) !== null) {
      const month = parseInt(m[2])
      const year = parseInt(m[3])
      if (month >= 1 && month <= 12 && year >= 2015 && year <= 2030) {
        allDates.push(toIsoDate(m[1], m[2], m[3]))
      }
    }
  }

  if (allDates.length > 0) {
    // Sort and return the most common or first
    allDates.sort()
    return { value: allDates[0], confidence: 'medium' }
  }

  return { value: '', confidence: 'low' }
}

// ---- Amount extraction ----
// Look for lines with total-keywords (Gesamt, Brutto, Zu zahlen, etc.)
// then grab the largest adjacent amount. Fallback: the largest amount on page.
function extractTotal(lines: string[]): { value: number; confidence: 'high' | 'medium' | 'low' } {
  // Austrian amount pattern: optional €, then number in AT format (1.234,56 or 1234,56)
  const AT_AMOUNT = /(?:€\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})(?:\s*€)?/g

  const TOTAL_LABELS = [
    'gesamtbetrag', 'gesamt', 'bruttobetrag', 'brutto', 'endbetrag',
    'zu\s*zahlen', 'zu\s*bezahlen', 'rechnungsbetrag', 'total',
    'inkl', 'summe', 'zahlbetrag',
  ]
  const TOTAL_RE = new RegExp(TOTAL_LABELS.join('|'), 'i')

  const EXCLUDE_LABELS = /mwst|ust|steuer|netto|rabatt|skonto|versand/i

  // Pass 1: lines with total keywords
  const candidates: { amount: number; confidence: 'high' | 'medium' }[] = []

  for (const line of lines) {
    if (TOTAL_RE.test(line) && !EXCLUDE_LABELS.test(line)) {
      AT_AMOUNT.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = AT_AMOUNT.exec(line)) !== null) {
        const val = parseAtAmount(m[1])
        if (val > 0.01 && val < 100_000) {
          candidates.push({ amount: val, confidence: 'high' })
        }
      }
    }
  }

  if (candidates.length > 0) {
    // Pick the largest total-labeled amount (likely the final sum)
    const best = candidates.reduce((a, b) => a.amount > b.amount ? a : b)
    return { value: best.amount, confidence: best.confidence }
  }

  // Pass 2: collect all amounts on the page, return the largest
  const allAmounts: number[] = []
  const fullText = lines.join('\n')
  AT_AMOUNT.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = AT_AMOUNT.exec(fullText)) !== null) {
    const val = parseAtAmount(m[1])
    if (val > 0.01 && val < 100_000) allAmounts.push(val)
  }

  if (allAmounts.length > 0) {
    return { value: Math.max(...allAmounts), confidence: 'low' }
  }

  return { value: 0, confidence: 'low' }
}

// ---- Description extraction ----
// Try to find the item name: look for lines in the item table area,
// typically after "Bezeichnung", "Artikel", "Beschreibung" header,
// or the longest non-numeric meaningful line near the middle of the document.
function extractDescription(lines: string[]): { value: string; confidence: 'high' | 'medium' | 'low' } {
  const HEADER_RE = /bezeichnung|artikel|beschreibung|produkt|leistung|item|description|pos\b/i
  const SKIP_RE = /rechnung|invoice|steuer|mwst|ust|gesamt|summe|adresse|tel\.|fax|www\.|\.at|\.com|gmbh|kg\b|ges\.m\.b\.h/i
  const MOSTLY_NUMERIC = /^\s*[\d\s€%,.\-+*/:]+\s*$/

  // Pass 1: find a line right after a table header
  let foundHeader = false
  for (const line of lines) {
    if (HEADER_RE.test(line)) { foundHeader = true; continue }
    if (foundHeader) {
      const clean = line.trim()
      if (clean.length > 5 && !MOSTLY_NUMERIC.test(clean) && !SKIP_RE.test(clean)) {
        // Take just the first ~60 chars as description
        return { value: clean.slice(0, 80), confidence: 'high' }
      }
    }
  }

  // Pass 2: find the longest meaningful line in the middle section of the document
  const midStart = Math.floor(lines.length * 0.15)
  const midEnd = Math.floor(lines.length * 0.75)
  const midLines = lines.slice(midStart, midEnd)

  const candidates = midLines
    .map(l => l.trim())
    .filter(l => l.length > 8 && l.length < 120 && !MOSTLY_NUMERIC.test(l) && !SKIP_RE.test(l))
    .sort((a, b) => b.length - a.length)

  if (candidates.length > 0) {
    return { value: candidates[0].slice(0, 80), confidence: 'medium' }
  }

  return { value: '', confidence: 'low' }
}

// ---- Main entry point ----
export async function parsePdfInvoice(file: File): Promise<InvoiceExtraction> {
  const pdfjsLib = await getPdfjs()

  const arrayBuffer = await file.arrayBuffer()

  let doc: Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>
  try {
    doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`PDF konnte nicht gelesen werden: ${msg}`)
  }

  const lineGroups: Map<number, { x: number; text: string }[]> = new Map()

  for (let p = 1; p <= Math.min(doc.numPages, 3); p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()

    // Group text items by rounded Y coordinate (= same line)
    for (const item of content.items as { str: string; transform: number[] }[]) {
      if (!item.str?.trim()) continue
      const y = Math.round(item.transform[5])
      if (!lineGroups.has(y)) lineGroups.set(y, [])
      lineGroups.get(y)!.push({ x: item.transform[4], text: item.str })
    }
  }

  // Sort lines top-to-bottom (higher Y = higher on page in PDF coords)
  const sortedLines = [...lineGroups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, items]) =>
      items.sort((a, b) => a.x - b.x).map(i => i.text).join(' ')
    )

  const rawText = sortedLines.join('\n')
  const isScanned = sortedLines.length < 5 || rawText.trim().length < 50

  if (isScanned) {
    return {
      date: '', totalGross: 0, description: '',
      confidence: { date: 'low', amount: 'low', description: 'low' },
      rawText, isScanned: true,
    }
  }

  const date = extractDate(sortedLines)
  const amount = extractTotal(sortedLines)
  const description = extractDescription(sortedLines)

  return {
    date: date.value,
    totalGross: amount.value,
    description: description.value,
    confidence: {
      date: date.confidence,
      amount: amount.confidence,
      description: description.confidence,
    },
    rawText,
    isScanned: false,
  }
}
