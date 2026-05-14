import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useIntl, FormattedMessage } from "react-intl";
import { useTax } from "../context/TaxContext";
import {
  calculateAfa,
  DEFAULT_USEFUL_LIFE,
  formatEUR,
  genId,
  GWG_LIMIT,
  isPurchaseH2,
} from "../utils/calculations";
import { parsePdfInvoice } from "../utils/parsePdfInvoice";
import type { InvoiceExtraction } from "../utils/parsePdfInvoice";
import { EmptyState } from "../components/EmptyState";
import { FormActions } from "../components/FormActions";
import { InfoTooltip } from "../components/InfoTooltip";
import { LegalRef } from "../components/LegalRef";
import { PageHeader } from "../components/PageHeader";
import type { AfaAsset, AssetCategory } from "../types";

const CATEGORIES: AssetCategory[] = [
  "computer",
  "monitor",
  "furniture",
  "other",
];

const EMPTY_ASSET: Omit<AfaAsset, "id"> = {
  description: "",
  purchaseDate: "",
  pricePaidEUR: 0,
  category: "computer",
  usefulLifeYears: 3,
  businessUsePercent: 100,
  depreciationMethod: "linear",
};

function ConfidenceDot({ level }: { level: "high" | "medium" | "low" }) {
  const intl = useIntl();
  const colors = { high: "bg-green-500", medium: "bg-amber-400", low: "bg-red-400" };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[level]} mr-1.5 flex-shrink-0`}
      title={intl.formatMessage({ id: `confidence.${level}` })}
    />
  );
}

function AssetForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<AfaAsset, "id">;
  onSave: (v: Omit<AfaAsset, "id">) => void;
  onCancel: () => void;
}) {
  const intl = useIntl();
  const [v, setV] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [extraction, setExtraction] = useState<InvoiceExtraction | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false); // toggle for extracted PDF text
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGWG = v.pricePaidEUR <= GWG_LIMIT;
  const baseCost = (v.pricePaidEUR * v.businessUsePercent) / 100;
  const annualDeduction = baseCost / v.usefulLifeYears;
  const isH2 = v.purchaseDate ? isPurchaseH2(v.purchaseDate) : false;
  const firstYearDeduction = isH2 ? annualDeduction / 2 : annualDeduction;

  const categoryLabel = (cat: AssetCategory) =>
    intl.formatMessage({ id: `category.${cat}` });

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(intl.formatMessage({ id: "invoiceImport.onlyPdf" }));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await parsePdfInvoice(file);
      setExtraction(result);
      setV((prev) => ({
        ...prev,
        ...(result.date ? { purchaseDate: result.date } : {}),
        ...(result.totalGross > 0 ? { pricePaidEUR: result.totalGross } : {}),
        ...(result.description ? { description: result.description.slice(0, 60) } : {}),
      }));
    } catch (e) {
      setError(
        intl.formatMessage(
          { id: "invoiceImport.fetchError" },
          { error: e instanceof Error ? e.message : String(e) }
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-green-200 bg-green-50 space-y-4">
      <h3 className="font-semibold text-gray-800">
        <FormattedMessage id="afa.form.title" />
      </h3>

      <div
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-purple-500 bg-purple-100"
            : "border-gray-300 bg-white hover:border-purple-400"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm font-medium">{intl.formatMessage({ id: "invoiceImport.processing" })}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <FileText size={16} className="text-purple-400" />
            <span className="text-sm">
              {extraction
                ? intl.formatMessage({ id: "invoiceImport.loadOther" })
                : intl.formatMessage({ id: "invoiceImport.drag" })}
            </span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
      </div>

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {extraction && (
        <div className={`rounded-lg px-4 py-2 text-sm flex items-center gap-2 ${
          extraction.isScanned
            ? "bg-red-50 border border-red-200 text-red-800"
            : "bg-green-100 border border-green-300 text-green-800"
        }`}>
          {extraction.isScanned ? (
            <><AlertTriangle size={14} /><span>{intl.formatMessage({ id: "invoiceImport.scanned" })}</span></>
          ) : (
            <><CheckCircle2 size={14} /><span>{intl.formatMessage({ id: "invoiceImport.success" })}</span></>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label flex items-center">
            {extraction && <ConfidenceDot level={extraction.confidence.description} />}
            <FormattedMessage id="afa.form.description" />
          </label>
          <input
            type="text"
            className="input"
            placeholder="z.B. iPhone 16 Pro"
            value={v.description}
            onChange={(e) => setV({ ...v, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label">
            <FormattedMessage id="afa.form.category" />
            <InfoTooltip>
              <FormattedMessage
                id="afa.col.categoryHint"
                values={{
                  b: (chunks) => <strong>{chunks}</strong>,
                  link16: (chunks) => <LegalRef par={16}>{chunks}</LegalRef>,
                  link20: (chunks) => <LegalRef par={20}>{chunks}</LegalRef>,
                }}
              />
            </InfoTooltip>
          </label>
          <select
            className="input"
            value={v.category}
            onChange={(e) => {
              const cat = e.target.value as AssetCategory;
              setV({
                ...v,
                category: cat,
                usefulLifeYears: DEFAULT_USEFUL_LIFE[cat],
              });
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label flex items-center">
            {extraction && <ConfidenceDot level={extraction.confidence.date} />}
            <FormattedMessage id="afa.form.purchaseDate" />
          </label>
          <input
            type="date"
            className="input"
            value={v.purchaseDate}
            onChange={(e) => setV({ ...v, purchaseDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label flex items-center">
            {extraction && <ConfidenceDot level={extraction.confidence.amount} />}
            <FormattedMessage id="afa.form.price" />
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="input"
            placeholder="z.B. 1399.00"
            value={v.pricePaidEUR || ""}
            onChange={(e) =>
              setV({ ...v, pricePaidEUR: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="label">
            <FormattedMessage id="afa.form.usefulLife" />
          </label>
          <input
            type="number"
            min={1}
            max={30}
            className="input"
            value={v.usefulLifeYears}
            disabled={v.pricePaidEUR !== 0 && isGWG}
            onChange={(e) =>
              setV({ ...v, usefulLifeYears: Number(e.target.value) })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            <FormattedMessage
              id="afa.form.usefulLifeHint"
              values={{
                years: DEFAULT_USEFUL_LIFE[v.category],
                category: categoryLabel(v.category),
              }}
            />
          </p>
        </div>
        <div>
          <label className="label">
            <FormattedMessage id="afa.form.businessUse" />
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="input"
            value={v.businessUsePercent}
            onChange={(e) =>
              setV({ ...v, businessUsePercent: Number(e.target.value) })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            <FormattedMessage id="afa.form.businessUseHint" />
          </p>
        </div>
        {!isGWG && (
          <div className="sm:col-span-2">
            <label className="label">
              <FormattedMessage id="afa.form.method" />
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value="linear"
                  checked={v.depreciationMethod === "linear"}
                  onChange={() => setV({ ...v, depreciationMethod: "linear" })}
                />
                <span className="text-sm">
                  <FormattedMessage id="afa.form.methodLinear" />
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value="degressive"
                  checked={v.depreciationMethod === "degressive"}
                  onChange={() =>
                    setV({ ...v, depreciationMethod: "degressive" })
                  }
                />
                <span className="text-sm">
                  <FormattedMessage id="afa.form.methodDegressive" />
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {v.pricePaidEUR > 0 && (
        <div
          className={`rounded-lg p-3 border text-sm ${isGWG ? "bg-green-100 border-green-300" : "bg-blue-50 border-blue-200"}`}
        >
          {isGWG ? (
            <p>
              <span className="font-semibold text-green-800">
                <FormattedMessage id="afa.form.gwgTitle" />
              </span>
              <span className="text-green-700">
                {" "}
                <FormattedMessage
                  id="afa.form.gwgText"
                  values={{ amount: formatEUR(baseCost) }}
                />
              </span>
            </p>
          ) : (
            <div className="space-y-1.5">
              <p className="font-semibold text-blue-800">
                <FormattedMessage
                  id="afa.form.afaRequired"
                  values={{ limit: GWG_LIMIT }}
                />
              </p>
              <p className="text-blue-700">
                <FormattedMessage id="afa.form.totalDeductible" />{" "}
                <strong>{formatEUR(baseCost)}</strong>
              </p>
              {v.depreciationMethod === "linear" && (
                <p className="text-blue-700">
                  <FormattedMessage id="afa.form.annualLinear" />{" "}
                  <strong>{formatEUR(annualDeduction)}</strong>
                </p>
              )}
              {v.purchaseDate && !isGWG && (
                <div className={`mt-1 rounded px-2 py-1 text-xs font-medium ${isH2 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                  <FormattedMessage
                    id={isH2 ? "afa.form.h2" : "afa.form.h1"}
                    values={{ amount: formatEUR(firstYearDeduction), rest: formatEUR(firstYearDeduction) }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {extraction && !extraction.isScanned && (
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {intl.formatMessage({ id: "invoiceImport.showRaw" })}
        </button>
      )}
      {showRaw && extraction && (
        <pre className="text-xs bg-gray-900 text-gray-300 rounded-xl p-4 overflow-auto max-h-48 whitespace-pre-wrap font-mono leading-relaxed">
          {extraction.rawText}
        </pre>
      )}

      <FormActions onSave={() => onSave(v)} onCancel={onCancel} />
    </div>
  );
}

