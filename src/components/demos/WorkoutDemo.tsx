"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type Goal = "strength" | "hypertrophy";
type Equip = "gym" | "home";
type Days = 3 | 4;
type Phase = "pick" | "stream" | "validate" | "repair" | "restream" | "revalidate" | "done";

interface Exercise {
  name: string;
  sets: number | string;
  reps: string;
}

const POOLS: Record<Goal, Record<Equip, Exercise[]>> = {
  strength: {
    gym: [
      { name: "Back Squat", sets: 5, reps: "5" },
      { name: "Bench Press", sets: 5, reps: "5" },
      { name: "Deadlift", sets: 3, reps: "5" },
      { name: "Barbell Row", sets: 4, reps: "6" },
      { name: "Overhead Press", sets: 4, reps: "6" },
      { name: "Weighted Pull-up", sets: 4, reps: "6" },
    ],
    home: [
      { name: "Pistol Squat", sets: 4, reps: "6" },
      { name: "Push-up (loaded)", sets: 5, reps: "10" },
      { name: "Nordic Curl", sets: 3, reps: "8" },
      { name: "Pull-up", sets: 4, reps: "8" },
      { name: "Pike Push-up", sets: 4, reps: "10" },
      { name: "Hip Thrust", sets: 4, reps: "10" },
    ],
  },
  hypertrophy: {
    gym: [
      { name: "Incline DB Press", sets: 4, reps: "10" },
      { name: "Lat Pulldown", sets: 4, reps: "12" },
      { name: "Leg Press", sets: 4, reps: "12" },
      { name: "Seated Cable Row", sets: 4, reps: "12" },
      { name: "Lateral Raise", sets: 4, reps: "15" },
      { name: "Leg Curl", sets: 4, reps: "12" },
    ],
    home: [
      { name: "Goblet Squat", sets: 4, reps: "12" },
      { name: "DB Floor Press", sets: 4, reps: "10" },
      { name: "Bulgarian Split Squat", sets: 4, reps: "12" },
      { name: "Band Row", sets: 4, reps: "15" },
      { name: "DB Romanian DL", sets: 4, reps: "10" },
      { name: "Curl + Press", sets: 4, reps: "12" },
    ],
  },
};

const SPLITS: Record<Days, string[]> = {
  3: ["push", "pull", "legs"],
  4: ["upper", "lower", "push", "pull"],
};

interface Plan {
  goal: Goal;
  equipment: Equip;
  days: Days;
  split: { day: number; focus: string; exercises: Exercise[] }[];
}

function buildPlan(goal: Goal, equip: Equip, days: Days, broken: boolean): Plan {
  const pool = POOLS[goal][equip];
  const split = SPLITS[days].map((focus, i) => ({
    day: i + 1,
    focus,
    exercises: [0, 1, 2].map((j) => {
      const ex = pool[(i * 2 + j) % pool.length];
      const sabotage = broken && i === 0 && j === 1;
      return { ...ex, sets: sabotage ? "yes" : ex.sets };
    }),
  }));
  return { goal, equipment: equip, days, split };
}

interface Check {
  text: string;
  ok: boolean;
}

const CHECKS_BROKEN: Check[] = [
  { text: "goal: string ✓", ok: true },
  { text: "equipment: string ✓", ok: true },
  { text: "days: 3|4 ✓", ok: true },
  { text: 'split[0].exercises[1].sets: "yes" ✗ expected number', ok: false },
];

const CHECKS_FIXED: Check[] = [
  { text: "schema: all fields ✓ · repair_attempts: 1", ok: true },
];

