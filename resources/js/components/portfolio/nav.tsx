import { NAV_ITEMS, type NavKey } from '@/lib/nav-items';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon, MenuIcon } from './icons';
import Kbd from './kbd';
import Mark from './mark';
import StatusDot from './status-dot';
import ThemeToggle from './theme-toggle';

interface NavProps {
    active: NavKey;
}

export default function Nav({ active }: NavProps) {
    const { portfolio } = usePage<SharedData>().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const sentinel = useRef<HTMLDivElement>(null);

    // A zero-height marker at the very top of the document. While it is in
    // view the page is unscrolled and the bar stays transparent over the hero.
    // IntersectionObserver rather than a scroll listener, so nothing runs per frame.
    useEffect(() => {
        const el = sentinel.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Close on route change (Inertia's success event fires after navigation completes).
    // Also locks body scroll while open so the page underneath doesn't move.
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDrawerOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [drawerOpen]);

    return (
        <>
            <div ref={sentinel} aria-hidden="true" className="pointer-events-none absolute top-0 h-px w-full" />

            <nav
                className={`sticky top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center bg-transparent px-6 py-4 transition-colors duration-300 md:px-12 md:py-5 ${
                    scrolled ? 'border-line border-b backdrop-blur' : 'border-b border-transparent'
                }`}
            >
                <div className="flex items-center gap-7 justify-self-start">
                    <Link href="/">
                        <Mark handle={portfolio.identity.handle} />
                    </Link>
                    <span className="text-fg-dim hidden font-mono text-[11px] md:inline">
                        /<span className="text-fg ml-1">{active}</span>
                    </span>
                </div>

                {/* Desktop nav links */}
                <div className="hidden items-center font-mono text-[12px] justify-self-center md:flex">
                    {NAV_ITEMS.map((it) => (
                        <Link
                            key={it.k}
                            href={it.href}
                            className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 ${active === it.k ? 'text-fg' : 'text-fg-dim hover:text-fg'} transition-colors`}
                        >
                            <span className="text-fg-fade text-[10px]">{it.n}</span>
                            <span>{it.l}</span>
                            {active === it.k && <span className="bg-portfolio-accent h-1 w-1 rounded-full" />}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2.5 justify-self-end md:gap-3.5">
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() =>
                            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
                        }
                        aria-label="Open command palette"
                        className="cursor-pointer"
                    >
                        <Kbd>⌘K</Kbd>
                    </button>
                    <div className="hidden lg:inline-flex">
                        <StatusDot>{portfolio.identity.available.label}</StatusDot>
                    </div>
                    {/* Hamburger — mobile only */}
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={drawerOpen}
                        className="bg-bg-elev text-fg border-line hover:border-line-strong inline-flex items-center justify-center rounded-md border p-1.5 md:hidden"
                    >
                        <MenuIcon />
                    </button>
                </div>
            </nav>

            {/* Mobile drawer — slides from right, with backdrop */}
            <div
                className={`fixed inset-0 z-50 md:hidden ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!drawerOpen}
            >
                {/* Backdrop */}
                <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setDrawerOpen(false)}
                    className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Drawer panel */}
                <aside
                    className={`bg-bg border-line absolute top-0 right-0 bottom-0 flex w-[78%] max-w-sm flex-col border-l shadow-2xl transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="border-line flex items-center justify-between border-b px-5 py-4">
                        <Mark handle={portfolio.identity.handle} only />
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Close menu"
                            className="bg-bg-elev text-fg-mid hover:text-fg border-line inline-flex items-center justify-center rounded-md border p-1.5"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <ul className="flex flex-col gap-1 p-3">
                        {NAV_ITEMS.map((it) => (
                            <li key={it.k}>
                                <Link
                                    href={it.href}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`flex items-baseline gap-3 rounded-md px-3 py-3 font-mono text-[15px] transition-colors ${
                                        active === it.k
                                            ? 'bg-bg-elev text-fg'
                                            : 'text-fg-mid hover:bg-bg-elev hover:text-fg'
                                    }`}
                                >
                                    <span className="text-fg-fade text-[11px]">{it.n}</span>
                                    <span className="flex-1">{it.l}</span>
                                    {active === it.k && <span className="bg-portfolio-accent h-1.5 w-1.5 rounded-full" />}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="border-line mt-auto border-t p-5">
                        <StatusDot>{portfolio.identity.available.label}</StatusDot>
                        <div className="text-fg-dim mt-3 font-mono text-[11px]">
                            <div>{portfolio.identity.location.city}</div>
                            <div>{portfolio.links.email}</div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}
