import { about } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { Reveal } from "@/components/ui/Reveal";

const stats = [
  { value: "8", label: "projects shipped or benchmarked" },
  { value: "500+", label: "users on a paid product" },
  { value: "6", label: "platform targets, web to embedded" },
  { value: "3", label: "spoken locales" },
] as const;

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto max-w-6xl px-5 sm:px-8"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <SectionHeading index="01" tag={about.heading} title="Full-stack, with eyes" meta="mode: overview" />

      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="mb-6 text-base leading-relaxed text-mut sm:text-lg">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <div className="mt-2 flex flex-wrap gap-2.5">
              {about.chips.map((chip) => (
                <ConfidenceChip key={chip.label} label={chip.label} confidence={chip.confidence} />
              ))}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.15}>
            <dl className="grid grid-cols-2 border-t border-l border-line">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col border-r border-b border-line p-5 sm:p-6">
                  <dt className="order-2 mt-2 font-mono text-[11px] leading-snug text-faint">
                    {stat.label}
                  </dt>
                  <dd className="display order-1 text-3xl text-ink sm:text-4xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
