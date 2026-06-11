# Ahmad Abdullatif — Portfolio

Personal portfolio styled as a computer-vision model analyzing the page: bounding boxes
draw around content on scroll, mono labels type out with confidence scores, and real
benchmark numbers from the CV double as UI.

## Stack

- Next.js (App Router, static export) + TypeScript
- Tailwind CSS v4 + CSS custom-property design tokens
- `motion` for scroll-driven reveals, `lenis` for smooth scrolling
- Fonts: Archivo (variable width axis) + IBM Plex Mono

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # static export to out/
```

## Deploy

`npm run build` produces a fully static `out/` directory — host it on Vercel,
GitHub Pages, or any static file server. No server runtime required.

## Content

All copy and CV data live in [src/lib/data.ts](src/lib/data.ts). Future
translations (ar / tr) are a data swap, not a rewrite.

Design spec: [docs/superpowers/specs/2026-06-11-portfolio-design.md](docs/superpowers/specs/2026-06-11-portfolio-design.md)
