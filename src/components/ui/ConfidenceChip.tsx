interface ConfidenceChipProps {
  label: string;
  confidence: number;
  className?: string;
}

/** Small mono chip: `label · 0.97`. Drops to warn tone below 0.93 — the model is only human. */
export function ConfidenceChip({ label, confidence, className = "" }: ConfidenceChipProps) {
  const tone = confidence >= 0.93 ? "text-acc border-acc-dim" : "text-warn border-warn/40";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] tracking-wide ${tone} ${className}`}
    >
      {label}
      <span className="opacity-60">{confidence.toFixed(2)}</span>
    </span>
  );
}
