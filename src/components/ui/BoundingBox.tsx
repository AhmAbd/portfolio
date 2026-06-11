"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

interface BoundingBoxProps {
  label: string;
  confidence?: number;
  children: React.ReactNode;
  className?: string;
  /** delay before the box starts drawing, in seconds */
  delay?: number;
}

/** Draws a YOLO-style detection box around its children when scrolled into view. */
export function BoundingBox({
  label,
  confidence,
  children,
  className = "",
  delay = 0,
}: BoundingBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();

  const corner = "absolute w-3.5 h-3.5 border-acc";
  const drawn = inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 };
  const cornerTransition = (i: number) => ({
    duration: reduced ? 0 : 0.3,
    delay: reduced ? 0 : delay + 0.55 + i * 0.06,
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* box outline */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <motion.rect
          x="0.5"
          y="0.5"
          width="99.6%"
          height="99%"
          fill="none"
          stroke="var(--acc)"
          strokeWidth="1"
          strokeOpacity="0.55"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: reduced ? 0 : 0.9, delay, ease: "easeInOut" }}
        />
      </svg>

      {/* corner ticks */}
      <motion.span aria-hidden className={`${corner} -top-px -left-px border-t-2 border-l-2`} initial={false} animate={drawn} transition={cornerTransition(0)} />
      <motion.span aria-hidden className={`${corner} -top-px -right-px border-t-2 border-r-2`} initial={false} animate={drawn} transition={cornerTransition(1)} />
      <motion.span aria-hidden className={`${corner} -bottom-px -right-px border-b-2 border-r-2`} initial={false} animate={drawn} transition={cornerTransition(2)} />
      <motion.span aria-hidden className={`${corner} -bottom-px -left-px border-b-2 border-l-2`} initial={false} animate={drawn} transition={cornerTransition(3)} />

      {/* label tab */}
      <motion.div
        className="absolute -top-px left-0 -translate-y-full bg-acc px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-bg sm:text-xs"
        initial={{ opacity: 0, y: 4 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
        transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : delay + 0.75 }}
      >
        {label}
        {confidence !== undefined && (
          <span className="opacity-70"> {confidence.toFixed(2)}</span>
        )}
      </motion.div>

      {children}
    </div>
  );
}
