import type { Project } from '@/types';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowIcon, ArrowNEIcon } from './icons';
import Screenshot from './screenshot';

/**
 * Scroll-driven poster carousel.
 *
 * The set is a ring — cards leaving one edge re-enter at the other — so it is
 * driven by its own controls rather than by page scroll. A looping carousel on a
 * pinned scroll track has no end, which means the reader can never scroll past
 * it; the section is now ordinary page height and scrolls by like anything else.
 *
 * Position is a continuous float damped toward a target each frame, with
 * transforms written straight to the DOM. React state holds only the rounded
 * index, for the controls and aria. The loop idles when it has nothing to
 * animate and stops entirely when the section is off screen.
 */

const CARD_VW = 80;        // card width on small screens, in vw
const CARD_MAX = 560;      // card width on desktop, in px
const SPACING = 58;        // % of card width each neighbour steps aside
const SCALE_STEP = 0.13;   // scale lost per step from centre
const OPACITY_STEP = 0.26;
const ROTATE = 16;         // deg of Y-rotation per step
const VISIBLE = 3;         // steps rendered either side of centre
const SMOOTHING = 0.14;    // damping toward the target card

export default function WorkCarousel({ projects }: { projects: Project[] }) {
    const n = projects.length;
    const [active, setActive] = useState(0);
    const [reduced, setReduced] = useState(false);
    const trackRef = useRef<HTMLElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    // Unbounded float targets so direction is preserved across the wrap; the
    // rendered offset is wrapped separately.
    const posRef = useRef(0);
    const targetRef = useRef(0);
    const rafRef = useRef(0);
    const visibleRef = useRef(true);

    const paint = useCallback(() => {
        const pos = posRef.current;
        const vis = Math.min(VISIBLE, n / 2 - 0.5);
        for (let i = 0; i < n; i++) {
            const el = cardRefs.current[i];
            if (!el) continue;
            // Shortest-path offset on a ring: a card that has fallen off one side
            // reappears on the other instead of running off to infinity.
            let o = i - pos;
            o = (((o + n / 2) % n) + n) % n - n / 2;
            const dist = Math.abs(o);
            const hidden = dist > vis;
            el.style.transform =
                `translateX(-50%) translateX(${o * SPACING}%) scale(${Math.max(0.5, 1 - dist * SCALE_STEP)}) rotateY(${-o * ROTATE}deg)`;
            el.style.opacity = hidden ? '0' : String(Math.max(0, 1 - dist * OPACITY_STEP));
            el.style.zIndex = String(n - Math.round(dist));
            el.style.pointerEvents = hidden ? 'none' : 'auto';
        }
    }, [n]);

    const tick = useCallback(() => {
        const d = targetRef.current - posRef.current;
        if (Math.abs(d) < 0.0005) {
            posRef.current = targetRef.current;
            paint();
            rafRef.current = 0; // settled: stop burning frames
            return;
        }
        posRef.current += d * SMOOTHING;
        paint();
        rafRef.current = requestAnimationFrame(tick);
    }, [paint]);

    const run = useCallback(() => {
        if (!rafRef.current && visibleRef.current) rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    useEffect(() => {
        paint();
        const track = trackRef.current;
        if (!track) return;
        const io = new IntersectionObserver(
            ([e]) => {
                visibleRef.current = e.isIntersecting;
                if (e.isIntersecting) run();
                else if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = 0;
                }
            },
            { rootMargin: '200px' },
        );
        io.observe(track);
        return () => {
            io.disconnect();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        };
    }, [paint, run]);

    // Step by whole cards. Advancing the unbounded target keeps the animation
    // going the way the reader asked, rather than unwinding the long way round.
    const step = useCallback(
        (delta: number) => {
            targetRef.current += delta;
            setActive(((Math.round(targetRef.current) % n) + n) % n);
            if (reduced) {
                posRef.current = targetRef.current;
                paint();
            } else run();
        },
        [n, paint, reduced, run],
    );

    // Jump to a specific card the short way round the ring.
    const goTo = useCallback(
        (i: number) => {
            const current = ((Math.round(targetRef.current) % n) + n) % n;
            let d = (((i - current) % n) + n) % n;
            if (d > n / 2) d -= n;
            step(d);
        },
        [n, step],
    );

    return (
        <section
            ref={trackRef}
            className="relative py-20 md:py-28"
            aria-roledescription="carousel"
            aria-label="Selected work"
        >
            <div className="flex flex-col items-center justify-center overflow-hidden">
                <div
                    className="relative mx-auto w-full max-w-[1600px]"
                    style={{ perspective: '2400px', height: 'min(84dvh, 760px)' }}
                >
                    {projects.map((p, i) => {
                        const isActive = i === active;
                        const shot = p.case_study.screenshots?.[0];

                        return (
                            <div
                                key={p.slug}
                                ref={(el) => {
                                    cardRefs.current[i] = el;
                                }}
                                onClick={() => (isActive ? router.visit(`/projects/${p.slug}`) : goTo(i))}
                                className="group absolute top-0 left-1/2 h-full cursor-pointer"
                                style={{
                                    width: `min(${CARD_VW}vw, ${CARD_MAX}px)`,
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform, opacity',
                                }}
                            >
                                <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-[#111] shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
                                    {/* Poster */}
                                    {shot ? (
                                        <img
                                            src={shot.src}
                                            alt={shot.alt}
                                            loading="lazy"
                                            draggable={false}
                                            className="absolute inset-0 h-full w-full object-cover object-top"
                                        />
                                    ) : (
                                        <Screenshot
                                            title={p.screenshot.title}
                                            subtitle={p.screenshot.subtitle}
                                            tone={p.screenshot.tone}
                                            ratio="3/4"
                                            style={{ borderRadius: 0, border: 'none', height: '100%' }}
                                        />
                                    )}

                                    {/* Legibility gradient. Sized so the copy always sits on it. */}
                                    <div
                                        className="pointer-events-none absolute inset-0"
                                        style={{
                                            background:
                                                'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.92) 82%, #000 100%)',
                                        }}
                                    />

                                    {/* Badges */}
                                    <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                                        <span className="bg-portfolio-accent text-on-accent rounded-full px-3.5 py-1.5 font-mono text-[13.5px] leading-none">
                                            {p.year}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3.5 py-1.5 font-mono text-[13.5px] leading-none text-white backdrop-blur">
                                            {p.lang}
                                        </span>
                                    </div>

                                    {/* Copy */}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6">
                                        <h3 className="text-[30px] leading-[1.05] font-medium tracking-tight text-white lg:text-[34px]">
                                            {p.name}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-2.5 text-[15px]">
                                            <span className="text-portfolio-accent">{p.tag || 'case study'}</span>
                                            <span className="text-white/45">•</span>
                                            <span className="text-white/85">{p.stack.slice(0, 3).join(', ')}</span>
                                        </div>

                                        {isActive && (
                                            <>
                                                <p className="line-clamp-3 text-[16px] leading-snug text-white/85">
                                                    {p.kicker}
                                                </p>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[16.5px] font-medium text-black transition group-hover:bg-white/90">
                                                        View project
                                                        <ArrowIcon size={15} />
                                                    </span>
                                                    <span
                                                        role="link"
                                                        aria-label={`Open ${p.name} case study`}
                                                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                                                    >
                                                        <ArrowNEIcon size={17} />
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous work"
                        className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-11 w-11 items-center justify-center rounded-full border transition disabled:opacity-30"
                    >
                        <ArrowIcon size={16} className="rotate-180" />
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
                                    i === active ? 'bg-portfolio-accent w-7' : 'bg-line-strong hover:bg-fg-dim w-1.5'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next work"
                        className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-11 w-11 items-center justify-center rounded-full border transition disabled:opacity-30"
                    >
                        <ArrowIcon size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}
