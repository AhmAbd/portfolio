"use client";

import { motion, useReducedMotion } from "motion/react";
import { TypedLabel } from "./TypedLabel";

interface SectionHeadingProps {
  index: string;
  tag: string;
  title: string;
  meta?: string;
}

/** Section header: mono tag line, display title, optional right-aligned meta readout. */
export function SectionHeading({ index, tag, title, meta }: SectionHeadingProps) {
  const reduced = useReducedMotion();
  return (
    <div className="mb-12 sm:mb-16">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <TypedLabel text={`// ${index} · ${tag}`} className="text-xs text-acc sm:text-sm" />
        {meta && (
          <span className="hidden font-mono text-xs text-faint sm:block">{meta}</span>
        )}
      </div>
      <motion.h2
        className="display text-ink"
        style={{ fontSize: "var(--text-section)" }}
        initial={{ opacity: 0, y: reduced ? 0 : 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: reduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h2>
    </div>
  );
}
