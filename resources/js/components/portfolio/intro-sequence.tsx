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
        title: 'Fast under load',
        body: 'Normalization, composite indexes, N+1 resolution, database-per-tenant isolation.',
    },
    {
        label: 'backend',
        title: 'Correct on retry',
        body: 'Laravel and Livewire, REST design, idempotent jobs, race conditions handled.',
    },
    {
        label: 'frontend',
        title: 'Typed all the way',
        body: 'React, TypeScript, Inertia, Tailwind. Server-driven routing, no untyped seams.',
    },
    {
        label: 'mobile',
        title: 'Live on device',
        body: 'React Native, Sanctum tokens, push registry, WebSocket updates in real time.',
    },
    {
        label: 'iot',
        title: 'Field to ledger',
        body: 'RFID readers, PayMongo and GCash reconciliation, replay-safe webhooks.',
    },
];

// Total scroll length of the intro, in vh. Raising this makes the sequence take
// longer to scroll through and holds each frame over more distance, which also
// reads as smoother. 460 was ~5 screens; 700 is ~7.
const TRACK_VH = 620;
// Pre-extracted frame sequence. Scrubbing a video means a decoder seek per
// update, which caps out around 5-15 updates/sec and reads as stepping. Frames
// are decoded once up front and then blitted, so scroll costs one drawImage.
const FRAME_COUNT = 105;
const SMOOTHING = 0.13; // 0 = frozen, 1 = follow scroll exactly (and jump with it)
const framePath = (i: number) => `/intro/frames/f_${String(i + 1).padStart(3, '0')}.jpg`;

const EDGE_MASK =
    'radial-gradient(ellipse 58% 62% at 50% 50%, #000 52%, rgba(0,0,0,0.75) 74%, transparent 96%)';
// The cross-fade runs between these two points; everything after HANDOFF_END is
// dead scroll where the hero sits pinned and fully visible, so it cannot be
// flicked past by accident.
const HANDOFF_START = 0.6;
const HANDOFF_END = 0.76;

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
    const beatsRef = useRef<HTMLDivElement>(null);
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
        // Wheel and trackpad scroll arrives in discrete jumps. Following the raw
        // value reproduces those jumps exactly; easing toward it turns them into
        // continuous motion. This is the single biggest smoothness factor here.
        let smooth = -1;
        let lastOverIntro: boolean | null = null;
        const frame = () => {
            if (!measured) measure();
            const raw = Math.min(Math.max((window.scrollY - trackTop) / span, 0), 1);
            if (smooth < 0) smooth = raw;
            const delta = raw - smooth;
            smooth = Math.abs(delta) < 0.0004 ? raw : smooth + delta * SMOOTHING;
            const progress = smooth;

            const clipT = Math.min(progress / HANDOFF_END, 1);
            const frameIdx = Math.min(Math.round(clipT * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
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

            const h = Math.min(Math.max((progress - HANDOFF_START) / (HANDOFF_END - HANDOFF_START), 0), 1);
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
                if (beatsRef.current) beatsRef.current.style.opacity = out;
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
                        backgroundColor: '#000000',
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
                            // No blend and no filter: the black crush is baked into the
                            // frames by ffmpeg, so they draw straight onto the black
                            // ground. Compositing a full-bleed canvas through
                            // mix-blend-mode + filter every frame was pure overhead.
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

                {/* Beats. Contrast is protected with a text shadow rather than a
                    scrim: a black radial gradient over the object dimmed its glow in
                    an ellipse, and the undimmed glow outside that ellipse read as a
                    halo ring. */}
                <div
                    ref={beatsRef}
                    className="stage-dark relative mx-auto w-full max-w-[720px] text-center"
                    style={{
                        willChange: 'opacity',
                        // Layered dark glow that hugs the glyphs. Does the job a scrim did without
                        // painting a shape over the object, so no halo.
                        textShadow:
                            '0 1px 2px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9), 0 0 52px rgba(0,0,0,0.75)',
                    }}
                >
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
                                className="text-portfolio-accent text-[58px] leading-none tracking-[0.01em] uppercase md:text-[104px]"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                {beat.label}
                            </h2>
                            <div className="text-fg mt-6 font-sans text-[27px] leading-tight tracking-[-0.015em] md:text-[36px]">
                                {beat.title}
                            </div>
                            <p className="text-fg mx-auto mt-4 max-w-[56ch] font-mono text-[16.5px] leading-relaxed tracking-[0.01em] md:text-[18px]">
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

            </div>
        </div>
    );
}
