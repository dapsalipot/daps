import type { Project } from '@/types';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Chip from './chip';
import { ArrowIcon } from './icons';
import LangDot from './lang-dot';
import MacWindow from './mac-window';
import Screenshot from './screenshot';

/**
 * Scroll-driven coverflow. The section is tall; the carousel sticks inside it
 * and the active card advances as the page scrolls, so the set revolves under
 * the reader's own scroll. Once the last card is reached the section releases
 * and the page continues normally.
 *
 * Progress comes from one IntersectionObserver over per-card sentinels rather
 * than a scroll listener: the observer only fires on crossings, so there is no
 * per-frame work on the main thread.
 */

const SPACING = 94;      // % of card width each neighbour steps aside
const SCALE_STEP = 0.17; // scale lost per step from centre
const OPACITY_STEP = 0.38;
const ROTATE = 22;       // deg of Y-rotation per step
const VISIBLE = 2;       // steps rendered either side of centre
const STEP_VH = 42;      // scroll distance that advances one card

export default function WorkCarousel({ projects }: { projects: Project[] }) {
    const n = projects.length;
    const [active, setActive] = useState(0);
    const [reduced, setReduced] = useState(false);
    const sentinels = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    // Each sentinel owns one card's slice of scroll. The one crossing the
    // viewport's middle line decides the active card.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (!e.isIntersecting) return;
                    const i = Number((e.target as HTMLElement).dataset.index);
                    if (!Number.isNaN(i)) setActive(i);
                });
            },
            // A thin band across the viewport's middle; exactly one sentinel spans it.
            { rootMargin: '-49.5% 0px -49.5% 0px', threshold: 0 },
        );
        sentinels.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [n]);

    // Controls move the page, so scroll position stays the source of truth.
    const goTo = useCallback((i: number) => {
        const el = sentinels.current[Math.max(0, Math.min(n - 1, i))];
        if (!el) return;
        const r = el.getBoundingClientRect();
        window.scrollTo({
            top: window.scrollY + r.top + r.height / 2 - window.innerHeight / 2,
            behavior: reduced ? 'auto' : 'smooth',
        });
    }, [n, reduced]);

    const offsetOf = (i: number) => i - active;

    return (
        <section
            className="relative"
            style={{ height: `calc(${n * STEP_VH}vh + 60vh)` }}
            aria-roledescription="carousel"
            aria-label="Selected work"
        >
            {/* Scroll slices, one per card */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div style={{ height: '30vh' }} />
                {projects.map((p, i) => (
                    <div
                        key={p.slug}
                        data-index={i}
                        ref={(el) => { sentinels.current[i] = el; }}
                        style={{ height: `${STEP_VH}vh` }}
                    />
                ))}
            </div>

            {/* Pinned stage */}
            <div className="sticky top-0 flex h-[100dvh] flex-col items-center justify-center overflow-hidden">
                <div
                    className="relative mx-auto h-[430px] w-full max-w-[1600px] sm:h-[540px] lg:h-[672px]"
                    style={{ perspective: '1800px' }}
                >
                    {projects.map((p, i) => {
                        const o = offsetOf(i);
                        const dist = Math.abs(o);
                        const hidden = dist > VISIBLE;
                        const isActive = o === 0;

                        return (
                            <div
                                key={p.slug}
                                data-active={isActive}
                                aria-hidden={hidden}
                                onClick={() => (isActive ? router.visit(`/projects/${p.slug}`) : goTo(i))}
                                className="group absolute top-0 left-1/2 w-[86vw] max-w-[560px] cursor-pointer sm:w-[70vw] lg:w-[680px] lg:max-w-[720px]"
                                style={{
                                    transform: `translateX(-50%) translateX(${o * SPACING}%) scale(${Math.max(0.55, 1 - dist * SCALE_STEP)}) rotateY(${-o * ROTATE}deg)`,
                                    opacity: hidden ? 0 : Math.max(0, 1 - dist * OPACITY_STEP),
                                    zIndex: n - dist,
                                    pointerEvents: hidden ? 'none' : 'auto',
                                    transition: reduced
                                        ? 'none'
                                        : 'transform 620ms cubic-bezier(.22,.75,.28,1), opacity 480ms ease',
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform, opacity',
                                }}
                            >
                                <MacWindow
                                    title={p.screenshot.title}
                                    muted={!isActive}
                                    className="h-full"
                                    style={isActive ? undefined : { boxShadow: '0 8px 30px -12px rgba(0,0,0,.4)' }}
                                >
                                    <div className="overflow-hidden">
                                        {p.case_study.screenshots?.length ? (
                                            <img
                                                src={p.case_study.screenshots[0].src}
                                                alt={p.case_study.screenshots[0].alt}
                                                loading="lazy"
                                                draggable={false}
                                                className="block aspect-[16/10] w-full object-cover object-top"
                                            />
                                        ) : (
                                            <Screenshot
                                                title={p.screenshot.title}
                                                subtitle={p.screenshot.subtitle}
                                                tone={p.screenshot.tone}
                                                ratio="16/10"
                                                style={{ borderRadius: 0, border: 'none' }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2.5 p-5">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <h3 className="text-fg text-[21px] leading-tight font-medium tracking-tight">
                                                {p.name}
                                            </h3>
                                            <span className="text-fg-dim shrink-0 font-mono text-[12px]">{p.year}</span>
                                        </div>
                                        <p className="text-fg-mid line-clamp-2 text-[14px] leading-snug">{p.kicker}</p>
                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.stack.slice(0, 3).map((t) => (
                                                    <Chip key={t}>
                                                        <LangDot name={t} size={6} />
                                                        {t}
                                                    </Chip>
                                                ))}
                                            </div>
                                            {isActive && (
                                                <span className="bg-portfolio-accent inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-medium text-[#0A0A0A] transition group-hover:opacity-90">
                                                    View project
                                                    <ArrowIcon size={13} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </MacWindow>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="mt-5 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => goTo(active - 1)}
                        disabled={active === 0}
                        aria-label="Previous work"
                        className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:opacity-30"
                    >
                        <ArrowIcon size={15} className="rotate-180" />
                    </button>

                    <div className="flex items-center gap-2">
                        {projects.map((p, i) => (
                            <button
                                key={p.slug}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Show ${p.name}`}
                                aria-current={i === active}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === active ? 'bg-portfolio-accent w-6' : 'bg-line-strong hover:bg-fg-dim w-1.5'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => goTo(active + 1)}
                        disabled={active === n - 1}
                        aria-label="Next work"
                        className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:opacity-30"
                    >
                        <ArrowIcon size={15} />
                    </button>
                </div>
            </div>
        </section>
    );
}
