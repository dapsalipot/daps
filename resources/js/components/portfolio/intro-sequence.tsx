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
const SEEK_STEPS = 96; // quantized scrub positions across the clip
const HANDOFF_START = 0.72; // progress at which the object starts giving way to the hero

export default function IntroSequence({
    poster,
    src,
    finale,
}: {
    poster: string;
    src?: string;
    finale: ReactNode;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [active, setActive] = useState(0);
    // Opacity is written straight to the DOM. Routing it through React state
    // re-rendered all five beats on every frame of the fade.
    const [heroReady, setHeroReady] = useState(false);
    const objectRef = useRef<HTMLDivElement>(null);
    const scrimRef = useRef<HTMLDivElement>(null);
    const beatsRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const finaleRef = useRef<HTMLDivElement>(null);
    const [useVideo, setUseVideo] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const small = window.matchMedia('(max-width: 767px)').matches;
        setUseVideo(Boolean(src) && !reduced && !small);
    }, [src]);

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
        const measure = () => {
            trackTop = track.getBoundingClientRect().top + window.scrollY;
            span = Math.max(track.offsetHeight - window.innerHeight, 1);
        };
        measure();
        window.addEventListener('resize', measure);

        let lastHandoff = -1;
        const frame = () => {
            const progress = Math.min(Math.max((window.scrollY - trackTop) / span, 0), 1);

            const video = videoRef.current;
            // Never stack seeks: issuing a new currentTime while one is still
            // pending starves the decoder and the element paints nothing at all.
            //
            // Targets are also quantized. The clip is not encoded all-keyframe, so
            // every distinct seek makes the decoder walk to the nearest keyframe;
            // snapping to a fixed ladder means it revisits positions it has already
            // decoded instead of a new one on every frame.
            if (video && video.duration && !video.seeking) {
                const t = (Math.round(progress * SEEK_STEPS) / SEEK_STEPS) * video.duration;
                if (Math.abs(video.currentTime - t) > 0.04) video.currentTime = t;
            }

            // Beats occupy the first stretch; the last stretch cross-fades the
            // object out and the hero in, both pinned, so nothing moves vertically.
            const beatSpan = Math.min(progress / HANDOFF_START, 1);
            const idx = Math.min(Math.floor(beatSpan * BEATS.length), BEATS.length - 1);
            setActive((prev) => (prev === idx ? prev : idx));

            const h = Math.min(Math.max((progress - HANDOFF_START) / (1 - HANDOFF_START), 0), 1);
            const eased = h * h * (3 - 2 * h);
            if (Math.abs(eased - lastHandoff) > 0.002) {
                lastHandoff = eased;
                const out = String(1 - eased);
                if (objectRef.current) objectRef.current.style.opacity = out;
                if (scrimRef.current) scrimRef.current.style.opacity = out;
                if (beatsRef.current) beatsRef.current.style.opacity = out;
                if (railRef.current) railRef.current.style.opacity = out;
                if (finaleRef.current) finaleRef.current.style.opacity = String(eased);
                setHeroReady((prev) => (prev === eased > 0.6 ? prev : eased > 0.6));
            }

            raf = visible ? requestAnimationFrame(frame) : 0;
        };

        raf = requestAnimationFrame(frame);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [useVideo]);

    return (
        <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
            <div
                className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-6 md:px-12"
                style={{ contain: 'layout paint', isolation: 'isolate' }}
            >
                {/* Object */}
                <div
                    ref={objectRef}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 1, willChange: 'opacity' }}
                >
                    <div
                        className="h-[min(680px,82vw)] w-[min(680px,82vw)]"
                        style={{
                            mixBlendMode: 'screen',
                            // This clip renders on a near-black rgb(24,26,26), so only a
                            // gentle crush is needed to reach zero — which keeps the object
                            // bright. The radial mask still removes the rectangle seam by
                            // construction rather than trusting the crush to be exact.
                            filter: 'contrast(1.5) saturate(1.05)',
                            maskImage:
                                'radial-gradient(circle at 50% 50%, #000 62%, rgba(0,0,0,0.6) 76%, transparent 86%)',
                            WebkitMaskImage:
                                'radial-gradient(circle at 50% 50%, #000 62%, rgba(0,0,0,0.6) 76%, transparent 86%)',
                        }}
                    >
                        {useVideo && src ? (
                            <video
                                ref={videoRef}
                                src={src}
                                poster={poster}
                                muted
                                playsInline
                                preload="auto"
                                className="h-full w-full object-cover"
                            />
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
                <div ref={beatsRef} className="relative mx-auto w-full max-w-[720px] text-center" style={{ willChange: 'opacity' }}>
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
                            <h2 className="text-portfolio-accent font-mono text-[46px] leading-none font-medium tracking-[-0.02em] md:text-[78px]">
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
                <div ref={railRef} className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2" style={{ willChange: 'opacity' }}>
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
