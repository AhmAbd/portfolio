import { detections } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

export function Projects() {
  return (
    <section
      id="builds"
      aria-labelledby="builds-title"
      className="mx-auto max-w-6xl px-5 sm:px-8"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <SectionHeading
        index="02"
        tag="build_log"
        title="Eight things that run"
        meta="sort: impact · skipped: 0"
      />

      <div className="flex flex-col gap-20 sm:gap-24">
        {detections.map((det, i) => (
          <ProjectCard key={det.id} detection={det} index={i} />
        ))}
      </div>
    </section>
  );
}
