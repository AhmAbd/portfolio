"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { HAND_POINTS, HAND_CONNECTIONS } from "@/components/sections/HandLandmarks";

const SCAN_MS = 1800;
const TARGET = 0.902;
const THRESHOLD = 0.85;
const BARS = 16;
const STUDENTS = ["stu_2209", "stu_1847", "stu_0533", "stu_3108", "stu_1192"];

type Phase = "idle" | "scanning" | "granted" | "incomplete";

export default function PalmScanDemo() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [student, setStudent] = useState(0);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const grantedRef = useRef(false);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const begin = useCallback(() => {
    if (holdingRef.current) return;
    holdingRef.current = true;
    if (grantedRef.current) {
      grantedRef.current = false;
      setStudent((s) => (s + 1) % STUDENTS.length);
    }
    setPhase("scanning");
    setProgress(0);
    const start = performance.now();
    const tick = (now: number) => {
      if (!holdingRef.current) return;
      const p = Math.min((now - start) / SCAN_MS, 1);
      setProgress(p);
      if (p >= 1) {
        holdingRef.current = false;
        grantedRef.current = true;
        setPhase("granted");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const release = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    setPhase("incomplete");
  }, []);

  const score = phase === "granted" ? TARGET : progress * TARGET;
  const scanning = phase === "scanning";

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
      {/* palm */}
      <svg viewBox="0 0 100 110" className="mx-auto w-40 sm:w-full" aria-hidden="true">
        {HAND_CONNECTIONS.map(([a, b], i) => (
          <line
            key={`c-${i}`}
            x1={HAND_POINTS[a][0]}
            y1={HAND_POINTS[a][1]}
            x2={HAND_POINTS[b][0]}
            y2={HAND_POINTS[b][1]}
            stroke="var(--acc)"
            strokeOpacity={scanning || phase === "granted" ? 0.45 : 0.25}
            strokeWidth="0.5"
          />
        ))}
        {HAND_POINTS.map(([x, y], i) => (
          <circle key={`p-${i}`} cx={x} cy={y} r="1.1" fill="var(--acc)" fillOpacity="0.75" />
        ))}
        {progress > 0.3 && phase !== "incomplete" && (
          <g>
            <rect
              x="28"
              y="54"
              width="46"
              height="46"
              fill="none"
              stroke="var(--acc)"
              strokeWidth="0.7"
              strokeDasharray="3 2"
            />
            <text x="30" y="51" fill="var(--acc)" fontSize="4.5" fontFamily="var(--font-mono)">
              roi · palm
            </text>
          </g>
        )}
        {scanning && !reduced && (
          <line
            x1="4"
            x2="96"
            y1={8 + progress * 94}
            y2={8 + progress * 94}
            stroke="var(--acc)"
            strokeWidth="0.8"
            strokeOpacity="0.85"
          />
        )}
      </svg>

      {/* readout */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-faint">similarity</span>
          <span className={`display text-4xl sm:text-5xl ${phase === "granted" ? "text-acc" : "text-ink"}`}>
            {score.toFixed(3)}
          </span>
          <span className="font-mono text-[11px] text-faint">≥ {THRESHOLD.toFixed(2)} → match</span>
        </div>

        {/* embedding bars */}
        <div className="mt-4 flex h-10 items-end gap-1" aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => {
            const lit = progress > i / BARS || phase === "granted";
            return (
              <div
                key={i}
                className={`w-2 transition-colors duration-150 ${lit ? "bg-acc" : "bg-line"}`}
                style={{ height: `${30 + ((i * 37) % 53)}%` }}
              />
            );
          })}
        </div>

        <p className="mt-4 h-5 font-mono text-[13px]" aria-live="polite">
          {phase === "idle" && <span className="text-faint">awaiting palm…</span>}
          {scanning && (
            <span className="text-mut">
              scanning… {Math.round(progress * 100)}% · extracting_embedding
            </span>
          )}
          {phase === "granted" && (
            <span className="text-acc">
              ACCESS GRANTED · attendance_marked · id: {STUDENTS[student]}
            </span>
          )}
          {phase === "incomplete" && (
            <span className="text-warn">scan_incomplete — palm left the frame</span>
          )}
        </p>

        <button
          onPointerDown={(e) => {
            e.preventDefault();
            begin();
          }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              begin();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") release();
          }}
          className={`mt-3 select-none border px-5 py-3 font-mono text-sm transition-colors duration-150 ${
            scanning ? "border-acc text-acc" : "border-line text-mut hover:border-acc hover:text-acc"
          }`}
          style={{ touchAction: "none" }}
        >
          {scanning ? "hold_steady…" : "hold_to_scan"}
        </button>
        <p className="mt-2 font-mono text-[11px] text-faint">hold click — or hold space</p>
      </div>
    </div>
  );
}
