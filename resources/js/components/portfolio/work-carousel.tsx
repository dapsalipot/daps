import type { Project } from '@/types';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Chip from './chip';
import { ArrowIcon } from './icons';
import LangDot from './lang-dot';
import MacWindow from './mac-window';
import Screenshot from './screenshot';

/**
 * Coverflow carousel. The active card sits centred at full scale; neighbours
 * fall back, shrink, fade, and rotate away on both sides. Advancing wraps
 * around, so the set revolves endlessly in either direction.
 *
 * Position is driven by an active index rather than scroll offset, so there is
 * no scroll listener. Transforms and opacity only, both GPU-composited.
 */

const SPACING = 94;      // % of card width each neighbour steps aside
const SCALE_STEP = 0.17; // scale lost per step from centre
const OPACITY_STEP = 0.38;
const ROTATE = 22;       // deg of Y-rotation per step
const VISIBLE = 2;       // steps rendered either side of centre

export default function WorkCarousel({ projects }: { projects: Project[] }) {
    const n = projects.length;
    const [active, setActive] = useState(0);
    const [reduced, setReduced] = useState(false);
    const drag = useRef<{ x: number; moved: boolean } | null>(null);

    useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, []);

    const step = useCallback((dir: 1 | -1) => setActive((i) => (i + dir + n) % n), [n]);

    // Shortest signed distance from the active card, wrapping both ways.
    const offsetOf = (i: number) => {
        let o = i - active;
        if (o > n / 2) o -= n;
        if (o < -n / 2) o += n;
        return o;
    };

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };

    return (
        <div
            className="relative w-full select-none"
            role="group"
            aria-roledescription="carousel"
            aria-label="Selected work"
            tabIndex={0}
            onKeyDown={onKey}
            onPointerDown={(e) => { drag.current = { x: e.clientX, moved: false }; }}
            onPointerMove={(e) => {
                if (!drag.current || drag.current.moved) return;
                const dx = e.clientX - drag.current.x;
                if (Math.abs(dx) > 55) {
                    step(dx < 0 ? 1 : -1);
                    drag.current.moved = true;
                }
            }}
            onPointerUp={() => { drag.current = null; }}
            onPointerLeave={() => { drag.current = null; }}
        >
            {/* Stage */}
            <div
                className="relative mx-auto h-[390px] w-full max-w-[1500px] sm:h-[430px] lg:h-[462px]"
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
                            onClick={() => {
                                if (drag.current?.moved) return;
                                if (isActive) router.visit(`/projects/${p.slug}`);
                                else setActive(i);
                            }}
                            className={`absolute top-0 left-1/2 w-[80vw] max-w-[440px] sm:w-[54vw] lg:w-[430px] ${
                                isActive ? 'cursor-pointer' : 'cursor-pointer'
                            }`}
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
                                style={
                                    isActive
                                        ? undefined
                                        : { boxShadow: '0 8px 30px -12px rgba(0,0,0,.4)' }
                                }
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

                                <div className="flex flex-1 flex-col gap-2 p-4">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="text-fg text-[17px] leading-tight font-medium tracking-tight">
                                            {p.name}
                                        </h3>
                                        <span className="text-fg-dim shrink-0 font-mono text-[11px]">{p.year}</span>
                                    </div>
                                    <p className="text-fg-mid line-clamp-2 text-[12.5px] leading-snug">{p.kicker}</p>
                                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                                        {p.stack.slice(0, 3).map((t) => (
                                            <Chip key={t}>
                                                <LangDot name={t} size={6} />
                                                {t}
                                            </Chip>
                                        ))}
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
                    onClick={() => step(-1)}
                    aria-label="Previous work"
                    className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
                >
                    <ArrowIcon size={15} className="rotate-180" />
                </button>

                <div className="flex items-center gap-2">
                    {projects.map((p, i) => (
                        <button
                            key={p.slug}
                            type="button"
                            onClick={() => setActive(i)}
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
                    onClick={() => step(1)}
                    aria-label="Next work"
                    className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
                >
                    <ArrowIcon size={15} />
                </button>
            </div>
        </div>
    );
}
