# bromney.com

My personal website. Single-page Astro site, static output, deployed via
Cloudflare Pages.

## Stack

- [Astro](https://astro.build/) (no JS framework beyond Astro itself; this site uses no islands)
- Self-hosted variable fonts (Fraunces, Newsreader, JetBrains Mono) via `@fontsource-variable`
- Vanilla CSS with design tokens. No Tailwind, no UI kit
- No analytics, no trackers, no JS required to view

## Local development

```bash
npm install
npm run dev      # dev server on localhost:4321
npm run build    # static build into dist/
npm run preview  # serve the built site
```

## Deploy

Cloudflare Pages is connected to this GitHub repo. Every push to `master`
triggers a production deploy; PRs get automatic preview URLs.

Pages build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: matches `.nvmrc` / project default

The S3 bucket and `./sync` script are retired.

## Repo layout

```
src/
  pages/index.astro        single-page entry
  pages/404.astro          error page (builds to 404.html)
  layouts/Base.astro       <head>, meta, fonts, skip link
  components/              section components
  styles/                  tokens + globals
  assets/                  images optimized by Astro's <Image />
public/                    passthrough assets with stable root URLs
                           (favicon, og_card.jpg, robots.txt)
dist/                      build output (gitignored; deployed by Pages)
reference/                 source images, thumbnails, screenshots (gitignored)
```

Anything in `public/` is served from the root unchanged. Anything in
`src/assets/` goes through the image pipeline and gets a content hash in the
URL, so never link to those paths from meta tags or hardcoded URLs.

---

© Ben Romney
