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
 *
 * The svg is height-capped: this sits inside a sticky section, and a sticky child
 * taller than the viewport stops holding and clips instead.
 */

const R_CAT = 200;   // centre -> category node
const R_LEAF = 372;  // centre -> leaf node
const SPREAD = 38;   // degrees a category's leaves fan either side of its angle

type Leaf = { name: string; note: string; x: number; y: number; angle: number; cat: number };
type Cat = { name: string; count: number; x: number; y: number; angle: number };

const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (r: number, deg: number) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r] as const;

/** Radial diagonal: control points sit at the midpoint radius on each end's own
 *  angle, so the curve leaves and arrives radially instead of bulging sideways. */
function branch(r0: number, a0: number, r1: number, a1: number) {
    const mid = (r0 + r1) / 2;
    const [x0, y0] = polar(r0, a0);
    const [c0x, c0y] = polar(mid, a0);
    const [c1x, c1y] = polar(mid, a1);
    const [x1, y1] = polar(r1, a1);
    return `M${x0} ${y0} C ${c0x} ${c0y} ${c1x} ${c1y} ${x1} ${y1}`;
}

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
                viewBox="-556 -412 1112 824"
                preserveAspectRatio="xMidYMid meet"
                className="mx-auto block max-h-[74dvh] w-full"
                role="img"
                aria-label="Stack shown as a connection map of categories and technologies"
            >
                {/* Tier rings. Structural, not decoration: they make the two radii
                    legible so the map reads as a system rather than scattered dots. */}
                <circle r={R_CAT} className="sm-ring" />
                <circle r={R_LEAF} className="sm-ring" />

                {/* category links */}
                {cats.map((c, i) => (
                    <path
                        key={`cl-${c.name}`}
                        className="sm-link sm-link-cat"
                        d={branch(0, c.angle, R_CAT, c.angle)}
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
                            d={branch(R_CAT, c.angle, R_LEAF, l.angle)}
                            fill="none"
                            style={{ opacity: dim ? 0.1 : on ? 1 : 0.55, ['--i' as string]: 4 + (i % 8) }}
                        />
                    );
                })}

                {/* centre */}
                <g className="sm-core">
                    <circle r="64" className="sm-core-ring" />
                    <circle r="46" className="sm-core-ring sm-core-ring-inner" />
                    <circle r="6" className="sm-core-dot" />
                    <text
                        className="sm-core-label"
                        y="86"
                        textAnchor="middle"
                        style={{ opacity: hover ? 0 : 1, transition: 'opacity 200ms ease' }}
                    >
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
                            <circle r="15" className="sm-cat-ring" />
                            <circle r="5.5" className="sm-cat-dot" />
                            <text
                                className="sm-cat-label"
                                x={end ? -26 : 26}
                                y="5"
                                textAnchor={end ? 'end' : 'start'}
                            >
                                {c.name}
                            </text>
                            <text
                                className="sm-cat-count"
                                x={end ? -26 : 26}
                                y="27"
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
                                <circle r="20" className="sm-leaf-hit" />
                                <circle r="11" className="sm-leaf-halo" />
                                <circle r="4.5" className="sm-leaf-dot" />
                                <text
                                    className="sm-leaf-label"
                                    x={end ? -18 : 18}
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

            {/* Detail readout. Sits in the centre well so the eye does not travel,
                on its own panel — over links and the core ring, plain text washed out. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                    className="border-line rounded-2xl border bg-black/90 px-7 py-5 text-center backdrop-blur transition-all duration-200"
                    style={{
                        opacity: hover ? 1 : 0,
                        transform: hover ? 'scale(1)' : 'scale(.94)',
                        boxShadow: '0 20px 60px -20px rgba(0,0,0,.95)',
                    }}
                >
                    <div className="text-portfolio-accent font-mono text-[14px] tracking-[0.06em]">
                        {hover ? Object.keys(stack)[hover.cat] : '\u00a0'}
                    </div>
                    <div className="text-fg mt-2 text-[26px] leading-tight tracking-tight">
                        {hover?.name ?? '\u00a0'}
                    </div>
                    <div className="text-fg-mid mt-2 font-mono text-[15px]">{hover?.note ?? '\u00a0'}</div>
                </div>
            </div>
        </div>
    );
}
