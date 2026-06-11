"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type Level = "low" | "med" | "high";
type Band = "low" | "medium" | "high" | "critical";
type InputId = "severity" | "stability" | "risk" | "age_vuln" | "waiting";

const INPUTS: { id: InputId; label: string }[] = [
  { id: "severity", label: "severity" },
  { id: "stability", label: "stability" },
  { id: "risk", label: "risk" },
  { id: "age_vuln", label: "age_vulnerability" },
  { id: "waiting", label: "waiting_time" },
];

/** triangular membership with shoulder handling at the domain edges */
function tri(x: number, [a, b, c]: readonly [number, number, number]): number {
  if (x <= a) return a === b ? 1 : 0;
  if (x >= c) return c === b ? 1 : 0;
  if (x === b) return 1;
  return x < b ? (x - a) / (b - a) : (c - x) / (c - b);
}

const MF: Record<Level, readonly [number, number, number]> = {
  low: [0, 0, 5],
  med: [0, 5, 10],
  high: [5, 10, 10],
};

function memberships(x: number): Record<Level, number> {
  return { low: tri(x, MF.low), med: tri(x, MF.med), high: tri(x, MF.high) };
}

interface Rule {
  when: Partial<Record<InputId, Level>>;
  then: Band;
}

/**
 * Compact Mamdani-style rule base. The three single-antecedent severity rules
 * guarantee every input combination fires something (no dead zones) — the
 * real project covers 243/243 with 70 rules; this is the demo-sized subset.
 */
const RULES: Rule[] = [
  { when: { severity: "high", stability: "low" }, then: "critical" },
  { when: { severity: "high", risk: "high" }, then: "critical" },
  { when: { severity: "high", age_vuln: "high" }, then: "critical" },
  { when: { stability: "low", risk: "high" }, then: "critical" },
  { when: { severity: "high" }, then: "high" },
  { when: { severity: "med", stability: "low" }, then: "high" },
  { when: { severity: "med", risk: "high" }, then: "high" },
  { when: { severity: "med", waiting: "high" }, then: "high" },
  { when: { severity: "med" }, then: "medium" },
  { when: { severity: "low", waiting: "high" }, then: "medium" },
  { when: { severity: "low", risk: "high" }, then: "medium" },
  { when: { severity: "low" }, then: "low" },
];

const BAND_CENTER: Record<Band, number> = { low: 15, medium: 42, high: 68, critical: 92 };
const BANDS: Band[] = ["low", "medium", "high", "critical"];

interface Inference {
  score: number;
  band: Band;
  topRule: { text: string; strength: number } | null;
  firedCount: number;
}

function ruleText(rule: Rule): string {
  const parts = Object.entries(rule.when).map(([id, lv]) => `${id}=${lv}`);
  return `${parts.join(" ∧ ")} → ${rule.then}`;
}

function bandOf(score: number): Band {
  return score >= 80 ? "critical" : score >= 55 ? "high" : score >= 30 ? "medium" : "low";
}

function infer(values: Record<InputId, number>): Inference {
  const m = Object.fromEntries(
    INPUTS.map((inp) => [inp.id, memberships(values[inp.id])]),
  ) as Record<InputId, Record<Level, number>>;

  const agg: Record<Band, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  let top: { text: string; strength: number } | null = null;
  let firedCount = 0;

  for (const rule of RULES) {
    const strength = Math.min(
      ...Object.entries(rule.when).map(([id, lv]) => m[id as InputId][lv as Level]),
    );
    if (strength <= 0) continue;
    firedCount += 1;
    agg[rule.then] = Math.max(agg[rule.then], strength);
    if (!top || strength > top.strength) top = { text: ruleText(rule), strength };
  }

  const den = BANDS.reduce((s, b) => s + agg[b], 0);
  const score = den === 0 ? 0 : BANDS.reduce((s, b) => s + agg[b] * BAND_CENTER[b], 0) / den;
  return { score, band: bandOf(score), topRule: top, firedCount };
}

