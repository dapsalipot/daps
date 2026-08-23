# DAPS Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Daniel Salipot's developer portfolio as a Laravel + Inertia + React app at `~/Herd/daps`, implementing the Claude Design "modern dev portfolio" direction across 5 pages with dark/light theme toggle and a functional contact form.

**Architecture:** Laravel 11 server with Inertia.js bridging to React (TypeScript). Portfolio content lives in `config/portfolio.php`, shared to every page via Inertia middleware. Theme state in React context backed by localStorage and `<html>` class. Contact form posts via Inertia → Laravel validation → DB persistence + Mail (log driver in dev).

**Tech Stack:** PHP 8.3, Laravel 11, Inertia.js, React 18, TypeScript, Tailwind CSS v3, Vite, SQLite, Geist + Geist Mono fonts.

**Note on commits:** The user prefers manual commits. Each task ends with a "verify visually" step. Skip the `git commit` lines unless the user explicitly asks to commit.

**Note on PHP:** Herd's default `php` is 8.2; the Laravel installer needs 8.3+. Use the explicit binary `/Users/danielsalipot/Library/Application\ Support/Herd/bin/php83` for the installer command. Once the project is created, `composer.json` will lock the PHP requirement and Herd's per-site PHP picker handles the rest.

---

## File Structure (target after implementation)

```
~/Herd/daps/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── HomeController.php
│   │   │   ├── AboutController.php
│   │   │   ├── ProjectController.php
│   │   │   └── ContactController.php
│   │   ├── Middleware/HandleInertiaRequests.php   (modified — share portfolio)
│   │   └── Requests/ContactRequest.php
│   ├── Mail/ContactFormMail.php
│   └── Models/Contact.php
├── config/portfolio.php
├── database/migrations/2026_05_28_000001_create_contacts_table.php
├── docs/superpowers/specs/2026-05-28-portfolio-design.md   (moved from spec-tmp)
├── docs/superpowers/plans/2026-05-28-portfolio-implementation-plan.md (this file)
├── resources/
│   ├── css/app.css                (Tailwind + import tokens.css)
│   ├── css/tokens.css             (CSS variables, animations, utility classes)
│   ├── js/
│   │   ├── app.tsx                (Inertia bootstrap — from starter)
│   │   ├── Layouts/AppLayout.tsx
│   │   ├── Pages/
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── Projects/
│   │   │       ├── Index.tsx
│   │   │       └── Show.tsx
│   │   ├── Components/
│   │   │   ├── Icons.tsx
│   │   │   ├── Mark.tsx
│   │   │   ├── Nav.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── StatusDot.tsx
│   │   │   ├── SectionHead.tsx
│   │   │   ├── SectionBreak.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Kbd.tsx
│   │   │   ├── MonoLabel.tsx
│   │   │   ├── LangDot.tsx
│   │   │   ├── RepoBadge.tsx
│   │   │   ├── RepoChrome.tsx
│   │   │   ├── CommitBars.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── Screenshot.tsx
│   │   │   ├── ProjectCardFeatured.tsx
│   │   │   └── ProjectCardCompact.tsx
│   │   ├── hooks/
│   │   │   └── useTheme.ts
│   │   ├── lib/
│   │   │   ├── langColors.ts
│   │   │   └── portfolio.ts        (TypeScript types for shared props)
│   │   └── types/index.d.ts        (Inertia PageProps augmentation)
│   └── views/app.blade.php
├── routes/web.php
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Phase 1 · Scaffold & verify

### Task 1: Scaffold Laravel + Inertia + React starter

**Files:**
- Create: `~/Herd/daps/` (full Laravel app)

- [ ] **Step 1.1:** Verify daps folder doesn't exist

```bash
ls ~/Herd/daps 2>/dev/null && echo "EXISTS — abort" || echo "OK to create"
```
Expected: `OK to create`

- [ ] **Step 1.2:** Run Laravel installer with React + TypeScript

```bash
cd ~/Herd && /Users/danielsalipot/Library/Application\ Support/Herd/bin/php83 /Users/danielsalipot/Library/Application\ Support/Herd/bin/laravel new daps --react --typescript --no-interaction
```
Expected: Installer completes, `~/Herd/daps/` populated with Laravel + Inertia + React TS starter, SQLite chosen as DB by default in Laravel 11.

- [ ] **Step 1.3:** Verify scaffold

```bash
ls ~/Herd/daps/resources/js/ && ls ~/Herd/daps/config/ && cat ~/Herd/daps/composer.json | head -20
```
Expected: `app.tsx`, `Pages/`, standard Laravel config files, `laravel/framework: ^11.x`.

- [ ] **Step 1.4:** Move spec + plan into the project

```bash
mkdir -p ~/Herd/daps/docs/superpowers/specs ~/Herd/daps/docs/superpowers/plans
mv ~/Herd/daps-spec-tmp/2026-05-28-portfolio-design.md ~/Herd/daps/docs/superpowers/specs/
mv ~/Herd/daps-spec-tmp/2026-05-28-portfolio-implementation-plan.md ~/Herd/daps/docs/superpowers/plans/
rmdir ~/Herd/daps-spec-tmp
```

- [ ] **Step 1.5:** Install node deps + build once

```bash
cd ~/Herd/daps && npm install && npm run build
```
Expected: `public/build/` populated, no errors.

- [ ] **Step 1.6:** Visit https://daps.test/ in browser — see the starter "Laravel" Inertia React page.

---

## Phase 2 · Content & shared infrastructure

### Task 2: Create `config/portfolio.php` with Daniel's CV data

**Files:**
- Create: `~/Herd/daps/config/portfolio.php`

- [ ] **Step 2.1:** Write the config — the entire CV content (see full content in Task 2 details below).

The file exports a single array. Key sections: `identity`, `links`, `stats`, `now`, `projects[]`, `stack`, `experience`, `education`, `certifications`, `achievements`.

Full file content:

```php
<?php

