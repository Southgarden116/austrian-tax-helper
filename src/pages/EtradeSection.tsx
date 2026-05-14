import { useMemo, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { useIntl, FormattedMessage } from "react-intl";
import { useTax } from "../context/TaxContext";
import {
  calculateCapitalGains,
  formatEUR,
  formatUSD,
  genId,
  KEST_RATE,
} from "../utils/calculations";
import { runTaxEngine } from "../utils/taxEngine";
import PortfolioImport from "../components/PortfolioImport";
import FlatexImport from "../components/FlatexImport";
import { Collapsible } from "../components/Collapsible";
import { EmptyState } from "../components/EmptyState";
import { FormActions } from "../components/FormActions";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";
import type { ReactNode } from "react";
import type { PortfolioEvent, PortfolioEventType } from "../types";

const ECB_RATES_URL =
  "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html";
const ESTG_27A_URL =
  "https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10004570&Paragraf=27a";

const b = (chunks: ReactNode) => <strong>{chunks}</strong>;
const link = (chunks: ReactNode) => (
  <a href={ECB_RATES_URL} target="_blank" rel="noopener noreferrer" className="underline">
    {chunks}
  </a>
);
const eStgLink = (chunks: ReactNode) => (
  <a href={ESTG_27A_URL} target="_blank" rel="noopener noreferrer" className="underline">
    {chunks}
  </a>
);

const EVENT_TYPES: PortfolioEventType[] = ["VEST", "BUY", "EXERCISE", "SELL"];

type ManualEvent = Omit<PortfolioEvent, "id">;

const EMPTY_EVENT: ManualEvent = {
  date: "",
  type: "VEST",
  shares: 0,
  pricePerShareUSD: 0,
  ecbRateUSDEUR: 0,
  source: "Manual",
  notes: "",
};

function ManualEventForm({
  onSave,
  onCancel,
}: {
  onSave: (v: ManualEvent) => void;
  onCancel: () => void;
}) {
  const intl = useIntl();
  const t = (id: string) => intl.formatMessage({ id });
  const [v, setV] = useState<ManualEvent>({ ...EMPTY_EVENT });
  const priceEUR = v.pricePerShareUSD * v.ecbRateUSDEUR;

  return (
    <div className="card border-orange-200 bg-orange-50 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {t("portfolio.manual.title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t("portfolio.manual.type")}</label>
          <select
            className="input"
            value={v.type}
            onChange={(e) =>
              setV({ ...v, type: e.target.value as PortfolioEventType })
            }
          >
            {EVENT_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {t(`portfolio.type.${tp}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t("portfolio.manual.date")}</label>
          <input
            type="date"
            className="input"
            value={v.date}
            onChange={(e) => setV({ ...v, date: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t("portfolio.manual.shares")}</label>
          <input
            type="number"
            min={0}
            className="input"
            value={v.shares || ""}
            onChange={(e) => setV({ ...v, shares: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">{t("portfolio.manual.priceUSD")}</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="input"
            value={v.pricePerShareUSD || ""}
            onChange={(e) =>
              setV({ ...v, pricePerShareUSD: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="label">{t("portfolio.manual.ecbRate")}</label>
          <input
            type="number"
            min={0}
            step={0.0001}
            className="input"
            placeholder="z.B. 0.9180"
            value={v.ecbRateUSDEUR || ""}
            onChange={(e) =>
              setV({ ...v, ecbRateUSDEUR: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="label">{t("portfolio.manual.notes")}</label>
          <input
            type="text"
            className="input"
            value={v.notes ?? ""}
            onChange={(e) => setV({ ...v, notes: e.target.value })}
          />
        </div>
      </div>
      {priceEUR > 0 && (
        <p className="text-sm text-gray-600">
          {t("portfolio.manual.priceEURPreview")}:{" "}
          <span className="font-semibold">{formatEUR(priceEUR)}</span>
        </p>
      )}
      <FormActions
        onSave={() => onSave(v)}
        onCancel={onCancel}
        saveDisabled={
          !v.date || v.shares <= 0 || v.pricePerShareUSD <= 0 || v.ecbRateUSDEUR <= 0
        }
      />
    </div>
  );
}

function EurField({
  labelId,
  kz,
  hintId,
  value,
  onChange,
}: {
  labelId: string;
  kz: string;
  hintId: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">
        <FormattedMessage id={labelId} />
        <span className="kz-badge ml-1">KZ {kz}</span>
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.01"
          min="0"
          className="input"
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="text-sm text-gray-500">EUR</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        <FormattedMessage id={hintId} />
      </p>
    </div>
  );
}

export default function EtradeSection() {
  const { selectedYearData, state, portfolioEvents, dispatch } = useTax();
  const intl = useIntl();
  const t = (id: string, vals?: Record<string, string | number>) =>
    intl.formatMessage({ id }, vals);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showFlatexImport, setShowFlatexImport] = useState(false);
  const year = state.selectedYear;

  const otherBrokerGains = selectedYearData.otherBrokerGainsEUR ?? 0;
  const otherBrokerLosses = selectedYearData.otherBrokerLossesEUR ?? 0;
  const otherBrokerPaidKest = selectedYearData.otherBrokerPaidKestEUR ?? 0;

  function setOtherBroker(
    otherBrokerGainsEUR: number,
    otherBrokerLossesEUR: number,
    otherBrokerPaidKestEUR: number,
  ) {
    dispatch({
      type: "SET_OTHER_BROKER",
      otherBrokerGainsEUR,
      otherBrokerLossesEUR,
      otherBrokerPaidKestEUR,
    });
  }

  // Full cross-year ledger from the moving-average engine.
  const engine = useMemo(() => runTaxEngine(portfolioEvents), [portfolioEvents]);
  // Realized gains/losses attributed to the selected year.
  const yearResult = useMemo(
    () => calculateCapitalGains(portfolioEvents, year),
    [portfolioEvents, year],
  );
  const netGains = Math.max(
    0,
    yearResult.totalGainsEUR - yearResult.totalLossesEUR,
  );
  const kestDue = netGains * KEST_RATE;

  return (
    <div className="space-y-8">
      <PageHeader
        title={intl.formatMessage({ id: "etrade.title" })}
        subtitle={intl.formatMessage({ id: "etrade.subtitle" }, { year })}
      />

      {/* Info box: moving-average method */}
      <Collapsible
        title={t("portfolio.info.title")}
        className="bg-blue-50 border-blue-200 text-sm text-blue-900"
      >
        <ul className="space-y-1 text-blue-800 mt-2">
          <li>
            • <strong>{t("portfolio.info.avgLabel")}</strong>{" "}
            <FormattedMessage
              id="portfolio.info.avgText"
              values={{ eStgLink }}
            />
          </li>
          <li>
            • <strong>{t("portfolio.info.sourcesLabel")}</strong>{" "}
            {t("portfolio.info.sourcesText")}
          </li>
          <li>
            •{" "}
            <FormattedMessage
              id="portfolio.info.currencyText"
              values={{ link }}
            />
          </li>
          <li>
            • <FormattedMessage id="portfolio.info.lossText" values={{ b }} />
          </li>
        </ul>
      </Collapsible>

      {/* Portfolio events */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SectionHeader
            title={t("portfolio.section.title")}
            subtitle={t("portfolio.section.subtitle")}
          />
          <div className="flex flex-wrap gap-2 shrink-0">
            {portfolioEvents.length > 0 && (
              <button
                className="btn-danger flex items-center gap-2"
                onClick={() => {
                  if (window.confirm(t("portfolio.deleteAllConfirm"))) {
                    dispatch({ type: "DELETE_ALL_PORTFOLIO_EVENTS" });
                  }
                }}
              >
                <Trash2 size={16} />
                <FormattedMessage id="portfolio.deleteAll" />
              </button>
            )}
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => setImporting(true)}
            >
              <Upload size={16} />
              {t("portfolio.importBtn")}
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => setAdding(true)}
            >
              <Plus size={16} />
              {t("portfolio.addManual")}
            </button>
          </div>
        </div>

        {importing && (
          <PortfolioImport
            existingEvents={portfolioEvents}
            onCommit={(events) => {
              if (events.length)
                dispatch({ type: "ADD_PORTFOLIO_EVENTS", events });
            }}
            onClose={() => setImporting(false)}
          />
        )}

        {adding && (
          <ManualEventForm
            onSave={(v) => {
              dispatch({
                type: "ADD_PORTFOLIO_EVENTS",
                events: [{ ...v, id: genId() }],
              });
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        {engine.errors.length > 0 && (
          <div className="card bg-red-50 border-red-200 space-y-1">
            {engine.errors.map((er, i) => (
              <p key={i} className="text-sm text-red-700">
                ⚠ {er.message}
              </p>
            ))}
          </div>
        )}

        {portfolioEvents.length > 0 ? (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="th">{t("portfolio.col.date")}</th>
                    <th className="th">{t("portfolio.col.type")}</th>
                    <th className="th text-right">{t("portfolio.col.shares")}</th>
                    <th className="th text-right">
                      {t("portfolio.col.priceUSD")}
                    </th>
                    <th className="th text-right">{t("portfolio.col.rate")}</th>
                    <th className="th text-right">
                      {t("portfolio.col.totalShares")}
                    </th>
                    <th className="th text-right">
                      {t("portfolio.col.avgCost")}
                    </th>
                    <th className="th text-right">
                      {t("portfolio.col.gainLoss")}
                    </th>
                    <th className="th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {engine.processed.map((pe, i) => {
                    const e = pe.event;
                    const isSell = e.type === "SELL";
                    const inYear = e.date.slice(0, 4) === String(year);
                    return (
                      <tr
                        key={`${e.id}-${i}`}
                        className={inYear ? "bg-orange-50/40" : ""}
                      >
                        <td className="td">{e.date}</td>
                        <td className="td">
                          <span
                            className={
                              isSell ? "text-orange-600" : "text-blue-600"
                            }
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
                        <td className="td">
                          <button
                            className="btn-danger"
                            onClick={() =>
                              dispatch({
                                type: "DELETE_PORTFOLIO_EVENT",
                                id: e.id,
                              })
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState>{t("portfolio.empty")}</EmptyState>
        )}

        {/* Selected-year summary */}
        {portfolioEvents.length > 0 && (
          <div className="card bg-orange-50 border-orange-200">
            <h3 className="font-semibold text-orange-900 mb-4">
              <FormattedMessage id="etrade.summary.title" values={{ year }} />
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <FormattedMessage id="etrade.summary.totalGains" />
                </span>
                <span className="font-semibold">
                  {formatEUR(yearResult.totalGainsEUR)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <FormattedMessage id="etrade.summary.totalLosses" />
                </span>
                <span className="font-semibold text-orange-700">
                  −{formatEUR(yearResult.totalLossesEUR)}
                </span>
              </div>
              <div className="flex justify-between col-span-2 pt-2 border-t border-orange-200">
                <span className="font-semibold text-orange-900">
                  <FormattedMessage id="etrade.summary.netGains" />{" "}
                </span>
                <span className="font-bold text-xl text-orange-700">
                  {formatEUR(netGains)}
                </span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-600">
                  <FormattedMessage id="etrade.summary.kest" />
                </span>
                <span className="font-semibold text-red-700">
                  {formatEUR(kestDue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Other Broker Loss Offset */}
      <section className="space-y-4">
        <SectionHeader
          title={intl.formatMessage({ id: "etrade.otherBroker.title" })}
          subtitle={intl.formatMessage({ id: "etrade.otherBroker.subtitle" })}
        />
        <div className="card space-y-4">
          <div>
            <button
              className="btn-secondary text-sm flex items-center gap-2"
              onClick={() => setShowFlatexImport(!showFlatexImport)}
            >
              <FormattedMessage id="flatexImport.button" />
            </button>
            {showFlatexImport && (
              <div className="mt-3">
                <FlatexImport
                  onApply={(gains, losses, kest) => {
                    setOtherBroker(gains, losses, kest);
                    setShowFlatexImport(false);
                  }}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EurField
              labelId="etrade.otherBroker.gainsLabel"
              kz="981"
              hintId="etrade.otherBroker.gainsHint"
              value={otherBrokerGains}
              onChange={(v) => setOtherBroker(v, otherBrokerLosses, otherBrokerPaidKest)}
            />
            <EurField
              labelId="etrade.otherBroker.lossesLabel"
              kz="891"
              hintId="etrade.otherBroker.lossesHint"
              value={otherBrokerLosses}
              onChange={(v) => setOtherBroker(otherBrokerGains, v, otherBrokerPaidKest)}
            />
            <EurField
              labelId="etrade.otherBroker.paidKestLabel"
              kz="899"
              hintId="etrade.otherBroker.paidKestHint"
              value={otherBrokerPaidKest}
              onChange={(v) => setOtherBroker(otherBrokerGains, otherBrokerLosses, v)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
