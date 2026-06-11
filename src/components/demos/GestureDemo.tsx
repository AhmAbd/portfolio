"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HAND_POINTS, HAND_CONNECTIONS } from "@/components/sections/HandLandmarks";

type Pt = readonly [number, number];
type PoseName = "open" | "fist" | "pinch" | "swipe";

const FIST: readonly Pt[] = [
  [50, 95],
  [40, 86], [33, 79], [31, 72], [35, 68],
  [38, 63], [37, 51], [38, 59], [39, 65],
  [48, 61], [47, 47], [48, 57], [49, 64],
  [58, 62], [59, 49], [59, 58], [59, 64],
  [67, 67], [69, 56], [70, 62], [70, 67],
];

const PINCH: readonly Pt[] = [
  [50, 95],
  [38, 85], [30, 72], [26, 59], [30, 49],
  [38, 62], [35, 50], [33, 46], [31, 48],
  [48, 60], [47, 42], [46, 30], [45, 18],
  [58, 61], [60, 44], [61, 33], [62, 23],
  [68, 66], [72, 52], [74, 43], [76, 34],
];

const SWIPE: readonly Pt[] = HAND_POINTS.map(([x, y]) => [x + 12, y - 3] as const);

const POSES: Record<PoseName, readonly Pt[]> = {
  open: HAND_POINTS,
  fist: FIST,
  pinch: PINCH,
  swipe: SWIPE,
};

const DURATION = 90;
const ACTION_DELAY_MS = 350;

interface GestureButton {
  id: string;
  pose: PoseName;
  label: string;
  conf: string;
}

const GESTURES: GestureButton[] = [
  { id: "open_palm", pose: "open", label: "open_palm · pause", conf: "0.98" },
  { id: "fist", pose: "fist", label: "fist · play", conf: "0.97" },
  { id: "swipe_l", pose: "swipe", label: "swipe_l · −10s", conf: "0.92" },
  { id: "swipe_r", pose: "swipe", label: "swipe_r · +10s", conf: "0.93" },
  { id: "pinch_up", pose: "pinch", label: "pinch · vol+", conf: "0.95" },
  { id: "pinch_dn", pose: "pinch", label: "pinch · vol−", conf: "0.95" },
];