return [
    'identity' => [
        'name'   => 'Daniel Andrei Salipot',
        'handle' => 'daniel.salipot',
        'role'   => 'Full-stack web developer shipping Laravel, IoT and real systems end-to-end.',
        'tagline' => 'Engineer first. Designer when needed.',
        'location' => ['city' => 'Marilao, PH', 'tz' => 'UTC+8'],
        'available' => [
            'status' => 'open',
            'since'  => 'Q3 2026',
            'label'  => 'available for hire · q3 2026',
        ],
    ],
    'links' => [
        'email'    => 'danielsalipot@gmail.com',
        'phone'    => '+63 939 504 4799',
        'github'   => 'https://github.com/danielsalipot',
        'linkedin' => 'https://linkedin.com/in/daniel-salipot',
    ],
    'stats' => [
        ['n' => '3',   'l' => 'years shipping'],
        ['n' => '12+', 'l' => 'production systems'],
        ['n' => '1st', 'l' => 'hack4impact 2025'],
    ],
    'now' => [
        ['label' => 'building', 'title' => 'School-management v4', 'sub' => 'rakso ct · since jan 2023 · 4 schools, 14k students live'],
        ['label' => 'last shipped', 'title' => 'Hack4Impact 2025 platform', 'sub' => 'laravel · 24-hour build · 1st place team'],
        ['label' => 'learning', 'title' => 'Go + Inertia.js', 'sub' => 'porting one of the older laravel monoliths sideways'],
    ],
    'projects' => [
        [
            'slug' => 'oasys', 'name' => 'OASYS', 'kicker' => 'Overall Administering System',
            'year' => '2023', 'featured' => true, 'tag' => 'Capstone · Best of department',
            'blurb' => "Web-based HRIS with integrated payroll for Adamson University. End-to-end build across 6 months — auth, role-based access, payroll engine, leave and DTR. Awarded Best Capstone, AdU IT&IS Department, 2023.",
            'stack' => ['laravel', 'php', 'mysql', 'bootstrap'],
            'lang' => 'php', 'branch' => 'main', 'hash' => 'a4f9c1d',
            'screenshot' => ['title' => 'oasys.adamson.local', 'subtitle' => 'employees · payroll · hris', 'tone' => 'forest'],
            'metrics' => [['6 mo', 'solo build'], ['Summa', 'cum laude'], ['Best', 'capstone 2023']],
            'case_study' => [
                'problem' => "Adamson's HR processes were fragmented across spreadsheets and paper forms. Payroll cycles took 5 days; leave requests routinely got lost.",
                'role'    => 'Solo developer — system design, database schema, all 11 modules, deployment.',
                'outcome' => "Cut payroll cycle from 5 days to 4 hours. Awarded Best Capstone of the IT&IS Department, 2023. Internal pilot ran for two semesters.",
                'links'   => ['live' => null, 'repo' => null],
            ],
        ],
        [
            'slug' => 'rakso-cashless', 'name' => 'Rakso · Cashless', 'kicker' => 'RFID payment & turnstile integration',
            'year' => '2024', 'featured' => false, 'tag' => 'IoT integration',
            'blurb' => 'RFID payment & turnstile integration for school cafeterias and gates.',
            'stack' => ['laravel', 'rfid', 'iot'],
            'lang' => 'php', 'branch' => 'release/2024', 'hash' => 'b71e2a8',
            'screenshot' => ['title' => 'rakso.cashless/admin', 'subtitle' => null, 'tone' => 'plum'],
            'metrics' => [['4 schools', 'live'], ['<200ms', 'tap-to-pay'], ['99.8%', 'uptime']],
            'case_study' => [
                'problem' => 'Cash handling in school cafeterias led to long lines, missing money, and zero parental visibility.',
                'role' => 'Lead developer — server, RFID reader integration, turnstile firmware glue, parent dashboard.',
                'outcome' => 'Live across 4 schools, processing thousands of taps per day with parent SMS top-up.',
                'links' => ['live' => null, 'repo' => null],
            ],
        ],
        [
            'slug' => 'hack4impact', 'name' => 'Hack4Impact', 'kicker' => '1st place · 24-hour build',
            'year' => '2025', 'featured' => false, 'tag' => '1st place · Rakso CT',
            'blurb' => 'Class-data uploader + interactive quizzes with live student insights. Shipped in 24h.',
            'stack' => ['laravel', 'livewire', 'mysql'],
            'lang' => 'php', 'branch' => 'hack/24h', 'hash' => 'c92f001',
            'screenshot' => ['title' => 'quiz.rakso.local', 'subtitle' => 'live student dashboard', 'tone' => 'ember'],
            'metrics' => [['24h', 'build time'], ['1st', 'place'], ['Team', 'lead']],
            'case_study' => [
                'problem' => 'Teachers had no real-time visibility into student comprehension during lessons.',
                'role' => 'Team lead — backend, real-time quiz state, scoring engine.',
                'outcome' => 'Champion of Rakso CT Hack4Impact 2025. Working prototype with live insights.',
                'links' => ['live' => null, 'repo' => null],
            ],
        ],
        [
            'slug' => 'attendance-monitor', 'name' => 'Attendance Monitor', 'kicker' => 'QR-based daily attendance',
            'year' => '2024', 'featured' => false, 'tag' => null,
            'blurb' => 'QR-based daily attendance with parent SMS, plug-in biometric scanners.',
            'stack' => ['laravel', 'livewire', 'qr'],
            'lang' => 'php', 'branch' => 'main', 'hash' => 'd05a112',
            'screenshot' => ['title' => 'attendance.rakso/dash', 'subtitle' => null, 'tone' => 'ocean'],
            'metrics' => [['3 schools', 'live'], ['QR + bio', 'scanners'], ['SMS', 'parents']],
            'case_study' => [
                'problem' => 'Daily attendance via paper roll calls was slow, error-prone, and invisible to parents.',
                'role' => 'Solo developer — full stack + IoT integration.',
                'outcome' => 'Daily attendance recorded in under 5 minutes per class; parents receive same-day SMS.',
                'links' => ['live' => null, 'repo' => null],
            ],
        ],
        [
            'slug' => 'dumagat-remontado', 'name' => 'Dumagat Remontado', 'kicker' => 'University outreach informational site',
            'year' => '2022', 'featured' => false, 'tag' => 'University outreach',
            'blurb' => 'Cultural informational site for the Dumagat Remontado tribe (Adamson outreach).',
            'stack' => ['laravel', 'bootstrap'],
            'lang' => 'php', 'branch' => 'archive', 'hash' => 'e3b7c44',
            'screenshot' => ['title' => 'dumagat-tribe.ph', 'subtitle' => null, 'tone' => 'forest'],
            'metrics' => [['Outreach', 'project'], ['Adamson', 'university'], ['2022', 'shipped']],
            'case_study' => [
                'problem' => 'The Dumagat Remontado tribe lacked digital presence and accessible information about their culture.',
                'role' => 'Team developer — Laravel + Bootstrap implementation.',
                'outcome' => 'Public informational site supporting visibility of the tribe and its traditions.',
                'links' => ['live' => null, 'repo' => null],
            ],
        ],
        [
            'slug' => 'skills-olympics', 'name' => 'Skills Olympics', 'kicker' => '1st runner-up · web design',
            'year' => '2022', 'featured' => false, 'tag' => '1st runner-up',
            'blurb' => 'Competition entry — represented Adamson at the I.T. Skills Olympics 2022, U-Makati.',
            'stack' => ['html', 'css', 'figma'],
            'lang' => 'html', 'branch' => 'competition', 'hash' => 'f48d910',
            'screenshot' => ['title' => 'olympics.entry', 'subtitle' => null, 'tone' => 'slate'],
            'metrics' => [['1st', 'runner-up'], ['~30', 'schools'], ['U-Makati', 'venue']],
            'case_study' => [
                'problem' => 'Competition brief: design a web page in a fixed time window evaluated by a panel.',
                'role' => 'Sole designer + developer — represented Adamson University.',
                'outcome' => '1st runner-up against ~30 schools.',
                'links' => ['live' => null, 'repo' => null],
            ],
        ],
    ],
    'stack' => [
        'backend'   => [['Laravel', 'expert · 6y'], ['Livewire', 'expert · 3y'], ['Filament', 'advanced · 2y'], ['PHP', 'expert · 6y'], ['MySQL', 'advanced · 6y']],
        'frontend'  => [['React', 'advanced · 3y'], ['Vue.js', 'advanced · 3y'], ['Tailwind', 'expert · 4y'], ['Flutter', 'mid · 2y'], ['JavaScript', 'advanced · 5y']],
        'platforms' => [['Linux', 'comfortable'], ['Git', 'daily'], ['n8n', 'comfortable'], ['CI/CD', 'comfortable'], ['Android (Kotlin)', 'mid']],
        'adjacent'  => [['Figma · UI/UX', 'daily'], ['IoT integration', 'RFID · biometric'], ['Webhooks · APIs', 'daily'], ['Agile · Scrum', 'team lead'], ['Client comms', 'lead']],
    ],
    'experience' => [
        [
            'from' => '01.2023', 'to' => 'current',
            'role' => 'Web Application Developer', 'org' => 'Rakso CT', 'loc' => 'Marilao, PH',
            'note' => 'Full-stack Laravel/Livewire/Filament. Lead end-to-end builds: cashless RFID, attendance, school management. Client comms + automations (n8n, webhooks, chatbots).',
            'stack' => ['laravel', 'livewire', 'filament', 'mysql', 'n8n'],
        ],
        [
            'from' => '01.2022', 'to' => '12.2022',
            'role' => 'Web Application Developer', 'org' => 'Adamson University', 'loc' => 'Manila, PH',
            'note' => 'Member of the team that built an informational site for the Dumagat Remontado Tribe (university outreach). Laravel + Bootstrap.',
            'stack' => ['laravel', 'php', 'bootstrap'],
        ],
    ],
    'education' => [
        [
            'yr' => '2019 — 2023', 'degree' => 'BS Information Technology', 'org' => 'Adamson University · Manila',
            'note' => 'Capstone: OASYS (HRIS + payroll). Best of Department.',
            'honor' => 'summa cum laude', 'gpa' => '1.182 / 1.000', 'active' => true,
        ],
        [
            'yr' => '2017 — 2019', 'degree' => 'Senior High · STEM, Technology Track', 'org' => 'Adamson University · Manila',
            'note' => 'Foundations in programming, math, electronics.',
            'honor' => 'with honors', 'gpa' => null, 'active' => false,
        ],
    ],
    'certifications' => [
        [
            'org' => 'Microsoft', 'org_mark' => 'MS', 'org_bg' => '#00A4EF',
            't' => 'Technology Associate', 'sub' => 'Database Management Fundamentals',
            'yr' => '2021', 'cred' => 'MTA-098-DM', 'status' => 'verified',
            'skills' => ['sql', 'mysql', 'schemas', 'normalization'],
        ],
        [
            'org' => 'PSITE', 'org_mark' => 'PS', 'org_bg' => '#7C3AED',
            't' => '3rd Philippine Skilling Summit', 'sub' => 'Agile Methodologies Track',
            'yr' => '2022', 'cred' => 'PSS-22-AGM-417', 'status' => 'verified',
            'skills' => ['scrum', 'kanban', 'sprint planning'],
        ],
        [
            'org' => 'Adamson Univ.', 'org_mark' => 'AU', 'org_bg' => '#1F4D8B',
            't' => 'IT Skills Olympics 2022', 'sub' => 'Web Design · 1st Runner-up',
            'yr' => '2022', 'cred' => 'ITSO-22-WD-002', 'status' => 'verified',
            'skills' => ['html', 'css', 'figma'],
        ],
    ],
    'achievements' => [
        ['yr' => '2025', 't' => '1st Place', 'where' => 'Rakso CT Hack4Impact', 'note' => 'Led the team — Laravel quiz platform built in 24h.'],
        ['yr' => '2023', 't' => 'Best Capstone', 'where' => 'AdU IT&IS Department', 'note' => 'OASYS — HRIS w/ payroll system.'],
        ['yr' => '2022', 't' => '1st Runner-up', 'where' => 'I.T. Skills Olympics', 'note' => 'Web Design · U-Makati · ~30 schools.'],
        ['yr' => '2021', 't' => 'Microsoft Cert.', 'where' => 'Database Management', 'note' => 'Technology Associate, fundamentals.'],
    ],
];
```

- [ ] **Step 2.2:** Verify config loads

```bash
cd ~/Herd/daps && php artisan tinker --execute="dump(config('portfolio.identity.name'));"
```
Expected: `"Daniel Andrei Salipot"`

---

### Task 3: Share portfolio config to every Inertia page

**Files:**
- Modify: `~/Herd/daps/app/Http/Middleware/HandleInertiaRequests.php`

- [ ] **Step 3.1:** Edit the middleware `share()` method to add the portfolio data.

In `share(Request $request): array`, the returned array should merge in:
```php
'portfolio' => config('portfolio'),
```

The full method becomes (preserving existing keys):
```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name' => config('app.name'),
        'auth' => [
            'user' => $request->user(),
        ],
        'ziggy' => fn () => [
            ...(new Ziggy)->toArray(),
            'location' => $request->url(),
        ],
        'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        'portfolio' => config('portfolio'),
        'flash' => [
            'contact' => fn () => $request->session()->get('contact'),
        ],
    ];
}
```

(The exact existing keys depend on Laravel starter version — preserve them; just add `portfolio` and `flash`.)

- [ ] **Step 3.2:** Verify Inertia shares it. From the running app, in browser dev console after visiting any page:

```js
JSON.parse(document.getElementById('app').dataset.page).props.portfolio.identity.name
```
Expected: `"Daniel Andrei Salipot"`

---

### Task 4: Create TypeScript types for shared props

**Files:**
- Create: `~/Herd/daps/resources/js/lib/portfolio.ts`
- Modify: `~/Herd/daps/resources/js/types/index.d.ts` (or wherever the starter declares PageProps — find with `grep -r "PageProps" resources/js/types`)

- [ ] **Step 4.1:** Create `resources/js/lib/portfolio.ts` with the TypeScript shape mirroring `config/portfolio.php`:

```typescript
export type ScreenshotTone = 'plum' | 'forest' | 'ember' | 'slate' | 'ocean' | 'paper';

export interface Project {
  slug: string;
  name: string;
  kicker: string;
  year: string;
  featured: boolean;
  tag: string | null;
  blurb: string;
  stack: string[];
  lang: string;
  branch: string;
  hash: string;
  screenshot: { title: string; subtitle: string | null; tone: ScreenshotTone };
  metrics: [string, string][];
  case_study: {
    problem: string;
    role: string;
    outcome: string;
    links: { live: string | null; repo: string | null };
  };
}

export interface Portfolio {
  identity: {
    name: string;
    handle: string;
    role: string;
    tagline: string;
    location: { city: string; tz: string };
    available: { status: string; since: string; label: string };
  };
  links: { email: string; phone: string; github: string; linkedin: string };
  stats: { n: string; l: string }[];
  now: { label: string; title: string; sub: string }[];
  projects: Project[];
  stack: Record<'backend' | 'frontend' | 'platforms' | 'adjacent', [string, string][]>;
  experience: {
    from: string; to: string; role: string; org: string; loc: string;
    note: string; stack: string[];
  }[];
  education: {
    yr: string; degree: string; org: string; note: string;
    honor: string; gpa: string | null; active: boolean;
  }[];
  certifications: {
    org: string; org_mark: string; org_bg: string;
    t: string; sub: string; yr: string; cred: string; status: string;
    skills: string[];
  }[];
  achievements: { yr: string; t: string; where: string; note: string }[];
}
```

- [ ] **Step 4.2:** Augment Inertia's `PageProps` (find existing declaration in `resources/js/types/`):

Add to the existing global types file:
```typescript
import type { Portfolio } from '@/lib/portfolio';

