# DAPS Portfolio — Design Spec

**Date:** 2026-05-28
**Owner:** Daniel Andrei Salipot
**Stack:** Laravel 11 + Inertia.js + React (TypeScript) + Tailwind CSS v3 + Vite
**Target location:** `~/Herd/daps` (auto-served at `daps.test` by Laravel Herd)

## Goal

Build Daniel's developer portfolio implementing the Claude Design "modern dev portfolio" direction. Single-repo Laravel + Inertia + React app — server-rendered routing, SPA-feel navigation, no separate API layer.

## Decisions (already aligned)

| Decision | Choice |
|---|---|
| Pages | All 5: Home, About, Projects index, Project case study, Contact |
| Contact form | Functional email send via Laravel Mail + persist to DB |
| Theme | Both dark and light with toggle (localStorage-persisted) |
| Content source | `config/portfolio.php` shared via Inertia |
| Database | SQLite (Herd-default) for contacts table |
| Admin panel | None (deferred) |

## Visual system (from design tokens)

**Colors (dark):** `--bg #0A0A0A`, `--bg-elev #111`, `--fg #EDEDED`, `--fg-mid #A1A1A1`, `--fg-dim #707070`, `--accent #7DD96E`
**Colors (light):** `--bg #FAFAFA`, `--bg-elev #FFF`, `--fg #0A0A0A`, `--fg-mid #525252`, `--accent #3F8B26`
**Fonts:** Geist (sans) + Geist Mono (mono) via Google Fonts
**Hairlines:** `rgba(255,255,255,0.08)` dark / `rgba(10,10,10,0.08)` light
**Lang dot colors:** GitHub-style swatches per language (php, js, ts, react, vue, …)
**Animations:** `fadeUp`, `stagger-in`, `pulse-ring`, `commit-bar grow`, `caret blink`, `grid-drift`, `scanline`, `marquee`, `link-slide` — all respect `prefers-reduced-motion`

## Architecture

```
~/Herd/daps/
├── app/
│   ├── Http/
│   │   ├── Controllers/         HomeController, AboutController, ProjectController, ContactController
│   │   ├── Requests/            ContactRequest
│   │   └── Middleware/          HandleInertiaRequests (shares portfolio config)
│   ├── Mail/                    ContactFormMail (Markdown mailable)
│   └── Models/                  Contact
├── config/
│   └── portfolio.php            ← ALL CV/content data
├── database/
│   ├── migrations/              create_contacts_table
│   └── database.sqlite          (Herd-managed)
├── docs/superpowers/specs/      ← this spec moves here after scaffold
├── resources/
│   ├── css/app.css              Tailwind directives + tokens.css
│   ├── css/tokens.css           CSS variables, animations, utility classes
│   └── js/
│       ├── app.tsx              Inertia bootstrap
│       ├── ssr.tsx              (optional; skip for now)
│       ├── Layouts/
│       │   └── AppLayout.tsx    Nav + theme provider + footer
│       ├── Pages/
│       │   ├── Home.tsx
│       │   ├── About.tsx
│       │   ├── Projects/Index.tsx
│       │   ├── Projects/Show.tsx
│       │   └── Contact.tsx
│       ├── Components/
│       │   ├── Nav.tsx           sticky nav, theme toggle, ⌘K hint, StatusDot
│       │   ├── Mark.tsx          "ds · daniel.salipot" wordmark
│       │   ├── StatusDot.tsx     pulse-ring + label
│       │   ├── SectionHead.tsx   IDE file-tab section header
│       │   ├── Chip.tsx          mono pill, default/strong/accent tones
│       │   ├── Card.tsx          surface with hairline border, repo-card hover
│       │   ├── Button.tsx        primary/accent/secondary/ghost variants
│       │   ├── Kbd.tsx           keyboard hint
│       │   ├── CodeBlock.tsx     terminal-style code panel
│       │   ├── Screenshot.tsx    fake browser chrome over gradient
│       │   ├── LangDot.tsx       GitHub-style language colored dot
│       │   ├── RepoBadge.tsx     git:branch pill with short hash
│       │   ├── RepoChrome.tsx    filename tab wrapper for project cards
│       │   ├── CommitBars.tsx    sparkline of fake contributions
│       │   ├── ProjectCardFeatured.tsx
│       │   ├── ProjectCardCompact.tsx
│       │   ├── Footer.tsx
│       │   └── Icons.tsx         inline SVG icon set (arrow, github, mail, …)
│       ├── hooks/
│       │   └── useTheme.ts       dark/light state + localStorage persistence
│       └── lib/
│           └── langColors.ts     language → hex color map
├── routes/web.php                5 GETs + 1 POST /contact
└── tailwind.config.js            extends colors to read CSS vars
```

## Routes

| Method | Path | Controller | Inertia component |
|---|---|---|---|
| GET | `/` | HomeController@index | Home |
| GET | `/about` | AboutController@index | About |
| GET | `/projects` | ProjectController@index | Projects/Index |
| GET | `/projects/{slug}` | ProjectController@show | Projects/Show |
| GET | `/contact` | ContactController@create | Contact |
| POST | `/contact` | ContactController@store | (redirect with flash) |

## Data flow

1. `HandleInertiaRequests::share()` returns `['portfolio' => config('portfolio')]` on every request.
2. React reads via `usePage<PageProps>().props.portfolio`.
3. Pages render directly from props — no client-side fetching, no API.
4. Contact form posts via Inertia `useForm()`. Controller validates → stores `Contact` model → dispatches `ContactFormMail` (log driver in dev).
5. Theme: React context reads `localStorage.theme` on mount, falls back to `prefers-color-scheme`. Toggle button calls `setTheme()` which both updates state and toggles `html.classList` for `dark`.

