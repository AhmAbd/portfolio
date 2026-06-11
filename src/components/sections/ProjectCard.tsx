import type { Detection } from "@/lib/data";
import { BoundingBox } from "@/components/ui/BoundingBox";
import { Reveal } from "@/components/ui/Reveal";
import { TechChip } from "@/components/ui/TechChip";

interface ProjectCardProps {
  detection: Detection;
  index: number;
}

export function ProjectCard({ detection, index }: ProjectCardProps) {
  const number = String(index + 1).padStart(2, "0");
  const flipped = index % 2 === 1;

  return (
    <BoundingBox label={`#${number} · ${detection.label}`} confidence={detection.confidence}>
      <article className="group grid gap-8 bg-bg-card/40 p-6 transition-colors duration-300 hover:bg-bg-card sm:p-9 lg:grid-cols-12 lg:gap-10">
        {/* meta column */}
        <div className={`lg:col-span-4 ${flipped ? "lg:order-2 lg:text-right" : ""}`}>
          <Reveal>
            <p className="font-mono text-xs text-faint">#{number}</p>
            <p className="display mt-3 text-5xl text-acc sm:text-6xl">
              {detection.metric.value}
            </p>
            <p className="mt-2 max-w-[26ch] font-mono text-xs leading-relaxed text-mut">
              {detection.metric.caption}
            </p>
            <div className={`mt-6 flex flex-wrap gap-2 ${flipped ? "lg:justify-end" : ""}`}>
              {detection.tech.map((t) => (
                <TechChip key={t} name={t} />
              ))}
            </div>
          </Reveal>
        </div>

        {/* content column */}
        <div className={`lg:col-span-8 ${flipped ? "lg:order-1" : ""}`}>
          <Reveal delay={0.08}>
            <h3 className="display text-2xl text-ink sm:text-3xl">{detection.title}</h3>
            <p className="mt-1.5 font-mono text-[13px] text-acc">{detection.tagline}</p>
            <p className="mt-4 leading-relaxed text-mut">{detection.description}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {detection.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm leading-relaxed text-mut">
                  <span className="mt-px font-mono text-acc" aria-hidden="true">
                    +
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </article>
    </BoundingBox>
  );
}
