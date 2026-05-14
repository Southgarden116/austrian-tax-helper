import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, FileDown } from "lucide-react";
import { useIntl, FormattedMessage } from "react-intl";
import { useTax } from "../context/TaxContext";
import { calculateTaxSummary, formatEUR } from "../utils/calculations";
import { PageHeader } from "../components/PageHeader";

function CopyButton({ value }: { value: string }) {
  const intl = useIntl();
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      className="ml-2 text-gray-400 hover:text-blue-600 transition-colors"
      title={intl.formatMessage({ id: "fo.copy" })}
    >
      {copied ? (
        <Check size={15} className="text-green-500" />
      ) : (
        <Copy size={15} />
      )}
    </button>
  );
}

function KzField({
  kz,
  label,
  value,
  note,
  highlight = false,
}: {
  kz: string;
  label: string;
  value: number;
  note?: string;
  highlight?: boolean;
}) {
  const display = value.toFixed(2).replace(".", ",");
  return (
    <div
      className={`flex items-start gap-4 py-4 border-b border-gray-100 last:border-0 ${highlight ? "bg-yellow-50 -mx-6 px-6 rounded" : ""}`}
    >
      <div className="flex-shrink-0">
        <span className="kz-badge text-base px-3 py-1">KZ {kz}</span>
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 text-sm">{label}</div>
        {note && <div className="text-xs text-gray-500 mt-0.5">{note}</div>}
      </div>
      <div className="flex items-center flex-shrink-0">
        <span
          className={`kz-value ${value !== 0 ? "text-gray-900" : "text-gray-400"}`}
        >
          {formatEUR(value)}
        </span>
        {value !== 0 && <CopyButton value={display} />}
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-9 h-9 bg-at-red text-white rounded-full flex items-center justify-center font-bold text-sm">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

const b = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

export default function FinanzOnlineGuide() {
  const { selectedYearData, state, portfolioEvents } = useTax();
  const intl = useIntl();
  const year = state.selectedYear;
  const summary = useMemo(
    () => calculateTaxSummary(selectedYearData, portfolioEvents),
    [selectedYearData, portfolioEvents],
  );

  const hasCapitalGains =
    summary.kz994 > 0 ||
    summary.kz892 > 0 ||
    summary.kz981 > 0 ||
    summary.kz891 > 0 ||
    summary.kz899 > 0;
  const hasWerbungskosten = summary.totalWerbungskostenEUR > 0;

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  return (
    <div className="space-y-8">
      <PageHeader title={t("fo.title")} subtitle={t("fo.subtitle", { year })} />

      {/* Summary numbers */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t("fo.overview.title")}
          </h2>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <FileDown size={16} />
            {t("pdf.export")}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              kz: "994",
              labelId: "fo.kz994",
              value: summary.kz994,
              color: "green",
            },
            ...(summary.kz892 > 0
              ? [
                  {
                    kz: "892",
                    labelId: "fo.kz892",
                    value: -summary.kz892,
                    color: "orange" as const,
                  },
                ]
              : []),
            ...(summary.kz981 > 0
              ? [
                  {
                    kz: "981",
                    labelId: "fo.kz981",
                    value: summary.kz981,
                    color: "green" as const,
                  },
                ]
              : []),
            ...(summary.kz891 > 0
              ? [
                  {
                    kz: "891",
                    labelId: "fo.kz891",
                    value: -summary.kz891,
                    color: "orange" as const,
                  },
                ]
              : []),
            ...(summary.kz899 > 0
              ? [
                  {
                    kz: "899",
                    labelId: "fo.kz899",
                    value: summary.kz899,
                    color: "orange" as const,
                  },
                ]
              : []),
            {
              kz: "158",
              labelId: "fo.kz158",
              value: summary.kz158,
              color: "blue",
            },
            {
              kz: "169",
              labelId: "fo.kz169",
              value: summary.kz169,
              color: "blue",
            },
            {
              kz: "717",
              labelId: "fo.kz717",
              value: summary.kz717,
              color: "blue",
            },
            {
              kz: "720",
              labelId: "fo.kz720",
              value: summary.kz720,
              color: "blue",
            },
            {
              kz: "722",
              labelId: "fo.kz722",
              value: summary.kz722,
              color: "blue",
            },
            {
              kz: "721",
              labelId: "fo.kz721",
              value: summary.kz721,
              color: "blue",
            },
            {
              kz: "724",
              labelId: "fo.kz724",
              value: summary.kz724,
              color: "blue",
            },
          ].map(({ kz, labelId, value, color }) => (
            <div
              key={kz}
              className={`rounded-xl p-4 border ${color === "orange" ? "bg-orange-50 border-orange-200" : color === "green" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-100"}`}
            >
              <div className="text-xs text-gray-500 mb-1">{t(labelId)}</div>
              <div className="flex items-center gap-2">
                <span className="kz-badge">KZ {kz}</span>
                <span
                  className={`font-bold text-xl ${value !== 0 ? "text-gray-900" : "text-gray-400"}`}
                >
                  {formatEUR(value)}
                </span>
                {value !== 0 && (
                  <CopyButton value={value.toFixed(2).replace(".", ",")} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step by step */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t("fo.steps.title")}
        </h2>

        <Step number={1} title={t("fo.step1.title")}>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>
              <FormattedMessage
                id="fo.step1.1"
                values={{
                  a: (chunks: React.ReactNode) => (
                    <a
                      href="https://finanzonline.bmf.gv.at"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {chunks}
                    </a>
                  ),
                }}
              />
            </li>
            <li>{t("fo.step1.2")}</li>
            <li>{t("fo.step1.3", { year })}</li>
          </ol>
          <a
            href="https://finanzonline.bmf.gv.at"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 bg-at-red hover:bg-at-darkred text-white px-5 py-3 rounded-xl font-semibold transition-colors"
          >
            {t("fo.openButton")} <ExternalLink size={16} />
          </a>
        </Step>

        {hasCapitalGains && (
          <Step number={2} title={t("fo.step3.title")}>
            <div className="text-sm text-gray-700 space-y-3">
              <p>{t("fo.step3.text")}</p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
                <div className="px-6 py-3 bg-orange-100 font-semibold text-orange-900 text-sm">
                  {t("fo.step3.formTitle")}
                </div>
                <div className="px-6 py-2 bg-orange-50 text-xs font-semibold text-orange-800 border-t border-orange-200">
                  {t("fo.step3.foreignSection")}
                </div>
                <div className="px-6">
                  <KzField
                    kz="994"
                    label={t("fo.step3.kz994label")}
                    value={summary.kz994}
                    note={t("fo.step3.kz994note")}
                    highlight={summary.kz994 > 0}
                  />
                  {summary.kz892 > 0 && (
                    <KzField
                      kz="892"
                      label={t("fo.step3.kz892label")}
                      value={-summary.kz892}
                      note={t("fo.step3.kz892note")}
                      highlight
                    />
                  )}
                </div>
                {(summary.kz981 > 0 || summary.kz891 > 0) && (
                  <>
                    <div className="px-6 py-2 bg-orange-50 text-xs font-semibold text-orange-800 border-t border-orange-200">
                      {t("fo.step3.domesticSection")}
                    </div>
                    <div className="px-6">
                      {summary.kz981 > 0 && (
                        <KzField
                          kz="981"
                          label={t("fo.step3.kz981label")}
                          value={summary.kz981}
                          note={t("fo.step3.kz981note")}
                          highlight={summary.kz981 > 0}
                        />
                      )}
                      {summary.kz891 > 0 && (
                        <KzField
                          kz="891"
                          label={t("fo.step3.kz891label")}
                          value={-summary.kz891}
                          note={t("fo.step3.kz891note")}
                          highlight
                        />
                      )}
                    </div>
                  </>
                )}
                {summary.kz899 > 0 && (
                  <>
                    <div className="px-6 py-2 bg-orange-50 text-xs font-semibold text-orange-800 border-t border-orange-200">
                      {t("fo.step3.taxesSection")}
                    </div>
                    <div className="px-6">
                      <KzField
                        kz="899"
                        label={t("fo.step3.kz899label")}
                        value={summary.kz899}
                        note={t("fo.step3.kz899note")}
                        highlight={false}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-semibold">{t("fo.step3.howTitle")}</p>
                <p>
                  {t("fo.step3.totalGains", {
                    amount: formatEUR(summary.totalGainsEUR),
                  })}
                </p>
                <p>
                  {t("fo.step3.totalLosses", {
                    amount: formatEUR(summary.totalLossesEUR),
                  })}
                </p>
                <p className="font-bold">
                  {t("fo.step3.netGains", {
                    amount: formatEUR(
                      summary.totalGainsEUR - summary.totalLossesEUR,
                    ),
                  })}
                </p>
                <p className="mt-1 text-blue-700">
                  {t("fo.step3.kest", {
                    amount: formatEUR(summary.kestDueEUR),
                  })}
                </p>
              </div>

              {summary.capitalGains.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-800 text-xs mb-2">
                    {t("fo.step3.transTitle")}
                  </p>
                  <div className="text-xs rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">
                            {t("fo.step3.col.date")}
                          </th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-600">
                            {t("fo.step3.col.description")}
                          </th>
                          <th className="text-right px-3 py-2 font-semibold text-gray-600">
                            {t("fo.step3.col.gainLoss")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.capitalGains.map((g) => (
                          <tr
                            key={g.id}
                            className="border-t border-gray-100"
                          >
                            <td className="px-3 py-2">{g.date}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {g.description ||
                                t("fo.step3.shares", { shares: g.shares })}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-semibold ${g.gainLossEUR >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {g.gainLossEUR >= 0 ? "+" : ""}
                              {formatEUR(g.gainLossEUR)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Step>
        )}

        {hasWerbungskosten && (
          <Step
            number={(hasCapitalGains ? 1 : 0) + 2}
            title={t("fo.step4.title")}
          >
            <div className="text-sm text-gray-700 space-y-3">
              <p>{t("fo.step4.text")}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
                <div className="px-6 py-3 bg-blue-100 font-semibold text-blue-900 text-sm">
                  {t("fo.step4.formTitle")}
                </div>
                <div className="px-6">
                  <KzField
                    kz="169"
                    label={t("fo.step4.kz169label")}
                    value={summary.kz169}
                    note={t("fo.step4.kz169note")}
                    highlight={summary.kz169 > 0}
                  />
                  <KzField
                    kz="158"
                    label={t("fo.step4.kz158label")}
                    value={summary.kz158}
                    note={t("fo.step4.kz158note")}
                    highlight={summary.kz158 > 0}
                  />
                  <KzField
                    kz="717"
                    label={t("fo.step4.kz717label")}
                    value={summary.kz717}
                    note={t("fo.step4.kz717note")}
                    highlight={summary.kz717 > 0}
                  />
                  <KzField
                    kz="720"
                    label={t("fo.step4.kz720label")}
                    value={summary.kz720}
                    note={t("fo.step4.kz720note")}
                    highlight={summary.kz720 > 0}
                  />
                  <KzField
                    kz="722"
                    label={t("fo.step4.kz722label")}
                    value={summary.kz722}
                    note={t("fo.step4.kz722note")}
                    highlight={summary.kz722 > 0}
                  />
                  <KzField
                    kz="721"
                    label={t("fo.step4.kz721label")}
                    value={summary.kz721}
                    note={t("fo.step4.kz721note")}
                    highlight={summary.kz721 > 0}
                  />
                  <KzField
                    kz="724"
                    label={t("fo.step4.kz724label")}
                    value={summary.kz724}
                    note={t("fo.step4.kz724note")}
                    highlight={summary.kz724 > 0}
                  />
                </div>
              </div>
            </div>
          </Step>
        )}

        <Step
          number={(hasCapitalGains ? 1 : 0) + (hasWerbungskosten ? 1 : 0) + 2}
          title={t("fo.stepFinal.title")}
        >
          <div className="text-sm text-gray-700 space-y-2">
            <p>{t("fo.stepFinal.1")}</p>
            <p>{t("fo.stepFinal.2")}</p>
            <p>{t("fo.stepFinal.3")}</p>
            <p>{t("fo.stepFinal.4")}</p>
            <div className="bg-blue-50 rounded-lg p-3 mt-3 text-blue-800">
              <FormattedMessage
                id="fo.stepFinal.deadline"
                values={{ b, year, nextYear: year + 1 }}
              />
            </div>
          </div>
        </Step>
      </div>
    </div>
  );
}
