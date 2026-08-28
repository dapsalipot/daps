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
        label: 'systems',
        title: 'Production, end to end',
        body: 'Multi-tenant SaaS, RFID device fleets, payment reconciliation. Schema design through to the hardware doing the tapping.',
    },
    {
        label: 'algorithms',
        title: 'When a problem needs one',
        body: 'A constraint solver that replaced a multi-day manual schedule — fail-first selection, ruin-and-recreate repair, seeded trials.',
    },
    {
        label: 'ownership',
        title: 'Sole developer, real stakes',
        body: 'Roughly 10 campuses, 10,000+ cardholders, and the transaction volume that comes with them. Built and maintained alone.',
    },
];

const TRACK_VH = 340; // total scroll length of the intro, in vh
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
    const [handoff, setHandoff] = useState(0);
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

        const frame = () => {
            const rect = track.getBoundingClientRect();
            const span = rect.height - window.innerHeight;
            const progress = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;

            const video = videoRef.current;
            // Never stack seeks: issuing a new currentTime while one is still
            // pending starves the decoder and the element paints nothing at all.
            if (video && video.duration && !video.seeking) {
                const t = progress * video.duration;
                if (Math.abs(video.currentTime - t) > 0.06) video.currentTime = t;
            }

            // Beats occupy the first stretch; the last stretch cross-fades the
            // object out and the hero in, both pinned, so nothing moves vertically.
            const beatSpan = Math.min(progress / HANDOFF_START, 1);
            const idx = Math.min(Math.floor(beatSpan * BEATS.length), BEATS.length - 1);
            setActive((prev) => (prev === idx ? prev : idx));

            const h = Math.min(Math.max((progress - HANDOFF_START) / (1 - HANDOFF_START), 0), 1);
            const eased = h * h * (3 - 2 * h);
            setHandoff((prev) => (Math.abs(prev - eased) < 0.01 ? prev : eased));

            raf = visible ? requestAnimationFrame(frame) : 0;
        };

        raf = requestAnimationFrame(frame);
        return () => {
            if (raf) cancelAnimationFrame(raf);
            io.disconnect();
        };
    }, [useVideo]);

    return (
        <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
            <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-6 md:px-12">
                {/* Object */}
                <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{ opacity: 1 - handoff }}
                >
                    <div
                        className="h-[min(680px,82vw)] w-[min(680px,82vw)]"
                        style={{
                            mixBlendMode: 'screen',
                            // The clip renders on ~rgb(80,82,82), not black, and it is not
                            // uniform — a luminance crush alone leaves a visible rectangle.
                            // The crush handles most of it; the radial mask removes the
                            // seam by construction rather than by hoping the crush is exact.
                            filter: 'brightness(0.62) contrast(2.9) saturate(1.1)',
                            maskImage:
                                'radial-gradient(circle at 50% 50%, #000 54%, rgba(0,0,0,0.55) 66%, transparent 74%)',
                            WebkitMaskImage:
                                'radial-gradient(circle at 50% 50%, #000 54%, rgba(0,0,0,0.55) 66%, transparent 74%)',
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
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 46% 30% at 50% 52%, rgba(0,0,0,0.82), rgba(0,0,0,0.45) 55%, transparent 78%)',
                        opacity: 1 - handoff,
                    }}
                />
                <div className="relative mx-auto w-full max-w-[720px] text-center" style={{ opacity: 1 - handoff }}>
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
                            <span className="text-portfolio-accent font-mono text-[12px] tracking-[0.14em] uppercase">
                                {beat.label}
                            </span>
                            <h2 className="text-fg mt-4 font-sans text-[34px] leading-[1.06] font-semibold tracking-[-0.03em] md:text-[56px]">
                                {beat.title}
                            </h2>
                            <p className="text-fg-mid mx-auto mt-4 max-w-[46ch] text-[16px] leading-relaxed md:text-[19px]">
                                {beat.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Finale — the hero, pinned in the same stage. Opacity only, so the
                    handoff has no vertical movement at all. */}
                <div
                    className="absolute inset-0 flex items-center justify-center px-6 md:px-12"
                    style={{ opacity: handoff, pointerEvents: handoff > 0.6 ? 'auto' : 'none' }}
                    aria-hidden={handoff < 0.6}
                >
                    {finale}
                </div>

                {/* Progress rail */}
                <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2" style={{ opacity: 1 - handoff }}>
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
