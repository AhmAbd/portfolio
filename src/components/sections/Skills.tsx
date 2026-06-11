import { skillClasses } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/** Bento spans per class — wide row for the biggest group. */
const spans = [
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-6",
  "md:col-span-3",
  "md:col-span-3",
] as const;

export function Skills() {
  return (
    <section
      id="taxonomy"
      aria-labelledby="taxonomy-title"
      className="mx-auto max-w-6xl px-5 sm:px-8"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <SectionHeading
        index="04"
        tag="stack_manifest"
        title="Trained on"
        meta={`modules: ${skillClasses.length}`}
      />

      <div className="grid gap-4 md:grid-cols-6">
        {skillClasses.map((cls, i) => (
          <Reveal key={cls.id} delay={i * 0.07} className={spans[i] ?? "md:col-span-3"}>
            <div className="group h-full border border-line bg-bg-card/40 p-6 transition-colors duration-300 hover:border-acc-dim hover:bg-bg-card">
              <div className="mb-5 flex items-baseline justify-between gap-3">
                <p className="font-mono text-xs text-acc">
                  {cls.id} · {cls.label}
                </p>
                <p className="font-mono text-[11px] text-faint">{cls.items.length} items</p>
              </div>
              <h3 className="display mb-4 text-xl text-ink">{cls.title}</h3>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {cls.items.map((item) => (
                  <li key={item} className="font-mono text-[13px] text-mut">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
