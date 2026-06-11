"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { identity } from "@/lib/data";
import { BoundingBox } from "@/components/ui/BoundingBox";
import { TypedLabel } from "@/components/ui/TypedLabel";
import { HandLandmarks } from "./HandLandmarks";

export function Hero() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const drift = useTransform(scrollYProgress, [0, 0.25], [0, reduced ? 0 : -60]);

  return (
    <section
      aria-labelledby="hero-heading"
      className="dotgrid relative flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-24 pb-28 sm:px-8"
    >
      <HandLandmarks className="pointer-events-none absolute top-[14%] right-[4%] hidden w-72 opacity-60 lg:block xl:w-80" />

      <motion.div style={{ y: drift }} className="mx-auto w-full max-w-6xl">
        <TypedLabel
          text="init complete — 1 engineer online · stacks: ai · web · mobile · embedded"
          className="mb-8 block text-xs text-mut sm:text-sm"
          caret
        />

        <BoundingBox label="person · ahmad_abdullatif · 0.998" delay={0.4} className="w-fit">
          <h1
            id="hero-heading"
            className="display px-3 py-2 text-ink sm:px-5 sm:py-3"
            style={{ fontSize: "var(--text-hero)" }}
          >
            Ahmad
            <br />
            Abdullatif
          </h1>
        </BoundingBox>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 max-w-xl"
        >
          <p className="text-lg leading-relaxed text-mut sm:text-xl">
            <span className="text-ink">{identity.role}.</span> {identity.heroLine}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs text-mut sm:text-[13px]">
            <span className="flex items-center gap-2.5">
              <span className="pulse-dot" aria-hidden="true" />
              <span className="text-acc">status: {identity.status}</span>
            </span>
            <span>loc: {identity.location}</span>
            <span>locales: ar · en · tr</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        className="link-hud absolute bottom-7 left-1/2 hidden -translate-x-1/2 font-mono text-xs text-faint sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 2.2, duration: 0.8 }}
      >
        ▼ scroll_to_load_more
      </motion.a>
    </section>
  );
}
