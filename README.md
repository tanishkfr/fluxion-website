# Fluxion Studios

The launch site. One page, one continuous scroll, seven chapters.

---

## The idea

**One line carries the whole story.** A single red signal line — the dot from
the wordmark, stretched out — runs behind the entire page on one fixed canvas.
It drifts in the hero, settles into a low horizon for the philosophy, splits
into three strands for the three things we build, then morphs through the four
moves of the process: **scattered → curve → grid → a single point.** That point
is the signal dot. Everything converges on it.

**One surface, not a stack of sections.** The page never changes background per
block. The whole ground crossfades between Just Black and Cornsilk as the story
moves between the machine and the people — black for the work, cornsilk for the
thinking and the two of us. One `data-tone` attribute on `<html>` drives ink,
rules, fields and the line's own colour together, over 750ms.

**Two protected cinematic moments:** the hero handing off (headline scales and
dissolves as the ground turns), and the process morph (pinned, four stages, the
line becoming a dot). Everything else stays restrained so those two land.

**Under the surface documents itself.** The interface / data / systems fragments
describe *this page's own contact endpoint* — the real schema, the real rate
limit, the real reply-to behaviour. Nothing is invented, and there is no
fabricated client work anywhere on the site.

---

## Stack

Next.js 16 (App Router) + React 19 + TypeScript. **Zero UI or animation
dependencies** — no Tailwind, no GSAP, no Framer Motion, no email SDK.

- Motion is one `requestAnimationFrame` loop (`lib/flux.ts`) that writes a
  single custom property `--p` (0→1) per section. All the movement is CSS
  reading that variable, so scrolling never triggers layout reads.
- The flux line is one `<canvas>` (`components/FluxField.tsx`) drawing three
  strands whose parameters ease toward per-chapter targets each frame.
- Email goes out over Resend's HTTPS API with plain `fetch` — no SDK.

Total production payload: **~248 KB over 22 requests** (144 KB JS, 87 KB fonts,
6 KB CSS), first contentful paint ~290 ms locally.

---

## Run it locally

```bash
pnpm install
```

```bash
pnpm dev
```

Then open http://localhost:3000.

Other commands:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

---

## Setup still required

The site builds, deploys and reads correctly with none of this. These are only
needed for the two things that reach the outside world.

### 1. Email delivery — required for the contact form to actually send

The form is fully wired, validated, rate limited and spam trapped, but it needs
a mail provider. Until `RESEND_API_KEY` is set, submitting returns a clear
"our mail service is not connected yet" message and the UI falls back to the
plain `mailto:` link. **It never pretends to have sent anything.**

1. Create a free account at [resend.com](https://resend.com) — **register it
   with `fluxion.workspace@gmail.com`.** This matters: until a custom domain is
   verified, Resend's shared `onboarding@resend.dev` sender can only deliver to
   the address the account was registered with.
2. Create an API key.
3. Add it to the Vercel project (Settings → Environment Variables), and to a
   local `.env.local` if you want to test locally:

```bash
RESEND_API_KEY=re_your_key_here
```

Copy `.env.example` to `.env.local` for the full list. Nothing secret is ever
read on the client — the key is only touched inside `lib/mailer.ts`, which runs
server-side.

When you do get a domain, verify it in Resend and change one variable:

```bash
CONTACT_FROM=Fluxion Studios <hello@yourdomain.com>
```

### 2. Site URL — for correct Open Graph and canonical links

On Vercel this falls back to the deployment URL automatically, so previews work.
Set it explicitly once you know the production URL so canonical tags, the
sitemap and social cards all agree:

```bash
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

### Deployment

Import the repo into Vercel. Framework detection handles the rest; there is no
custom build configuration. Add the environment variables above.

---

## Editing content

**All copy lives in `content/site.ts`.** Every heading, paragraph, label,
placeholder, option and link is in that one file. Change text there and it
updates everywhere — no component needs touching.

Structural keys (`id`, `href`, and the `need` / `timeline` option lists) are
used by the navigation, the scroll engine and server-side validation, so rename
those with a little care. If you add or remove a `need` option, the server
validates against the same list automatically.

---

## Structure

```
app/
  layout.tsx          metadata, fonts, JSON-LD, no-JS fallbacks
  page.tsx            the seven chapters, server rendered
  globals.css         the whole design system and every animation
  api/contact/route.ts
  sitemap.ts robots.ts icon.png apple-icon.png
components/
  FluxRuntime.tsx     starts the engine, reveals on scroll
  FluxField.tsx       the flux line canvas
  Track.tsx           registers a section with the engine
  Nav.tsx  ContactForm.tsx
content/site.ts       ← all copy
lib/
  flux.ts             the scroll engine
  validate.ts         one rule set, used by client and server
  rateLimit.ts  mailer.ts  siteUrl.ts
public/
  brand/              supplied wordmark and F. mark
  fonts/              Nohemi (Light / Medium / Black)
  og.png
```

### Brand assets

The supplied `whiteonblack*` and `blackonwhite*` lockups are designed to sit
invisibly on their matching ground, so the nav and footer simply **crossfade
between the two supplied variants** as the tone changes rather than recolouring
anything. `mark-*.png` and `wordmark-*.png` are those exact files cropped to
their content bounds — same artwork, no rescaling — so the dark and light
variants swap at identical dimensions. The originals are kept alongside them.

Buttons set their label in Just Black on Fluxion Red. Cornsilk on red is only
3.9:1, under AA at button sizes; black on red is 5:1, and it is the brand's own
pairing — the supplied red lockup sets "Studios" and the dot in black.

---

## Accessibility and motion

- Semantic landmarks, one `<h1>`, no skipped heading levels, skip link.
- Everything reachable and operable by keyboard; the honeypot is out of the tab
  order but kept in the accessibility tree with an honest label.
- Measured contrast: body 8.3:1, small caps 4.9–6.1:1, headings 19.5:1, buttons
  5:1 — in both tones.
- Form errors are inline *and* summarised in a focused `role="alert"` region
  that links to each field. Entered values are always preserved.
- **Reduced motion un-pins the entire page.** Nothing sticks, nothing morphs,
  all four process stages and all three registers are on the page at once, and
  the line renders as a single static state. It becomes a plain vertical read.
- Without JavaScript the page is complete and readable — `<noscript>` styles
  un-pin everything and reveal all content.
- Native scrolling throughout. No scroll hijacking, no splash screen, no audio,
  no custom cursor.

---

## Deliberately not here yet

Case studies, testimonials, client logos, pricing, a lab section, a blog, a CMS.
The structure leaves room for case studies to slot in after "What we build"
without disturbing the scroll narrative.
