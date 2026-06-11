"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

/** Scroll-progress HUD: 1px accent bar up top, mono scan readout bottom-right. */
export function ScanHud() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const percentValue = useTransform(scrollYProgress, (v) => Math.round(v * 100));
  const [percent, setPercent] = useState(0);

  useEffect(() => percentValue.on("change", setPercent), [percentValue]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-acc"
        style={{ scaleX }}
      />
      <div
        aria-hidden="true"
        className="fixed right-4 bottom-4 z-50 hidden font-mono text-[11px] text-faint select-none md:block"
      >
        scan {String(percent).padStart(3, "0")}%
      </div>
    </>
  );
}
