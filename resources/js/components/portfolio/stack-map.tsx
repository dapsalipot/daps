import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * The stack as a connection map: a centre, one node per category, and a leaf per
 * technology, joined by curved links. Hovering a leaf lifts its branch and shows
 * that entry's note; everything else dims so the path reads at a glance.
 *
 * Layout is computed, not hand-placed, so adding a category or a tool to
 * config/portfolio.php re-balances the map instead of breaking it.
 *
 * Links draw themselves in on first view via stroke-dashoffset, and leaves drift
 * on a slow loop with staggered delays. Both stop under prefers-reduced-motion.
 */

const R_CAT = 200;   // centre -> category node
const R_LEAF = 372;  // centre -> leaf node
const SPREAD = 38;   // degrees a category's leaves fan either side of its angle

type Leaf = { name: string; note: string; x: number; y: number; angle: number; cat: number };
type Cat = { name: string; count: number; x: number; y: number; angle: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

export default function StackMap({ stack }: { stack: Record<string, [string, string][]> }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);
    const [hover, setHover] = useState<Leaf | null>(null);

    const { cats, leaves } = useMemo(() => {
        const entries = Object.entries(stack);
        const n = entries.length;
        const cats: Cat[] = [];
        const leaves: Leaf[] = [];

        entries.forEach(([name, items], i) => {
            // Offset by half a step so no branch points straight up or down,
            // where labels would collide with the centre.
            const angle = ((i + 0.5) / n) * 360 - 90;
            cats.push({
                name,
                count: items.length,
                angle,
                x: Math.cos(rad(angle)) * R_CAT,
                y: Math.sin(rad(angle)) * R_CAT,
            });

            const m = items.length;
            items.forEach(([leafName, note], j) => {
                const t = m === 1 ? 0.5 : j / (m - 1);
                const a = angle - SPREAD + t * SPREAD * 2;
                leaves.push({
                    name: leafName,
                    note,
                    cat: i,
                    angle: a,
                    x: Math.cos(rad(a)) * R_LEAF,
                    y: Math.sin(rad(a)) * R_LEAF,
                });
            });
        });
        return { cats, leaves };
    }, [stack]);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { rootMargin: '-10% 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const activeCat = hover?.cat ?? null;

    return (
        <div ref={wrapRef} className={`stack-map ${shown ? 'is-in' : ''} relative w-full`}>
            <svg
                viewBox="-660 -440 1320 880"
                className="block h-auto w-full"
                role="img"
                aria-label="Stack shown as a connection map of categories and technologies"
            >
                {/* category links */}
                {cats.map((c, i) => (
                    <path
                        key={`cl-${c.name}`}
                        className="sm-link sm-link-cat"
                        d={`M0 0 Q ${c.x * 0.45} ${c.y * 0.72} ${c.x} ${c.y}`}
                        fill="none"
                        style={{
                            opacity: activeCat === null || activeCat === i ? 1 : 0.15,
                            ['--i' as string]: i,
                        }}
                    />
                ))}

                {/* leaf links */}
                {leaves.map((l, i) => {
                    const c = cats[l.cat];
                    const dim = activeCat !== null && activeCat !== l.cat;
                    const on = hover?.name === l.name;
                    return (
                        <path
                            key={`ll-${l.cat}-${l.name}`}
                            className={`sm-link ${on ? 'sm-link-on' : ''}`}
                            d={`M${c.x} ${c.y} Q ${(c.x + l.x) / 2 + l.x * 0.06} ${(c.y + l.y) / 2 + l.y * 0.06} ${l.x} ${l.y}`}
                            fill="none"
                            style={{ opacity: dim ? 0.1 : on ? 1 : 0.55, ['--i' as string]: 4 + (i % 8) }}
                        />
                    );
                })}

                {/* centre */}
                <g className="sm-core">
                    <circle r="58" className="sm-core-ring" />
                    <circle r="7" className="sm-core-dot" />
                    <text className="sm-core-label" y="86" textAnchor="middle">
                        stack
                    </text>
                </g>

                {/* categories */}
                {cats.map((c, i) => {
                    const end = c.x < 0;
                    return (
                        <g
                            key={c.name}
                            className="sm-node sm-cat"
                            style={{ ['--i' as string]: i, opacity: activeCat === null || activeCat === i ? 1 : 0.3 }}
                            transform={`translate(${c.x} ${c.y})`}
                        >
                            <circle r="9" className="sm-cat-dot" />
                            <text
                                className="sm-cat-label"
                                x={end ? -20 : 20}
                                y="6"
                                textAnchor={end ? 'end' : 'start'}
                            >
                                {c.name}
                            </text>
                            <text
                                className="sm-cat-count"
                                x={end ? -20 : 20}
                                y="26"
                                textAnchor={end ? 'end' : 'start'}
                            >
                                {String(c.count).padStart(2, '0')} tools
                            </text>
                        </g>
                    );
                })}

                {/* leaves */}
                {leaves.map((l, i) => {
                    const end = l.x < 0;
                    const dim = activeCat !== null && activeCat !== l.cat;
                    const on = hover?.name === l.name;
                    return (
                        <g
                            key={`${l.cat}-${l.name}`}
                            className={`sm-node sm-leaf ${on ? 'sm-leaf-on' : ''}`}
                            style={{ ['--i' as string]: i % 10, opacity: dim ? 0.25 : 1 }}
                            transform={`translate(${l.x} ${l.y})`}
                            onMouseEnter={() => setHover(l)}
                            onMouseLeave={() => setHover((h) => (h?.name === l.name ? null : h))}
                            onFocus={() => setHover(l)}
                            onBlur={() => setHover(null)}
                            tabIndex={0}
                            role="button"
                            aria-label={`${l.name}: ${l.note}`}
                        >
                            {/* Inner group carries the drift. A CSS transform would
                                override the outer translate and stack every leaf on
                                the origin, so positioning and animation stay apart. */}
                            <g className="sm-float">
                                <circle r="18" className="sm-leaf-hit" />
                                <circle r="5" className="sm-leaf-dot" />
                                <text
                                    className="sm-leaf-label"
                                    x={end ? -14 : 14}
                                    y="5"
                                    textAnchor={end ? 'end' : 'start'}
                                >
                                    {l.name}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </svg>

            {/* Detail readout. Sits in the centre well so the eye does not travel. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                    className="max-w-[240px] text-center transition-opacity duration-200"
                    style={{ opacity: hover ? 1 : 0 }}
                >
                    <div className="text-portfolio-accent font-mono text-[13.5px]">
                        {hover ? Object.keys(stack)[hover.cat] : ''}
                    </div>
                    <div className="text-fg mt-1 text-[19px] leading-tight tracking-tight">{hover?.name}</div>
                    <div className="text-fg-mid mt-1.5 font-mono text-[13.5px]">{hover?.note}</div>
                </div>
            </div>
        </div>
    );
}
