"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const W = 640;
const H = 300;
const LANES = [70, 150, 230];
const WALL_X = 560;
const SLOTS = [90, 190, 290, 390];
const START_GOLD = 100;
const WALL_MAX = 100;
const FIXED = 1 / 60;
const BEST_KEY = "lastfort_best_v1";

const COST = { archer: 40, soldier: 25 } as const;
type UnitType = keyof typeof COST;

interface Unit {
  lane: number;
  slot: number;
  type: UnitType;
  hp: number;
  cd: number;
}

interface Enemy {
  lane: number;
  x: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  cd: number;
}

interface Shot {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ttl: number;
}

interface Game {
  gold: number;
  wave: number;
  wallHp: number;
  units: Unit[];
  enemies: Enemy[];
  toSpawn: number;
  spawnCd: number;
  interWave: number;
  endless: boolean;
  over: "" | "won" | "lost";
  shots: Shot[];
}

function waveSpec(wave: number): { count: number; hp: number; interval: number } {
  const SCRIPTED = [
    { count: 4, hp: 20, interval: 1.3 },
    { count: 6, hp: 26, interval: 1.1 },
    { count: 8, hp: 34, interval: 1.0 },
    { count: 11, hp: 44, interval: 0.9 },
    { count: 14, hp: 60, interval: 0.8 },
  ];
  if (wave <= 5) return SCRIPTED[wave - 1];
  const n = wave - 5;
  return { count: 14 + 3 * n, hp: Math.round(60 * Math.pow(1.15, n)), interval: 0.75 };
}