function AssetRow({
  asset,
  taxYear,
  onDelete,
  onEdit,
}: {
  asset: AfaAsset;
  taxYear: number;
  onDelete: () => void;
  onEdit: (v: Omit<AfaAsset, "id">) => void;
}) {
  const intl = useIntl();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const result = calculateAfa(asset, taxYear);
  const purchaseYear = new Date(asset.purchaseDate).getFullYear();

  if (editing) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-4">
          <AssetForm
            initial={asset}
            onSave={(v) => { onEdit(v); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="td font-medium">{asset.description}</td>
        <td className="td text-gray-500">
          {intl.formatMessage({ id: `category.${asset.category}` })}
        </td>
        <td className="td">{asset.purchaseDate}</td>
        <td className="td text-right font-mono">
          {formatEUR(asset.pricePaidEUR)}
        </td>
        <td className="td text-center">{asset.businessUsePercent}%</td>
        <td className="td text-center">
          {result.isGWG ? (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-medium">
              <FormattedMessage id="afa.gwgBadge" />
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
              <FormattedMessage
                id="afa.afaBadge"
                values={{ years: asset.usefulLifeYears }}
              />
            </span>
          )}
        </td>
        <td
          className={`td text-right font-bold text-lg ${result.deductionForYear > 0 ? "text-green-700" : "text-gray-400"}`}
        >
          {formatEUR(result.deductionForYear)}
        </td>
        <td className="td">
          <div className="flex items-center justify-end gap-1">
            {!result.isGWG && (
              <button
                className="text-gray-400 hover:text-gray-700 p-1"
                onClick={() => setExpanded(!expanded)}
                title={intl.formatMessage({ id: "afa.plan.title" })}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            <button
              className="text-gray-400 hover:text-blue-600 p-1"
              onClick={() => setEditing(true)}
              title={intl.formatMessage({ id: "common.edit" })}
            >
              <Pencil size={13} />
            </button>
            <button className="btn-danger" onClick={onDelete}>
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && !result.isGWG && (
        <tr>
          <td colSpan={8} className="px-4 pb-4">
            <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">
                      <FormattedMessage id="afa.plan.year" />
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600">
                      <FormattedMessage id="afa.plan.deduction" />
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600">
                      <FormattedMessage id="afa.plan.bookValue" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((s) => (
                    <tr
                      key={s.year}
                      className={`border-t border-gray-100 ${s.year === taxYear ? "bg-yellow-50 font-semibold" : ""}`}
                    >
                      <td className="px-3 py-2">
                        {s.year}
                        {s.year === taxYear && (
                          <span className="ml-2 text-yellow-700 text-xs">
                            <FormattedMessage id="common.currentYear" />
                          </span>
                        )}
                        {s.year === purchaseYear && s.year !== taxYear && (
                          <span className="ml-2 text-blue-600 text-xs">
                            <FormattedMessage id="common.purchaseYear" />
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatEUR(s.deduction)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatEUR(s.bookValueEnd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AfaCalculator() {
  const { selectedYearData, state, dispatch } = useTax();
  const intl = useIntl();
  const [adding, setAdding] = useState(false);
  const year = state.selectedYear;

  const { afaAssets } = selectedYearData;
  const results = useMemo(() => afaAssets.map((a) => calculateAfa(a, year)), [afaAssets, year]);
  const totalDeduction = useMemo(() => results.reduce((s, r) => s + r.deductionForYear, 0), [results]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={intl.formatMessage({ id: "afa.title" })}
        subtitle={intl.formatMessage({ id: "afa.subtitle" }, { year })}
      />

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            <FormattedMessage id="afa.assets.title" />
          </h2>
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={() => setAdding(true)}
          >
            <Plus size={16} />
            <FormattedMessage id="afa.assets.add" />
          </button>
        </div>

        {adding && (
          <AssetForm
            initial={{ ...EMPTY_ASSET }}
            onSave={(v) => {
              dispatch({ type: "ADD_ASSET", asset: { ...v, id: genId() } });
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {afaAssets.length > 0 ? (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="th">
                    <FormattedMessage id="afa.col.name" />
                  </th>
                  <th className="th">
                    <span className="inline-flex items-center">
                      <FormattedMessage id="afa.col.category" />
                      <InfoTooltip>
                        <FormattedMessage
                          id="afa.col.categoryHint"
                          values={{
                            b: (chunks) => <strong>{chunks}</strong>,
                            link16: (chunks) => (
                              <LegalRef par={16}>{chunks}</LegalRef>
                            ),
                            link20: (chunks) => (
                              <LegalRef par={20}>{chunks}</LegalRef>
                            ),
                          }}
                        />
                      </InfoTooltip>
                    </span>
                  </th>
                  <th className="th">
                    <FormattedMessage id="afa.col.date" />
                  </th>
                  <th className="th text-right">
                    <FormattedMessage id="afa.col.price" />
                  </th>
                  <th className="th text-center">
                    <FormattedMessage id="afa.col.business" />
                  </th>
                  <th className="th text-center">
                    <FormattedMessage id="afa.col.type" />
                  </th>
                  <th className="th text-right">
                    <FormattedMessage
                      id="afa.col.deduction"
                      values={{ year }}
                    />
                  </th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {afaAssets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    taxYear={year}
                    onDelete={() =>
                      dispatch({ type: "DELETE_ASSET", id: asset.id })
                    }
                    onEdit={(v) =>
                      dispatch({ type: "UPDATE_ASSET", asset: { ...v, id: asset.id } })
                    }
                  />
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={6} className="td font-semibold">
                    <FormattedMessage id="afa.total" values={{ year }} />
                  </td>
                  <td className="td text-right font-bold text-lg text-green-700">
                    {formatEUR(totalDeduction)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
        ) : (
          <EmptyState
            subtitle={intl.formatMessage({ id: "afa.emptySubtitle" })}
          >
            <FormattedMessage id="afa.empty" />
          </EmptyState>
        )}
      </section>

      {totalDeduction > 0 && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-green-900">
                <FormattedMessage id="afa.summary.title" values={{ year }} />
              </div>
              <div className="text-sm text-green-700 mt-1">
                <FormattedMessage id="afa.summary.note" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-700">
              {formatEUR(totalDeduction)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