export default function WorkoutDemo() {
  const reduced = useReducedMotion();
  const [goal, setGoal] = useState<Goal>("strength");
  const [equip, setEquip] = useState<Equip>("gym");
  const [days, setDays] = useState<Days>(3);
  const [phase, setPhase] = useState<Phase>("pick");
  const [chars, setChars] = useState(0);
  const [checks, setChecks] = useState<Check[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef(0);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const broken = phase === "stream" || phase === "validate" || phase === "repair";
  const plan = buildPlan(goal, equip, days, broken);
  const json = JSON.stringify(plan, null, 2);
  const streamed = chars >= json.length;

  // streaming reveal
  useEffect(() => {
    if (phase !== "stream" && phase !== "restream") return;
    if (reduced) {
      setChars(json.length);
      return;
    }
    const speed = phase === "restream" ? 14 : 5;
    const tick = () => {
      setChars((c) => {
        const next = Math.min(c + speed, json.length);
        if (next < json.length) rafRef.current = requestAnimationFrame(tick);
        return next;
      });
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, json.length, reduced]);

  // phase machine
  useEffect(() => {
    if ((phase === "stream" || phase === "restream") && streamed) {
      const next = phase === "stream" ? "validate" : "revalidate";
      later(() => setPhase(next), 350);
    }
    if (phase === "validate") {
      CHECKS_BROKEN.forEach((c, i) => later(() => setChecks((prev) => [...prev, c]), 320 * (i + 1)));
      later(() => setPhase("repair"), 320 * CHECKS_BROKEN.length + 500);
    }
    if (phase === "repair") {
      later(() => {
        setChecks([]);
        setChars(0);
        setPhase("restream");
      }, 900);
    }
    if (phase === "revalidate") {
      CHECKS_FIXED.forEach((c, i) => later(() => setChecks((prev) => [...prev, c]), 320 * (i + 1)));
      later(() => setPhase("done"), 320 * CHECKS_FIXED.length + 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, streamed]);

  const generate = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setChecks([]);
    setChars(0);
    setPhase("stream");
  };

  const picksLocked = phase !== "pick" && phase !== "done";
  const pickBtn = (selected: boolean) =>
    `border px-3 py-2 font-mono text-[11px] transition-colors duration-150 disabled:opacity-45 sm:text-xs ${
      selected ? "border-acc text-acc" : "border-line text-mut hover:border-acc hover:text-acc"
    }`;

  return (
    <div>
      {/* picks */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex gap-2">
          {(["strength", "hypertrophy"] as Goal[]).map((g) => (
            <button key={g} onClick={() => setGoal(g)} aria-pressed={goal === g} disabled={picksLocked} className={pickBtn(goal === g)}>
              {g}
            </button>
          ))}
        </span>
        <span className="flex gap-2">
          {(["gym", "home"] as Equip[]).map((e) => (
            <button key={e} onClick={() => setEquip(e)} aria-pressed={equip === e} disabled={picksLocked} className={pickBtn(equip === e)}>
              {e}
            </button>
          ))}
        </span>
        <span className="flex gap-2">
          {([3, 4] as Days[]).map((d) => (
            <button key={d} onClick={() => setDays(d)} aria-pressed={days === d} disabled={picksLocked} className={pickBtn(days === d)}>
              {d}d
            </button>
          ))}
        </span>
        <button
          onClick={generate}
          disabled={picksLocked}
          className="border border-line bg-acc/10 px-4 py-2 font-mono text-[11px] text-acc transition-colors duration-150 hover:border-acc disabled:opacity-45 sm:text-xs"
        >
          generate_plan →
        </button>
      </div>

      {phase !== "pick" && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* raw stream */}
          <div className="border border-line bg-bg-card/40">
            <p className="border-b border-line px-3 py-2 font-mono text-[11px] text-faint">
              openai · structured_output{" "}
              {(phase === "stream" || phase === "restream") && <span className="text-acc">▮ streaming</span>}
            </p>
            <pre className="max-h-56 overflow-auto whitespace-pre px-3 py-2 font-mono text-[11px] leading-relaxed text-mut">
              {json.slice(0, chars)}
            </pre>
          </div>

          {/* validation + result */}
          <div>
            <ul className="flex flex-col gap-1 font-mono text-[11px]" aria-live="polite">
              {checks.map((c) => (
                <li key={c.text} className={c.ok ? "text-mut" : "text-warn"}>
                  {c.text}
                </li>
              ))}
              {phase === "repair" && <li className="text-acc">repair_retry (1/2) — regenerating bad field…</li>}
            </ul>

            {phase === "done" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.split.map((d) => (
                  <div key={d.day} className="min-w-36 flex-1 border border-line p-3">
                    <p className="font-mono text-[11px] text-acc">
                      d{d.day} · {d.focus}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {d.exercises.map((ex) => (
                        <li key={ex.name} className="flex justify-between gap-2 text-xs text-mut">
                          <span>{ex.name}</span>
                          <span className="font-mono text-faint">
                            {ex.sets}×{ex.reps}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
