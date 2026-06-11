"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

type BinId = "glass" | "paper" | "metal" | "battery" | "plastic";

interface WasteItem {
  name: string;
  emoji: string;
  bin: BinId;
}

const BINS: { id: BinId; label: string }[] = [
  { id: "glass", label: "glass" },
  { id: "paper", label: "paper" },
  { id: "metal", label: "metal" },
  { id: "battery", label: "battery" },
  { id: "plastic", label: "plastic" },
];

const POOL: WasteItem[] = [
  { name: "glass_bottle", emoji: "🍾", bin: "glass" },
  { name: "glass_jar", emoji: "🫙", bin: "glass" },
  { name: "wine_glass", emoji: "🍷", bin: "glass" },
  { name: "newspaper", emoji: "📰", bin: "paper" },
  { name: "cardboard_box", emoji: "📦", bin: "paper" },
  { name: "envelope", emoji: "✉️", bin: "paper" },
  { name: "receipt", emoji: "🧾", bin: "paper" },
  { name: "tin_can", emoji: "🥫", bin: "metal" },
  { name: "paper_clip", emoji: "📎", bin: "metal" },
  { name: "metal_screw", emoji: "🔩", bin: "metal" },
  { name: "aa_battery", emoji: "🔋", bin: "battery" },
  { name: "drained_battery", emoji: "🪫", bin: "battery" },
  { name: "shampoo_bottle", emoji: "🧴", bin: "plastic" },
  { name: "plastic_cup", emoji: "🥤", bin: "plastic" },
  { name: "toothbrush", emoji: "🪥", bin: "plastic" },
  { name: "plastic_bag", emoji: "🛍️", bin: "plastic" },
];

const ROUNDS = POOL.length;
const BENCHMARK = 86.29;
const FEEDBACK_MS = 700;
const BEST_KEY = "wastesort_best_v1";

type Phase = "idle" | "item" | "feedback" | "done";

interface Feedback {
  ok: boolean;
  message: string;
}

