import { contact, identity } from "@/lib/data";
import { TypedLabel } from "@/components/ui/TypedLabel";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  return (
    <footer id="contact" className="border-t border-line">
      <section
        aria-labelledby="contact-title"
        className="mx-auto max-w-6xl px-5 sm:px-8"
        style={{ paddingBlock: "var(--space-section)" }}
      >
        <TypedLabel text="// 07 · handshake" className="mb-6 block text-xs text-acc sm:text-sm" />

        <Reveal>
          <h2
            id="contact-title"
            className="display max-w-4xl text-ink"
            style={{ fontSize: "var(--text-section)" }}
          >
            {contact.heading}
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-mut">{contact.body}</p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a
              href={`mailto:${identity.email}?subject=inference%20request`}
              className="group inline-flex items-center gap-3 bg-acc px-6 py-3.5 font-mono text-sm font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5"
            >
              {contact.cta}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
            <a href={identity.github} target="_blank" rel="noopener noreferrer" className="link-hud font-mono text-sm text-mut">
              github/AhmAbd
            </a>
            <a href={identity.linkedin} target="_blank" rel="noopener noreferrer" className="link-hud font-mono text-sm text-mut">
              linkedin/ahmmhma
            </a>
            <a href={`mailto:${identity.email}`} className="link-hud font-mono text-sm text-mut">
              {identity.email}
            </a>
          </div>
        </Reveal>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-mono text-[11px] text-faint">
          <p>© 2026 {identity.name} · built with Next.js</p>
          <p>no models were overfitted in the making of this site</p>
        </div>
      </section>
    </footer>
  );
}
