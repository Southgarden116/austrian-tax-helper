import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Collapsible({
  title,
  children,
  className = "",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`card ${className}`.trimEnd()}>
      <button
        className="w-full flex items-center justify-between font-semibold text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  );
}
