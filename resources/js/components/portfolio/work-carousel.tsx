import type { Project } from '@/types';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowIcon, ArrowNEIcon } from './icons';
import Screenshot from './screenshot';

/**
 * Scroll-driven poster carousel.
 *
 * Position is continuous, not a card index. The previous version took an
 * integer active card from an IntersectionObserver and ran a 620ms CSS
 * transition on every change, so it snapped between stops instead of following
 * the scroll — which is what read as jumpy. Now scroll maps to a float, that
 * float is damped toward its target each frame, and transforms are written
 * straight to the DOM. React state holds only the rounded index, for the
 * controls and aria.
 *
 * The set is a ring: each card's offset is wrapped to the shortest way round,
 * so cards leaving one edge re-enter at the other and the scroll covers a full
 * cycle rather than stopping at the last card.
 */

const CARD_VW = 80;        // card width on small screens, in vw
const CARD_MAX = 560;      // card width on desktop, in px
const SPACING = 58;        // % of card width each neighbour steps aside
const SCALE_STEP = 0.13;   // scale lost per step from centre
const OPACITY_STEP = 0.26;
const ROTATE = 16;         // deg of Y-rotation per step
const VISIBLE = 3;         // steps rendered either side of centre
const STEP_VH = 58;        // scroll distance that advances one card
const SMOOTHING = 0.12;    // damping on the scroll follow

export default function WorkCarousel({ projects }: { projects: Project[] }) {
    const n = projects.length;
    const [active, setActive] = useState(0);
    const [reduced, setReduced] = useState(false);
    const trackRef = useRef<HTMLElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let raf = 0;
        let visible = true;
        let pos = -1;
        let measured = false;
        let trackTop = 0;
        let span = 1;

        const measure = () => {
            if (window.innerHeight === 0) return;
            trackTop = track.getBoundingClientRect().top + window.scrollY;
            span = Math.max(track.offsetHeight - window.innerHeight, 1);
            measured = true;
        };
        measure();
        window.addEventListener('resize', measure);

        const io = new IntersectionObserver(
            ([e]) => {
                visible = e.isIntersecting;
                if (visible && !raf) raf = requestAnimationFrame(frame);
            },
            { rootMargin: '200px' },
        );
        io.observe(track);

        let lastRounded = -1;
        // Cards wrap at dist = n/2. If that ever falls inside the visible range the
        // wrap becomes a visible pop, so cap how far out we render.
        const vis = Math.min(VISIBLE, n / 2 - 0.5);

        function frame() {
            if (!measured) measure();
            const progress = Math.min(Math.max((window.scrollY - trackTop) / span, 0), 1);
            const target = progress * n;

            if (pos < 0 || reduced) pos = target;
            else {
                const d = target - pos;
                pos = Math.abs(d) < 0.0005 ? target : pos + d * SMOOTHING;
            }

            for (let i = 0; i < n; i++) {
                const el = cardRefs.current[i];
                if (!el) continue;
                // Shortest-path offset on a ring: a card that has fallen off one
                // side reappears on the other instead of running off to infinity.
                let o = i - pos;
                o = (((o + n / 2) % n) + n) % n - n / 2;
                const dist = Math.abs(o);
                const hidden = dist > vis;
                el.style.transform =
                    `translateX(-50%) translateX(${o * SPACING}%) scale(${Math.max(0.5, 1 - dist * SCALE_STEP)}) rotateY(${-o * ROTATE}deg)`;
                el.style.opacity = hidden ? '0' : String(Math.max(0, 1 - dist * OPACITY_STEP));
                el.style.zIndex = String(n - Math.round(dist));
                el.style.pointerEvents = dist < 0.5 ? 'auto' : hidden ? 'none' : 'auto';
            }

            const rounded = ((Math.round(pos) % n) + n) % n;
            if (rounded !== lastRounded) {
                lastRounded = rounded;
                setActive(rounded);
            }

            raf = visible ? requestAnimationFrame(frame) : 0;
        }

        raf = requestAnimationFrame(frame);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [n, reduced]);

    // Controls move the page; scroll stays the source of truth.
    const goTo = useCallback(
        (i: number) => {
            const track = trackRef.current;
            if (!track) return;
            const wrapped = ((i % n) + n) % n;
            const span = Math.max(track.offsetHeight - window.innerHeight, 1);
            const top = track.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: top + (wrapped / n) * span,
                behavior: reduced ? 'auto' : 'smooth',
            });
        },
        [n, reduced],
    );

    return (
        <section
            ref={trackRef}
            className="relative"
            style={{ height: `calc(${n * STEP_VH}vh + 60vh)` }}
            aria-roledescription="carousel"
            aria-label="Selected work"
        >
            <div className="sticky top-0 flex h-[100dvh] flex-col items-center justify-center overflow-hidden">
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
                        onClick={() => goTo(active - 1)}
                        disabled={active === 0}
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
                        onClick={() => goTo(active + 1)}
                        disabled={active === n - 1}
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
