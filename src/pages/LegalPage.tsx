import { useIntl } from "react-intl";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";

export default function LegalPage() {
  const intl = useIntl();
  const t = (id: string, vals?: Record<string, string | number>) =>
    intl.formatMessage({ id }, vals);

  return (
    <div className="space-y-6">
      <PageHeader title={t("legal.title")} subtitle={t("legal.subtitle")} />

      {/* Haftungsausschluss — keine Steuerberatung, keine Gewähr */}
      <section className="card space-y-3 border-at-red/30 bg-at-red/5">
        <SectionHeader title={t("legal.disclaimer.title")} />
        <p className="text-sm text-gray-700">{t("legal.disclaimer.body")}</p>
      </section>

      {/* Offenlegung "kleine Website" — §25 Abs 5 MedienG */}
      <section className="card space-y-3">
        <SectionHeader title={t("legal.impressum.title")} />
        <div className="text-sm text-gray-700 space-y-1">
          <p className="whitespace-pre-line">{t("legal.impressum.body")}</p>
        </div>
      </section>

      {/* Datenschutz — GDPR */}
      <section className="card space-y-3">
        <SectionHeader title={t("legal.privacy.title")} />
        <div className="text-sm text-gray-700 space-y-3">
          <p>{t("legal.privacy.controller")}</p>
          <p>{t("legal.privacy.local")}</p>
          <p>{t("legal.privacy.host")}</p>
          <p className="text-gray-500">{t("legal.privacy.rights")}</p>
        </div>
      </section>
    </div>
  );
}
