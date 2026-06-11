"use client";

const links = [
  { href: "#builds", label: "builds" },
  { href: "#feed", label: "commits" },
  { href: "#taxonomy", label: "skills" },
  { href: "#contact", label: "contact" },
] as const;

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <a href="#top" className="font-mono text-sm text-ink">
          ahm.abd<span className="text-acc">_</span>
        </a>
        <ul className="flex items-center gap-5 sm:gap-8">
          {links.map((link) => (
            <li key={link.href} className={link.href === "#contact" ? "" : "hidden sm:block"}>
              <a href={link.href} className="link-hud font-mono text-xs text-mut sm:text-[13px]">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
