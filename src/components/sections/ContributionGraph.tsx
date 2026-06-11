"use client";

import { useEffect, useRef, useState } from "react";
import { identity } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

interface DayCell {
  date: string;
  count: number;
  level: number;
}

interface ApiResponse {
  total: Record<string, number>;
  contributions: DayCell[];
}

type GraphState =
  | { status: "loading" }
  | { status: "ok"; weeks: (DayCell | null)[][]; months: (string | null)[]; total: number }
  | { status: "error" };

const API_URL = `https://github-contributions-api.jogruber.de/v4/${identity.githubUser}?y=last`;
const CACHE_KEY = "gh_graph_v1";
const CACHE_TTL_MS = 30 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** GitHub's level 0–4 mapped onto the accent ramp. */
const LEVEL_BG = [
  "var(--line)",
  "color-mix(in oklab, var(--acc) 28%, var(--bg-soft))",
  "color-mix(in oklab, var(--acc) 52%, var(--bg-soft))",
  "color-mix(in oklab, var(--acc) 76%, var(--bg-soft))",
  "var(--acc)",
];

function buildWeeks(days: DayCell[]): { weeks: (DayCell | null)[][]; months: (string | null)[] } {
  // pad so the first column starts on Sunday, like GitHub's graph
  const lead = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: (DayCell | null)[] = [...Array<null>(lead).fill(null), ...days];
  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  let prevMonth = -1;
  const months = weeks.map((week) => {
    const firstDay = week.find((d) => d !== null);
    if (!firstDay) return null;
    const month = new Date(`${firstDay.date}T00:00:00Z`).getUTCMonth();
    if (month === prevMonth) return null;
    prevMonth = month;
    return MONTHS[month];
  });
  // a label in column 0 usually collides with the partial first week — drop it
  if (months[0] !== null && months[1] !== null) months[0] = null;

  return { weeks, months };
}

function readCache(): ApiResponse | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: { ts: number; data: ApiResponse } = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function ContributionGraph() {
  const [state, setState] = useState<GraphState>({ status: "loading" });
  const scrollRef = useRef<HTMLDivElement>(null);

  // on narrow screens start scrolled to the recent end, like GitHub does
  useEffect(() => {
    if (state.status !== "ok" || !scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, [state.status]);

  useEffect(() => {
    let cancelled = false;

    const apply = (data: ApiResponse) => {
      if (cancelled || data.contributions.length === 0) return false;
      const { weeks, months } = buildWeeks(data.contributions);
      const total = data.contributions.reduce((sum, d) => sum + d.count, 0);
      setState({ status: "ok", weeks, months, total });
      return true;
    };

    const cached = readCache();
    if (cached) {
      queueMicrotask(() => apply(cached));
      return () => {
        cancelled = true;
      };
    }

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`contributions api ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        } catch {
          // storage blocked — graph still renders from memory
        }
        if (!apply(data)) setState({ status: "error" });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="feed"
      aria-labelledby="feed-title"
      className="mx-auto max-w-6xl px-5 sm:px-8"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <SectionHeading
        index="03"
        tag="commit_matrix"
        title="Proof of work"
        meta="window: last_365d"
      />

      <Reveal>
        <div className="border border-line bg-bg-card/40">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 sm:px-5">
            <p className="font-mono text-xs text-mut">
              $ git log --since=&quot;1 year ago&quot; --oneline | wc -l
            </p>
            <span className="flex items-center gap-2 font-mono text-[10px] text-faint">
              <span className="pulse-dot" aria-hidden="true" />
              live · public + private
            </span>
          </div>

          <div className="px-4 py-5 sm:px-5">
            {state.status === "loading" && (
              <p className="font-mono text-[13px] text-faint">
                counting_commits…<span className="caret" aria-hidden="true" />
              </p>
            )}

            {state.status === "error" && (
              <p className="font-mono text-[13px] leading-relaxed text-mut">
                <span className="text-warn">graph_offline</span> — the contributions proxy is
                napping. The real thing lives at{" "}
                <a href={identity.github} target="_blank" rel="noopener noreferrer" className="link-hud text-ink">
                  github.com/{identity.githubUser}
                </a>
              </p>
            )}

            {state.status === "ok" && (
              <>
                <p className="mb-5 font-mono text-sm text-mut">
                  <span className="display mr-2 text-3xl text-acc sm:text-4xl">{state.total}</span>
                  contributions in the last year
                </p>

                <div ref={scrollRef} className="overflow-x-auto pb-1">
                  <div className="w-max">
                    {/* month labels */}
                    <div
                      className="mb-1.5 grid grid-flow-col gap-[3px]"
                      style={{ gridTemplateColumns: `repeat(${state.weeks.length}, 11px)` }}
                      aria-hidden="true"
                    >
                      {state.months.map((m, i) => (
                        <span key={i} className="overflow-visible whitespace-nowrap font-mono text-[9px] leading-none text-faint">
                          {m ?? ""}
                        </span>
                      ))}
                    </div>

                    {/* the matrix */}
                    <div className="grid grid-flow-col gap-[3px]" role="img" aria-label={`GitHub contribution calendar: ${state.total} contributions in the last year`}>
                      {state.weeks.map((week, wi) => (
                        <div key={wi} className="cal-col grid grid-rows-7 gap-[3px]" style={{ "--col": wi } as React.CSSProperties}>
                          {week.map((day, di) =>
                            day === null ? (
                              <span key={di} className="h-2 w-2 sm:h-[11px] sm:w-[11px]" />
                            ) : (
                              <span
                                key={di}
                                className="h-2 w-2 sm:h-[11px] sm:w-[11px]"
                                style={{ backgroundColor: LEVEL_BG[Math.min(day.level, 4)] }}
                                title={`${day.date} · ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                              />
                            ),
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-faint">
                  <span className="flex items-center gap-1.5">
                    less
                    {LEVEL_BG.map((bg, i) => (
                      <span key={i} className="h-2 w-2 sm:h-[11px] sm:w-[11px]" style={{ backgroundColor: bg }} aria-hidden="true" />
                    ))}
                    more
                  </span>
                  <span>darker = quieter · brighter = caffeinated</span>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 font-mono text-xs text-faint">
          full history →{" "}
          <a href={identity.github} target="_blank" rel="noopener noreferrer" className="link-hud text-mut">
            github.com/{identity.githubUser}
          </a>
        </p>
      </Reveal>
    </section>
  );
}
