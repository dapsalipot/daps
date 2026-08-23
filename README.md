<div align="center">

# daniel.salipot

**Software engineer · production web systems · hardware integration**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat-square)](https://inertiajs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

A personal portfolio built as a single-repo Laravel + Inertia + React app —
server-rendered routing, SPA navigation, zero API layer.

</div>

---

## `$ cat about.md`

This is the source for **[daps.test](http://daps.test)** (locally) — a developer
portfolio for **Daniel Andrei Salipot**, a software engineer building production
web systems with hardware integration (RFID, biometric, turnstile, QR).

The design started as a [Claude Design](https://claude.ai) handoff bundle
(HTML/CSS/JS prototypes) and was rebuilt component-by-component into idiomatic
Inertia + React, then iterated on with real content pulled from an actual system
manual (see `/projects/oasys`).

## `$ ls features/`

- **5 pages** — Home, About, Projects (index + case study), Contact
- **Dark / light theme** — CSS-variable driven, persisted via `localStorage`, no flash on load
- **Functional contact form** — Inertia `useForm` → Laravel validation → DB persistence + Markdown email
- **⌘K command palette** — jump to any page/project, keyboard-first navigation
- **Mobile nav drawer** — slide-in menu with focus trap and route-close behavior
- **OASYS case study** — real screenshots + module breakdown pulled from an actual system manual
- **Motion, tastefully applied**:
  - Live-typing hero terminal (looping, human-jitter timing)
  - One-time boot sequence on first visit (`sessionStorage`-gated)
  - Interactive canvas grid background — dots repel from the cursor, spring back on release
  - Scroll-triggered reveals, page-transition fades, scroll-progress bar
  - Stat counters that "compile" up, GitHub-style tech marquee
- **Content-driven** — all copy/projects/experience live in `config/portfolio.php`, shared to every page via Inertia middleware. No hardcoded strings in components.

## `$ cat stack.json`

```json
{
  "backend":  ["Laravel 12", "PHP 8.2+", "SQLite"],
  "frontend": ["Inertia.js 2", "React 19", "TypeScript 5.7"],
  "styling":  ["Tailwind CSS 4", "CSS variables for theming"],
  "tooling":  ["Vite 6", "ESLint", "Prettier"],
  "hosting":  ["Laravel Herd (local)"]
}
```

## `$ tree resources/js`

```
resources/js/
├── pages/                    Inertia page components (home, about, contact, projects/*)
├── layouts/
│   └── portfolio-layout.tsx  Nav + footer + theme + grid background + boot sequence
├── components/portfolio/     Design-system primitives (Card, Chip, CodeBlock, LangDot, …)
├── hooks/                    useTheme, useTypewriter, useCountUp, useRevealOnScroll
├── lib/                      lang-colors, hero-terminal-script, nav-items
└── types/                    Portfolio content types (mirrors config/portfolio.php)
```

## `$ ./setup.sh`

Requires PHP 8.2+, Composer, Node 20+, and [Laravel Herd](https://herd.laravel.com)
(or any local PHP dev environment).

```bash
git clone https://github.com/danielsalipot/daps.git
cd daps

composer install
npm install

cp .env.example .env
php artisan key:generate
php artisan migrate

npm run dev        # Vite dev server with HMR
# or
npm run build      # production bundle
```

With Herd, the app is served automatically at `daps.test` — no `artisan serve` needed.

## `$ cat config/portfolio.php | head`

All resume content — identity, links, projects, stack, experience, education,
certifications, achievements — lives in one PHP config file and flows to every
page as a shared Inertia prop. Update your resume by editing one file; no
component touches needed.

```php
return [
    'identity' => [
        'name' => 'Daniel Andrei Salipot',
        'role' => 'Software engineer building production web systems with hardware integration.',
        // ...
    ],
    'projects' => [ /* ... */ ],
    'experience' => [ /* ... */ ],
    // ...
];
```

## `$ echo $CONTACT`

- **Email** — danielsalipot@gmail.com
- **LinkedIn** — [linkedin.com/in/daniel-salipot](https://linkedin.com/in/daniel-salipot)
- **GitHub** — [github.com/danielsalipot](https://github.com/danielsalipot)

---

<div align="center">

Built solo, top to bottom — design, backend, frontend, content, deployment.

</div>
