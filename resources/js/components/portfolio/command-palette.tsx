import { NAV_ITEMS } from '@/lib/nav-items';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

/**
 * A single entry in the command palette.
 * - `id` is unique (used as React key + filtering anchor)
 * - `label` is what's displayed prominently
 * - `kind` is shown as a small mono tag on the right ("page", "project", "action")
 * - `keywords` are extra strings the search query matches against (not displayed)
 * - `run` is what happens when the entry is chosen
 */
export interface PaletteEntry {
    id: string;
    label: string;
    sub?: string;
    kind: 'page' | 'project' | 'action';
    keywords?: string[];
    run: () => void;
}

export default function CommandPalette() {
    const { portfolio } = usePage<SharedData>().props;
    const { updateAppearance } = useAppearance();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // ──────────────────────────────────────────────────────────────────────
    // Palette entries - pages + projects + actions.
    // This is the single most "you"-shaped part of the feature: what should
    // visitors be able to jump to or do? See the comment in this file's call
    // site (PortfolioLayout) for the full rationale.
    // ──────────────────────────────────────────────────────────────────────
    const entries = useMemo<PaletteEntry[]>(
        () =>
            buildEntries({
                portfolio,
                toggleTheme: () => updateAppearance(document.documentElement.classList.contains('dark') ? 'light' : 'dark'),
                copyEmail: () => navigator.clipboard?.writeText(portfolio.links.email),
                downloadResume: () => window.open('/resume.pdf', '_blank'),
            }),
        [portfolio, updateAppearance]
    );

    // Filtered + ranked entries (simple substring match over label + keywords)
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return entries;
        return entries.filter((e) => {
            const haystack = [e.label, e.sub ?? '', ...(e.keywords ?? []), e.kind].join(' ').toLowerCase();
            return haystack.includes(q);
        });
    }, [query, entries]);

    // ⌘K (mac) / Ctrl+K (others) toggles the palette
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((v) => !v);
                return;
            }
            if (!open) return;
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected((i) => Math.min(i + 1, filtered.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected((i) => Math.max(i - 1, 0));
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const item = filtered[selected];
                if (item) {
                    item.run();
                    setOpen(false);
                    setQuery('');
                    setSelected(0);
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, filtered, selected]);

    // Focus the input + reset selection when opened
    useEffect(() => {
        if (open) {
            setSelected(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    // Reset selection whenever the query changes (otherwise it can be out of range)
    useEffect(() => setSelected(0), [query]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[15vh]" role="dialog" aria-modal="true">
            <button
                type="button"
                aria-label="Close command palette"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="bg-bg-elev border-line relative w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl">
                {/* Search input */}
                <div className="border-line flex items-center gap-3 border-b px-4 py-3">
                    <span className="text-portfolio-accent font-mono text-[13px]">$</span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="search pages, projects, actions…"
                        className="text-fg placeholder:text-fg-dim w-full bg-transparent font-mono text-[14px] outline-none"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <span className="text-fg-dim hidden font-mono text-[10px] sm:inline">ESC to close</span>
                </div>

                {/* Results */}
                <ul className="max-h-[55vh] list-none overflow-y-auto p-2">
                    {filtered.length === 0 && (
                        <li className="text-fg-dim px-3 py-6 text-center font-mono text-[12px]">no matches for "{query}"</li>
                    )}
                    {filtered.map((e, idx) => (
                        <li key={e.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    e.run();
                                    setOpen(false);
                                    setQuery('');
                                    setSelected(0);
                                }}
                                onMouseEnter={() => setSelected(idx)}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                                    idx === selected ? 'bg-bg-elev-2 text-fg' : 'text-fg-mid'
                                }`}
                            >
                                <KindBadge kind={e.kind} />
                                <div className="min-w-0 flex-1">
                                    <div className="text-fg truncate text-[13.5px] font-medium">{e.label}</div>
                                    {e.sub && <div className="text-fg-dim truncate font-mono text-[11px]">{e.sub}</div>}
                                </div>
                                {idx === selected && (
                                    <span className="text-fg-dim font-mono text-[10px]">⏎</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Footer hints */}
                <div className="border-line text-fg-dim flex items-center justify-between border-t px-4 py-2 font-mono text-[10.5px]">
                    <span>{filtered.length} of {entries.length}</span>
                    <span className="flex items-center gap-3">
                        <span>↑↓ navigate</span>
                        <span>⏎ select</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

function KindBadge({ kind }: { kind: PaletteEntry['kind'] }) {
    const styles: Record<PaletteEntry['kind'], string> = {
        page: 'bg-bg-elev-2 text-fg-mid border-line',
        project: 'bg-portfolio-accent/15 text-portfolio-accent border-portfolio-accent/25',
        action: 'bg-bg text-fg-mid border-line',
    };
    return (
        <span className={`inline-flex w-[60px] justify-center rounded border px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-wider ${styles[kind]}`}>
            {kind}
        </span>
    );
}

// ──────────────────────────────────────────────────────────────────────
// Palette entry builder - this is the customizable bit.
// Change what gets surfaced by editing this function (or pull it into
// a separate file if the list grows large).
// ──────────────────────────────────────────────────────────────────────
function buildEntries(opts: {
    portfolio: SharedData['portfolio'];
    toggleTheme: () => void;
    copyEmail: () => void;
    downloadResume: () => void;
}): PaletteEntry[] {
    const { portfolio, toggleTheme, copyEmail, downloadResume } = opts;

    const pages: PaletteEntry[] = NAV_ITEMS.map((it) => ({
        id: `page:${it.k}`,
        label: it.l,
        sub: it.sub,
        kind: 'page',
        keywords: [it.k, it.n, 'navigate', 'go to'],
        run: () => router.visit(it.href),
    }));

    const projects: PaletteEntry[] = portfolio.projects.map((p) => ({
        id: `project:${p.slug}`,
        label: p.name,
        sub: `${p.kicker} · ${p.year}`,
        kind: 'project',
        keywords: [p.slug, ...p.stack, p.kicker, p.year],
        run: () => router.visit(`/projects/${p.slug}`),
    }));

    const actions: PaletteEntry[] = [
        {
            id: 'action:toggle-theme',
            label: 'Toggle theme',
            sub: 'switch between dark and light',
            kind: 'action',
            keywords: ['dark', 'light', 'appearance', 'mode'],
            run: toggleTheme,
        },
        {
            id: 'action:copy-email',
            label: 'Copy email address',
            sub: portfolio.links.email,
            kind: 'action',
            keywords: ['mail', 'contact', 'clipboard'],
            run: copyEmail,
        },
        {
            id: 'action:download-resume',
            label: 'Open résumé (PDF)',
            sub: '/resume.pdf',
            kind: 'action',
            keywords: ['cv', 'download', 'pdf'],
            run: downloadResume,
        },
        {
            id: 'action:github',
            label: 'Visit GitHub profile',
            sub: portfolio.links.github,
            kind: 'action',
            keywords: ['github', 'repos', 'code'],
            run: () => window.open(portfolio.links.github, '_blank'),
        },
        {
            id: 'action:linkedin',
            label: 'Visit LinkedIn',
            sub: portfolio.links.linkedin,
            kind: 'action',
            keywords: ['linkedin', 'social'],
            run: () => window.open(portfolio.links.linkedin, '_blank'),
        },
    ];

    return [...pages, ...projects, ...actions];
}
