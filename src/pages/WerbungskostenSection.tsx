import { useIntl } from "react-intl";
import { useTax } from "../context/TaxContext";
import { calculateWerbungskosten, formatEUR } from "../utils/calculations";
import { LegalRef } from "../components/LegalRef";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";
import type { WerbungskostenData } from "../types";

function WkSectionCard({
  title,
  subtitle,
  lawText,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  lawText: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-6">
      <div>
        <SectionHeader title={title} subtitle={subtitle} />
        <p className="text-xs text-gray-400 mt-0.5">
          <LegalRef par={16}>{lawText}</LegalRef>
        </p>
      </div>
      {children}
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center">
        {prefix && (
          <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 text-sm text-gray-500 rounded-l-lg">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          className={`input ${prefix ? "rounded-l-none" : ""} ${suffix ? "rounded-r-none" : ""}`}
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && (
          <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-sm text-gray-500 rounded-r-lg">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function ExamplesBox({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
      <p className="font-semibold text-gray-800 mb-2">{title}</p>
      <ul className="space-y-1">{children}</ul>
      {note && (
        <p className="text-xs text-amber-700 mt-2 font-medium">{note}</p>
      )}
    </div>
  );
}

export default function WerbungskostenSection() {
  const { selectedYearData, state, dispatch } = useTax();
  const intl = useIntl();
  const year = state.selectedYear;
  const wk = selectedYearData.werbungskosten;

  function update(partial: Partial<WerbungskostenData>) {
    dispatch({ type: "SET_WERBUNGSKOSTEN", data: { ...wk, ...partial } });
  }

  const calc = calculateWerbungskosten(wk, 0);

  const t = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const furnitureTotal =
    (wk.ergonomicFurnitureCost || 0) + (wk.ergoFurnitureCarryOver || 0);
  const furnitureDeduction = Math.min(furnitureTotal, 300);
  const furnitureCarryOver = Math.max(0, furnitureTotal - 300);

  return (
    <div className="space-y-8">
      <PageHeader title={t("wk.title")} subtitle={t("wk.subtitle", { year })} />

      {/* Ergonomic furniture — KZ 158 */}
      <WkSectionCard
        title={t("wk.furniture.title")}
        subtitle={t("wk.furniture.subtitle")}
        lawText={t("wk.furniture.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label={t("wk.furniture.cost")}
            value={wk.ergonomicFurnitureCost}
            onChange={(v) => update({ ergonomicFurnitureCost: v })}
            hint={t("wk.furniture.costHint")}
            prefix="€"
            step={0.01}
          />
          <NumberInput
            label={t("wk.furniture.carryOver")}
            value={wk.ergoFurnitureCarryOver}
            onChange={(v) => update({ ergoFurnitureCarryOver: v })}
            hint={t("wk.furniture.carryOverHint")}
            prefix="€"
            step={0.01}
          />
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-gray-500 text-xs mb-1">
              {t("wk.furniture.available")}
            </div>
            <div className="font-bold">{formatEUR(furnitureTotal)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">
              {t("wk.furniture.deduction")}{" "}
              <span className="kz-badge">KZ 158</span>
            </div>
            <div className="font-bold text-green-700">
              {formatEUR(furnitureDeduction)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">
              {t("wk.furniture.nextCarryOver")}
            </div>
            <div
              className={`font-bold ${furnitureCarryOver > 0 ? "text-amber-600" : "text-gray-400"}`}
            >
              {formatEUR(furnitureCarryOver)}
            </div>
            {furnitureCarryOver > 0 && (
              <div className="text-xs text-amber-700 mt-0.5">
                {t("wk.furniture.carryOverNote")} (
                <LegalRef par={16}>§16 Abs. 1 Z 7a</LegalRef>)
              </div>
            )}
          </div>
        </div>
      </WkSectionCard>

      {/* Internet — KZ 169 */}
      <WkSectionCard
        title={t("wk.internet.title")}
        subtitle={t("wk.internet.subtitle")}
        lawText={t("wk.internet.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label={t("wk.internet.monthly")}
            value={wk.internetMonthlyGross}
            onChange={(v) => update({ internetMonthlyGross: v })}
            hint={t("wk.internet.monthlyHint")}
            prefix="€"
            step={0.01}
          />
          <NumberInput
            label={t("wk.internet.workPercent")}
            value={wk.internetWorkPercent}
            onChange={(v) =>
              update({ internetWorkPercent: Math.min(100, Math.max(0, v)) })
            }
            hint={t("wk.internet.workPercentHint")}
            suffix="%"
            max={100}
          />
        </div>

        {wk.internetMonthlyGross > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <div className="text-gray-600">
              {t("wk.internet.annual")}{" "}
              <strong>{formatEUR(wk.internetMonthlyGross * 12)}</strong>
            </div>
            <div className="text-gray-600">
              {t("wk.internet.workShare", { pct: wk.internetWorkPercent })}{" "}
              <strong className="text-green-700">
                {formatEUR(calc.internetDeduction)}
              </strong>
            </div>
          </div>
        )}
      </WkSectionCard>

      {/* Gewerkschaft / Berufsverbände — KZ 717 */}
      <WkSectionCard
        title={t("wk.union.title")}
        subtitle={t("wk.union.subtitle")}
        lawText={t("wk.union.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberInput
            label={t("wk.union.label")}
            value={wk.gewerkschaftCost}
            onChange={(v) => update({ gewerkschaftCost: v })}
            hint={t("wk.union.labelHint")}
            prefix="€"
            step={0.01}
          />
          <ExamplesBox
            title={t("wk.union.examples")}
            note={t("wk.union.exNote")}
          >
            <li>{t("wk.union.ex1")}</li>
            <li>{t("wk.union.ex2")}</li>
            <li>{t("wk.union.ex3")}</li>
          </ExamplesBox>
        </div>
      </WkSectionCard>

      {/* Fachliteratur — KZ 720 */}
      <WkSectionCard
        title={t("wk.literature.title")}
        subtitle={t("wk.literature.subtitle")}
        lawText={t("wk.literature.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberInput
            label={t("wk.literature.label")}
            value={wk.fachliteraturCost}
            onChange={(v) => update({ fachliteraturCost: v })}
            hint={t("wk.literature.labelHint")}
            prefix="€"
            step={0.01}
          />
          <ExamplesBox title={t("wk.literature.examples")}>
            <li>{t("wk.literature.ex1")}</li>
            <li>{t("wk.literature.ex2")}</li>
            <li>{t("wk.literature.ex3")}</li>
          </ExamplesBox>
        </div>
      </WkSectionCard>

      {/* Fortbildung — KZ 722 */}
      <WkSectionCard
        title={t("wk.training.title")}
        subtitle={t("wk.training.subtitle")}
        lawText={t("wk.training.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberInput
            label={t("wk.training.label")}
            value={wk.fortbildungCost}
            onChange={(v) => update({ fortbildungCost: v })}
            hint={t("wk.training.labelHint")}
            prefix="€"
            step={0.01}
          />
          <ExamplesBox
            title={t("wk.training.examples")}
            note={t("wk.training.exNote")}
          >
            <li>{t("wk.training.ex1")}</li>
            <li>{t("wk.training.ex2")}</li>
            <li>{t("wk.training.ex3")}</li>
            <li>{t("wk.training.ex4")}</li>
          </ExamplesBox>
        </div>
      </WkSectionCard>

      {/* Reisekosten — KZ 721 */}
      <WkSectionCard
        title={t("wk.travel.title")}
        subtitle={t("wk.travel.subtitle")}
        lawText={t("wk.travel.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberInput
            label={t("wk.travel.label")}
            value={wk.reisekostenCost}
            onChange={(v) => update({ reisekostenCost: v })}
            hint={t("wk.travel.labelHint")}
            prefix="€"
            step={0.01}
          />
          <ExamplesBox
            title={t("wk.travel.examples")}
            note={t("wk.travel.exNote")}
          >
            <li>{t("wk.travel.ex1")}</li>
            <li>{t("wk.travel.ex2")}</li>
            <li>{t("wk.travel.ex3")}</li>
          </ExamplesBox>
        </div>
      </WkSectionCard>

      {/* Sonstige Werbungskosten — KZ 724 */}
      <WkSectionCard
        title={t("wk.other.title")}
        subtitle={t("wk.other.subtitle")}
        lawText={t("wk.other.law")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberInput
            label={t("wk.other.label")}
            value={wk.otherWerbungskostenCost}
            onChange={(v) => update({ otherWerbungskostenCost: v })}
            prefix="€"
            step={0.01}
          />
          <ExamplesBox title={t("wk.other.examples")}>
            <li>{t("wk.other.ex1")}</li>
            <li>{t("wk.other.ex2")}</li>
            <li>{t("wk.other.ex3")}</li>
          </ExamplesBox>
        </div>
      </WkSectionCard>

      {/* Total */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="font-semibold text-green-900 mb-4">
          {t("wk.summary.title", { year })}
        </h3>
        <div className="space-y-2 text-sm">
          {[
            {
              labelId: "wk.summary.furniture",
              value: calc.ergonomicFurnitureDeduction,
              kz: "158",
            },
            {
              labelId: "wk.summary.internet",
              value: calc.internetDeduction,
              kz: "169",
            },
            {
              labelId: "wk.summary.union",
              value: calc.gewerkschaftDeduction,
              kz: "717",
            },
            {
              labelId: "wk.summary.literature",
              value: calc.fachliteraturDeduction,
              kz: "720",
            },
            {
              labelId: "wk.summary.training",
              value: calc.fortbildungDeduction,
              kz: "722",
            },
            {
              labelId: "wk.summary.travel",
              value: calc.reisekostenDeduction,
              kz: "721",
            },
            {
              labelId: "wk.summary.other",
              value: calc.otherWerbungskostenDeduction,
              kz: "724",
            },
          ].map(({ labelId, value, kz }) => (
            <div
              key={kz + labelId}
              className="flex justify-between items-center py-1.5 border-b border-green-100 last:border-0"
            >
              <span className="text-gray-700 flex items-center gap-2">
                {t(labelId)} <span className="kz-badge">KZ {kz}</span>
              </span>
              <span
                className={`font-semibold ${value > 0 ? "text-green-700" : "text-gray-400"}`}
              >
                {formatEUR(value)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3">
            <span className="font-bold text-green-900">
              {t("wk.summary.afaNote")}
            </span>
            <span className="text-sm text-gray-500">→ KZ 169 / 724</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t-2 border-green-200 flex justify-between items-center">
          <span className="font-bold text-green-900 text-lg">
            {t("wk.summary.subtotal")}
          </span>
          <span className="font-bold text-2xl text-green-700">
            {formatEUR(
              calc.ergonomicFurnitureDeduction +
                calc.internetDeduction +
                calc.gewerkschaftDeduction +
                calc.fachliteraturDeduction +
                calc.fortbildungDeduction +
                calc.reisekostenDeduction +
                calc.otherWerbungskostenDeduction,
            )}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{t("wk.summary.hint")}</p>
      </div>
    </div>
  );
}
