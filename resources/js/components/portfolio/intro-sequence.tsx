import { ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Scrollable introduction. A tall scroll track holds a sticky stage; the
 * abstract clip scrubs through it while detail beats swap in and out, then the
 * whole thing hands off to the hero.
 *
 * Implementation notes:
 *   - The clip is rendered with mix-blend-mode: screen over a pure-black
 *     source, so black pixels drop out and GridBackground's dots stay visible
 *     behind the object. No alpha channel needed.
 *   - Scroll is sampled once per frame in a rAF loop, never a scroll listener.
 *   - Scrubbing needs an all-keyframe encode to seek smoothly. Mobile and
 *     reduced-motion never load the video and get the poster frame instead,
 *     which is what most visitors see.
 */

interface Beat {
    label: string;
    title: string;
    body: string;
}

const BEATS: Beat[] = [
    {
        label: 'data',
        title: 'Structure and speed',
        body: 'Normalization, composite indexes, N+1 resolution, database-per-tenant isolation.',
    },
    {
        label: 'backend',
        title: 'Logic and services',
        body: 'Livewire, Filament, REST design, queued jobs that stay correct on retry.',
    },
    {
        label: 'frontend',
        title: 'Interfaces and state',
        body: 'TypeScript, Tailwind, server-driven routing, typed props end to end.',
    },
    {
        label: 'mobile',
        title: 'Clients and delivery',
        body: 'Sanctum token auth, push registry, live WebSocket updates on device.',
    },
    {
        label: 'iot',
        title: 'Hardware and transactions',
        body: 'Field readers, PayMongo and GCash reconciliation, replay-safe webhooks.',
    },
];

const TRACK_VH = 460; // total scroll length of the intro, in vh
// Pre-extracted frame sequence. Scrubbing a video means a decoder seek per
// update, which caps out around 5-15 updates/sec and reads as stepping. Frames
// are decoded once up front and then blitted, so scroll costs one drawImage.
const FRAME_COUNT = 105;
const framePath = (i: number) => `/intro/frames/f_${String(i + 1).padStart(3, '0')}.jpg`;

const EDGE_MASK =
    'radial-gradient(ellipse 58% 62% at 50% 50%, #000 52%, rgba(0,0,0,0.75) 74%, transparent 96%)';
const HANDOFF_START = 0.72; // progress at which the object starts giving way to the hero

export default function IntroSequence({ poster, finale }: { poster: string; finale: ReactNode }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const [active, setActive] = useState(0);
    // Opacity is written straight to the DOM. Routing it through React state
    // re-rendered all five beats on every frame of the fade.
    const [heroReady, setHeroReady] = useState(false);
    const veilRef = useRef<HTMLDivElement>(null);
    const objectRef = useRef<HTMLDivElement>(null);
    const mediaRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);
    const beatsRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);
    const [useVideo, setUseVideo] = useState(false);

    useEffect(() => {
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const wide = window.matchMedia('(min-width: 768px)');

        // A hidden or not-yet-painted tab reports innerWidth 0, which matches every
        // max-width query. Deciding once in that state pinned the poster forever,
        // so the decision is re-evaluated whenever the viewport actually changes.
        const decide = () => {
            if (window.innerWidth === 0) return;
            setUseVideo(!motion.matches && wide.matches);
        };
        decide();
        motion.addEventListener('change', decide);
        wide.addEventListener('change', decide);
        window.addEventListener('resize', decide);
        return () => {
            motion.removeEventListener('change', decide);
            wide.removeEventListener('change', decide);
            window.removeEventListener('resize', decide);
        };
    }, []);

    // Decode every frame once, up front. Nothing is decoded during scroll.
    useEffect(() => {
        if (!useVideo) return;
        const imgs: HTMLImageElement[] = [];
        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            img.decoding = 'async';
            img.src = framePath(i);
            imgs.push(img);
        }
        framesRef.current = imgs;
        return () => {
            framesRef.current = [];
        };
    }, [useVideo]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let raf = 0;
        let visible = true;

        const io = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible && !raf) raf = requestAnimationFrame(frame);
            },
            { rootMargin: '200px' },
        );
        io.observe(track);

        // Track geometry only changes on resize, so read it there instead of
        // forcing a layout every frame.
        let trackTop = 0;
        let span = 1;
        const paint = (img: HTMLImageElement) => {
            const cv = canvasRef.current;
            if (!cv) return;
            const ctx = cv.getContext('2d');
            if (!ctx) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = cv.clientWidth;
            const h = cv.clientHeight;
            if (!w || !h) return;
            if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
                cv.width = Math.round(w * dpr);
                cv.height = Math.round(h * dpr);
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            // cover fit
            const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
            const dw = img.naturalWidth * scale;
            const dh = img.naturalHeight * scale;
            ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        };

        let measured = false;
        const measure = () => {
            if (window.innerHeight === 0) return; // vh units are 0 here; nothing is laid out yet
            trackTop = track.getBoundingClientRect().top + window.scrollY;
            span = Math.max(track.offsetHeight - window.innerHeight, 1);
            measured = true;
        };
        measure();
        window.addEventListener('resize', measure);

        let lastHandoff = -1;
        let lastFrame = -1;
        let lastOverIntro: boolean | null = null;
        const frame = () => {
            if (!measured) measure();
            const progress = Math.min(Math.max((window.scrollY - trackTop) / span, 0), 1);

            const frameIdx = Math.min(Math.round(progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
            if (frameIdx !== lastFrame) {
                const img = framesRef.current[frameIdx];
                if (img && img.complete && img.naturalWidth) {
                    lastFrame = frameIdx;
                    paint(img);
                }
            }

            // Beats occupy the first stretch; the last stretch cross-fades the
            // object out and the hero in, both pinned, so nothing moves vertically.
            const beatSpan = Math.min(progress / HANDOFF_START, 1);
            const idx = Math.min(Math.floor(beatSpan * BEATS.length), BEATS.length - 1);
            setActive((prev) => (prev === idx ? prev : idx));

            const h = Math.min(Math.max((progress - HANDOFF_START) / (1 - HANDOFF_START), 0), 1);
            const eased = h * h * (3 - 2 * h);
            // Nav sits above the stage, so the strip behind it would otherwise show
            // the page dot grid while the intro is black. Flag it on the root and let
            // the nav paint itself black for the duration.
            // The loop only runs while the track is in view, so 'still black'
            // is purely a question of whether the ground has lifted yet.
            const overIntro = eased < 0.98;
            if (overIntro !== lastOverIntro) {
                lastOverIntro = overIntro;
                document.documentElement.toggleAttribute('data-intro', overIntro);
            }

            if (Math.abs(eased - lastHandoff) > 0.002) {
                lastHandoff = eased;
                const out = String(1 - eased);
                // The ground outlasts the object. Screen-blend washes out once the
                // backdrop lightens, so in light mode the object has to be gone
                // before the dark ground is.
                if (veilRef.current) veilRef.current.style.opacity = String(1 - eased * eased);
                if (objectRef.current) objectRef.current.style.opacity = out;
                // Expand while fading so the final particle state reads as scattering
                // outward into the dot grid rather than blinking off in place.
                if (mediaRef.current) mediaRef.current.style.transform = `scale(${1 + eased * 0.22})`;
                if (scrimRef.current) scrimRef.current.style.opacity = out;
                if (beatsRef.current) beatsRef.current.style.opacity = out;
                if (railRef.current) railRef.current.style.opacity = out;
                if (finaleRef.current) finaleRef.current.style.opacity = String(eased);
                const ready = eased > 0.6;
                setHeroReady((prev) => (prev === ready ? prev : ready));
            }

            raf = visible ? requestAnimationFrame(frame) : 0;
        };

        raf = requestAnimationFrame(frame);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener('resize', measure);
            document.documentElement.removeAttribute('data-intro');
        };
    }, [useVideo]);

    return (
        <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
            <div
                className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-6 md:px-12"
                style={{ contain: 'layout paint' }}
            >
                {/* Dark ground. Screen-blend only drops black on a dark backdrop, so
                    this sits under the object while it plays and fades out with it —
                    which lets the stage return to the page theme for the hero. */}
                <div
                    ref={veilRef}
                    className="pointer-events-none absolute inset-0"
                    style={{
                        opacity: 1,
                        willChange: 'opacity',
                        backgroundColor: '#0A0A0A',
                    }}
                />
                {/* Object */}
                <div
                    ref={objectRef}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 1, willChange: 'opacity' }}
                >
                    <div
                        ref={mediaRef}
                        className="absolute inset-0"
                        style={{
                            mixBlendMode: 'screen',
                            // The clip's ground is rgb(24,26,26). contrast(1.5) left a
                            // residual above zero, and screen-blend can only lighten — so
                            // that residual showed as a halo lighter than the #0A0A0A
                            // ground. This drives it to a hard zero while keeping the
                            // object bright. The mask feathers the frame edges so a
                            // full-bleed video never shows its rectangle.
                            filter: 'brightness(0.88) contrast(2.1) saturate(1.05)',
                            transformOrigin: '50% 50%',
                            willChange: 'transform',
                            maskImage: EDGE_MASK,
                            WebkitMaskImage: EDGE_MASK,
                        }}
                    >
                        {useVideo ? (
                            <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
                        ) : (
                            <img
                                src={poster}
                                alt=""
                                aria-hidden="true"
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Beats. The scrim guarantees text contrast against whatever frame
                    is showing, instead of depending on the object being dark there. */}
                <div
                    ref={scrimRef}
                    className="pointer-events-none absolute inset-0"
                    style={{
                        willChange: 'opacity',
                        background:
                            'radial-gradient(ellipse 46% 30% at 50% 52%, rgba(0,0,0,0.82), rgba(0,0,0,0.45) 55%, transparent 78%)',
                    }}
                />
                <div ref={beatsRef} className="stage-dark relative mx-auto w-full max-w-[720px] text-center" style={{ willChange: 'opacity' }}>
                    {BEATS.map((beat, i) => (
                        <div
                            key={beat.label}
                            aria-hidden={i !== active}
                            className="transition-all duration-500 ease-out"
                            style={{
                                opacity: i === active ? 1 : 0,
                                transform: `translateY(${i === active ? 0 : 14}px)`,
                                position: i === active ? 'relative' : 'absolute',
                                inset: i === active ? undefined : 0,
                                pointerEvents: 'none',
                            }}
                        >
                            <h2
                                className="text-portfolio-accent text-[46px] leading-none font-bold tracking-[-0.03em] md:text-[78px]"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {beat.label}
                            </h2>
                            <div className="text-fg mt-5 font-sans text-[20px] leading-tight font-medium tracking-[-0.02em] md:text-[27px]">
                                {beat.title}
                            </div>
                            <p className="text-fg-mid mx-auto mt-3 max-w-[52ch] text-[13px] leading-relaxed md:text-[14px]">
                                {beat.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Finale — the hero, pinned in the same stage. Opacity only, so the
                    handoff has no vertical movement at all. */}
                <div
                    ref={finaleRef}
                    className="absolute inset-0 flex items-center justify-center px-6 md:px-12"
                    style={{ opacity: 0, willChange: 'opacity', pointerEvents: heroReady ? 'auto' : 'none' }}
                    aria-hidden={!heroReady}
                >
                    {finale}
                </div>

                {/* Progress rail */}
                <div ref={railRef} className="stage-dark absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2" style={{ willChange: 'opacity' }}>
                    {BEATS.map((beat, i) => (
                        <span
                            key={beat.label}
                            className={`h-[3px] rounded-full transition-all duration-300 ${
                                i === active ? 'bg-portfolio-accent w-8' : 'bg-line-strong w-4'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