## `config/portfolio.php` shape

```php
return [
    'name'    => 'Daniel Andrei Salipot',
    'handle'  => 'daniel.salipot',
    'role'    => 'Full-stack web developer shipping Laravel, IoT and real systems end-to-end.',
    'location' => ['city' => 'Marilao, PH', 'tz' => 'UTC+8'],
    'available' => ['since' => 'Q3 2026', 'open_to' => ['full-time', 'freelance']],
    'links' => ['github' => '...', 'linkedin' => '...', 'email' => '...', 'phone' => '...'],
    'stats' => [['n' => '3',  'l' => 'years shipping'], ...],
    'now'   => [['label' => 'building', 'title' => '...', 'sub' => '...'], ...],
    'projects' => [
        [
            'slug' => 'oasys',
            'name' => 'OASYS',
            'kicker' => 'Overall Administering System',
            'year' => '2023',
            'featured' => true,
            'tag' => 'Capstone · Best of department',
            'blurb' => '...',
            'stack' => ['laravel', 'php', 'mysql', 'bootstrap'],
            'lang' => 'php',
            'branch' => 'main',
            'hash' => 'a4f9c1d',
            'screenshot' => ['title' => 'oasys.adamson.local', 'tone' => 'forest', 'subtitle' => '...'],
            'metrics' => [['6 mo', 'solo build'], ['Summa', 'cum laude'], ['Best', 'capstone 2023']],
            'case_study' => [
                'problem' => '...',
                'role' => '...',
                'outcome' => '...',
                'links' => ['live' => null, 'repo' => null],
            ],
        ],
        // … rakso-cashless, hack4impact, attendance, dumagat-remontado, skills-olympics
    ],
    'stack' => [
        'backend' => [['Laravel', 'expert · 6y'], ...],
        'frontend' => [...],
        'platforms' => [...],
        'adjacent' => [...],
    ],
    'experience' => [
        ['from' => '01.2023', 'to' => 'current', 'role' => '...', 'org' => 'Rakso CT', ...],
        ['from' => '01.2022', 'to' => '12.2022', 'role' => '...', 'org' => 'Adamson University', ...],
    ],
    'education' => [...],
    'certifications' => [...],
    'achievements' => [...],
];
```

## Components & their responsibilities

| Component | Purpose | Inputs |
|---|---|---|
| `AppLayout` | Wrap every page with Nav + Footer, manage theme | `children`, page title |
| `Nav` | Sticky top nav, active route highlight, theme toggle, ⌘K hint, StatusDot | `active: 'home' \| 'work' \| 'about' \| 'contact'` |
| `SectionHead` | IDE tab section header | `n, title, right?, headline?, kicker?` |
| `Card` | Surface with `repo-card` hover-lift | `pad?, className?` |
| `Chip` | Mono pill | `tone: 'default' \| 'strong' \| 'accent'` |
| `Button` | 4 kinds × 3 sizes | `kind, size, icon?, trailing?, full?` |
| `CodeBlock` | Terminal panel | `lines: {p?, t, c?, strong?}[], title?` |
| `Screenshot` | Fake browser-chrome panel | `title, tone, ratio?, subtitle?` |
| `LangDot` | Language colored dot | `name, size?` |
| `RepoBadge` | git:branch with hash | `branch, hash` |
| `RepoChrome` | Filename tab wrapping a screenshot | `filename, lang, branch?, hash?, children` |
| `CommitBars` | Sparkline | `data: number[], h?` |
| `ProjectCardFeatured` | Hero card for OASYS | one project object + metrics |
| `ProjectCardCompact` | Smaller grid card | one project object |
| `StatusDot` | Pulse-ring with label | `children, tone?` |
| `Mark` | Wordmark | `only?` (icon only) |

All components accept a `theme` prop or pull from `useTheme()` hook; default is dark.

## Contact form

- React form: name, email, subject, message — Inertia `useForm` posts to `/contact`
- `ContactRequest` validation: required, email format, max lengths, simple honeypot field
- `ContactController@store` → `Contact::create()` → `Mail::to(config('portfolio.links.email'))->send(new ContactFormMail($contact))`
- Mail driver: `log` for dev (writes to `storage/logs/laravel.log`); user can swap to `mailgun`/`resend` later
- After post: redirect back with `flash('contact', 'sent')` → React shows success state

## Theming

```css
/* tokens.css */
:root {
  --bg: #FAFAFA; --bg-elev: #FFFFFF; --fg: #0A0A0A; --fg-mid: #525252;
  --fg-dim: #8A8A8A; --line: rgba(10,10,10,0.08); --accent: #3F8B26;
}
:root.dark {
  --bg: #0A0A0A; --bg-elev: #111111; --fg: #EDEDED; --fg-mid: #A1A1A1;
  --fg-dim: #707070; --line: rgba(255,255,255,0.08); --accent: #7DD96E;
}
```

Tailwind `theme.extend.colors` reads these vars: `bg: 'rgb(var(--bg) / <alpha-value>)'` etc. Components use `bg-bg`, `text-fg`, `border-line` utilities.

## Out of scope (for this session)

- Filament admin panel
- SSR
- Server-side analytics
- Real project screenshots (use the design's gradient `Screenshot` placeholders)
- i18n (English only)
- Tests (manual verification only — start the dev server and click through)

## Verification plan

- `php artisan serve` not needed — Herd serves `daps.test` automatically
- Open `https://daps.test/` in browser, click through all 5 pages
- Toggle theme button — verify all pages flip correctly
- Submit contact form — verify entry in `contacts` table + email in `storage/logs/laravel.log`
- Mobile viewport: each page should reflow gracefully (mocks-mobile.jsx shows target layouts)
