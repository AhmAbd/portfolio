import { STACK_ICONS } from "@/lib/stackIcons";

interface TechChipProps {
  name: string;
}

/** Bordered mono chip with a monochrome brand glyph when one exists. */
export function TechChip({ name }: TechChipProps) {
  const icon = STACK_ICONS[name];
  return (
    <span className="inline-flex items-center gap-1.5 border border-line px-2 py-0.5 font-mono text-[11px] text-mut transition-colors duration-200 group-hover:border-line-strong group-hover:text-ink">
      {icon && (
        <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-current opacity-80" aria-hidden="true">
          <path d={icon.path} />
        </svg>
      )}
      {name}
    </span>
  );
}
