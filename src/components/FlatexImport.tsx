import { useRef, useState } from "react";
import { FileUp, RefreshCw } from "lucide-react";
import { useIntl, FormattedMessage } from "react-intl";
import { parseFlatexReport } from "../utils/parseFlatexReport";
import type { FlatexExtraction } from "../utils/parseFlatexReport";
import { formatEUR } from "../utils/calculations";

function ConfidenceDot({ level }: { level: "high" | "medium" | "low" }) {
  const color =
    level === "high"
      ? "bg-green-500"
      : level === "medium"
        ? "bg-yellow-400"
        : "bg-red-400";
  const title =
    level === "high"
      ? "Sicher erkannt"
      : level === "medium"
        ? "Unsicher — bitte prüfen"
        : "Nicht gefunden";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color} flex-shrink-0`}
      title={title}
    />
  );
}

interface Props {
  onApply: (gains: number, losses: number, paidKest: number) => void;
}

export default function FlatexImport({ onApply }: Props) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FlatexExtraction | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(intl.formatMessage({ id: "invoiceImport.onlyPdf" }));
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const r = await parseFlatexReport(file);
      setResult(r);
    } catch (e) {
      setError(
        intl.formatMessage(
          { id: "flatexImport.fetchError" },
          { error: e instanceof Error ? e.message : String(e) },
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError("");
    setShowRaw(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (result) {
    return (
      <div className="space-y-3">
        {result.isScanned ? (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <FormattedMessage id="flatexImport.scanned" />
          </div>
        ) : (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-2">
              <p className="text-xs text-amber-700 font-medium">
                <FormattedMessage id="flatexImport.warning" />
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <ConfidenceDot level={result.confidence.gains} />
                  <FormattedMessage id="flatexImport.gains" />
                </div>
                <span className="font-semibold text-right">
                  {formatEUR(result.gains)}
                </span>

                <div className="flex items-center gap-2 text-gray-600">
                  <ConfidenceDot level={result.confidence.losses} />
                  <FormattedMessage id="flatexImport.losses" />
                </div>
                <span className="font-semibold text-right">
                  {formatEUR(result.losses)}
                </span>

                <div className="flex items-center gap-2 font-semibold border-t border-gray-200 pt-1">
                  <ConfidenceDot level={result.confidence.gains} />
                  <FormattedMessage id="flatexImport.net" />
                </div>
                <span
                  className={`font-bold text-right border-t border-gray-200 pt-1 ${result.netGainLoss < 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatEUR(result.netGainLoss)}
                </span>

                <div className="flex items-center gap-2 text-gray-600">
                  <ConfidenceDot level={result.confidence.paidKest} />
                  <FormattedMessage id="flatexImport.paidKest" />
                </div>
                <span className="font-semibold text-right">
                  {formatEUR(result.paidKest)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="btn-primary flex-1"
                onClick={() =>
                  onApply(result.gains, result.losses, result.paidKest)
                }
              >
                <FormattedMessage id="flatexImport.apply" />
              </button>
              <button className="btn-secondary" onClick={reset}>
                <RefreshCw size={15} />
              </button>
            </div>

            <button
              className="text-xs text-gray-400 hover:text-gray-600 underline"
              onClick={() => setShowRaw(!showRaw)}
            >
              <FormattedMessage id="flatexImport.showRaw" />
            </button>
            {showRaw && (
              <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                {result.rawText}
              </pre>
            )}
          </>
        )}
        {result.isScanned && (
          <button className="btn-secondary text-sm" onClick={reset}>
            <FormattedMessage id="flatexImport.loadOther" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors text-sm ${
          dragOver
            ? "border-at-red bg-red-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? (
          <span className="text-gray-500">
            <FormattedMessage id="flatexImport.processing" />
          </span>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <FileUp size={16} />
            <span>
              <FormattedMessage id="flatexImport.drag" />
            </span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
        }}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
