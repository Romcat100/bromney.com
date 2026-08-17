# bromney.com

My personal website. Astro site with static output plus one Cloudflare
Pages Function, deployed via Cloudflare Pages.

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

To exercise the feedback function locally, build first and then run the
built site through Wrangler with a gitignored `.dev.vars` file:

```bash
npm run build
npx wrangler pages dev dist   # reads .dev.vars for RESEND_API_KEY / FEEDBACK_TO
```

## Deploy

Cloudflare Pages is connected to this GitHub repo. Every push to `master`
triggers a production deploy; PRs get automatic preview URLs.

Pages build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: matches `.nvmrc` / project default

The S3 bucket and `./sync` script are retired.

## Feedback backend

The anonymous feedback form posts to `/api/feedback`, handled by
`functions/api/feedback.ts` (Cloudflare Pages Functions; picked up
automatically alongside the static output). The function forwards the
message through [Resend](https://resend.com) and always redirects to
`/thanks`. Spam defense: honeypot field, same-origin check, length bounds.
The destination address lives only in a Pages env var, never in the repo.

One-time setup (already done for production; repeat if the project moves):

1. Create a free Resend account and verify `bromney.com` (add the DNS
   records Resend provides in the Cloudflare DNS dashboard)
2. Create a sending-only API key
3. In the Pages project → Settings → Environment variables, set
   `RESEND_API_KEY` (secret) and `FEEDBACK_TO` (destination inbox)

## Repo layout

```
src/
  pages/index.astro        main entry
  pages/404.astro          error page (builds to 404.html)
  pages/thanks.astro       feedback confirmation (noindex)
  layouts/Base.astro       <head>, meta, fonts, skip link
  components/              section components
  styles/                  tokens + globals
  assets/                  images optimized by Astro's <Image />
functions/
  api/feedback.ts          Pages Function: feedback form → Resend → inbox
public/                    passthrough assets with stable root URLs
                           (favicon, og_card.jpg, robots.txt, _headers)
dist/                      build output (gitignored; deployed by Pages)
reference/                 source images, thumbnails, screenshots (gitignored)
```

Anything in `public/` is served from the root unchanged. Anything in
`src/assets/` goes through the image pipeline and gets a content hash in the
URL, so never link to those paths from meta tags or hardcoded URLs.

---

© Ben Romney
