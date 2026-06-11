"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Initializes Lenis smooth scrolling. Skipped entirely under reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -72 },
      lerp: 0.105,
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
