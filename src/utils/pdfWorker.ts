import type * as PdfjsLib from "pdfjs-dist";

let pdfjsLib: typeof PdfjsLib | null = null;

// Lazily loads pdfjs-dist and wires up an inline-bundled worker (via Vite's
// ?worker&inline), which embeds the worker as a data URL. This avoids the
// server MIME-type requirement for .mjs files that breaks module workers on
// Apache hosts without AllowOverride.
export async function getPdfjs(): Promise<typeof PdfjsLib> {
  if (pdfjsLib) return pdfjsLib;

  const [lib, { default: PdfWorkerClass }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?worker&inline"),
  ]);

  lib.GlobalWorkerOptions.workerPort =
    new PdfWorkerClass() as unknown as Worker;
  pdfjsLib = lib;
  return lib;
}
