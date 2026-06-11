"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type Lang = "ar" | "tr";
type Phase = "idle" | "pipeline" | "playing" | "done";

const SOURCE: string[] = [
  "Hey everyone — quick demo today.",
  "We upload a video and pick a language.",
  "The pipeline does the boring parts.",
  "And we never deploy on Friday.",
];

const TRANSLATIONS: Record<Lang, string[]> = {
  ar: [
    "مرحباً بالجميع — عرض سريع اليوم.",
    "نرفع فيديو ونختار اللغة.",
    "خط الأنابيب يتولى الأجزاء المملة.",
    "ولا ننشر يوم الجمعة أبداً.",
  ],
  tr: [
    "Herkese merhaba — bugün hızlı bir demo.",
    "Bir video yükleyip dil seçiyoruz.",
    "Sıkıcı kısımları pipeline hallediyor.",
    "Ve cuma günü asla deploy etmeyiz.",
  ],
};

const STAGES = [
  { id: "ffmpeg_extract", ms: 612 },
  { id: "whisper", ms: 848 },
  { id: "translate", ms: 543 },
  { id: "mux", ms: 391 },
];

const CLIP_S = 12;
const LINE_S = 3;
const CHARS_PER_S = 30;
const WAVE_BARS = 36;

export default function AiventlyDemo() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lang, setLang] = useState<Lang>("ar");
  const [stageIdx, setStageIdx] = useState(-1);
  const [t, setT] = useState(0);
  const [credits, setCredits] = useState(3);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // pipeline stage chain
  useEffect(() => {
    if (phase !== "pipeline") return;
    if (stageIdx >= STAGES.length) {
      setT(0);
      setPhase("playing");
      return;
    }
    timeoutRef.current = setTimeout(
      () => setStageIdx((i) => i + 1),
      stageIdx < 0 ? 150 : STAGES[stageIdx].ms,
    );
    return () => clearTimeout(timeoutRef.current);
  }, [phase, stageIdx]);

  // playback clock
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => {
      setT((v) => {
        if (v + 0.1 >= CLIP_S) {
          setPhase("done");
          return CLIP_S;
        }
        return v + 0.1;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [phase]);

  const run = () => {
    if (credits <= 0 || phase === "pipeline" || phase === "playing") return;
    setCredits((c) => c - 1);
    setStageIdx(-1);
    setPhase("pipeline");
  };

  const lineIdx = Math.min(Math.floor(t / LINE_S), SOURCE.length - 1);
  const lineElapsed = t - lineIdx * LINE_S;
  const target = TRANSLATIONS[lang][lineIdx];
  const chars = reduced ? target.length : Math.min(target.length, Math.floor(lineElapsed * CHARS_PER_S));
  const showingSubs = phase === "playing" || phase === "done";
  const activeBar = Math.floor((t / CLIP_S) * WAVE_BARS);
  const busy = phase === "pipeline" || phase === "playing";

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-faint">en →</span>
        {(["ar", "tr"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            disabled={busy}
            className={`border px-3 py-2 transition-colors duration-150 disabled:opacity-45 ${
              lang === l ? "border-acc text-acc" : "border-line text-mut hover:border-acc hover:text-acc"
            }`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={run}
          disabled={credits <= 0 || busy}
          className="border border-line bg-acc/10 px-4 py-2 text-acc transition-colors duration-150 hover:border-acc disabled:opacity-45"
        >
          run_pipeline →
        </button>
        <span className="ml-auto text-faint">credits: {credits}</span>
      </div>

      {credits <= 0 && !busy && (
        <p className="mt-2 font-mono text-[11px] text-warn">
          out_of_credits — refresh the page, the bill&apos;s on me.
        </p>
      )}

      {/* stages */}
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
        {STAGES.map((s, i) => {
          const state = phase === "idle" ? "pending" : i < stageIdx ? "done" : i === stageIdx ? "active" : "pending";
          return (
            <span
              key={s.id}
              className={`border px-2.5 py-1.5 ${
                state === "done"
                  ? "border-line text-mut"
                  : state === "active"
                    ? "border-acc text-acc"
                    : "border-line text-faint"
              }`}
            >
              {state === "done" ? "✓" : state === "active" ? "▸" : "·"} {s.id}
              {state === "done" && <span className="text-faint"> {s.ms}ms</span>}
            </span>
          );
        })}
      </div>

      {/* fake clip */}
      <div className="dotgrid mt-4 border border-line bg-bg-card/40 px-4 py-6">
        <div className="flex h-8 items-end gap-0.5" aria-hidden="true">
          {Array.from({ length: WAVE_BARS }, (_, i) => (
            <div
              key={i}
              className={`flex-1 ${showingSubs && i <= activeBar ? "bg-acc" : "bg-line"}`}
              style={{ height: `${20 + ((i * 53) % 23) * 3.2}%` }}
            />
          ))}
        </div>

        <div className="mt-5 min-h-16 text-center">
          {showingSubs ? (
            <>
              <p className="font-mono text-[11px] text-faint">{SOURCE[lineIdx]}</p>
              <p
                dir={lang === "ar" ? "rtl" : "ltr"}
                lang={lang}
                className="mt-1.5 text-base text-ink sm:text-lg"
                aria-live="polite"
              >
                {target.slice(0, chars)}
                {chars < target.length && <span className="text-acc">▍</span>}
              </p>
            </>
          ) : (
            <p className="font-mono text-xs text-faint">
              {phase === "pipeline" ? "processing…" : "subtitle track will render here"}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-faint">
          <span>{showingSubs ? `${t.toFixed(1)}s / ${CLIP_S}s` : "clip: demo.mp4 · 12s"}</span>
          <span>{phase === "done" ? "render_complete · srt+dub ready" : `target: ${lang}`}</span>
        </div>
      </div>
    </div>
  );
}