const PEERS = [
  { id: "pt_204", score: 88 },
  { id: "pt_117", score: 64 },
  { id: "pt_093", score: 39 },
  { id: "pt_310", score: 14 },
];

const BAND_CLASS: Record<Band, string> = {
  low: "text-faint",
  medium: "text-mut",
  high: "text-acc",
  critical: "text-warn",
};

export default function TriageDemo() {
  const reduced = useReducedMotion();
  const [values, setValues] = useState<Record<InputId, number>>({
    severity: 6,
    stability: 4,
    risk: 5,
    age_vuln: 3,
    waiting: 2,
  });
  const [active, setActive] = useState<InputId>("severity");

  const result = useMemo(() => infer(values), [values]);

  const queue = useMemo(() => {
    const rows = [...PEERS.map((p) => ({ ...p, you: false })), { id: "you", score: result.score, you: true }];
    return rows.sort((a, b) => b.score - a.score);
  }, [result.score]);

  const activeM = memberships(values[active]);
  const activeLevel = (Object.entries(activeM) as [Level, number][]).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* sliders + curves */}
      <div>
        {INPUTS.map((inp) => (
          <label key={inp.id} className="mb-3 block font-mono text-xs">
            <span className="flex justify-between text-mut">
              <span>{inp.label}</span>
              <span className={inp.id === active ? "text-acc" : "text-faint"}>
                {values[inp.id].toFixed(1)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={values[inp.id]}
              onChange={(e) => setValues((v) => ({ ...v, [inp.id]: Number(e.target.value) }))}
              onFocus={() => setActive(inp.id)}
              onPointerDown={() => setActive(inp.id)}
              className="mt-1 w-full"
              style={{ accentColor: "var(--acc)" }}
              aria-label={inp.label}
            />
          </label>
        ))}

        {/* membership curves for the active input */}
        <div className="mt-4 border border-line p-3">
          <p className="mb-1 font-mono text-[11px] text-faint">
            μ({active}) · dominant: {activeLevel}
          </p>
          <svg viewBox="0 0 200 52" className="w-full" aria-hidden="true">
            <polyline points="0,4 100,48" fill="none" stroke="var(--line)" strokeWidth="1.5" />
            <polyline points="0,48 100,4 200,48" fill="none" stroke="var(--line)" strokeWidth="1.5" />
            <polyline points="100,48 200,4" fill="none" stroke="var(--line)" strokeWidth="1.5" />
            <line
              x1={values[active] * 20}
              x2={values[active] * 20}
              y1="0"
              y2="52"
              stroke="var(--acc)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* score + queue */}
      <div>
        <div className="flex items-baseline gap-4">
          <span className={`display text-6xl ${BAND_CLASS[result.band]}`}>
            {Math.round(result.score)}
          </span>
          <span className={`font-mono text-sm ${BAND_CLASS[result.band]}`}>
            band: {result.band}
          </span>
        </div>
        <p className="mt-2 h-4 font-mono text-[11px] text-faint" aria-live="polite">
          {result.topRule
            ? `top_rule: ${result.topRule.text} (${result.topRule.strength.toFixed(2)}) · fired: ${result.firedCount}/12`
            : "no rules fired"}
        </p>

        <ul className="mt-5 flex flex-col gap-1.5">
          {queue.map((row, i) => (
            <motion.li
              key={row.id}
              layout={!reduced}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center justify-between border px-3 py-2 font-mono text-xs ${
                row.you ? "border-acc bg-bg-card" : "border-line"
              }`}
            >
              <span className={row.you ? "text-acc" : "text-mut"}>
                {String(i + 1).padStart(2, "0")} · {row.id}
              </span>
              <span className={BAND_CLASS[bandOf(row.score)]}>
                {Math.round(row.score)} · {bandOf(row.score)}
              </span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[11px] text-faint">
          queue reorders live · same membership shapes as the real 70-rule system
        </p>
      </div>
    </div>
  );
}
