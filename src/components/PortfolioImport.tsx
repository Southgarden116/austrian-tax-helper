import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Download,
  ExternalLink,
  FileUp,
  Loader2,
  X,
} from "lucide-react";
import { useIntl } from "react-intl";
import { fetchEcbRatesBatch } from "../utils/ecbRates";
import { parseEtradeInputFile } from "../utils/parseEtradeFiles";
import type { RawPortfolioEvent } from "../utils/parseEtradeFiles";
import { runTaxEngine } from "../utils/taxEngine";
import { formatEUR, formatUSD, genId, KEST_RATE } from "../utils/calculations";
import type { PortfolioEvent } from "../types";

interface Props {
  existingEvents: PortfolioEvent[];
  onCommit: (newEvents: PortfolioEvent[]) => void;
  onClose: () => void;
}

function eventKey(e: {
  date: string;
  type: string;
  shares: number;
  pricePerShareUSD: number;
}) {
  return `${e.date}|${e.type}|${e.shares}|${e.pricePerShareUSD}`;
}

// Deep links into eTrade's stock-plan area where each file is downloaded.
const ETRADE_URLS = {
  espp: "https://us.etrade.com/etx/sp/stockplan#/myAccount/benefitHistory",
  confirmations: "https://edoc.etrade.com/e/t/onlinedocs/docsearch",
};

function EtradeLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline inline-flex items-center gap-0.5 whitespace-nowrap font-medium"
    >
      {label}
      <ExternalLink size={11} />
    </a>
  );
}

