import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export function InfoTooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="text-blue-400 hover:text-blue-600 transition-colors align-middle ml-1"
        onClick={() => setOpen((v) => !v)}
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[min(20rem,calc(100vw-2rem))] bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-700 text-left font-normal">
          {children}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-gray-200" />
        </div>
      )}
    </div>
  );
}
