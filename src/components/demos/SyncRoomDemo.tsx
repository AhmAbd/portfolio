"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 120;
const TICK_MS = 100;
const DRIFT_AMBER_MS = 120;

type FollowerId = "ayse" | "omar";

interface Follower {
  t: number;
  playing: boolean;
  flash: "" | "resync";
}

const LATENCY: Record<FollowerId, () => number> = {
  ayse: () => 80 + Math.random() * 70,
  omar: () => 250 + Math.random() * 150 + (Math.random() < 0.1 ? 1000 : 0),
};

const NAMES: Record<FollowerId, string> = {
  ayse: "ayse",
  omar: "omar · hotel_wifi",
};

function timecode(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SyncRoomDemo() {
  const [host, setHost] = useState({ t: 18, playing: false });
  const [fols, setFols] = useState<Record<FollowerId, Follower>>({
    ayse: { t: 18, playing: false, flash: "" },
    omar: { t: 18, playing: false, flash: "" },
  });
  const hostRef = useRef(host);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    hostRef.current = host;
  }, [host]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  // shared clock
  useEffect(() => {
    const iv = setInterval(() => {
      setHost((h) => (h.playing ? { ...h, t: (h.t + TICK_MS / 1000) % DURATION } : h));
      setFols((f) => {
        const adv = (p: Follower): Follower =>
          p.playing ? { ...p, t: (p.t + TICK_MS / 1000) % DURATION } : p;
        return { ayse: adv(f.ayse), omar: adv(f.omar) };
      });
    }, TICK_MS);
    return () => clearInterval(iv);
  }, []);

  // omar's hotel wifi: periodic lag spike + auto resync
  useEffect(() => {
    const iv = setInterval(() => {
      if (!hostRef.current.playing) return;
      setFols((f) => ({ ...f, omar: { ...f.omar, t: Math.max(0, f.omar.t - 0.45) } }));
      later(() => {
        setFols((f) => ({
          ...f,
          omar: { ...f.omar, t: hostRef.current.t, flash: "resync" },
        }));
        later(() => setFols((f) => ({ ...f, omar: { ...f.omar, flash: "" } })), 700);
      }, 900);
    }, 6500);
    return () => clearInterval(iv);
  }, []);

  /** host command → followers apply after their own latency, snapping to host time */
  const command = (playing: boolean, seekTo?: number) => {
    setHost((h) => ({ playing, t: seekTo ?? h.t }));
    (Object.keys(NAMES) as FollowerId[]).forEach((id) => {
      later(() => {
        setFols((f) => ({
          ...f,
          [id]: { t: hostRef.current.t, playing, flash: "resync" },
        }));
        later(() => setFols((f) => ({ ...f, [id]: { ...f[id], flash: "" } })), 600);
      }, LATENCY[id]());
    });
  };

  const panes: { id: string; name: string; t: number; drift: number | null; flash: string }[] = [
    { id: "you", name: "you · host", t: host.t, drift: null, flash: "" },
    ...(Object.keys(NAMES) as FollowerId[]).map((id) => ({
      id: id as string,
      name: NAMES[id],
      t: fols[id].t,
      drift: Math.round((fols[id].t - host.t) * 1000) as number | null,
      flash: fols[id].flash as string,
    })),
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {panes.map((p) => {
          const amber = p.drift !== null && Math.abs(p.drift) > DRIFT_AMBER_MS;
          return (
            <div key={p.id} className={`border p-3 ${p.id === "you" ? "border-acc" : "border-line"}`}>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className={p.id === "you" ? "text-acc" : "text-mut"}>{p.name}</span>
                <span className={amber ? "text-warn" : "text-faint"} aria-live="polite">
                  {p.flash === "resync"
                    ? "resync ✓"
                    : p.drift === null
                      ? "origin"
                      : `${p.drift >= 0 ? "+" : ""}${p.drift}ms`}
                </span>
              </div>
              <p className="display mt-3 text-center text-3xl text-ink sm:text-4xl" aria-hidden="true">
                {timecode(p.t)}
              </p>
              <div className="mt-3 h-0.5 w-full bg-line" aria-hidden="true">
                <div
                  className={`h-full ${amber ? "bg-warn" : "bg-acc"}`}
                  style={{ width: `${(p.t / DURATION) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* host transport */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => command(!host.playing)}
          className="border border-line px-4 py-2 font-mono text-xs text-mut transition-colors duration-150 hover:border-acc hover:text-acc"
        >
          {host.playing ? "❚❚ pause_all" : "▶ play_all"}
        </button>
        <input
          type="range"
          min={0}
          max={DURATION}
          step={1}
          value={Math.round(host.t)}
          onChange={(e) => command(host.playing, Number(e.target.value))}
          className="min-w-32 flex-1"
          style={{ accentColor: "var(--acc)" }}
          aria-label="seek all viewers"
        />
        <span className="font-mono text-[11px] text-faint">host commands propagate with real-ish latency</span>
      </div>
    </div>
  );
}