function timecode(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function GestureDemo() {
  const reduced = useReducedMotion();
  const [pose, setPose] = useState<PoseName>("open");
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(24);
  const [vol, setVol] = useState(0.625);
  const [away, setAway] = useState(false);
  const [attention, setAttention] = useState(1);
  const [status, setStatus] = useState("idle — throw a gesture");
  const actionRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pausedByAttention = useRef(false);

  useEffect(() => () => clearTimeout(actionRef.current), []);

  // playhead
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setT((v) => (v + 0.25) % DURATION), 250);
    return () => clearInterval(iv);
  }, [playing]);

  // attention drain / refill
  useEffect(() => {
    const iv = setInterval(() => {
      setAttention((a) => Math.max(0, Math.min(1, a + (away ? -0.07 : 0.07))));
    }, 90);
    return () => clearInterval(iv);
  }, [away]);

  // attention side effects
  useEffect(() => {
    if (attention <= 0 && playing) {
      pausedByAttention.current = true;
      setPlaying(false);
      setStatus("attention_lost → auto_pause");
    }
    if (attention >= 1 && pausedByAttention.current) {
      pausedByAttention.current = false;
      setPlaying(true);
      setStatus("attention_restored → resume");
    }
  }, [attention, playing]);

  const act = useCallback((g: GestureButton) => {
    clearTimeout(actionRef.current);
    setPose(g.pose);
    setStatus(`${g.id} · ${g.conf} → recognizing…`);
    actionRef.current = setTimeout(() => {
      if (g.id === "open_palm") setPlaying(false);
      if (g.id === "fist") setPlaying(true);
      if (g.id === "swipe_l") setT((v) => Math.max(0, v - 10));
      if (g.id === "swipe_r") setT((v) => Math.min(DURATION - 1, v + 10));
      if (g.id === "pinch_up") setVol((v) => Math.min(1, v + 0.125));
      if (g.id === "pinch_dn") setVol((v) => Math.max(0, v - 0.125));
      setStatus(`${g.id} · ${g.conf} → ${g.label.split("· ")[1]}`);
      actionRef.current = setTimeout(() => setPose("open"), 600);
    }, ACTION_DELAY_MS);
  }, []);

  const points = POSES[pose];
  const locked = attention >= 0.5;

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-[1fr_150px]">
        {/* fake player with hand overlay */}
        <div className="dotgrid relative border border-line bg-bg-card/40 p-4">
          <div className="flex items-center justify-between font-mono text-[11px] text-faint">
            <span>{playing ? "▶ playing" : "❚❚ paused"}</span>
            <span>
              vol{" "}
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className={i / 8 < vol ? "text-acc" : "text-line"}>
                  ▮
                </span>
              ))}
            </span>
          </div>

          <div className="relative mx-auto mt-2 flex h-40 items-center justify-center sm:h-48">
            <p className="display text-5xl text-ink/90 sm:text-6xl" aria-hidden="true">
              {timecode(t)}
            </p>
            <svg viewBox="0 0 100 110" className="absolute right-0 top-0 h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
              {HAND_CONNECTIONS.map(([a, b], i) => (
                <motion.line
                  key={`c-${i}`}
                  animate={{
                    x1: points[a][0],
                    y1: points[a][1],
                    x2: points[b][0],
                    y2: points[b][1],
                  }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
                  stroke="var(--acc)"
                  strokeOpacity="0.5"
                  strokeWidth="0.6"
                />
              ))}
              {points.map((_, i) => (
                <motion.circle
                  key={`p-${i}`}
                  animate={{ cx: points[i][0], cy: points[i][1] }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
                  r="1.2"
                  fill="var(--acc)"
                />
              ))}
            </svg>
          </div>

          {/* progress */}
          <div className="mt-2 h-0.5 w-full bg-line" aria-hidden="true">
            <div className="h-full bg-acc" style={{ width: `${(t / DURATION) * 100}%` }} />
          </div>
        </div>

        {/* face lock */}
        <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-stretch sm:justify-start">
          <svg viewBox="0 0 60 44" className="w-24 sm:w-full" aria-hidden="true">
            <rect
              x="14"
              y="6"
              width="32"
              height="32"
              fill="none"
              stroke={locked ? "var(--acc)" : "var(--warn)"}
              strokeWidth="1"
              strokeDasharray={locked ? "0" : "4 3"}
            />
            <circle cx={locked ? 25 : 21} cy="18" r="2" fill={locked ? "var(--acc)" : "var(--warn)"} />
            <circle cx={locked ? 35 : 31} cy="18" r="2" fill={locked ? "var(--acc)" : "var(--warn)"} />
            <path
              d={locked ? "M25 28 q5 4 10 0" : "M23 30 q5 -3 10 0"}
              fill="none"
              stroke={locked ? "var(--acc)" : "var(--warn)"}
              strokeWidth="1"
            />
          </svg>
          <div>
            <p className={`font-mono text-[11px] ${locked ? "text-acc" : "text-warn"}`}>
              {locked ? "face_lock · 0.98" : "attention_lost"}
            </p>
            <div className="mt-1.5 h-1 w-full bg-line" aria-hidden="true">
              <div
                className={`h-full transition-[width] duration-100 ${locked ? "bg-acc" : "bg-warn"}`}
                style={{ width: `${attention * 100}%` }}
              />
            </div>
            <button
              onClick={() => setAway((v) => !v)}
              aria-pressed={away}
              className="mt-3 w-full border border-line px-3 py-2 font-mono text-[11px] text-mut transition-colors duration-150 hover:border-acc hover:text-acc"
            >
              {away ? "look_back 👀" : "look_away"}
            </button>
          </div>
        </div>
      </div>

      {/* gesture buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {GESTURES.map((g) => (
          <button
            key={g.id}
            onClick={() => act(g)}
            className="border border-line px-3 py-2 font-mono text-[11px] text-mut transition-colors duration-150 hover:border-acc hover:text-acc sm:text-xs"
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mt-3 h-4 font-mono text-xs text-mut" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