export default function PortfolioImport({
  existingEvents,
  onCommit,
  onClose,
}: Props) {
  const intl = useIntl();
  const t = (id: string, vals?: Record<string, string | number>) =>
    intl.formatMessage({ id }, vals);

  const [raw, setRaw] = useState<RawPortfolioEvent[]>([]);
  const [rates, setRates] = useState<Map<string, number>>(new Map());
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track which files were already added (by name+size) so re-dropping the same
  // file is ignored — without collapsing genuinely identical lots within a file.
  const processedSigsRef = useRef<Set<string>>(new Set());

  // Rates that already live on existing events (don't refetch those dates).
  const existingRateByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of existingEvents) {
      if (e.ecbRateUSDEUR > 0 && !m.has(e.date)) m.set(e.date, e.ecbRateUSDEUR);
    }
    return m;
  }, [existingEvents]);

  function rateFor(date: string): number | null {
    return rates.get(date) ?? existingRateByDate.get(date) ?? null;
  }

  async function handleFiles(files: FileList | File[]) {
    setLoading(true);
    const newWarnings: string[] = [];
    const collected: RawPortfolioEvent[] = [];
    const names: string[] = [];

    for (const file of Array.from(files)) {
      const sig = `${file.name}|${file.size}`;
      if (processedSigsRef.current.has(sig)) {
        newWarnings.push(
          t("portfolio.import.duplicateFile", { name: file.name }),
        );
        continue;
      }
      processedSigsRef.current.add(sig);
      names.push(file.name);
      try {
        const res = await parseEtradeInputFile(file);
        collected.push(...res.events);
        newWarnings.push(...res.warnings);
      } catch (e) {
        newWarnings.push(
          `${file.name}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // No content-level dedup here: two genuinely identical fills (same date,
    // size and price) are distinct sales and must both be kept. Accidental
    // re-imports are guarded by the file-signature check above.
    const merged = [...raw, ...collected];
    setRaw(merged);
    setWarnings((w) => [...w, ...newWarnings]);
    setFileNames((f) => [...f, ...names]);

    // Fetch ECB rates for any dates we don't already have.
    const needed = [
      ...new Set(
        merged
          .map((e) => e.date)
          .filter((d) => !rates.has(d) && !existingRateByDate.has(d)),
      ),
    ];
    if (needed.length > 0) {
      try {
        const fetched = await fetchEcbRatesBatch(needed);
        setRates((prev) => {
          const next = new Map(prev);
          for (const [d, r] of fetched) next.set(d, r);
          return next;
        });
      } catch (e) {
        setWarnings((w) => [
          ...w,
          t("portfolio.import.ratesError", {
            error: e instanceof Error ? e.message : String(e),
          }),
        ]);
      }
    }
    setLoading(false);
  }

  // Build the combined PortfolioEvent list (existing + newly parsed) and run
  // the moving-average engine so the preview shows the true resulting ledger.
  const { preview, newEvents, missingRates } = useMemo(() => {
    // Count copies of each already-committed event so a re-import skips exactly
    // those and still adds genuinely new (or additional identical) lots.
    const existingCounts = new Map<string, number>();
    for (const e of existingEvents) {
      const k = eventKey(e);
      existingCounts.set(k, (existingCounts.get(k) ?? 0) + 1);
    }
    const missing = new Set<string>();

    const newEvts: PortfolioEvent[] = [];
    for (const r of raw) {
      const k = eventKey(r);
      const already = existingCounts.get(k) ?? 0;
      if (already > 0) {
        existingCounts.set(k, already - 1); // consume one already-imported copy
        continue;
      }
      const rate = rateFor(r.date);
      if (rate == null) missing.add(r.date);
      newEvts.push({
        id: genId(),
        date: r.date,
        type: r.type,
        shares: r.shares,
        pricePerShareUSD: r.pricePerShareUSD,
        ecbRateUSDEUR: rate ?? 0,
        symbol: r.symbol,
        source: r.source,
        notes: r.notes,
      });
    }

    const combined = [...existingEvents, ...newEvts];
    const engine = runTaxEngine(combined);
    return {
      preview: engine,
      newEvents: newEvts,
      missingRates: [...missing],
    };
  }, [raw, rates, existingEvents, existingRateByDate]);

  const byYear = Object.values(preview.byYear).sort((a, b) => a.year - b.year);
  const canCommit = newEvents.length > 0 && missingRates.length === 0;

  function doCommit() {
    onCommit(newEvents);
    onClose();
  }

  return (
    <div className="card border-blue-200 bg-blue-50 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {t("portfolio.import.title")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("portfolio.import.subtitle")}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-100"
            : "border-blue-300 bg-white hover:border-blue-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-gray-600">{t("portfolio.import.processing")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileUp className="text-blue-400" size={32} />
            <p className="font-medium text-gray-700">
              {t("portfolio.import.drag")}
            </p>
            <p className="text-sm text-gray-500">
              {t("portfolio.import.formats")}
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* What to import */}
      <div className="bg-white rounded-xl p-4 text-sm text-gray-700 space-y-1">
        <p className="font-semibold text-gray-800">
          {t("portfolio.import.where.title")}
        </p>
        <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
          <li>
            {t("portfolio.import.where.espp")}{" "}
            <EtradeLink
              href={ETRADE_URLS.espp}
              label={t("portfolio.import.openOnEtrade")}
            />
          </li>
          <li>
            {t("portfolio.import.where.orders")}{" "}
            <EtradeLink
              href={ETRADE_URLS.confirmations}
              label={t("portfolio.import.openOnEtrade")}
            />
          </li>
        </ul>
        <p className="text-xs text-amber-700 pt-1">
          {t("portfolio.import.where.note")}
        </p>
      </div>

      {/* Optional: automated download helper script */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-2">
        <p className="font-semibold text-gray-800">
          {t("portfolio.import.script.title")}
        </p>
        <p className="text-gray-600">{t("portfolio.import.script.desc")}</p>
        <pre className="bg-white border border-blue-100 rounded-lg p-2 text-xs text-gray-700 overflow-x-auto">
          npm install playwright{"\n"}npx playwright install chromium{"\n"}
          node etrade-download.mjs
        </pre>
        <a
          href={`${import.meta.env.BASE_URL}etrade-download.mjs`}
          download
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
        >
          <Download size={16} />
          {t("portfolio.import.script.download")}
        </a>
      </div>

      {fileNames.length > 0 && (
        <div className="text-xs text-gray-500">
          {t("portfolio.import.loadedFiles")}: {fileNames.join(", ")}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1 max-h-32 overflow-auto">
          {warnings.map((w, i) => (
            <div
              key={`${w}-${i}`}
              className="flex gap-2 text-sm text-amber-800"
            >
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {w}
            </div>
          ))}
        </div>
      )}

      {missingRates.length > 0 && (
        <div className="flex gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          {t("portfolio.import.missingRates", {
            dates: missingRates.join(", "),
          })}
        </div>
      )}

      {preview.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
          {preview.errors.map((er, i) => (
            <div key={i} className="flex gap-2 text-sm text-red-700">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              {er.message}
            </div>
          ))}
        </div>
      )}

      {/* Per-year summary */}
      {byYear.length > 0 && (
        <div className="bg-white rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">
            {t("portfolio.import.yearSummary")}
          </h4>
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b border-gray-100">
              <tr>
                <th className="text-left py-1">{t("portfolio.col.year")}</th>
                <th className="text-right py-1">{t("portfolio.col.gains")}</th>
                <th className="text-right py-1">{t("portfolio.col.losses")}</th>
                <th className="text-right py-1">{t("portfolio.col.kest")}</th>
              </tr>
            </thead>
            <tbody>
              {byYear.map((y) => {
                const net = Math.max(0, y.totalGainsEUR - y.totalLossesEUR);
                return (
                  <tr key={y.year} className="border-b border-gray-50">
                    <td className="py-1 font-medium">{y.year}</td>
                    <td className="py-1 text-right font-mono">
                      {formatEUR(y.totalGainsEUR)}
                    </td>
                    <td className="py-1 text-right font-mono text-green-700">
                      −{formatEUR(y.totalLossesEUR)}
                    </td>
                    <td className="py-1 text-right font-mono text-red-700">
                      {formatEUR(net * KEST_RATE)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">
            {t("portfolio.import.finalPosition", {
              shares: preview.finalShares,
              avg: formatEUR(preview.finalAvgCostEUR),
            })}
          </p>
        </div>
      )}

      {/* Full ledger */}
      {preview.processed.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="th text-xs">{t("portfolio.col.date")}</th>
                <th className="th text-xs">{t("portfolio.col.type")}</th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.shares")}
                </th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.priceUSD")}
                </th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.rate")}
                </th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.priceEUR")}
                </th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.totalShares")}
                </th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.avgCost")}
                </th>
                <th className="th text-xs text-right">
                  {t("portfolio.col.gainLoss")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {preview.processed.map((pe, i) => {
                const e = pe.event;
                const isSell = e.type === "SELL";
                return (
                  <tr key={`${e.id}-${i}`} className="hover:bg-gray-50">
                    <td className="td">{e.date}</td>
                    <td className="td">
                      <span
                        className={isSell ? "text-orange-600" : "text-blue-600"}
                      >
                        {t(`portfolio.type.${e.type}`)}
                      </span>
                    </td>
                    <td className="td text-right font-mono">
                      {isSell ? "−" : "+"}
                      {e.shares}
                    </td>
                    <td className="td text-right font-mono">
                      {formatUSD(e.pricePerShareUSD)}
                    </td>
                    <td className="td text-right font-mono">
                      {e.ecbRateUSDEUR ? e.ecbRateUSDEUR.toFixed(4) : "—"}
                    </td>
                    <td className="td text-right font-mono">
                      {formatEUR(pe.pricePerShareEUR)}
                    </td>
                    <td className="td text-right font-mono">
                      {pe.totalSharesAfter}
                    </td>
                    <td className="td text-right font-mono">
                      {formatEUR(pe.avgCostEURAfter)}
                    </td>
                    <td
                      className={`td text-right font-bold ${
                        !isSell
                          ? "text-gray-300"
                          : pe.realizedGainLossEUR >= 0
                            ? "text-green-600"
                            : "text-orange-600"
                      }`}
                    >
                      {isSell
                        ? `${pe.realizedGainLossEUR >= 0 ? "+" : ""}${formatEUR(pe.realizedGainLossEUR)}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          className="btn-primary flex items-center gap-2"
          onClick={doCommit}
          disabled={!canCommit}
        >
          <Download size={16} />
          {t("portfolio.import.commit", { count: newEvents.length })}
        </button>
        <button className="btn-secondary" onClick={onClose}>
          {t("portfolio.import.cancel")}
        </button>
      </div>
    </div>
  );
}