declare module '@inertiajs/core' {
  interface PageProps {
    portfolio: Portfolio;
    flash: { contact?: 'sent' | null };
  }
}
```

- [ ] **Step 4.3:** Run `npx tsc --noEmit` to verify type checking passes.

---

## Phase 3 · Design tokens & theme

### Task 5: Create `tokens.css` with design variables & animations

**Files:**
- Create: `~/Herd/daps/resources/css/tokens.css`
- Modify: `~/Herd/daps/resources/css/app.css` (add `@import` for tokens)

- [ ] **Step 5.1:** Create `resources/css/tokens.css` with full content (copied & adapted from the design's tokens.css, structured for both `:root` light default and `:root.dark` override):

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');

:root {
  --bg: #FAFAFA;        --bg-elev: #FFFFFF;   --bg-elev-2: #F4F4F4;
  --fg: #0A0A0A;        --fg-mid: #525252;    --fg-dim: #8A8A8A;  --fg-fade: #B5B5B5;
  --line: rgba(10,10,10,0.08);  --line-strong: rgba(10,10,10,0.14);
  --accent: #3F8B26;    --accent-dim: #5BB94B;  --accent-sage: rgba(63,139,38,0.10);
  --status-ok: #3F8B26;
  --lang-php: #777BB4; --lang-js: #F1E05A; --lang-ts: #3178C6;
  --lang-html: #E34F26; --lang-css: #563D7C; --lang-vue: #41B883;
  --lang-react: #61DAFB; --lang-kotlin: #A97BFF; --lang-go: #00ADD8;
  --lang-py: #3572A5; --lang-sql: #E38C00; --lang-blade: #F05340;
  --lang-shell: #89E051; --lang-laravel: #FF2D20; --lang-livewire: #FB70A9;
  --lang-filament: #FFAB40; --lang-tailwind: #38BDF8; --lang-bootstrap: #7952B3;
  --lang-flutter: #54C5F8; --lang-dart: #00B4AB; --lang-java: #B07219;
  --lang-csharp: #178600; --lang-rfid: #7DD96E; --lang-iot: #7DD96E;
  --lang-n8n: #EA4B71; --lang-qr: #A1A1A1; --lang-webhooks: #A1A1A1;
  --lang-figma: #F24E1E;
}

:root.dark {
  --bg: #0A0A0A;        --bg-elev: #111111;   --bg-elev-2: #161616;
  --fg: #EDEDED;        --fg-mid: #A1A1A1;    --fg-dim: #707070;  --fg-fade: #4A4A4A;
  --line: rgba(255,255,255,0.08);  --line-strong: rgba(255,255,255,0.14);
  --accent: #7DD96E;    --accent-dim: #5BB94B;  --accent-sage: rgba(125,217,110,0.12);
  --status-ok: #7DD96E;
}

html, body { margin: 0; background: var(--bg); color: var(--fg); }

body {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  font-feature-settings: 'ss01', 'cv11', 'zero';
  -webkit-font-smoothing: antialiased;
}

.font-mono { font-family: 'Geist Mono', ui-monospace, SFMono-Regular, monospace; }

.ulink {
  display: inline-flex; align-items: center; gap: 6px;
  text-decoration: none; color: inherit;
  border-bottom: 1px solid currentColor; padding-bottom: 1px;
}

.dotgrid {
  background-image: radial-gradient(rgba(125,125,125,0.07) 1px, transparent 1px);
  background-size: 18px 18px;
}

@keyframes blink { 50% { opacity: 0 } }
.caret { animation: blink 1.05s steps(1, end) infinite; }

::selection { background: var(--accent); color: #0a0a0a; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulseRing {
  0%   { box-shadow: 0 0 0 0   rgba(125,217,110,0.55); }
  70%  { box-shadow: 0 0 0 7px rgba(125,217,110,0);    }
  100% { box-shadow: 0 0 0 0   rgba(125,217,110,0);    }
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes gridScroll { 0% { background-position: 0 0; } 100% { background-position: 56px 56px; } }
@keyframes scanline {
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(2000%); opacity: 0; }
}
@keyframes barGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

.anim-fadeUp { animation: fadeUp 600ms cubic-bezier(.2,.7,.3,1) both; }
.anim-fadeIn { animation: fadeIn 500ms ease-out both; }
.pulse-ring  { animation: pulseRing 1.9s ease-out infinite; border-radius: 999px; }
.grid-drift  { animation: gridScroll 22s linear infinite; }
.scanline {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.5;
  animation: scanline 9s linear infinite;
  pointer-events: none;
}

.stagger-in > * { opacity: 0; animation: fadeUp 600ms cubic-bezier(.2,.7,.3,1) forwards; }
.stagger-in > *:nth-child(1) { animation-delay: 60ms; }
.stagger-in > *:nth-child(2) { animation-delay: 140ms; }
.stagger-in > *:nth-child(3) { animation-delay: 220ms; }
.stagger-in > *:nth-child(4) { animation-delay: 300ms; }
.stagger-in > *:nth-child(5) { animation-delay: 380ms; }
.stagger-in > *:nth-child(6) { animation-delay: 460ms; }
.stagger-in > *:nth-child(7) { animation-delay: 540ms; }
.stagger-in > *:nth-child(8) { animation-delay: 620ms; }

.repo-card {
  transition: transform 220ms cubic-bezier(.2,.7,.3,1), border-color 220ms;
  will-change: transform;
}
.repo-card:hover {
  transform: translateY(-3px);
  border-color: rgba(125,217,110,0.35) !important;
}
.repo-card:hover .repo-screenshot { transform: scale(1.015); }
.repo-screenshot { transition: transform 320ms cubic-bezier(.2,.7,.3,1); will-change: transform; }

.link-slide { position: relative; }
.link-slide::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -2px;
  height: 1px; background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform 240ms cubic-bezier(.2,.7,.3,1);
}
.link-slide:hover::after { transform: scaleX(1); }

.commit-bar {
  background: linear-gradient(180deg, var(--accent), var(--accent-dim));
  transform-origin: bottom;
  animation: barGrow 700ms cubic-bezier(.2,.7,.3,1) both;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 5.2:** Update `resources/css/app.css` — replace contents with:

```css
@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### Task 6: Extend Tailwind config to read CSS variables

**Files:**
- Modify: `~/Herd/daps/tailwind.config.js`

- [ ] **Step 6.1:** Replace `theme.extend` in `tailwind.config.js`:

```javascript
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Geist', ...defaultTheme.fontFamily.sans],
                mono: ['Geist Mono', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                bg:       'var(--bg)',
                'bg-elev':   'var(--bg-elev)',
                'bg-elev-2': 'var(--bg-elev-2)',
                fg:        'var(--fg)',
                'fg-mid':   'var(--fg-mid)',
                'fg-dim':   'var(--fg-dim)',
                'fg-fade':  'var(--fg-fade)',
                line:       'var(--line)',
                'line-strong': 'var(--line-strong)',
                accent:    'var(--accent)',
                'accent-dim': 'var(--accent-dim)',
            },
        },
    },
    plugins: [forms],
};
```

- [ ] **Step 6.2:** Run `npm run build` to verify the config compiles. Expected: build succeeds.

---

### Task 7: Create theme hook + ThemeToggle component

**Files:**
- Create: `~/Herd/daps/resources/js/hooks/useTheme.ts`
- Create: `~/Herd/daps/resources/js/Components/ThemeToggle.tsx`

- [ ] **Step 7.1:** Create `resources/js/hooks/useTheme.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
```

- [ ] **Step 7.2:** Create `resources/js/Components/ThemeToggle.tsx`:

```tsx
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-elev px-2 py-1 font-mono text-[11px] text-fg-mid hover:text-fg transition-colors"
    >
      {theme === 'dark' ? '☼ light' : '☾ dark'}
    </button>
  );
}
```

- [ ] **Step 7.3:** Add a no-flash script to `resources/views/app.blade.php` `<head>`, BEFORE Vite scripts:

```html
<script>
  (function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

This prevents a flash of light-mode on initial load when the saved theme is dark.

---

## Phase 4 · Components (atomic primitives first, then composites)

### Task 8: Icons + langColors

**Files:**
- Create: `~/Herd/daps/resources/js/Components/Icons.tsx`
- Create: `~/Herd/daps/resources/js/lib/langColors.ts`

- [ ] **Step 8.1:** Create `lib/langColors.ts`:

```typescript
const LANG_COLORS: Record<string, string> = {
  php: '#777BB4', js: '#F1E05A', javascript: '#F1E05A',
  ts: '#3178C6', typescript: '#3178C6',
  html: '#E34F26', css: '#563D7C',
  vue: '#41B883', 'vue.js': '#41B883',
  react: '#61DAFB',
  dart: '#00B4AB', flutter: '#54C5F8',
  kotlin: '#A97BFF', java: '#B07219', 'c#': '#178600',
  go: '#00ADD8', python: '#3572A5', py: '#3572A5',
  sql: '#E38C00', mysql: '#E38C00',
  blade: '#F05340', shell: '#89E051',
  laravel: '#FF2D20', livewire: '#FB70A9', filament: '#FFAB40',
  tailwind: '#38BDF8', bootstrap: '#7952B3',
  rfid: '#7DD96E', iot: '#7DD96E', n8n: '#EA4B71',
  qr: '#A1A1A1', webhooks: '#A1A1A1', figma: '#F24E1E',
  json: '#A1A1A1', scrum: '#7DD96E', kanban: '#7DD96E',
  schemas: '#A1A1A1', normalization: '#A1A1A1', 'sprint planning': '#7DD96E',
};

export function langColor(name: string | null | undefined): string {
  if (!name) return '#7DD96E';
  return LANG_COLORS[name.toLowerCase()] ?? '#7DD96E';
}
```

- [ ] **Step 8.2:** Create `Components/Icons.tsx` with the full icon set (arrow, arrowNE, chev, ext, github, linkedin, mail, search, menu, copy, terminal, sparkle, dot):

```tsx
type IconProps = { size?: number; className?: string };

