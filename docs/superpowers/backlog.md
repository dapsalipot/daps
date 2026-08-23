# DAPS Portfolio — Improvement Backlog

> Curated, prioritized list of improvements. Pick from the top of each tier
> for the highest impact per session. Cross items off as you ship them.

Last updated: 2026-05-28

---

## 🥇 Tier 1 — Ship-blockers

The portfolio isn't truly "deployed" until these are done.

- [x] **Mobile nav drawer** — hamburger menu + slide-in for screens <768px
- [x] **⌘K command palette** — keyboard-driven jump to any page, project, or action
- [ ] **Styled 404 page** — terminal-style "file not found" matching the IDE aesthetic
  - File to create: `resources/js/pages/errors/404.tsx`
  - Wire it up: edit `bootstrap/app.php` to render Inertia component for 404s
  - Est: 15 min
- [x] **Custom favicon** — SVG + apple-touch + 32/192 PNGs + theme-color meta — _shipped 2026-05-28_
- [ ] **OG image** — 1200×630 social-share preview (`og-image.png`)
  - When someone pastes your URL in Slack/iMessage/X, this is what shows up
  - Update meta tags in `resources/views/app.blade.php` (`<meta property="og:image">`, `<meta property="og:title">`, `<meta name="twitter:card">`)
  - Easiest: build it in Figma (or generate dynamically with `spatie/browsershot`)
  - Est: 30–60 min depending on design rounds
- [ ] **Deploy to production** — pick a host, point a domain, ship
  - Recommended: **Laravel Forge + DigitalOcean** ($5–12/mo) — same stack as work, easy SSL via Let's Encrypt
  - Alternative: **Fly.io** (free tier covers a portfolio) or **Railway** (free trial then ~$5/mo)
  - Domain: register `danielsalipot.com` or `daps.dev` (~$10–15/year)
  - Don't forget: set `APP_ENV=production`, `APP_DEBUG=false`, generate fresh `APP_KEY`, switch `MAIL_MAILER` to a real provider (Mailgun, Resend, Postmark)
  - Est: ~1 hour first time

---

## 🥈 Tier 2 — Production polish

- [ ] **Rate limiting on `/contact`** — Laravel's `throttle` middleware, e.g. 3 submissions per IP per hour
  - File: `routes/web.php` — wrap POST `/contact` with `->middleware('throttle:3,60')`
  - Est: 5 min
- [ ] **Smoke tests for all 5 pages** — Pest tests that hit each route, assert 200 + component renders
  - File: `tests/Feature/PortfolioPagesTest.php`
  - Est: 30 min
- [ ] **Sitemap.xml + robots.txt** — so Google can index
  - Use `spatie/laravel-sitemap` package or hand-roll
  - Est: 20 min
- [ ] **Meta tags per page** — `<meta name="description">`, `<meta property="og:title">`, etc. per route
  - Use Inertia's `<Head>` component per page (already imported)
  - Est: 15 min
- [ ] **OASYS case study depth** — go deep on your strongest project
  - Add architecture/data-flow diagram (Mermaid, Excalidraw, or hand-drawn)
  - Add real screenshots (login, dashboard, payroll, reports)
  - Add a "what I learned" / "what I'd do differently" section
  - Est: 1–2 hours including writing
- [ ] **Lighthouse audit + fix Core Web Vitals**
  - Run from Chrome DevTools → Lighthouse → Mobile
  - Common wins: preload `@font-face`, defer non-critical CSS, reduce unused JS
  - Goal: 90+ on Performance, Accessibility, SEO
  - Est: 1 hour

---

## 🥉 Tier 3 — Differentiators

- [ ] **Hardware integration demo page** — simulated "live" IoT flow
  - Idea: a fake RFID scanner UI (CSS animation) that POSTs to a tiny Laravel endpoint
  - Shows the round-trip: simulated scan → Laravel → DB → UI updates
  - Wildly differentiating because most full-stack portfolios can't show this
  - Est: 3–5 hours

- [ ] **`/notes` or `/writing` section** — 2–5 short technical notes
  - Markdown files in `resources/notes/` parsed at build time, or Filament-managed
  - Topic ideas: "Debugging serial port flicker with retry queues", "Why Filament > custom admin", "RFID polling architecture for low-end hardware"
  - Est: 4–8 hours including writing 3 notes

- [ ] **Testimonials** (1–3 short quotes)
  - From: teachers, hackathon judges, clients (with permission)
  - Add to Home or About page as a small section
  - Est: 30 min to design + however long to collect quotes

- [ ] **Privacy-respecting analytics** — Plausible (cloud, ~$9/mo) or Umami (self-host, free)
  - Why: you'll learn which pages people actually read
  - Est: 15 min setup

- [ ] **Inertia SSR** — server-render the first paint for SEO + perceived perf
  - The starter scaffolded `ssr.tsx` but it's unused
  - Run `npm run build:ssr`, configure `INERTIA_SSR_URL` in `.env`
  - Add `php artisan inertia:start-ssr` to your boot process
  - Est: 1–2 hours including debugging

- [ ] **GitHub stats integration** — live commit graph or top repos
  - Use GitHub's REST or GraphQL API server-side (cache for 1 hour)
  - Or embed a third-party widget like `github-readme-stats`
  - Est: 1–2 hours for a clean server-side solution

---

## 💡 Stretch — long-term

- [ ] Custom domain + matching email (`daniel@danielsalipot.com`)
- [ ] Newsletter (when there's a blog to subscribe to)
- [ ] Speaking page (hackathon talks, guest lectures)
- [ ] One small open-source package (anything — even a Laravel macro)
- [ ] Periodic "year in review" post

---

## 🔧 Maintenance habits

After every Tier item ships:
1. Update this file (mark `[x]`)
2. `npm run build` to confirm production bundle still works
3. Click through all 5 pages in browser, dark + light, mobile + desktop
4. Commit with a clear message like `feat(portfolio): add mobile nav drawer`

If you've been away for a month:
- `cd ~/Herd/daps && git pull && composer install && npm install && npm run build`
- Check `composer outdated` and `npm outdated` — bump minor versions
- Re-run Lighthouse to catch regressions
