export const RIS_ESTG =
  "https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10004570&Paragraf=";

export function LegalRef({
  children,
  par,
}: {
  children: React.ReactNode;
  par: number;
}) {
  return (
    <a
      href={`${RIS_ESTG}${par}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-dotted underline-offset-2 hover:text-blue-700 transition-colors"
    >
      {children}
    </a>
  );
}
