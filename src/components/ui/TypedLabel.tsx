"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface TypedLabelProps {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  startDelay?: number;
  caret?: boolean;
}

/** Types out mono text when scrolled into view. Renders instantly under reduced motion. */
export function TypedLabel({
  text,
  className = "",
  speed = 28,
  startDelay = 0,
  caret = false,
}: TypedLabelProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length && interval) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [inView, reduced, text, speed, startDelay]);

  const shown = reduced && inView ? text.length : count;
  const done = shown >= text.length;

  return (
    <span ref={ref} className={`font-mono ${className}`} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, shown)}</span>
      {caret && !done && inView && <span className="caret" aria-hidden="true" />}
    </span>
  );
}
