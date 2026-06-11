"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { demoLoaders } from "@/components/demos";

interface DemoPanelProps {
  id: string;
  demo: { label: string; caption: string };
}

type PanelState = "closed" | "loading" | "open" | "error";

export function DemoPanel({ id, demo }: DemoPanelProps) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<PanelState>("closed");
  const [Comp, setComp] = useState<ComponentType | null>(null);
  const [procMs, setProcMs] = useState("0.0");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  const loader = demoLoaders[id];

  const open = useCallback(async () => {
    setProcMs((8 + Math.random() * 32).toFixed(1));
    if (Comp) {
      setState("open");
      return;
    }
    setState("loading");
    try {
      const mod = await loader!();
      setComp(() => mod.default);
      setState("open");
    } catch {
      setState("error");
    }
  }, [Comp, loader]);

  const close = useCallback(() => {
    setState("closed");
  }, []);

  // focus moves into the panel once content is up, and back to the
  // re-mounted run_demo button after close (ref is null until remount)
  useEffect(() => {
    if (state === "open") {
      wasOpenRef.current = true;
      panelRef.current?.focus();
    }
    if (state === "closed" && wasOpenRef.current) {
      wasOpenRef.current = false;
      toggleRef.current?.focus();
    }
  }, [state]);

  if (!loader) return null;

  const expanded = state !== "closed";

  return (
    <div>
      {!expanded && (
        <button
          ref={toggleRef}
          onClick={open}
          aria-expanded={false}
          className="group inline-flex items-center gap-2.5 border border-line px-4 py-2.5 font-mono text-xs text-mut transition-colors duration-150 hover:border-acc hover:text-acc sm:text-[13px]"
        >
          run_demo
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              ref={panelRef}
              tabIndex={-1}
              role="region"
              aria-label={`${demo.label} demo`}
              onKeyDown={(e) => {
                if (e.key === "Escape") close();
              }}
              className="border border-line bg-bg-card/60 outline-none"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-faint sm:text-xs">
                <span className="text-acc">▸ {demo.label}</span>
                <span className="flex items-center gap-4">
                  <span className="hidden sm:inline">proc {procMs}ms</span>
                  <button
                    onClick={close}
                    className="link-hud text-mut transition-colors hover:text-warn"
                  >
                    kill_process ×
                  </button>
                </span>
              </div>

              {state === "loading" && (
                <p className="px-4 py-10 text-center font-mono text-xs text-faint">
                  loading_demo<span className="animate-pulse">…</span>
                </p>
              )}

              {state === "error" && (
                <p className="px-4 py-10 text-center font-mono text-xs text-warn">
                  demo_unavailable — connection lost mid-inference{" "}
                  <button onClick={open} className="link-hud ml-2 text-ink">
                    retry →
                  </button>
                </p>
              )}

              {state === "open" && Comp && (
                <div className="p-4 sm:p-5">
                  <Comp />
                </div>
              )}

              <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-faint">
                {demo.caption}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
