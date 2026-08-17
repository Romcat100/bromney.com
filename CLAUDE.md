# Guidance for agents working on bromney.com

This repo is a personal website — one main page plus a 404 and a small
form-confirmation page, set-and-forget, Astro static output with one
Cloudflare Pages Function. Read this before touching code.

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

**The feedback form is the only server-side code.**
`functions/api/feedback.ts` is a Cloudflare Pages Function (Pages picks up
`functions/` automatically alongside the static `dist`; no Astro adapter).
It forwards submissions from the Feedback section to Ben's inbox via the
Resend API. Two env vars are set in the Pages dashboard, NOT in the repo:
`RESEND_API_KEY` (secret) and `FEEDBACK_TO` (the destination address).
Ben's email address must never appear in the repo or in client code. Spam
defense is a honeypot field (`website`), a same-origin check, and length
bounds; every outcome 303-redirects to `/thanks` so bots learn nothing.
Test locally with `npx wrangler pages dev dist` plus a gitignored
`.dev.vars` file holding the two vars.

**Security headers live in `public/_headers`.** Cloudflare Pages reads that
file and applies the listed headers to every response. The CSP is
deliberately tight — same-origin only, no external hosts; `form-action` is
`'self'` for the feedback form. If a future change needs an external asset
(a hosted font, any iframe), the CSP in `_headers` must be loosened to
match, or the browser will block it at runtime. The cache rules in the same
file give hashed `/_astro/*` assets `immutable` and HTML files
`must-revalidate`.

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
  disabled. No hydrated islands. No client directives. The feedback form is
  a plain HTML POST for this reason
- **No trackers, no analytics, no third-party embeds.** Not now, not later.
  (Resend is called server-side only; nothing third-party loads in the page)

## Hard stack rules

- **No Tailwind.** Vanilla CSS + design tokens in `src/styles/tokens.css`
- **No JS frameworks beyond Astro.** No React, Vue, Svelte, Alpine, htmx
- **No CMS, no RSS feed, no blog, no scheduled content.** Set-and-forget is
  the point
- **Self-host fonts.** No Google Fonts CDN at runtime. Fonts come through
  `@fontsource-variable` npm packages
- **One main page.** Everything lives on `src/pages/index.astro`; the only
  other pages are `404.astro` and `thanks.astro` (feedback confirmation,
  noindex). No blog or sub-content pages

## Code style

- **Don't hand-wrap prose in `.astro` files.** User-visible copy inside `<p>`
  (hero lede, section ledes, card copy, Values paragraphs, etc.) goes on a
  single line inside its tag. Ben relies on editor word-wrap. Hand-wrapping
  at ~80 chars forces authors to guess where to break and produces noisy
  diffs on copy edits. HTML structure, attributes, comments, and CSS wrap
  normally — this rule is only for prose text content

## Design system at a glance

- **Aesthetic:** Plein Air, second pass. Foothills (linen, olive) as the
  everyday read, deliberately a touch less brown than v1; Alpenglow
  (apricot, spruce) as punctuation around the Art section. Ben tried a cool
  blue "Civic Frost" theme in Aug 2026 and rejected it; don't drift cool
- **Palette:** defined in `src/styles/tokens.css`. `--linen` is the body bg.
  The Now and Feedback sections use `--paper` for contrast. The Art section
  uses `--spruce` (dark). Projects and Values use `--linen-warm`
- **Typography:**
  - Display — `Fraunces Variable` (warm serif, expressive optical size)
  - Body — `Newsreader Variable` (editorial serif, clear digits)
  - Meta — `JetBrains Mono Variable` (labels, tags, dates)
  - **Watch out:** Fraunces as shipped via `@fontsource-variable` does not
    expose `lnum` (lining-nums). If a display title contains digits, render
    it in Newsreader — the "1"s in Fraunces oldstyle are indistinguishable
    from lowercase "l". `ProjectCard.astro` uses Newsreader for this reason
- **Accent:** `--amber` (deep warm bronze) for links and focus rings.
  Apricot highlight on a single phrase in the hero lede. Used sparingly on
  purpose. `--amber` and `--olive` are tuned so 12–15px text passes WCAG AA
  (≥4.5:1) on every background they appear on (`--paper`, `--linen`,
  `--linen-warm`, `--cream`). Don't lighten either back toward the old dusty
  gold / muted olive without re-checking contrast on all those backgrounds
- **Motif:** the footer and 404 carry a small mountain-ridgeline polyline,
  echoing the favicon. Ben kept it on purpose after the DC move; it reads
  as landscape, not as a trail-running reference

## Where things live

```
src/pages/index.astro          single main entry, composes all sections
src/pages/404.astro            "Off the trail." error page (builds to 404.html)
src/pages/thanks.astro         feedback confirmation (noindex)
src/layouts/Base.astro         <head>, meta tags, OG/Twitter, fonts, skip link
src/components/
  Hero.astro                   eyebrow (DC coords), name, one-liner, portrait
  Now.astro                    Horizon Institute role + interests
  Projects.astro               calls ProjectCard 3x (A11y Lens, Romcat, EarthAR)
  ProjectCard.astro            thumbnail + text block
  Art.astro                    Mt Hood painting feature (spruce bg)
  Values.astro                 what Ben cares about
  Feedback.astro               anonymous feedback form (posts to /api/feedback)
  Contact.astro                LinkedIn-only contact
  Footer.astro                 copyright + peak silhouette
functions/api/feedback.ts      Pages Function: form → Resend → inbox
src/styles/tokens.css          design tokens
src/styles/global.css          resets, base element styles, utilities
src/assets/                    images processed by <Image />
public/                        passthrough (favicon, og_card, robots.txt, _headers)
```

## Commands

```bash
npm run dev      # localhost:4321 (static site only; no functions)
npm run build    # writes to dist/
npm run preview  # serves the built site locally (no functions)
npx wrangler pages dev dist   # built site + the feedback function (.dev.vars)
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
- The anonymous Feedback form (Ben requested it himself). It stays; the
  email address stays out of the repo
- Adding further sections in the future, *if Ben asks*. Don't grow the page
  unprompted

## What Ben has said is not OK

- Em-dashes
- Blog/RSS/CMS
- Trackers or analytics, ever
- SaaS-template aesthetic
- Paper white everywhere (paper is a contrast device, not the base)
- Adding an email address anywhere user-visible — LinkedIn is the only named
  channel in Contact, and feedback goes through the form

## Memory pointers

Ben's personal details, preferences, and the stack's load-bearing quirks are
saved under
`~/.claude/projects/C--Users-romne-Code-bromney-com/memory/`.
Update those alongside this file when something durable changes.