export const ArrowIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <path d="M2 7h10M8 3l4 4-4 4" />
  </svg>
);
export const ArrowNEIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <path d="M3.5 10.5L10.5 3.5M5 3.5h5.5V9" />
  </svg>
);
export const ExtIcon = ({ size = 12, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
    <path d="M5 2H2.5v7.5H10V7M7.5 2H10v2.5M10 2L5.5 6.5" />
  </svg>
);
export const GithubIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.72 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 014.01 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.49v2.2c0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);
export const LinkedinIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M2 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm.2 2h2.6v8H2.2zM6.4 6h2.5v1.1h.04c.35-.66 1.2-1.35 2.47-1.35C13.97 5.75 14.5 7.4 14.5 9.5V14H12V10c0-.95-.02-2.17-1.32-2.17S9.2 8.86 9.2 9.93V14H6.4z"/>
  </svg>
);
export const MailIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
    <rect x="1.5" y="3.5" width="13" height="9" rx="0.5"/>
    <path d="M2 4l6 4.5L14 4"/>
  </svg>
);
export const TerminalIcon = ({ size = 14, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 4.5L5.5 7 3 9.5M7.5 9.5h3.5"/>
  </svg>
);
export const GitBranchIcon = ({ size = 10, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
    <circle cx="3" cy="2" r="1.2" /><circle cx="3" cy="8" r="1.2" /><circle cx="7" cy="5" r="1.2" />
    <path d="M3 3.2v3.6M3.5 7.2C4.5 6.8 5.5 6.2 6 5.5" strokeLinecap="round" />
  </svg>
);
export const CheckIcon = ({ size = 10, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 6.5l2.5 2.5 4.5-5"/>
  </svg>
);
```

---

### Task 9: Atomic UI primitives (Mark, Kbd, MonoLabel, LangDot, RepoBadge, StatusDot)

**Files:**
- Create: `~/Herd/daps/resources/js/Components/Mark.tsx`
- Create: `~/Herd/daps/resources/js/Components/Kbd.tsx`
- Create: `~/Herd/daps/resources/js/Components/MonoLabel.tsx`
- Create: `~/Herd/daps/resources/js/Components/LangDot.tsx`
- Create: `~/Herd/daps/resources/js/Components/RepoBadge.tsx`
- Create: `~/Herd/daps/resources/js/Components/StatusDot.tsx`

- [ ] **Step 9.1:** `Components/Mark.tsx`:

```tsx
export default function Mark({ only = false, handle = 'daniel.salipot' }: { only?: boolean; handle?: string }) {
  const [first, dot] = handle.split('.');
  return (
    <div className="inline-flex items-center gap-2.5 text-fg">
      <span className="font-mono font-semibold text-[12px] bg-fg text-bg px-1.5 py-1 leading-none tracking-tight border border-line dark:border-line">
        ds
      </span>
      {!only && (
        <span className="font-mono text-[13px] font-medium tracking-tight">
          {first}<span className="text-fg-dim">.{dot}</span>
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 9.2:** `Components/Kbd.tsx`:

```tsx
import { ReactNode } from 'react';

export default function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-bg-elev text-fg-mid border border-line font-mono text-[11px] px-1.5 py-1 rounded leading-none font-medium">
      {children}
    </span>
  );
}
```

- [ ] **Step 9.3:** `Components/MonoLabel.tsx`:

```tsx
import { ReactNode } from 'react';

export default function MonoLabel({ children, size = 11 }: { children: ReactNode; size?: number }) {
  return (
    <span className="font-mono text-fg-dim tracking-wide" style={{ fontSize: size }}>
      {children}
    </span>
  );
}
```

- [ ] **Step 9.4:** `Components/LangDot.tsx`:

```tsx
import { langColor } from '@/lib/langColors';

export default function LangDot({ name, size = 9 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-block flex-shrink-0 rounded-full"
      style={{ width: size, height: size, background: langColor(name) }}
    />
  );
}
```

- [ ] **Step 9.5:** `Components/RepoBadge.tsx`:

```tsx
import { GitBranchIcon } from './Icons';

export default function RepoBadge({ branch = 'main', hash = 'a4f9c1d' }: { branch?: string; hash?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-fg-mid border border-line rounded px-[7px] py-[3px] leading-none">
      <GitBranchIcon />
      <span className="text-fg">{branch}</span>
      <span className="text-fg-dim">·</span>
      <span className="text-fg-dim">{hash}</span>
    </span>
  );
}
```

- [ ] **Step 9.6:** `Components/StatusDot.tsx`:

```tsx
import { ReactNode } from 'react';

export default function StatusDot({ children = 'Available for work' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] text-fg-mid tracking-wide">
      <span className="relative w-2 h-2">
        <span className="pulse-ring absolute inset-0 rounded-full bg-accent" />
        <span className="absolute inset-0 rounded-full bg-accent" />
      </span>
      <span>{children}</span>
    </span>
  );
}
```

---

### Task 10: Card, Chip, Button, SectionHead, SectionBreak

**Files:**
- Create: `~/Herd/daps/resources/js/Components/Card.tsx`
- Create: `~/Herd/daps/resources/js/Components/Chip.tsx`
- Create: `~/Herd/daps/resources/js/Components/Button.tsx`
- Create: `~/Herd/daps/resources/js/Components/SectionHead.tsx`
- Create: `~/Herd/daps/resources/js/Components/SectionBreak.tsx`

- [ ] **Step 10.1:** `Components/Card.tsx`:

```tsx
import { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  pad?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Card({ children, pad = 24, className = '', style }: CardProps) {
  return (
    <div
      className={`bg-bg-elev border border-line rounded-xl ${className}`}
      style={{ padding: pad, ...style }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 10.2:** `Components/Chip.tsx`:

```tsx
import { ReactNode } from 'react';

type Tone = 'default' | 'strong' | 'accent';

export default function Chip({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
  const toneClass = {
    default: 'bg-bg-elev text-fg-mid border-line',
    strong:  'bg-fg text-bg border-fg',
    accent:  'bg-[var(--accent-sage)] text-accent border-[color:var(--accent-sage)]',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] font-medium border rounded-md leading-none ${toneClass}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 10.3:** `Components/Button.tsx`:

```tsx
import { ReactNode } from 'react';

type Kind = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  kind?: Kind;
  size?: Size;
  icon?: ReactNode;
  trailing?: ReactNode;
  full?: boolean;
  as?: 'button' | 'a' | 'span';
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children, kind = 'primary', size = 'md',
  icon, trailing, full = false, as = 'button',
  href, type = 'button', disabled, onClick,
}: ButtonProps) {
  const sizes: Record<Size, string> = {
    sm: 'px-3 py-[7px] text-[12px]',
    md: 'px-4 py-2.5 text-[13px]',
    lg: 'px-5 py-3 text-[14px]',
  };
  const kinds: Record<Kind, string> = {
    primary:   'bg-fg text-bg border-fg hover:bg-fg/90',
    accent:    'bg-accent text-[#0A0A0A] border-transparent hover:bg-accent-dim',
    secondary: 'bg-bg-elev text-fg border-line hover:border-line-strong',
    ghost:     'bg-transparent text-fg-mid border-transparent hover:text-fg',
  };
  const cls = `inline-flex items-center justify-center gap-2 font-sans font-medium tracking-tight border rounded-lg leading-none transition-colors ${sizes[size]} ${kinds[kind]} ${full ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  const inner = <>{icon}{children}{trailing}</>;
  if (as === 'a' && href) return <a href={href} className={cls}>{inner}</a>;
  if (as === 'span') return <span className={cls}>{inner}</span>;
  return <button type={type} className={cls} disabled={disabled} onClick={onClick}>{inner}</button>;
}
```

- [ ] **Step 10.4:** `Components/SectionHead.tsx`:

```tsx
import { ReactNode } from 'react';

interface SectionHeadProps {
  n: string;
  title: string;
  right?: string;
  headline?: string;
  kicker?: string;
  icon?: ReactNode;
}

export default function SectionHead({ n, title, right, headline, kicker, icon }: SectionHeadProps) {
  return (
    <div className="anim-fadeUp">
      <div className="flex items-stretch font-mono text-[11.5px]">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-bg-elev text-fg border border-line border-b-0 rounded-t-md relative -mb-px">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ boxShadow: '0 0 6px var(--accent)' }} />
          <span className="text-fg-fade">§</span>
          <span className="text-fg-dim">{n}</span>
          <span className="text-fg-fade">·</span>
          <span className="text-fg font-medium">{title}</span>
          {icon && <span className="text-fg-dim ml-1">{icon}</span>}
        </div>
        <div className="flex-1 border-b border-line" />
        {right && (
          <div className="inline-flex items-center gap-2 px-1 pb-1.5 text-fg-dim self-end">
            <span className="text-fg-fade">↳</span>
            <span>{right}</span>
          </div>
        )}
      </div>
      {(headline || kicker) && (
        <div className="pt-5 pb-1 flex justify-between items-baseline gap-6">
          {headline && (
            <h2 className="font-sans font-medium text-[36px] leading-[1.05] tracking-tight text-fg m-0">{headline}</h2>
          )}
          {kicker && <span className="font-mono text-[11px] text-fg-dim whitespace-nowrap">{kicker}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 10.5:** `Components/SectionBreak.tsx`:

```tsx
export default function SectionBreak({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3.5 my-2">
      <div className="flex-1 h-px" style={{ background: 'repeating-linear-gradient(90deg, var(--line) 0 6px, transparent 6px 10px)' }} />
      {label && <span className="font-mono text-[10.5px] text-fg-dim tracking-wider">{label}</span>}
      <div className="flex-1 h-px" style={{ background: 'repeating-linear-gradient(90deg, var(--line) 0 6px, transparent 6px 10px)' }} />
    </div>
  );
}
```

---

### Task 11: CodeBlock, Screenshot, CommitBars

**Files:**
- Create: `~/Herd/daps/resources/js/Components/CodeBlock.tsx`
- Create: `~/Herd/daps/resources/js/Components/Screenshot.tsx`
- Create: `~/Herd/daps/resources/js/Components/CommitBars.tsx`

- [ ] **Step 11.1:** `Components/CodeBlock.tsx`:

```tsx
import { CSSProperties } from 'react';

export interface CodeLine {
  p?: string;       // prompt (e.g., '$')
  t: string;        // text
  c?: string;       // color override
  strong?: boolean; // render in fg
}

interface CodeBlockProps {
  lines: CodeLine[];
  title?: string;
  style?: CSSProperties;
}

export default function CodeBlock({ lines, title, style }: CodeBlockProps) {
  return (
    <div
      className="bg-bg-elev-2 border border-line rounded-lg font-mono text-[12.5px] leading-[1.7] overflow-hidden"
      style={style}
    >
      {title && (
        <div className="flex items-center gap-2 px-3.5 py-2 border-b border-line text-fg-dim text-[11px]">
          <span className="inline-flex gap-1">
            <span className="w-2 h-2 rounded-full bg-line-strong" />
            <span className="w-2 h-2 rounded-full bg-line-strong" />
            <span className="w-2 h-2 rounded-full bg-line-strong" />
          </span>
          <span className="ml-1.5">{title}</span>
        </div>
      )}
      <div className="px-4 py-3.5 text-fg-mid">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2.5" style={{ color: l.c }}>
            {l.p && <span className="text-accent">{l.p}</span>}
            <span className={`whitespace-pre-wrap ${l.strong ? 'text-fg' : ''}`}>{l.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.2:** `Components/Screenshot.tsx`:

```tsx
import { CSSProperties, ReactNode } from 'react';
import type { ScreenshotTone } from '@/lib/portfolio';

const TONES: Record<ScreenshotTone, [string, string, string]> = {
  plum:   ['#1c1a2a', '#2a2240', '#7c6cd6'],
  forest: ['#0f1a14', '#15311f', '#7DD96E'],
  ember:  ['#1f1410', '#3a1d10', '#f59e6b'],
  slate:  ['#0f1216', '#1c2128', '#8b95a5'],
  ocean:  ['#0c1620', '#143046', '#5bb1ff'],
  paper:  ['#f0eee9', '#e2dfd6', '#6b6b6b'],
};

interface ScreenshotProps {
  title: string;
  subtitle?: string | null;
  tone?: ScreenshotTone;
  ratio?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export default function Screenshot({
  title = 'product.app', subtitle, tone = 'plum', ratio = '16/10',
  style, children,
}: ScreenshotProps) {
  const [a, b, accent] = TONES[tone];
  return (
    <div
      className="relative overflow-hidden border border-line rounded-lg"
      style={{ aspectRatio: ratio, background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`, ...style }}
    >
      <div className="absolute top-0 left-0 right-0 h-7 flex items-center px-3 bg-black/25 border-b border-white/5">
        <div className="flex gap-1.5">
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <span key={c} className="w-2 h-2 rounded-full" style={{ background: c, opacity: 0.8 }} />
          ))}
        </div>
        <span className="ml-3 font-mono text-[10px] text-white/50">{title}</span>
      </div>
      <div className="absolute inset-0 top-7 flex">
        <div className="w-1/5 bg-black/25 border-r border-white/5 p-2 flex flex-col gap-1.5">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-2 rounded-sm" style={{
              background: i === 1 ? accent : 'rgba(255,255,255,0.07)',
              opacity: i === 1 ? 0.85 : 1, width: i === 1 ? '85%' : `${60+(i*7)}%`,
            }} />
          ))}
        </div>
        <div className="flex-1 p-3.5 flex flex-col gap-2.5 relative">
          <div className="h-3.5 w-1/2 bg-white/20 rounded-sm" />
          <div className="h-2 w-1/3 bg-white/10 rounded-sm" />
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-white/5 border border-white/5 rounded-md" />
            ))}
          </div>
          <div className="h-[90px] bg-white/5 rounded-md mt-1 relative overflow-hidden">
            <div className="absolute left-0 bottom-0 h-[70%] w-[60%]" style={{
              background: `linear-gradient(180deg, transparent, ${accent}40)`,
            }} />
          </div>
          {subtitle && (
            <div className="absolute bottom-2.5 right-3.5 font-mono text-[10px] text-white/50">{subtitle}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 11.3:** `Components/CommitBars.tsx`:

```tsx
export default function CommitBars({
  data = [3, 6, 2, 8, 4, 7, 5, 9, 3, 6, 8, 4, 7, 5],
  h = 22,
}: { data?: number[]; h?: number }) {
  const max = Math.max(...data);
  return (
    <span className="inline-flex items-end gap-0.5" style={{ height: h }}>
      {data.map((v, i) => (
        <span
          key={i}
          className="commit-bar rounded-[1px]"
          style={{
            width: 3,
            height: Math.max(2, (v / max) * h),
            opacity: 0.4 + (v / max) * 0.6,
            animationDelay: `${i * 35}ms`,
            background: i === data.length - 1 ? 'var(--accent)' : undefined,
          }}
        />
      ))}
    </span>
  );
}
```

---

### Task 12: RepoChrome + Project cards

**Files:**
- Create: `~/Herd/daps/resources/js/Components/RepoChrome.tsx`
- Create: `~/Herd/daps/resources/js/Components/ProjectCardFeatured.tsx`
- Create: `~/Herd/daps/resources/js/Components/ProjectCardCompact.tsx`

- [ ] **Step 12.1:** `Components/RepoChrome.tsx`:

```tsx
import { ReactNode } from 'react';
import LangDot from './LangDot';
import { GitBranchIcon } from './Icons';

interface RepoChromeProps {
  filename: string;
  lang: string;
  branch?: string;
  hash?: string;
  children: ReactNode;
}

export default function RepoChrome({ filename, lang, branch, hash, children }: RepoChromeProps) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between px-3.5 py-2 bg-bg-elev-2 border-b border-line font-mono text-[11px] text-fg-dim">
        <span className="inline-flex items-center gap-2">
          <LangDot name={lang} />
          <span className="text-fg">{filename}</span>
        </span>
        {(branch || hash) && (
          <span className="inline-flex items-center gap-1.5 text-fg-dim">
            <GitBranchIcon />
            {branch && <span className="text-fg">{branch}</span>}
            {hash && <span>· {hash}</span>}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 12.2:** `Components/ProjectCardFeatured.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import type { Project } from '@/lib/portfolio';
import Card from './Card';
import Chip from './Chip';
import LangDot from './LangDot';
import RepoChrome from './RepoChrome';
import Screenshot from './Screenshot';
import CommitBars from './CommitBars';
import { ArrowIcon } from './Icons';

export default function ProjectCardFeatured({ project }: { project: Project }) {
  return (
    <Card pad={0} className="repo-card overflow-hidden flex flex-col relative">
      <RepoChrome filename={`projects/${project.slug}/README.md`} lang={project.lang} branch={project.branch} hash={project.hash}>
        <div className="relative overflow-hidden">
          <div className="repo-screenshot">
            <Screenshot
              title={project.screenshot.title}
              subtitle={project.screenshot.subtitle}
              tone={project.screenshot.tone}
              ratio="16/9"
              style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--line)' }}
            />
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(125,217,110,0.18), transparent 70%)' }} />
        </div>
      </RepoChrome>

      <div className="px-7 pt-6 pb-6 flex flex-col gap-3.5">
        <div className="flex justify-between items-baseline">
          <div className="flex gap-2 items-center">
            <Chip tone="accent">case study</Chip>
            {project.tag && <span className="font-mono text-[11px] text-fg-mid">{project.tag}</span>}
          </div>
          <span className="font-mono text-[11px] text-fg-dim">{project.year}</span>
        </div>

        <div>
          <h3 className="text-[32px] font-medium tracking-tight leading-[1.1] text-fg">{project.name}</h3>
          <span className="font-mono text-[12px] text-accent">{project.kicker}</span>
        </div>

        <p className="text-[14px] leading-relaxed text-fg-mid">{project.blurb}</p>

        <div className="flex justify-between items-center">
          <div className="flex gap-1.5 flex-wrap">
            {project.stack.map(s => (
              <Chip key={s}><LangDot name={s} size={7} />{s}</Chip>
            ))}
          </div>
          <Link href={`/projects/${project.slug}`} className="link-slide inline-flex items-center gap-1.5 font-mono text-[11px] text-fg cursor-pointer">
            read case study <ArrowIcon size={11} />
          </Link>
        </div>

        {project.metrics.length > 0 && (
          <div className="grid gap-2.5 border-t border-line pt-4" style={{ gridTemplateColumns: `repeat(${project.metrics.length}, 1fr)` }}>
            {project.metrics.map(([n, l]) => (
              <div key={l}>
                <div className="text-[20px] font-medium tracking-tight text-accent">{n}</div>
                <span className="font-mono text-[10.5px] text-fg-dim">{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-line px-4 py-2 flex justify-between items-center font-mono text-[10.5px] text-fg-dim bg-bg-elev-2">
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> deployed
          </span>
          <span>· UTF-8</span>
          <span>· LF</span>
        </span>
        <CommitBars h={12} />
      </div>
    </Card>
  );
}
```

- [ ] **Step 12.3:** `Components/ProjectCardCompact.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import type { Project } from '@/lib/portfolio';
import Card from './Card';
import Chip from './Chip';
import LangDot from './LangDot';
import RepoChrome from './RepoChrome';
import Screenshot from './Screenshot';

export default function ProjectCardCompact({ project }: { project: Project }) {
  const filename = '/' + project.slug;
  return (
    <Link href={`/projects/${project.slug}`} className="block">
      <Card pad={0} className="repo-card overflow-hidden flex flex-col flex-1">
        <RepoChrome filename={filename} lang={project.lang} branch={project.branch}>
          <div className="overflow-hidden">
            <div className="repo-screenshot">
              <Screenshot
                title={project.screenshot.title}
                subtitle={project.screenshot.subtitle}
                tone={project.screenshot.tone}
                ratio="16/10"
                style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--line)' }}
              />
            </div>
          </div>
        </RepoChrome>
        <div className="px-4.5 py-3.5 flex flex-col gap-2" style={{ paddingLeft: 18, paddingRight: 18 }}>
          <div className="flex justify-between items-baseline">
            <h4 className="text-[18px] font-medium tracking-tight text-fg">{project.name}</h4>
            <span className="font-mono text-[11px] text-fg-dim">{project.year}</span>
          </div>
          {project.tag && <span className="font-mono text-[11px] text-accent">{project.tag}</span>}
          <p className="text-[13px] leading-[1.55] text-fg-mid">{project.blurb}</p>
          <div className="mt-1 flex gap-1 flex-wrap">
            {project.stack.map(s => (
              <Chip key={s}><LangDot name={s} size={6} />{s}</Chip>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

---

### Task 13: Nav, Footer, AppLayout

**Files:**
- Create: `~/Herd/daps/resources/js/Components/Nav.tsx`
- Create: `~/Herd/daps/resources/js/Components/Footer.tsx`
- Create: `~/Herd/daps/resources/js/Layouts/AppLayout.tsx`

- [ ] **Step 13.1:** `Components/Nav.tsx`:

```tsx
import { Link, usePage } from '@inertiajs/react';
import Mark from './Mark';
import Kbd from './Kbd';
import StatusDot from './StatusDot';
import ThemeToggle from './ThemeToggle';
import type { PageProps } from '@inertiajs/core';

const ITEMS = [
  { k: 'home',    l: 'home',    n: '01', href: '/' },
  { k: 'work',    l: 'work',    n: '02', href: '/projects' },
  { k: 'about',   l: 'about',   n: '03', href: '/about' },
  { k: 'contact', l: 'contact', n: '04', href: '/contact' },
];

interface NavProps {
  active: 'home' | 'work' | 'about' | 'contact';
  dense?: boolean;
}

export default function Nav({ active, dense = false }: NavProps) {
  const { portfolio } = usePage<PageProps>().props;
  return (
    <nav
      className="flex items-center justify-between border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-50"
      style={{ padding: dense ? '14px 32px' : '20px 48px' }}
    >
      <div className="flex items-center gap-7">
        <Link href="/"><Mark handle={portfolio.identity.handle} /></Link>
        <span className="font-mono text-[11px] text-fg-dim">
          /<span className="text-fg ml-1">{active}</span>
        </span>
      </div>
      <div className="hidden md:flex items-center font-mono text-[12px]">
        {ITEMS.map(it => (
          <Link
            key={it.k}
            href={it.href}
            className={`px-3.5 py-1.5 inline-flex items-center gap-1.5 relative ${active === it.k ? 'text-fg' : 'text-fg-dim hover:text-fg'} transition-colors`}
          >
            <span className="text-fg-fade text-[10px]">{it.n}</span>
            <span>{it.l}</span>
            {active === it.k && <span className="w-1 h-1 rounded-full bg-accent" />}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3.5">
        <ThemeToggle />
        <Kbd>⌘K</Kbd>
        <div className="hidden lg:inline-flex"><StatusDot>{portfolio.identity.available.label}</StatusDot></div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 13.2:** `Components/Footer.tsx`:

```tsx
import { usePage } from '@inertiajs/react';
import { GithubIcon, LinkedinIcon, MailIcon } from './Icons';
import type { PageProps } from '@inertiajs/core';

export default function Footer() {
  const { portfolio } = usePage<PageProps>().props;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line px-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-[11px] text-fg-dim">
      <div className="flex flex-col gap-1">
        <span className="text-fg">© {year} {portfolio.identity.name}</span>
        <span>built with Laravel · Inertia · React</span>
      </div>
      <div className="flex items-center gap-4">
        <a href={portfolio.links.github} className="ulink link-slide" target="_blank" rel="noreferrer">
          <GithubIcon /> github
        </a>
        <a href={portfolio.links.linkedin} className="ulink link-slide" target="_blank" rel="noreferrer">
          <LinkedinIcon /> linkedin
        </a>
        <a href={`mailto:${portfolio.links.email}`} className="ulink link-slide">
          <MailIcon /> {portfolio.links.email}
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 13.3:** `Layouts/AppLayout.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';
import Nav from '@/Components/Nav';
import Footer from '@/Components/Footer';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  active: 'home' | 'work' | 'about' | 'contact';
}

export default function AppLayout({ children, title, active }: AppLayoutProps) {
  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-bg text-fg">
        <Nav active={active} />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
```

---

## Phase 5 · Pages

### Task 14: Home page

**Files:**
- Create: `~/Herd/daps/resources/js/Pages/Home.tsx`
- Create: `~/Herd/daps/app/Http/Controllers/HomeController.php`
- Modify: `~/Herd/daps/routes/web.php`

- [ ] **Step 14.1:** Create `HomeController.php`:

```php
<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Home');
    }
}
```

- [ ] **Step 14.2:** Update `routes/web.php` — replace default `/` route, add all 5:

```php
<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/contact', [ContactController::class, 'create'])->name('contact.create');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
```

- [ ] **Step 14.3:** Create `Pages/Home.tsx`. This is the largest page. Build it section-by-section using the design's mocks-desktop.jsx HomeDesktop as visual reference:

```tsx
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import AppLayout from '@/Layouts/AppLayout';
import StatusDot from '@/Components/StatusDot';
import RepoBadge from '@/Components/RepoBadge';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Chip from '@/Components/Chip';
import LangDot from '@/Components/LangDot';
import SectionHead from '@/Components/SectionHead';
import CodeBlock from '@/Components/CodeBlock';
import ProjectCardFeatured from '@/Components/ProjectCardFeatured';
import ProjectCardCompact from '@/Components/ProjectCardCompact';
import CommitBars from '@/Components/CommitBars';
import { ArrowIcon, ArrowNEIcon, MailIcon, ExtIcon, GithubIcon, LinkedinIcon, CheckIcon } from '@/Components/Icons';

export default function Home() {
  const { portfolio } = usePage<PageProps>().props;
  const featured = portfolio.projects.find(p => p.featured) ?? portfolio.projects[0];
  const secondary = portfolio.projects.filter(p => !p.featured).slice(0, 2);
  const more = portfolio.projects.filter(p => !p.featured).slice(2, 5);

  return (
    <AppLayout title="Daniel Salipot — Portfolio" active="home">
      {/* HERO */}
      <section className="relative overflow-hidden px-12 pt-20 pb-14 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-14 items-center">
        <div className="grid-drift absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(125,125,125,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 75%)',
        }} />
        <div className="scanline" style={{ top: '12%' }} />

        <div className="relative anim-fadeUp">
          <div className="flex items-center gap-3.5 flex-wrap">
            <StatusDot>{portfolio.identity.available.label}</StatusDot>
            <span className="font-mono text-[11px] text-fg-dim">· {portfolio.identity.location.city} ({portfolio.identity.location.tz})</span>
            <span className="font-mono text-[11px] text-fg-fade">·</span>
            <RepoBadge branch="main" hash="a4f9c1d" />
          </div>

          <h1 className="font-sans font-medium text-[64px] md:text-[96px] leading-[0.98] tracking-tight text-fg mt-6">
            {portfolio.identity.name.replace(' Andrei ', ' ')}<span className="caret text-accent ml-1">.</span>
          </h1>
          <h2 className="font-sans text-[24px] md:text-[32px] leading-tight tracking-tight text-fg-mid mt-4 max-w-xl">
            Full-stack web developer shipping <span className="text-fg">Laravel</span>,
            <span className="text-fg"> IoT</span> and <span className="text-fg">real systems</span> end-to-end.
          </h2>

          <p className="text-[16px] leading-relaxed text-fg-mid mt-6 max-w-[560px]">
            Three years at <span className="text-fg">Rakso CT</span> building production school-management platforms,
            RFID cashless payments, and biometric-turnstile integrations.
            Summa Cum Laude, Adamson University.
          </p>

          <div className="flex gap-2.5 mt-7 flex-wrap">
            <Button kind="primary" size="lg" trailing={<ArrowIcon />} as="a" href="/projects">View selected work</Button>
            <Button kind="secondary" size="lg" icon={<MailIcon />} as="a" href={`mailto:${portfolio.links.email}`}>{portfolio.links.email}</Button>
            <Button kind="ghost" size="lg" trailing={<ExtIcon />} as="a" href="#">Resume.pdf</Button>
          </div>

          <div className="mt-8 flex gap-5 items-center font-mono text-[11px] text-fg-dim flex-wrap">
            <a className="ulink link-slide" href={portfolio.links.github} target="_blank" rel="noreferrer"><GithubIcon /> @danielsalipot</a>
            <a className="ulink link-slide" href={portfolio.links.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon /> daniel-salipot</a>
            <span className="text-fg-fade">·</span>
            <span>{portfolio.links.phone}</span>
          </div>
        </div>

        {/* Right column */}
        <div className="relative flex flex-col gap-4">
          <CodeBlock
            title="~ daniel.salipot — zsh"
            lines={[
              { p: '$', t: 'whoami' },
              { t: 'daniel salipot — full-stack web developer', strong: true },
              { p: '$', t: 'cat stack.json | jq' },
              { t: '{' },
              { t: '  "primary":  ["laravel", "livewire", "filament"],' },
              { t: '  "client":   ["react", "vue", "flutter"],' },
              { t: '  "data":     ["mysql", "redis"],' },
              { t: '  "iot":      ["rfid", "biometric", "turnstile"]' },
              { t: '}' },
              { p: '$', t: 'status' },
              { c: 'var(--accent)', t: '● open · accepting projects for q3 2026' },
            ]}
          />
          <Card pad={20}>
            <div className="grid grid-cols-3 gap-2">
              {portfolio.stats.map(s => (
                <div key={s.l}>
                  <div className="text-[28px] font-medium tracking-tight text-fg">{s.n}</div>
                  <span className="font-mono text-[10.5px] text-fg-dim">{s.l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* NOW */}
      <section className="px-12 pt-6 pb-16">
        <SectionHead n="01" title="now()" right="updated 14 may 2026" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-7 stagger-in">
          {portfolio.now.map(it => (
            <Card key={it.title} pad={20} className="repo-card">
              <span className="font-mono text-[10px] text-accent tracking-wider">// {it.label}</span>
              <div className="text-[20px] font-medium tracking-tight mt-2.5 text-fg">{it.title}</div>
              <p className="text-[13.5px] leading-relaxed text-fg-mid mt-1.5">{it.sub}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="px-12 pt-6 pb-16">
        <SectionHead n="02" title="selected_work" right={`2022 — 2026 · ${secondary.length + more.length + 1} of ${portfolio.projects.length}`} />
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 mt-7">
          <ProjectCardFeatured project={featured} />
          <div className="flex flex-col gap-4">
            {secondary.map(p => <ProjectCardCompact key={p.slug} project={p} />)}
          </div>
        </div>
        {more.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 stagger-in">
            {more.map(p => <ProjectCardCompact key={p.slug} project={p} />)}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button kind="ghost" trailing={<ArrowIcon size={12} />} as="a" href="/projects">All {portfolio.projects.length} projects</Button>
        </div>
      </section>

      {/* STACK */}
      <section className="px-12 pt-6 pb-16">
        <SectionHead n="03" title="stack.json" right="daily drivers · 2026" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-7 stagger-in">
          {Object.entries(portfolio.stack).map(([cat, items]) => (
            <Card key={cat} pad={18} className="repo-card">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10.5px] text-accent tracking-wider">// {cat}</span>
                <span className="font-mono text-[10px] text-fg-fade">{String(items.length).padStart(2, '0')}</span>
              </div>
              <ul className="mt-3.5 flex flex-col gap-2.5 list-none p-0">
                {items.map(([k, v]) => (
                  <li key={k} className="flex justify-between items-baseline text-[14px]">
                    <span className="text-fg inline-flex items-center gap-2">
                      <LangDot name={k.split(' ')[0]} size={7} />{k}
                    </span>
                    <span className="font-mono text-[10.5px] text-fg-dim">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="px-12 pt-6 pb-16">
        <SectionHead n="04" title="experience.log" right="most recent first" />
        <div className="mt-6">
          {portfolio.experience.map(e => (
            <div
              key={`${e.from}-${e.role}`}
              className="grid grid-cols-1 md:grid-cols-[180px_1.4fr_1fr_40px] gap-8 py-6 items-baseline border-t border-line"
            >
              <span className="font-mono text-[11px] text-accent">{e.from} — {e.to}</span>
              <div>
                <div className="text-[22px] font-medium tracking-tight text-fg">
                  {e.role} · <span className="text-fg-mid">{e.org}</span>
                </div>
                <span className="font-mono text-[11px] text-fg-dim">{e.loc}</span>
              </div>
              <div className="text-[14px] leading-relaxed text-fg-mid">{e.note}</div>
              <div className="text-right text-fg-mid"><ArrowNEIcon /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="px-12 pt-6 pb-16">
        <SectionHead n="05" title="achievements" right="awards · certs · honors" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {portfolio.achievements.map(a => (
            <Card key={`${a.yr}-${a.t}`} pad={18}>
              <span className="font-mono text-[10.5px] text-accent">{a.yr}</span>
              <div className="text-[18px] font-medium mt-2 tracking-tight text-fg">{a.t}</div>
              <div className="text-[13px] text-fg-mid mt-0.5">{a.where}</div>
              <p className="text-[12.5px] text-fg-dim mt-2.5 leading-snug">{a.note}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="px-12 pt-6 pb-24">
        <div className="border border-line rounded-2xl p-14 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, var(--bg-elev) 0%, var(--bg) 100%)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(rgba(125,217,110,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          <div className="relative">
            <span className="font-mono text-[11px] text-accent">// contact</span>
            <h2 className="font-sans font-medium text-[52px] leading-none tracking-tight mt-3 text-fg">
              Have a project<br />in mind?
            </h2>
            <p className="text-[16px] text-fg-mid mt-4 max-w-md leading-relaxed">
              Open for full-time and freelance starting <span className="text-fg">{portfolio.identity.available.since}</span>. Laravel / IoT / web platforms welcome — I reply within 48 hours.
            </p>
            <div className="mt-6 flex gap-2.5 flex-wrap">
              <Button kind="accent" size="lg" trailing={<ArrowNEIcon />} as="a" href={`mailto:${portfolio.links.email}`}>{portfolio.links.email}</Button>
              <Button kind="secondary" size="lg" icon={<LinkedinIcon />} as="a" href={portfolio.links.linkedin}>LinkedIn</Button>
            </div>
          </div>
          <div className="relative">
            <CodeBlock
              lines={[
                { p: '$', t: 'mail -s "hello daniel"' },
                { t: `  --to ${portfolio.links.email}` },
                { t: '' },
                { c: 'var(--accent)', t: '⌛ replies within 48h' },
              ]}
            />
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
```

- [ ] **Step 14.4:** Visit `https://daps.test/` in browser — confirm Home renders with all sections.

---

### Task 15: About page

**Files:**
- Create: `~/Herd/daps/app/Http/Controllers/AboutController.php`
- Create: `~/Herd/daps/resources/js/Pages/About.tsx`

- [ ] **Step 15.1:** `AboutController.php`:

```php
<?php
namespace App\Http\Controllers;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('About');
    }
}
```

- [ ] **Step 15.2:** `Pages/About.tsx` — bio block, skills grid, experience timeline, education. Build using SectionHead + Card primitives. (See mocks-desktop AboutDesktop for visual reference.) The implementation should iterate `portfolio.stack`, `portfolio.experience`, `portfolio.education`, `portfolio.certifications`.

```tsx
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Chip from '@/Components/Chip';
import LangDot from '@/Components/LangDot';
import SectionHead from '@/Components/SectionHead';
import CommitBars from '@/Components/CommitBars';
import { CheckIcon, ArrowNEIcon } from '@/Components/Icons';

export default function About() {
  const { portfolio } = usePage<PageProps>().props;
  return (
    <AppLayout title="About — Daniel Salipot" active="about">
      <section className="px-12 pt-16 pb-14 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-end">
        <div>
          <span className="font-mono text-[11px] text-accent">// 01 — about</span>
          <h1 className="font-sans font-medium text-[64px] md:text-[80px] leading-none tracking-tight mt-3.5 text-fg">
            Engineer first.<br /><span className="text-fg-mid">Designer when needed.</span>
          </h1>
        </div>
        <Card pad={0} className="overflow-hidden">
          <div className="aspect-[4/5] relative" style={{ background: 'linear-gradient(135deg, #15311f 0%, #0f1a14 100%)' }}>
            <div className="absolute inset-0 flex items-center justify-center font-sans text-[140px] font-medium text-accent tracking-tight">DS</div>
            <div className="absolute bottom-3.5 left-4 right-4 flex justify-between font-mono text-[10px] text-white/50">
              <span>portrait.jpg</span>
              <span>1080 × 1350</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="px-12 pt-6 pb-14">
        <SectionHead n="02" title="story" />
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_1.7fr] gap-12">
          <div>
            <h2 className="font-sans font-medium text-[32px] leading-tight tracking-tight text-fg">
              I build the <span className="text-accent">quiet parts</span> of web apps.
            </h2>
            <p className="mt-4 text-[13px] text-fg-dim font-mono leading-relaxed">
              based in {portfolio.identity.location.city}<br />
              {portfolio.identity.location.tz} · english + tagalog<br />
              open to remote · contract or full-time
            </p>
          </div>
          <div className="text-[16px] leading-[1.7] text-fg-mid flex flex-col gap-3.5">
            <p>I'm a full-stack web developer with three years of production experience. I came up at Adamson University, where I graduated <span className="text-fg">Summa Cum Laude</span> in IT and shipped my capstone — <span className="text-fg">OASYS</span>, an HRIS with payroll — as the Best of department.</p>
            <p>Since 2023 I've been at <span className="text-fg">Rakso CT</span> maintaining and extending large legacy systems: school management, cashless payments, attendance. I work solo on full builds (design → deploy) and lead client comms when the project needs it.</p>
            <p>I like the parts of software nobody asks about — error copy, loading states, ten-line scripts that save the team an hour a day. I care more about systems that ship than features that demo.</p>
          </div>
        </div>
      </section>

      <section className="px-12 pt-6 pb-14">
        <SectionHead n="03" title="skills" right="years × confidence" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(portfolio.stack).map(([cat, items]) => (
            <Card key={cat} pad={18}>
              <span className="font-mono text-[11px] text-accent">// {cat}</span>
              <ul className="mt-3.5 flex flex-col gap-2 list-none p-0">
                {items.map(([k, v]) => (
                  <li key={k} className="flex justify-between items-baseline text-[14px]">
                    <span className="text-fg">{k}</span>
                    <span className="font-mono text-[11px] text-fg-dim">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-12 pt-6 pb-14">
        <SectionHead n="04" title="experience" right="most recent first" />
        <div className="mt-4">
          {portfolio.experience.map(e => (
            <div
              key={`${e.from}-${e.role}`}
              className="grid grid-cols-1 md:grid-cols-[160px_1.3fr_1.6fr] gap-8 items-start py-6 border-t border-line"
            >
              <span className="font-mono text-[11px] text-accent">{e.from === '01.2023' ? '2023 — current' : '2022'}</span>
              <div>
                <div className="text-[22px] font-medium tracking-tight text-fg">{e.role}</div>
                <div className="text-[14px] text-fg-mid mt-0.5">{e.org} · {e.loc}</div>
              </div>
              <div>
                <p className="text-[14px] leading-relaxed text-fg-mid">{e.note}</p>
                <div className="mt-3 flex gap-1 flex-wrap">
                  {e.stack.map(s => <Chip key={s}><LangDot name={s} size={6} />{s}</Chip>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-12 pt-6 pb-20">
        <SectionHead n="05" title="education + certs" />
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <Card pad={22}>
            <span className="font-mono text-[11px] text-accent">// education</span>
            <div className="mt-4 flex flex-col gap-4">
              {portfolio.education.map(e => (
                <div key={e.yr} className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-4 items-baseline">
                  <span className="font-mono text-[11px] text-fg-dim">{e.yr}</span>
                  <div>
                    <div className="text-[18px] font-medium tracking-tight text-fg">{e.degree}</div>
                    <div className="text-[13px] text-fg-mid">{e.org}</div>
                    {e.gpa && <div className="font-mono text-[10.5px] text-fg-dim mt-1">gpa {e.gpa}</div>}
                  </div>
                  <Chip tone={e.active ? 'accent' : 'default'}>{e.honor}</Chip>
                </div>
              ))}
            </div>
          </Card>
          <Card pad={22}>
            <span className="font-mono text-[11px] text-accent">// certifications</span>
            <ul className="mt-3.5 flex flex-col gap-3 list-none p-0">
              {portfolio.certifications.map(c => (
                <li key={c.cred} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg inline-flex items-center justify-center font-mono font-semibold text-[14px] text-white" style={{ background: c.org_bg }}>{c.org_mark}</span>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium tracking-tight text-fg">{c.t}</div>
                    <div className="text-[12px] text-fg-mid">{c.sub} · {c.yr}</div>
                  </div>
                  <CheckIcon className="text-accent" />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
}
```

- [ ] **Step 15.3:** Visit `https://daps.test/about` — confirm About renders.

---

### Task 16: Projects index page

**Files:**
- Create: `~/Herd/daps/app/Http/Controllers/ProjectController.php`
- Create: `~/Herd/daps/resources/js/Pages/Projects/Index.tsx`

- [ ] **Step 16.1:** `ProjectController.php`:

```php
<?php
namespace App\Http\Controllers;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Projects/Index');
    }

    public function show(string $slug): Response
    {
        $projects = config('portfolio.projects');
        $project = Arr::first($projects, fn ($p) => $p['slug'] === $slug);
        if (! $project) {
            throw new NotFoundHttpException("Project [$slug] not found.");
        }
        return Inertia::render('Projects/Show', ['project' => $project]);
    }
}
```

- [ ] **Step 16.2:** `Pages/Projects/Index.tsx`:

```tsx
import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { PageProps } from '@inertiajs/core';
import AppLayout from '@/Layouts/AppLayout';
import ProjectCardCompact from '@/Components/ProjectCardCompact';
import Chip from '@/Components/Chip';
import LangDot from '@/Components/LangDot';
import SectionHead from '@/Components/SectionHead';

export default function ProjectsIndex() {
  const { portfolio } = usePage<PageProps>().props;
  const [filter, setFilter] = useState<string | null>(null);

  const allLangs = useMemo(() => {
    const set = new Set<string>();
    portfolio.projects.forEach(p => p.stack.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [portfolio.projects]);

  const filtered = filter
    ? portfolio.projects.filter(p => p.stack.includes(filter))
    : portfolio.projects;

  return (
    <AppLayout title="Work — Daniel Salipot" active="work">
      <section className="px-12 pt-16 pb-10">
        <span className="font-mono text-[11px] text-accent">// 01 — selected_work</span>
        <h1 className="font-sans font-medium text-[64px] md:text-[80px] leading-none tracking-tight mt-3.5 text-fg">
          Things I shipped.
        </h1>
        <p className="text-[16px] text-fg-mid mt-4 max-w-2xl">
          A timeline of {portfolio.projects.length} production builds and competition entries — Laravel, IoT, school platforms.
        </p>
      </section>

      <section className="px-12 pb-6">
        <div className="font-mono text-[12px] text-fg-mid flex items-center gap-3 flex-wrap border border-line rounded-lg px-4 py-3 bg-bg-elev">
          <span className="text-accent">$ filter</span>
          <button
            onClick={() => setFilter(null)}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === null ? 'bg-fg text-bg' : 'hover:text-fg'}`}
          >
            all
          </button>
          {allLangs.map(l => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-colors ${filter === l ? 'bg-fg text-bg' : 'hover:text-fg'}`}
            >
              <LangDot name={l} size={6} />{l}
            </button>
          ))}
        </div>
      </section>

      <section className="px-12 pb-24">
        <SectionHead n="02" title="grid" right={`${filtered.length} of ${portfolio.projects.length}`} />
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
          {filtered.map(p => <ProjectCardCompact key={p.slug} project={p} />)}
        </div>
        {filtered.length === 0 && (
          <div className="font-mono text-[13px] text-fg-mid mt-8">No projects match this filter.</div>
        )}
      </section>
    </AppLayout>
  );
}
```

- [ ] **Step 16.3:** Visit `https://daps.test/projects` — confirm grid + filter works.

---

### Task 17: Project case study page

**Files:**
- Create: `~/Herd/daps/resources/js/Pages/Projects/Show.tsx`

- [ ] **Step 17.1:** Create `Pages/Projects/Show.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import type { Project } from '@/lib/portfolio';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Chip from '@/Components/Chip';
import LangDot from '@/Components/LangDot';
import Screenshot from '@/Components/Screenshot';
import RepoChrome from '@/Components/RepoChrome';
import SectionHead from '@/Components/SectionHead';
import Button from '@/Components/Button';
import { ArrowIcon, ExtIcon } from '@/Components/Icons';

export default function ProjectShow({ project }: { project: Project }) {
  return (
    <AppLayout title={`${project.name} — Case study`} active="work">
      <section className="px-12 pt-16 pb-10">
        <Link href="/projects" className="link-slide font-mono text-[11px] text-fg-mid inline-flex items-center gap-1.5">
          <ArrowIcon className="rotate-180" /> all projects
        </Link>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 items-end">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Chip tone="accent">case study</Chip>
              {project.tag && <span className="font-mono text-[11px] text-fg-mid">{project.tag}</span>}
              <span className="font-mono text-[11px] text-fg-dim">· {project.year}</span>
            </div>
            <h1 className="font-sans font-medium text-[72px] leading-none tracking-tight mt-4 text-fg">{project.name}</h1>
            <p className="font-mono text-[14px] text-accent mt-2">{project.kicker}</p>
            <p className="text-[16px] text-fg-mid mt-5 max-w-2xl leading-relaxed">{project.blurb}</p>
            <div className="mt-5 flex gap-1.5 flex-wrap">
              {project.stack.map(s => <Chip key={s}><LangDot name={s} size={7} />{s}</Chip>)}
            </div>
          </div>
          {project.metrics.length > 0 && (
            <Card pad={22}>
              <span className="font-mono text-[11px] text-accent">// outcomes</span>
              <div className="mt-3.5 grid grid-cols-3 gap-3">
                {project.metrics.map(([n, l]) => (
                  <div key={l}>
                    <div className="text-[28px] font-medium tracking-tight text-fg">{n}</div>
                    <span className="font-mono text-[10.5px] text-fg-dim">{l}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>

      <section className="px-12 pb-10">
        <Card pad={0} className="overflow-hidden">
          <RepoChrome
            filename={`projects/${project.slug}/screenshots/01.png`}
            lang={project.lang} branch={project.branch} hash={project.hash}
          >
            <Screenshot
              title={project.screenshot.title}
              subtitle={project.screenshot.subtitle}
              tone={project.screenshot.tone}
              ratio="16/9"
              style={{ borderRadius: 0, border: 'none' }}
            />
          </RepoChrome>
        </Card>
      </section>

      <section className="px-12 pb-10">
        <SectionHead n="01" title="problem" />
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-fg-mid">{project.case_study.problem}</p>
      </section>

      <section className="px-12 pb-10">
        <SectionHead n="02" title="role" />
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-fg-mid">{project.case_study.role}</p>
      </section>

      <section className="px-12 pb-20">
        <SectionHead n="03" title="outcome" />
        <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-fg-mid">{project.case_study.outcome}</p>
        {(project.case_study.links.live || project.case_study.links.repo) && (
          <div className="mt-7 flex gap-3 flex-wrap">
            {project.case_study.links.live && (
              <Button kind="accent" size="lg" trailing={<ExtIcon />} as="a" href={project.case_study.links.live}>visit live</Button>
            )}
            {project.case_study.links.repo && (
              <Button kind="secondary" size="lg" trailing={<ExtIcon />} as="a" href={project.case_study.links.repo}>view repo</Button>
            )}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
```

- [ ] **Step 17.2:** Visit `https://daps.test/projects/oasys` — confirm case study renders.

---

### Task 18: Contact page + form

**Files:**
- Create: `~/Herd/daps/database/migrations/2026_05_28_000001_create_contacts_table.php`
- Create: `~/Herd/daps/app/Models/Contact.php`
- Create: `~/Herd/daps/app/Http/Requests/ContactRequest.php`
- Create: `~/Herd/daps/app/Mail/ContactFormMail.php`
- Create: `~/Herd/daps/resources/views/emails/contact.blade.php`
- Create: `~/Herd/daps/app/Http/Controllers/ContactController.php`
- Create: `~/Herd/daps/resources/js/Pages/Contact.tsx`

- [ ] **Step 18.1:** Migration `database/migrations/2026_05_28_000001_create_contacts_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->string('ip', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
```

- [ ] **Step 18.2:** Run migration:

```bash
cd ~/Herd/daps && php artisan migrate
```
Expected: `Migrated: 2026_05_28_000001_create_contacts_table`.

- [ ] **Step 18.3:** `app/Models/Contact.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = ['name', 'email', 'subject', 'message', 'ip'];
}
```

- [ ] **Step 18.4:** `app/Http/Requests/ContactRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'max:120'],
            'email'   => ['required', 'email:rfc', 'max:200'],
            'subject' => ['nullable', 'string', 'max:200'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            // honeypot
            'website' => ['nullable', 'size:0'],
        ];
    }
}
```

- [ ] **Step 18.5:** `app/Mail/ContactFormMail.php`:

```php
<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactFormMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Contact $contact) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Portfolio contact: ' . ($this->contact->subject ?: 'no subject'),
            replyTo: [$this->contact->email],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.contact');
    }
}
```

- [ ] **Step 18.6:** `resources/views/emails/contact.blade.php`:

```blade
<x-mail::message>
# New contact from {{ $contact->name }}

**Email:** {{ $contact->email }}
**Subject:** {{ $contact->subject ?: '(none)' }}
**IP:** {{ $contact->ip ?: '(unknown)' }}
**Time:** {{ $contact->created_at->format('Y-m-d H:i:s') }}

---

{{ $contact->message }}

Thanks,<br>
DAPS Portfolio
</x-mail::message>
```

- [ ] **Step 18.7:** Publish mail components: `cd ~/Herd/daps && php artisan vendor:publish --tag=laravel-mail`. (Skip silently if components are already available — Laravel 11+ ships them by default in some versions.)

- [ ] **Step 18.8:** `app/Http/Controllers/ContactController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Mail\ContactFormMail;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Contact');
    }

    public function store(ContactRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['website']); // strip honeypot

        $contact = Contact::create([
            ...$data,
            'ip' => $request->ip(),
        ]);

        Mail::to(config('portfolio.links.email'))->send(new ContactFormMail($contact));

        return back()->with('contact', 'sent');
    }
}
```

- [ ] **Step 18.9:** Set `MAIL_MAILER=log` in `.env` (Herd-default is usually log already in dev). Verify:

```bash
cd ~/Herd/daps && grep '^MAIL_MAILER' .env
```
If missing or set to `smtp`, change to `MAIL_MAILER=log`.

- [ ] **Step 18.10:** `resources/js/Pages/Contact.tsx`:

```tsx
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import type { PageProps } from '@inertiajs/core';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import SectionHead from '@/Components/SectionHead';
import CodeBlock from '@/Components/CodeBlock';
import { ArrowNEIcon, MailIcon, GithubIcon, LinkedinIcon, CheckIcon } from '@/Components/Icons';

export default function Contact() {
  const { portfolio, flash } = usePage<PageProps>().props;
  const sent = flash?.contact === 'sent';
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '', email: '', subject: '', message: '', website: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/contact', { onSuccess: () => reset('name','email','subject','message') });
  };

  return (
    <AppLayout title="Contact — Daniel Salipot" active="contact">
      <section className="px-12 pt-16 pb-10 max-w-5xl">
        <span className="font-mono text-[11px] text-accent">// 01 — contact</span>
        <h1 className="font-sans font-medium text-[64px] md:text-[80px] leading-none tracking-tight mt-3.5 text-fg">Let's talk.</h1>
        <p className="text-[16px] text-fg-mid mt-5 max-w-2xl leading-relaxed">
          Available {portfolio.identity.available.since} for full-time and freelance. Laravel / IoT / school platforms welcome. I reply within 48 hours.
        </p>
      </section>

      <section className="px-12 pb-24 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
        <Card pad={28}>
          <SectionHead n="02" title="message.form" />
          {sent && (
            <div className="mt-5 p-4 rounded-lg border border-accent/30 bg-[var(--accent-sage)] font-mono text-[12px] text-accent inline-flex items-center gap-2.5">
              <CheckIcon /> Message sent. I'll reply within 48 hours.
            </div>
          )}
          <form onSubmit={submit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="name" error={errors.name}>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required
                     className="w-full bg-bg-elev-2 border border-line text-fg rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-line-strong" />
            </Field>
            <Field label="email" error={errors.email}>
              <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required
                     className="w-full bg-bg-elev-2 border border-line text-fg rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-line-strong" />
            </Field>
            <div className="md:col-span-2">
              <Field label="subject (optional)" error={errors.subject}>
                <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)}
                       className="w-full bg-bg-elev-2 border border-line text-fg rounded-lg px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-line-strong" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="message" error={errors.message}>
                <textarea rows={6} value={data.message} onChange={e => setData('message', e.target.value)} required
                          className="w-full bg-bg-elev-2 border border-line text-fg rounded-lg px-3.5 py-3 text-[14px] focus:outline-none focus:border-line-strong resize-y" />
              </Field>
            </div>
            {/* honeypot */}
            <input type="text" name="website" value={data.website} onChange={e => setData('website', e.target.value)}
                   className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="md:col-span-2 flex justify-end gap-2.5 items-center">
              <span className="font-mono text-[11px] text-fg-dim mr-auto">replies within 48h</span>
              <Button kind="accent" size="lg" type="submit" disabled={processing} trailing={<ArrowNEIcon />}>
                {processing ? 'sending…' : 'send message'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-4">
          <Card pad={22}>
            <span className="font-mono text-[11px] text-accent">// or skip the form</span>
            <ul className="mt-3.5 flex flex-col gap-2.5 list-none p-0">
              <li>
                <a href={`mailto:${portfolio.links.email}`} className="ulink link-slide text-[14px]">
                  <MailIcon /> {portfolio.links.email}
                </a>
              </li>
              <li>
                <a href={portfolio.links.github} target="_blank" rel="noreferrer" className="ulink link-slide text-[14px]">
                  <GithubIcon /> github.com/danielsalipot
                </a>
              </li>
              <li>
                <a href={portfolio.links.linkedin} target="_blank" rel="noreferrer" className="ulink link-slide text-[14px]">
                  <LinkedinIcon /> linkedin.com/in/daniel-salipot
                </a>
              </li>
              <li className="font-mono text-[12px] text-fg-dim mt-1">{portfolio.links.phone}</li>
            </ul>
          </Card>
          <CodeBlock
            title="response.txt"
            lines={[
              { t: 'mon–fri · 09:00–18:00 PHT', strong: true },
              { t: 'avg first-reply · 12 hours' },
              { t: '' },
              { c: 'var(--accent)', t: '● open · accepting projects' },
            ]}
          />
        </div>
      </section>
    </AppLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-fg-dim">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="font-mono text-[11px] text-red-400 mt-1 block">{error}</span>}
    </label>
  );
}
```

- [ ] **Step 18.11:** Visit `https://daps.test/contact`, fill the form, submit. Then verify:

```bash
cd ~/Herd/daps && php artisan tinker --execute="dump(App\Models\Contact::latest()->first());" && tail -50 storage/logs/laravel.log
```
Expected: latest Contact row exists; log contains "Portfolio contact:" entry with name/email/message.

---

## Phase 6 · Final verification

### Task 19: Manual verification of all pages and theme toggle

- [ ] **Step 19.1:** Start dev mode (Vite HMR):

```bash
cd ~/Herd/daps && npm run dev
```
Run in background.

- [ ] **Step 19.2:** Open `https://daps.test/` in browser. Verify each page renders without console errors:
  - `/` — Home (hero, now, work, stack, experience, achievements, CTA)
  - `/about` — About (hero, story, skills, experience, education+certs)
  - `/projects` — Projects index (filter bar, grid)
  - `/projects/oasys` — Case study (hero, screenshot, problem/role/outcome)
  - `/projects/rakso-cashless`, `/projects/hack4impact`, etc. — all 6 projects accessible
  - `/contact` — Contact (form, sidebar)

- [ ] **Step 19.3:** Click the theme toggle in nav — verify EVERY page flips colors correctly. Refresh page — theme persists.

- [ ] **Step 19.4:** Submit contact form — verify success state + email entry in log + DB row.

- [ ] **Step 19.5:** Mobile viewport (Chrome dev tools, 390px width) — verify every page reflows reasonably. Nav links may need to hide on small screens (the `hidden md:flex` classes handle this); the hero stacks vertically.

- [ ] **Step 19.6:** Visit a non-existent project: `/projects/nonexistent` — verify 404.

---

## Open items / known cuts

- **Mobile nav menu**: For viewport < 768px, the desktop nav links hide; there's no hamburger menu replacement in this scope. The site is browsable via the wordmark linking back to `/` and the contact CTA buttons, but a dedicated mobile menu is a follow-up.
- **Resume.pdf**: The "Resume.pdf" button in the hero links to `#`. Drop the PDF into `public/resume.pdf` later and change the href.
- **Real screenshots**: All projects use the gradient `Screenshot` placeholder. Adding real images is a follow-up.
- **Real GitHub/LinkedIn URLs**: The placeholders in `config/portfolio.php` use generic paths — update once you confirm the actual handles.

## Self-review

**Spec coverage:**
- ✅ 5 pages → Tasks 14–18
- ✅ Dark/light theme with toggle → Tasks 5, 7
- ✅ Functional contact form with mail + DB → Task 18
- ✅ Content in `config/portfolio.php` → Task 2
- ✅ Inertia shared props → Tasks 3, 4
- ✅ Design tokens + animations → Task 5
- ✅ Component library matching design → Tasks 8–13
- ✅ Routes → Task 14 (web.php updated)
- ✅ Tailwind v3 + Vite + TypeScript → Task 1 (scaffold)

**Placeholder scan:** None — every step has concrete code.

**Type consistency:** `Project`, `Portfolio`, `ScreenshotTone` defined in Task 4 and used consistently in components and pages.

**Scope check:** Focused for one session. Skipped Filament admin, SSR, real screenshots, tests (per spec).
