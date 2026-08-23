import type { Project } from '@/types';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Chip from './chip';
import { ArrowIcon } from './icons';
import LangDot from './lang-dot';
import MacWindow from './mac-window';
import Screenshot from './screenshot';

/**
 * Horizontal scroll-snap carousel of work, one macOS window per card.
 * Native CSS scroll-snap, no carousel dependency. Arrows scroll by one card;
 * trackpad, touch, and keyboard all work unaided.
 */
export default function WorkCarousel({ projects }: { projects: Project[] }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const sync = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setAtStart(el.scrollLeft < 8);
        setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    }, []);

    useEffect(() => {
        sync();
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        return () => {
            el.removeEventListener('scroll', sync);
            window.removeEventListener('resize', sync);
        };
    }, [sync]);

    const nudge = (dir: 1 | -1) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>('[data-card]');
        const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    return (
        <div className="relative">
            <div className="mb-5 flex items-center justify-end gap-2 px-6 md:px-12">
                {([-1, 1] as const).map((dir) => (
                    <button
                        key={dir}
                        type="button"
                        onClick={() => nudge(dir)}
                        disabled={dir === -1 ? atStart : atEnd}
                        aria-label={dir === -1 ? 'Previous work' : 'Next work'}
                        className="border-line bg-bg-elev text-fg-mid hover:text-fg hover:border-line-strong inline-flex h-9 w-9 items-center justify-center rounded-full border transition disabled:pointer-events-none disabled:opacity-30"
                    >
                        <ArrowIcon size={15} className={dir === -1 ? 'rotate-180' : ''} />
                    </button>
                ))}
            </div>

            <div
                ref={trackRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-6 md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {projects.map((p) => (
                    <Link
                        key={p.slug}
                        href={`/projects/${p.slug}`}
                        data-card
                        className="w-[85vw] max-w-[520px] shrink-0 snap-start sm:w-[64vw] lg:w-[440px]"
                    >
                        <MacWindow title={p.screenshot.title} className="group h-full transition-transform duration-300 hover:-translate-y-1">
                            <div className="overflow-hidden">
                                {p.case_study.screenshots?.length ? (
                                    <img
                                        src={p.case_study.screenshots[0].src}
                                        alt={p.case_study.screenshots[0].alt}
                                        loading="lazy"
                                        className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
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

                            <div className="flex flex-1 flex-col gap-3 p-5">
                                <div className="flex items-baseline justify-between gap-3">
                                    <h3 className="text-fg text-[19px] leading-tight font-medium tracking-tight">
                                        {p.name}
                                    </h3>
                                    <span className="text-fg-dim shrink-0 font-mono text-[11px]">{p.year}</span>
                                </div>
                                <p className="text-fg-mid line-clamp-2 text-[13.5px] leading-relaxed">{p.kicker}</p>
                                <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                                    {p.stack.slice(0, 4).map((t) => (
                                        <Chip key={t}>
                                            <LangDot name={t} size={6} />
                                            {t}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </MacWindow>
                    </Link>
                ))}
            </div>
        </div>
    );
}
