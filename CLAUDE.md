# Guidance for agents working on bromney.com

This repo is a personal website — one page, set-and-forget, Astro static
output. Read this before touching code.

## The non-obvious stuff

**Astro defaults apply.** `src/pages/` → `dist/` on build; `public/` is the
static-passthrough directory (favicon, `og_card.jpg`, `robots.txt`). Assets
that should go through the `<Image />` pipeline live in `src/assets/`. Never
hardcode a URL to anything under `src/assets/` — it gets content-hashed.

**`dist/` is gitignored.** It's a build artifact. Don't commit it. The
repo's git history starts at the Astro rewrite; the pre-Astro static
HTML/CSS version is not in this repo.

**Deploys go through Cloudflare Pages, connected to GitHub.** Every push to
`master` deploys; PRs get preview URLs. Build command is `npm run build`,
output directory is `dist`. There is no deploy script in the repo.

**The 404 page is served by Cloudflare Pages' built-in handling.**
`src/pages/404.astro` builds to `dist/404.html` and Pages automatically
serves it for unknown paths. If you rename or remove the file, Pages will
fall back to a plain default, so keep it in place. The page reuses
`Base.astro`, owns its own `<main id="main">` for the skip link, and keeps
the Plein Air palette so it reads as part of the site.

**Security headers live in `public/_headers`.** Cloudflare Pages reads that
file and applies the listed headers to every response. The CSP is
deliberately tight — same-origin only, no external hosts. If a future
change needs an external asset (a hosted font, a Substack widget, any
iframe), the CSP in `_headers` must be loosened to match, or the browser
will block it at runtime. The cache rules in the same file give hashed
`/_astro/*` assets `immutable` and HTML files `must-revalidate`.

## Hard design rules

- **No em-dashes in user-visible copy.** Use commas, colons, parentheses, or
  full stops. Year ranges use en-dashes (`2025–present`). Ben doesn't use
  em-dashes; ignore the urge to "fix" prose by adding them
- **Evergreen copy.** The site should read fine a year after any change. No
  visible "updated [date]" stamps. No content that depends on calendar
  context (e.g. "this fall", "last quarter")
- **Mobile-first and accessible.** Ben built A11y Lens; accessibility is not
  decorative. Respect keyboard nav, focus rings, landmarks, `alt` text,
  `prefers-reduced-motion`, and AA contrast minimums
- **No JS dependency for viewing.** The site must work with JavaScript
  disabled. No hydrated islands. No client directives
- **No trackers, no analytics, no third-party embeds.** Not now, not later

## Hard stack rules

- **No Tailwind.** Vanilla CSS + design tokens in `src/styles/tokens.css`
- **No JS frameworks beyond Astro.** No React, Vue, Svelte, Alpine, htmx
- **No CMS, no RSS feed, no blog, no scheduled content.** Set-and-forget is
  the point. If Ben wants a blog, he has Substack
- **Self-host fonts.** No Google Fonts CDN at runtime. Fonts come through
  `@fontsource-variable` npm packages
- **Single page.** No routing, no sub-pages. Everything is `src/pages/index.astro`

## Code style

- **Don't hand-wrap prose in `.astro` files.** User-visible copy inside `<p>`
  (hero lede, section ledes, card copy, Values paragraphs, etc.) goes on a
  single line inside its tag. Ben relies on editor word-wrap. Hand-wrapping
  at ~80 chars forces authors to guess where to break and produces noisy
  diffs on copy edits. HTML structure, attributes, comments, and CSS wrap
  normally — this rule is only for prose text content

## Design system at a glance

- **Aesthetic:** Plein Air. Foothills (linen, sage, olive) as the everyday
  read; Alpenglow (apricot, spruce) as punctuation around the Art section
- **Palette:** defined in `src/styles/tokens.css`. `--linen` is the body bg.
  The Now and Contact sections use `--paper` (white) for contrast. The Art
  section uses `--spruce` (dark). Projects and Values use `--linen-warm`
- **Typography:**
  - Display — `Fraunces Variable` (warm serif, expressive optical size)
  - Body — `Newsreader Variable` (editorial serif, clear digits)
  - Meta — `JetBrains Mono Variable` (labels, tags, dates)
  - **Watch out:** Fraunces as shipped via `@fontsource-variable` does not
    expose `lnum` (lining-nums). If a display title contains digits, render
    it in Newsreader — the "1"s in Fraunces oldstyle are indistinguishable
    from lowercase "l". `ProjectCard.astro` uses Newsreader for this reason
- **Accent:** `--amber` (deep warm bronze) for links. Apricot highlight on a
  single phrase in the hero lede and the Values opening. Used sparingly on
  purpose. The current `--amber` and `--olive` values are tuned so 12–15px
  text passes WCAG AA (≥4.5:1) on every background they appear on (`--paper`,
  `--linen`, `--linen-warm`). Don't lighten either back toward the old dusty
  gold / muted olive without re-checking contrast on all three backgrounds

## Where things live

```
src/pages/index.astro          single entry, composes all sections
src/pages/404.astro            "Off the trail." error page (builds to 404.html)
src/layouts/Base.astro         <head>, meta tags, OG/Twitter, fonts, skip link
src/components/
  Hero.astro                   eyebrow, name, one-liner, portrait
  Now.astro                    what Ben's up to + theory of change
  Projects.astro               calls ProjectCard 3x (A11y Lens, Romcat, EarthAR)
  ProjectCard.astro            thumbnail + text block
  Art.astro                    Mt Hood painting feature (spruce bg)
  Writing.astro                Substack link
  Values.astro                 what Ben cares about
  Contact.astro                LinkedIn-only contact
  Footer.astro                 copyright + peak silhouette
src/styles/tokens.css          design tokens
src/styles/global.css          resets, base element styles, utilities
src/assets/                    images processed by <Image />
public/                        passthrough (favicon, og_card, robots.txt)
```

## Commands

```bash
npm run dev      # localhost:4321
npm run build    # writes to dist/
npm run preview  # serves the built site locally
```

Deploys happen automatically on push to `master` via Cloudflare Pages.

When iterating on <style> blocks in `.astro` files, the dev server's HMR has
occasionally served stale CSS. If you see the source matching but the DOM
disagreeing, run `npm run build` and serve `dist/` directly instead of
trusting dev.

## Before making changes

1. Read this file. Read `readme.md`
2. Check if the thing you want to change conflicts with a hard rule above
3. If you're adding copy, scan it for em-dashes and for AI-tells
   ("at its core", "not just X, but Y", "quietly", "genuinely overlap",
    grand-sounding generational claims)
4. If you're adding an asset, decide: stable URL needed? → `public/`.
   Responsive / optimized? → `src/assets/` + `<Image />`
5. If you're changing the build, confirm Cloudflare Pages' build settings
   (`npm run build`, output `dist`) still match

## What Ben has said is OK

- Rewriting copy to be less writerly
- Changing visual treatment (colors, spacing, type) when it serves the vibe
- Adding new images to `reference/` and wiring them in
- Tightening the A11y story
- Adding further sections in the future, *if Ben asks*. Don't grow the page
  unprompted

## What Ben has said is not OK

- Em-dashes
- Blog/RSS/CMS
- Trackers or analytics, ever
- SaaS-template aesthetic
- Pure white everywhere (the site should feel warm; white is a contrast
  device, not the base)
- Adding a contact form or email address to the Contact section — LinkedIn
  is the only channel there

## Memory pointers

Ben's personal details, preferences, and the stack's load-bearing quirks are
saved under
`~/.claude/projects/C--Users-Ben-Documents-Websites-bromney-com/memory/`.
Update those alongside this file when something durable changes.
