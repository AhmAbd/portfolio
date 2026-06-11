import { education, experience, languages } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function Experience() {
  return (
    <section
      id="deployment"
      aria-labelledby="deployment-title"
      className="mx-auto max-w-6xl px-5 sm:px-8"
      style={{ paddingBlock: "var(--space-section)" }}
    >
      <SectionHeading
        index="06"
        tag="deployment_history"
        title="Runs in production"
        meta="env: real world"
      />

      <div className="grid gap-4 lg:grid-cols-12">
        {/* work */}
        <Reveal className="lg:col-span-7">
          <article className="h-full border border-line bg-bg-card/40 p-6 sm:p-8">
            <p className="font-mono text-xs text-acc">work · {experience.mode.toLowerCase()}</p>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="display text-2xl text-ink">{experience.company}</h3>
              <p className="font-mono text-xs text-faint">{experience.period}</p>
            </div>
            <p className="mt-1 font-mono text-[13px] text-mut">{experience.role}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {experience.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-mut">
                  <span className="mt-px font-mono text-acc" aria-hidden="true">+</span>
                  {b}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* education */}
          <Reveal delay={0.1}>
            <article className="border border-line bg-bg-card/40 p-6 sm:p-8">
              <p className="font-mono text-xs text-acc">training_run</p>
              <h3 className="display mt-3 text-xl leading-tight text-ink">{education.school}</h3>
              <p className="mt-1.5 font-mono text-[13px] text-mut">{education.degree}</p>
              <p className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-xs text-faint">
                <span>{education.period}</span>
                <span className="text-acc">{education.note}</span>
              </p>
            </article>
          </Reveal>

          {/* languages */}
          <Reveal delay={0.18}>
            <article className="border border-line bg-bg-card/40 p-6 sm:p-8">
              <p className="mb-4 font-mono text-xs text-acc">locale_support</p>
              <ul className="flex flex-col gap-2.5">
                {languages.map((lang) => (
                  <li
                    key={lang.code}
                    className="flex items-baseline justify-between font-mono text-[13px]"
                  >
                    <span className="text-mut">
                      <span className="text-ink">{lang.code}</span> · {lang.name}
                    </span>
                    <span className="text-faint">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