function shuffled(items: WasteItem[]): WasteItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function readBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function WasteGame() {
  const reduced = useReducedMotion();
  const roundMs = reduced ? 5200 : 3600;

  const [phase, setPhase] = useState<Phase>("idle");
  const [deck, setDeck] = useState<WasteItem[]>(POOL);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [progress, setProgress] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const answeredRef = useRef(-1);

  useEffect(() => {
    queueMicrotask(() => setBest(readBest()));
  }, []);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const item = deck[round];

  const advance = useCallback(
    (nextCorrect: number) => {
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        if (round + 1 < ROUNDS) {
          setRound((r) => r + 1);
          setProgress(0);
          setPhase("item");
        } else {
          const accuracy = (nextCorrect / ROUNDS) * 100;
          const prevBest = readBest();
          const next = prevBest === null ? accuracy : Math.max(prevBest, accuracy);
          try {
            localStorage.setItem(BEST_KEY, String(next));
          } catch {
            // private mode — best score just won't persist
          }
          setBest(next);
          setPhase("done");
        }
      }, FEEDBACK_MS);
    },
    [round],
  );

  const answer = useCallback(
    (bin: BinId | null) => {
      if (phase !== "item" || answeredRef.current === round) return;
      answeredRef.current = round;
      const ok = bin === item.bin;
      const nextCorrect = correct + (ok ? 1 : 0);
      setCorrect(nextCorrect);
      setFeedback({
        ok,
        message: ok
          ? "correct · +1"
          : bin === null
            ? `too_slow → ${item.bin}`
            : `wrong → ${item.bin}`,
      });
      setPhase("feedback");
      advance(nextCorrect);
    },
    [advance, correct, item, phase, round],
  );

  // round timer
  useEffect(() => {
    if (phase !== "item") return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = (now - start) / roundMs;
      if (p >= 1) {
        answer(null);
        return;
      }
      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, round, roundMs, answer]);

  // keys 1-5
  useEffect(() => {
    if (phase !== "item") return;
    const onKey = (e: KeyboardEvent) => {
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < BINS.length) answer(BINS[idx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  const start = () => {
    clearTimeout(timeoutRef.current);
    answeredRef.current = -1;
    setDeck(shuffled(POOL));
    setRound(0);
    setCorrect(0);
    setFeedback(null);
    setProgress(0);
    setPhase("item");
  };

  const accuracy = (correct / ROUNDS) * 100;
  const won = accuracy > BENCHMARK;
  const playing = phase === "item" || phase === "feedback";

  return (
    <section
      id="playground"
      aria-labelledby="playground-title"
      className="mx-auto max-w-6xl px-5 sm:px-8"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <SectionHeading
        index="04"
        tag="playground"
        title="Beat my model"
        meta={`benchmark: ${BENCHMARK}%`}
      />

      <Reveal>
        <p className="mb-8 max-w-xl leading-relaxed text-mut">
          My YOLOv8s sorts waste at <span className="text-ink">86.29% mAP50</span>. Your turn:{" "}
          {ROUNDS} items, a few seconds each, five bins. Outsort the model.
        </p>

        <div
          className={`relative border bg-bg-card/40 transition-colors duration-300 ${
            feedback ? (feedback.ok ? "border-acc" : "border-warn") : "border-line"
          }`}
        >
          {/* status bar */}
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-faint sm:px-5 sm:text-xs">
            <span>
              {playing ? `item ${String(round + 1).padStart(2, "0")}/${ROUNDS}` : `items: ${ROUNDS}`}
            </span>
            <span aria-live="polite">
              {playing
                ? `acc: ${round > 0 || phase === "feedback" ? ((correct / Math.max(round + (phase === "feedback" ? 1 : 0), 1)) * 100).toFixed(0) : "—"}%`
                : best !== null
                  ? `personal_best: ${best.toFixed(2)}%`
                  : "personal_best: none"}
            </span>
          </div>

          {/* arena */}
          <div className="dotgrid flex min-h-64 flex-col items-center justify-center px-4 py-10 text-center sm:min-h-72">
            {phase === "idle" && (
              <button
                onClick={start}
                className="group inline-flex items-center gap-3 bg-acc px-6 py-3.5 font-mono text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5"
              >
                start_run
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            )}

            {playing && item && (
              <>
                <div className="text-6xl sm:text-7xl" aria-hidden="true">
                  {item.emoji}
                </div>
                <p className="mt-4 font-mono text-sm text-ink sm:text-base">{item.name}</p>
                <p
                  className={`mt-3 h-5 font-mono text-[13px] ${feedback ? (feedback.ok ? "text-acc" : "text-warn") : "text-transparent"}`}
                  aria-live="assertive"
                >
                  {feedback?.message ?? "·"}
                </p>
              </>
            )}

            {phase === "done" && (
              <div>
                <p className="font-mono text-xs text-faint">final_accuracy</p>
                <p className={`display mt-2 text-6xl sm:text-7xl ${won ? "text-acc" : "text-warn"}`}>
                  {accuracy.toFixed(2)}%
                </p>
                <p className="mt-3 font-mono text-sm text-mut">
                  {won
                    ? "New SOTA. Publish it."
                    : `The model remains undefeated. (${BENCHMARK}%)`}
                </p>
                <button
                  onClick={start}
                  className="link-hud mt-6 font-mono text-sm text-ink"
                >
                  retry_run →
                </button>
              </div>
            )}
          </div>

          {/* round timer */}
          {playing && (
            <div className="h-0.5 w-full bg-line" aria-hidden="true">
              <div
                className="h-full origin-left bg-acc"
                style={{ transform: `scaleX(${phase === "feedback" ? 0 : 1 - progress})` }}
              />
            </div>
          )}

          {/* bins */}
          <div className="flex flex-wrap justify-center gap-2 border-t border-line px-4 py-4 sm:gap-3 sm:px-5">
            {BINS.map((bin, i) => (
              <button
                key={bin.id}
                onClick={() => answer(bin.id)}
                disabled={phase !== "item"}
                className="border border-line px-3 py-2 font-mono text-xs text-mut transition-colors duration-150 hover:border-acc hover:text-acc disabled:opacity-45 disabled:hover:border-line disabled:hover:text-mut sm:px-4 sm:text-[13px]"
              >
                <span className="mr-1.5 text-faint" aria-hidden="true">{i + 1}</span>
                {bin.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 font-mono text-xs text-faint">
          same five classes as the real app · keys 1–5 work too
        </p>
      </Reveal>
    </section>
  );
}
