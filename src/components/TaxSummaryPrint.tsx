import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useTax } from "../context/TaxContext";
import { calculateTaxSummary, formatEUR } from "../utils/calculations";
import s from "./TaxSummaryPrint.module.css";

export default function TaxSummaryPrint() {
  const { selectedYearData, state, portfolioEvents } = useTax();
  const intl = useIntl();
  const year = state.selectedYear;
  const t = (id: string, vals?: Record<string, string | number>) =>
    intl.formatMessage({ id }, vals);

  const summary = useMemo(
    () => calculateTaxSummary(selectedYearData, portfolioEvents),
    [selectedYearData, portfolioEvents],
  );

  const today = new Date().toLocaleDateString(
    intl.locale === "en" ? "en-GB" : "de-AT",
    { day: "2-digit", month: "2-digit", year: "numeric" },
  );

  const hasCapGains =
    summary.kz994 > 0 ||
    summary.kz892 > 0 ||
    summary.kz981 > 0 ||
    summary.kz891 > 0 ||
    summary.kz899 > 0;
  const hasWK = summary.totalWerbungskostenEUR > 0;
  const hasAfa = selectedYearData.afaAssets.length > 0;

  return (
    <div className={`${s.page} hidden print:block`}>
      {/* ── Header ── */}
      <div className={s.header}>
        <div>
          <div className={s.logoRow}>
            <span>🇦🇹</span>
            <span>Steuerhelfer</span>
          </div>
          <div className={s.logoSub}>{t("layout.subtitle")}</div>
        </div>
        <div>
          <div className={s.yearBadge}>{t("layout.taxYear")} {year}</div>
          <div className={s.generatedAt}>{t("pdf.generated", { date: today })}</div>
        </div>
      </div>

      {/* ── Capital Gains ── */}
      {hasCapGains && (
        <div className="print-section">
          <div className={s.sectionTitle}>{t("pdf.capital.title")}</div>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th} style={{ width: "70px" }}>KZ</th>
                <th className={s.th}>{t("pdf.description")}</th>
                <th className={s.thR} style={{ width: "130px" }}>{t("pdf.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { kz: "994", id: "etrade.summary.totalGains", v: summary.totalGainsEUR, always: true },
                { kz: "892", id: "etrade.summary.totalLosses", v: summary.totalLossesEUR, always: true, neg: true },
                { kz: "981", id: "fo.kz981", v: summary.kz981 },
                { kz: "891", id: "fo.kz891", v: summary.kz891, neg: true },
                { kz: "899", id: "fo.kz899", v: summary.kz899 },
              ]
                .filter((r) => r.always || r.v > 0)
                .map(({ kz, id, v, neg }) => (
                  <tr key={kz}>
                    <td className={s.td}><span className={s.kzBadge}>KZ {kz}</span></td>
                    <td className={s.td}>{t(id)}</td>
                    <td className={s.tdR}>
                      <span className={v > 0 ? s.valueNeutral : s.valueZero}>{formatEUR(neg ? -v : v)}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {summary.capitalGains.length > 0 && (
            <>
              <div className={s.transactionsLabel}>{t("fo.step3.transTitle")}</div>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th} style={{ width: "90px" }}>{t("fo.step3.col.date")}</th>
                    <th className={s.th}>{t("fo.step3.col.description")}</th>
                    <th className={s.thR} style={{ width: "80px" }}>{t("fo.step3.col.shares")}</th>
                    <th className={s.thR} style={{ width: "100px" }}>{t("fo.step3.col.revenueEUR")}</th>
                    <th className={s.thR} style={{ width: "110px" }}>{t("fo.step3.col.gainLoss")}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.capitalGains.map((g) => (
                    <tr key={g.id}>
                      <td className={s.td}>{g.date}</td>
                      <td className={s.td}>{g.description || `${g.shares} Shares`}</td>
                      <td className={s.tdR}>{g.shares}</td>
                      <td className={s.tdR}>{formatEUR(g.salePriceEUR * g.shares)}</td>
                      <td className={s.tdR}>
                        <span className={g.gainLossEUR >= 0 ? s.valuePos : s.valueNeg}>
                          {g.gainLossEUR >= 0 ? "+" : ""}{formatEUR(g.gainLossEUR)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className={s.tdTotal}>{t("common.total")}</td>
                    <td className={s.tdRTotal}>
                      <span className={summary.totalGainsEUR - summary.totalLossesEUR >= 0 ? s.valuePos : s.valueNeg}>
                        {summary.totalGainsEUR - summary.totalLossesEUR >= 0 ? "+" : ""}
                        {formatEUR(summary.totalGainsEUR - summary.totalLossesEUR)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* ── Werbungskosten ── */}
      {hasWK && (
        <div className="print-section">
          <div className={s.sectionTitle}>{t("pdf.wk.detail")}</div>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th} style={{ width: "70px" }}>KZ</th>
                <th className={s.th}>{t("pdf.description")}</th>
                <th className={s.thR} style={{ width: "130px" }}>{t("pdf.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { kz: "158", label: t("wk.summary.furniture"), v: summary.ergonomicFurnitureDeduction },
                { kz: "169", label: t("wk.summary.internet"), v: summary.internetDeduction },
                { kz: "169", label: t("pdf.afa.title"), v: summary.totalAfaDeductionsEUR },
                { kz: "717", label: t("wk.summary.union"), v: summary.gewerkschaftDeduction },
                { kz: "720", label: t("wk.summary.literature"), v: summary.fachliteraturDeduction },
                { kz: "722", label: t("wk.summary.training"), v: summary.fortbildungDeduction },
                { kz: "721", label: t("wk.summary.travel"), v: summary.reisekostenDeduction },
                { kz: "724", label: t("wk.summary.other"), v: summary.otherWerbungskostenDeduction },
              ]
                .filter((r) => r.v > 0)
                .map(({ kz, label, v }, i) => (
                  <tr key={i}>
                    <td className={s.td}><span className={s.kzBadge}>KZ {kz}</span></td>
                    <td className={s.td}>{label}</td>
                    <td className={s.tdR}><span className={s.valueNeutral}>{formatEUR(v)}</span></td>
                  </tr>
                ))}
              <tr>
                <td colSpan={2} className={s.tdTotal}>{t("wk.summary.subtotal")}</td>
                <td className={s.tdRTotal}>
                  <span className={s.valueNeutral}>{formatEUR(summary.totalWerbungskostenEUR)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── AfA ── */}
      {hasAfa && (
        <div className="print-section">
          <div className={s.sectionTitle}>{t("pdf.afa.title")}</div>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>{t("afa.col.name")}</th>
                <th className={s.th}>{t("afa.col.category")}</th>
                <th className={s.th} style={{ width: "90px" }}>{t("afa.col.date")}</th>
                <th className={s.thR} style={{ width: "90px" }}>{t("afa.col.price")}</th>
                <th className={s.thR} style={{ width: "70px" }}>{t("afa.col.business")}</th>
                <th className={s.thR} style={{ width: "100px" }}>{t("afa.col.deduction", { year })}</th>
              </tr>
            </thead>
            <tbody>
              {summary.afaResults.map((r) => (
                <tr key={r.asset.id}>
                  <td className={s.td}>{r.asset.description}</td>
                  <td className={s.td}>{t(`category.${r.asset.category}`)}</td>
                  <td className={s.td}>{r.asset.purchaseDate}</td>
                  <td className={s.tdR}>{formatEUR(r.asset.pricePaidEUR)}</td>
                  <td className={s.tdR}>{r.asset.businessUsePercent}%</td>
                  <td className={s.tdR}>
                    <span className={r.deductionForYear > 0 ? s.valueNeutral : s.valueZero}>
                      {formatEUR(r.deductionForYear)}
                    </span>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className={s.tdTotal}>{t("afa.total", { year })}</td>
                <td className={s.tdRTotal}>
                  <span className={s.valueNeutral}>{formatEUR(summary.totalAfaDeductionsEUR)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ── */}
      <div className={s.footer}>{t("pdf.footer")}</div>
    </div>
  );
}