function newGame(): Game {
  return {
    gold: START_GOLD,
    wave: 1,
    wallHp: WALL_MAX,
    units: [],
    enemies: [],
    toSpawn: waveSpec(1).count,
    spawnCd: 1,
    interWave: 0,
    endless: false,
    over: "",
    shots: [],
  };
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function update(g: Game, dt: number): void {
  // between waves
  if (g.interWave > 0) {
    g.interWave -= dt;
    if (g.interWave <= 0) {
      g.interWave = 0;
      const spec = waveSpec(g.wave);
      g.toSpawn = spec.count;
      g.spawnCd = 0.6;
    }
  } else if (g.toSpawn > 0) {
    g.spawnCd -= dt;
    if (g.spawnCd <= 0) {
      const spec = waveSpec(g.wave);
      g.spawnCd = spec.interval;
      g.toSpawn -= 1;
      g.enemies.push({
        lane: Math.floor(Math.random() * 3),
        x: -12,
        hp: spec.hp,
        maxHp: spec.hp,
        speed: 30 + Math.random() * 10,
        reward: 8 + g.wave * 2,
        cd: 0,
      });
    }
  }

  // enemies: fight a blocking soldier, chip the wall, or march
  for (const e of g.enemies) {
    e.cd = Math.max(0, e.cd - dt);
    const blocker = g.units.find(
      (u) => u.type === "soldier" && u.lane === e.lane && e.x >= SLOTS[u.slot] - 6 && e.x <= SLOTS[u.slot] + 26,
    );
    if (blocker) {
      if (e.cd === 0) {
        blocker.hp -= 8;
        e.cd = 0.7;
      }
    } else if (e.x >= WALL_X - 14) {
      if (e.cd === 0) {
        g.wallHp -= 5;
        e.cd = 0.8;
      }
    } else {
      e.x += e.speed * dt;
    }
  }

  // units attack
  for (const u of g.units) {
    u.cd = Math.max(0, u.cd - dt);
    if (u.cd > 0) continue;
    if (u.type === "archer") {
      const target = g.enemies
        .filter((e) => e.lane === u.lane && e.x > SLOTS[u.slot] - 20)
        .sort((a, b) => b.x - a.x)[0];
      if (target) {
        target.hp -= 6;
        u.cd = 0.7;
        g.shots.push({
          x1: SLOTS[u.slot],
          y1: LANES[u.lane] - 8,
          x2: target.x,
          y2: LANES[target.lane],
          ttl: 0.08,
        });
      }
    } else {
      const target = g.enemies.find(
        (e) => e.lane === u.lane && e.x >= SLOTS[u.slot] - 6 && e.x <= SLOTS[u.slot] + 26,
      );
      if (target) {
        target.hp -= 10;
        u.cd = 0.6;
      }
    }
  }

  // cleanup
  g.units = g.units.filter((u) => u.hp > 0);
  g.enemies = g.enemies.filter((e) => {
    if (e.hp > 0) return true;
    g.gold += e.reward;
    return false;
  });
  g.shots = g.shots.filter((s) => {
    s.ttl -= dt;
    return s.ttl > 0;
  });

  // wave end / game end
  if (g.wallHp <= 0) {
    g.wallHp = 0;
    g.over = "lost";
    return;
  }
  if (g.interWave === 0 && g.toSpawn === 0 && g.enemies.length === 0) {
    if (g.wave === 5 && !g.endless) {
      g.over = "won";
      return;
    }
    g.wave += 1;
    g.interWave = 3;
    g.gold += 20;
  }
}

export default function FortDemo() {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game>(newGame());
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const accRef = useRef(0);
  const frameCount = useRef(0);
  const laneRef = useRef(0);
  const phaseRef = useRef<"idle" | "running" | "won" | "lost">("idle");

  const [phase, setPhase] = useState<"idle" | "running" | "won" | "lost">("idle");
  const [lane, setLane] = useState(0);
  const [hud, setHud] = useState({ gold: START_GOLD, wave: 1, wallHp: WALL_MAX, interWave: 0 });
  const [best, setBest] = useState(0);

  useEffect(() => {
    queueMicrotask(() => setBest(readBest()));
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const g = gameRef.current;
    const acc = cssVar("--acc", "#4ade80");
    const warn = cssVar("--warn", "#f87171");
    const ink = cssVar("--ink", "#e5e5e5");
    const mut = cssVar("--mut", "#9ca3af");
    const line = cssVar("--line", "#374151");

    ctx.clearRect(0, 0, W, H);

    // lanes
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    for (const y of LANES) {
      ctx.beginPath();
      ctx.moveTo(0, y + 18);
      ctx.lineTo(WALL_X - 2, y + 18);
      ctx.stroke();
    }

    // selected lane marker
    ctx.fillStyle = acc;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, LANES[laneRef.current] - 22, WALL_X - 2, 42);
    ctx.globalAlpha = 1;

    // slots
    ctx.strokeStyle = line;
    for (const laneY of LANES) {
      for (const sx of SLOTS) {
        ctx.strokeRect(sx - 8, laneY - 10, 20, 20);
      }
    }

    // wall + hp
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.25 + 0.75 * (g.wallHp / WALL_MAX);
    ctx.fillRect(WALL_X, 20, 12, H - 40);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g.wallHp > 35 ? acc : warn;
    ctx.fillRect(WALL_X + 18, 20 + (H - 40) * (1 - g.wallHp / WALL_MAX), 3, (H - 40) * (g.wallHp / WALL_MAX));

    // units
    for (const u of g.units) {
      const x = SLOTS[u.slot];
      const y = LANES[u.lane];
      if (u.type === "archer") {
        ctx.fillStyle = acc;
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 12);
        ctx.lineTo(x - 7, y + 8);
        ctx.lineTo(x + 11, y + 8);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = mut;
        ctx.fillRect(x - 6, y - 10, 16, 18);
        ctx.fillStyle = acc;
        ctx.fillRect(x - 6, y - 14, 16 * (u.hp / 40), 2);
      }
    }

    // enemies
    for (const e of g.enemies) {
      const y = LANES[e.lane];
      ctx.fillStyle = warn;
      ctx.beginPath();
      ctx.arc(e.x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.fillRect(e.x - 7, y - 14, 14 * (e.hp / e.maxHp), 2);
    }

    // shots
    if (!reduced) {
      ctx.strokeStyle = acc;
      ctx.lineWidth = 1.5;
      for (const s of g.shots) {
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
    }

    // interwave banner
    if (g.interWave > 0) {
      ctx.fillStyle = mut;
      ctx.font = "12px monospace";
      ctx.fillText(`wave ${g.wave} in ${g.interWave.toFixed(1)}s…`, W / 2 - 50, 30);
    }
  }, [reduced]);

  const stopLoop = useCallback(() => cancelAnimationFrame(rafRef.current), []);

  const frame = useCallback(
    (now: number) => {
      const g = gameRef.current;
      accRef.current = Math.min(accRef.current + (now - lastRef.current) / 1000, 0.25);
      lastRef.current = now;
      while (accRef.current >= FIXED && !g.over) {
        update(g, FIXED);
        accRef.current -= FIXED;
      }
      render();

      frameCount.current += 1;
      if (frameCount.current % 10 === 0) {
        setHud({ gold: g.gold, wave: g.wave, wallHp: g.wallHp, interWave: g.interWave });
      }

      if (g.over) {
        const reached = g.over === "won" ? 5 : g.wave;
        const next = Math.max(readBest(), reached);
        try {
          localStorage.setItem(BEST_KEY, String(next));
        } catch {
          // private mode
        }
        setBest(next);
        setHud({ gold: g.gold, wave: g.wave, wallHp: g.wallHp, interWave: 0 });
        setPhase(g.over);
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [render],
  );

  const startLoop = useCallback(() => {
    stopLoop();
    lastRef.current = performance.now();
    accRef.current = 0;
    rafRef.current = requestAnimationFrame(frame);
  }, [frame, stopLoop]);

  // pause when tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        stopLoop();
      } else if (phaseRef.current === "running") {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [startLoop, stopLoop]);

  useEffect(() => () => stopLoop(), [stopLoop]);

  const start = () => {
    gameRef.current = newGame();
    setPhase("running");
    startLoop();
  };

  const continueEndless = () => {
    const g = gameRef.current;
    g.endless = true;
    g.over = "";
    g.wave += 1;
    g.interWave = 2.5;
    g.gold += 20;
    setPhase("running");
    startLoop();
  };

  const place = (type: UnitType) => {
    const g = gameRef.current;
    if (phaseRef.current !== "running" || g.gold < COST[type]) return;
    const used = new Set(g.units.filter((u) => u.lane === laneRef.current).map((u) => u.slot));
    const order = type === "soldier" ? [3, 2, 1, 0] : [0, 1, 2, 3];
    const slot = order.find((s) => !used.has(s));
    if (slot === undefined) return;
    g.gold -= COST[type];
    g.units.push({ lane: laneRef.current, slot, type, hp: type === "soldier" ? 40 : 1, cd: 0 });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "1" || e.key === "2" || e.key === "3") setLane(Number(e.key) - 1);
    if (e.key === "a" || e.key === "A") place("archer");
    if (e.key === "s" || e.key === "S") place("soldier");
  };

  const playing = phase === "running";

  return (
    <div tabIndex={0} onKeyDown={onKey} className="outline-none">
      {/* HUD */}
      <div className="flex items-center justify-between font-mono text-[11px] text-faint sm:text-xs">
        <span aria-live="polite">
          {playing
            ? `wave ${hud.wave} · gold ${hud.gold} · wall ${Math.round((hud.wallHp / WALL_MAX) * 100)}%`
            : best > 0
              ? `best_wave: ${best}`
              : "best_wave: none"}
        </span>
        <span>archer 40g · soldier 25g</span>
      </div>

      <div className="relative mt-2 border border-line bg-bg-card/40">
        <canvas ref={canvasRef} width={W} height={H} className="block h-auto w-full" aria-hidden="true" />

        {phase === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={start}
              className="group inline-flex items-center gap-3 bg-acc px-6 py-3.5 font-mono text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5"
            >
              man_the_walls
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        )}

        {phase === "won" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-card/80 text-center">
            <p className="display text-4xl text-acc sm:text-5xl">fort_holds</p>
            <p className="mt-2 font-mono text-xs text-mut">5 waves repelled · garrison intact</p>
            <div className="mt-5 flex gap-3">
              <button onClick={continueEndless} className="border border-acc px-4 py-2 font-mono text-xs text-acc">
                wave_6+ · difficulty permitting →
              </button>
              <button onClick={start} className="link-hud font-mono text-xs text-ink">
                restart
              </button>
            </div>
          </div>
        )}

        {phase === "lost" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-card/80 text-center">
            <p className="display text-4xl text-warn sm:text-5xl">breach</p>
            <p className="mt-2 font-mono text-xs text-mut">
              the wall fell on wave {hud.wave} · best: {best}
            </p>
            <button onClick={start} className="link-hud mt-5 font-mono text-xs text-ink">
              rebuild →
            </button>
          </div>
        )}
      </div>

      {/* lane controls */}
      <div className="mt-3 flex flex-col gap-1.5">
        {LANES.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setLane(i)}
              aria-pressed={lane === i}
              className={`w-20 border px-2 py-2 text-left font-mono text-[11px] transition-colors duration-150 ${
                lane === i ? "border-acc text-acc" : "border-line text-mut hover:border-acc"
              }`}
            >
              lane_{i + 1}
            </button>
            <button
              onClick={() => {
                setLane(i);
                laneRef.current = i;
                place("archer");
              }}
              disabled={!playing || hud.gold < COST.archer}
              className="border border-line px-3 py-2 font-mono text-[11px] text-mut transition-colors duration-150 hover:border-acc hover:text-acc disabled:opacity-40"
            >
              ▲ archer
            </button>
            <button
              onClick={() => {
                setLane(i);
                laneRef.current = i;
                place("soldier");
              }}
              disabled={!playing || hud.gold < COST.soldier}
              className="border border-line px-3 py-2 font-mono text-[11px] text-mut transition-colors duration-150 hover:border-acc hover:text-acc disabled:opacity-40"
            >
              ■ soldier
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-faint">
        keys: 1/2/3 lane · A archer · S soldier · archers fill from the back, soldiers hold the front
      </p>
    </div>
  );
}
