import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * The stack as a connection map. Three tiers radiating from a centre, plus
 * cross-links between branches for the relationships a tree cannot express
 * (multi-tenancy depends on the framework; queues carry the webhooks).
 *
 * Layout is a recursive radial tree, not hand-placed. Each branch gets an angular
 * wedge proportional to how many leaves it carries, then subdivides that wedge
 * among its children, so a dense branch never crushes a sparse one. Adding a node
 * in config/portfolio.php re-balances the whole map.
 *
 * Hovering lifts a node's whole ancestry, its descendants, and anything it
 * cross-links to, so "what does this touch?" is answered by looking.
 *
 * The svg is height-capped: this sits inside a sticky section, and a sticky child
 * taller than the viewport stops holding and clips instead.
 */

const RADII = [0, 168, 306, 424]; // radius per depth; index 0 is the centre
const GAP = 3;                    // degrees of padding between sibling wedges

interface RawNode {
    name: string;
    note?: string;
    children?: RawNode[];
}

interface Node {
    id: string;
    name: string;
    note: string;
    depth: number;
    angle: number;
    r: number;
    x: number;
    y: number;
    parent: string | null;
    branch: number; // index of the top-level ancestor
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (r: number, deg: number) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r] as const;

/** Radial diagonal: control points sit at the midpoint radius on each end's own
 *  angle, so the curve leaves and arrives radially instead of bulging sideways. */
function branchPath(r0: number, a0: number, r1: number, a1: number) {
    const mid = (r0 + r1) / 2;
    const [x0, y0] = polar(r0, a0);
    const [c0x, c0y] = polar(mid, a0);
    const [c1x, c1y] = polar(mid, a1);
    const [x1, y1] = polar(r1, a1);
    return `M${x0} ${y0} C ${c0x} ${c0y} ${c1x} ${c1y} ${x1} ${y1}`;
}

/** Cross-links cut through the middle instead of following the radial grid, so
 *  they read as a different kind of relationship at a glance. */
function chordPath(a: Node, b: Node) {
    return `M${a.x} ${a.y} Q ${(a.x + b.x) * 0.22} ${(a.y + b.y) * 0.22} ${b.x} ${b.y}`;
}

const leafCount = (n: RawNode): number =>
    n.children?.length ? n.children.reduce((sum, c) => sum + leafCount(c), 0) : 1;

export default function StackMap({ graph, links }: { graph: RawNode[]; links: [string, string][] }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);
    const [hover, setHover] = useState<string | null>(null);

    const { nodes, byId } = useMemo(() => {
        const out: Node[] = [];

        const place = (
            items: RawNode[],
            from: number,
            to: number,
            depth: number,
            parent: string | null,
            branch: number,
        ) => {
            const total = items.reduce((s, i) => s + leafCount(i), 0);
            let cursor = from;
            items.forEach((item, idx) => {
                const share = (leafCount(item) / total) * (to - from);
                const pad = items.length > 1 ? GAP : 0;
                const start = cursor + pad / 2;
                const stop = cursor + share - pad / 2;
                const angle = (start + stop) / 2;
                const r = RADII[depth];
                const [x, y] = polar(r, angle);
                const id = `${parent ?? 'root'}/${item.name}`;
                const ownBranch = depth === 1 ? idx : branch;
                out.push({ id, name: item.name, note: item.note ?? '', depth, angle, r, x, y, parent, branch: ownBranch });
                if (item.children?.length) place(item.children, start, stop, depth + 1, id, ownBranch);
                cursor += share;
            });
        };

        place(graph, -90, 270, 1, null, 0);
        return { nodes: out, byId: new Map(out.map((n) => [n.id, n])) };
    }, [graph]);

    const crossPairs = useMemo(() => {
        const byName = new Map<string, Node>();
        nodes.forEach((n) => byName.set(n.name, n));
        return links
            .map(([a, b]) => [byName.get(a), byName.get(b)] as const)
            .filter((p): p is readonly [Node, Node] => Boolean(p[0] && p[1]));
    }, [links, nodes]);

    // Lit on hover: ancestry, descendants, and cross-linked partners.
    const lit = useMemo(() => {
        if (!hover) return null;
        const set = new Set<string>([hover]);
        let cur = byId.get(hover);
        while (cur?.parent) {
            set.add(cur.parent);
            cur = byId.get(cur.parent);
        }
        const addKids = (id: string) =>
            nodes
                .filter((n) => n.parent === id)
                .forEach((n) => {
                    set.add(n.id);
                    addKids(n.id);
                });
        addKids(hover);
        crossPairs.forEach(([a, b]) => {
            if (a.id === hover) set.add(b.id);
            if (b.id === hover) set.add(a.id);
        });
        return set;
    }, [hover, byId, nodes, crossPairs]);

    const dimmed = (id: string) => (lit ? !lit.has(id) : false);

    // Index rows: categories and the tools under them. Depth 3 stays on the map
    // only, so the list remains scannable inside a pinned section.
    const index = useMemo(
        () =>
            nodes
                .filter((n) => n.depth === 1)
                .map((cat) => ({ cat, tools: nodes.filter((n) => n.depth === 2 && n.parent === cat.id) })),
        [nodes],
    );

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

    return (
        <div ref={wrapRef} className={`stack-map ${shown ? 'is-in' : ''} w-full`}>
            <div className="grid items-center gap-10 lg:grid-cols-[248px_1fr]">
                <ul className="sm-index order-2 flex list-none flex-col gap-5 p-0 lg:order-1">
                    {index.map(({ cat, tools }) => (
                        <li key={cat.id}>
                            <button
                                type="button"
                                className={`sm-idx-cat ${lit?.has(cat.id) ? 'is-on' : ''}`}
                                onMouseEnter={() => setHover(cat.id)}
                                onMouseLeave={() => setHover((h) => (h === cat.id ? null : h))}
                                onFocus={() => setHover(cat.id)}
                                onBlur={() => setHover(null)}
                            >
                                {cat.name}
                            </button>
                            <ul className="mt-2 flex list-none flex-col p-0">
                                {tools.map((t) => (
                                    <li key={t.id}>
                                        <button
                                            type="button"
                                            className={`sm-idx-tool ${lit?.has(t.id) ? 'is-on' : ''}`}
                                            onMouseEnter={() => setHover(t.id)}
                                            onMouseLeave={() => setHover((h) => (h === t.id ? null : h))}
                                            onFocus={() => setHover(t.id)}
                                            onBlur={() => setHover(null)}
                                        >
                                            <span>{t.name}</span>
                                            <span className="sm-idx-note">{t.note}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                <svg
                viewBox="-620 -470 1240 940"
                preserveAspectRatio="xMidYMid meet"
                className="order-1 mx-auto block max-h-[68dvh] w-full lg:order-2"
                role="img"
                aria-label="Stack shown as a layered connection map of categories, tools and practices"
            >
                {RADII.slice(1).map((r) => (
                    <circle key={r} r={r} className="sm-ring" />
                ))}

                {nodes.map((n, i) => {
                    const p = n.parent ? byId.get(n.parent) : null;
                    const on = Boolean(lit?.has(n.id) && (!p || lit.has(p.id)));
                    return (
                        <path
                            key={`l-${n.id}`}
                            className={`sm-link sm-link-d${n.depth} ${on ? 'sm-link-on' : ''}`}
                            d={branchPath(p ? p.r : 0, p ? p.angle : n.angle, n.r, n.angle)}
                            style={{ opacity: dimmed(n.id) ? 0.08 : 1, ['--i' as string]: i % 12 }}
                        />
                    );
                })}

                {crossPairs.map(([a, b]) => {
                    const on = Boolean(lit?.has(a.id) && lit?.has(b.id));
                    return (
                        <path
                            key={`x-${a.id}-${b.id}`}
                            className={`sm-cross ${on ? 'sm-cross-on' : ''}`}
                            d={chordPath(a, b)}
                            style={{ opacity: lit ? (on ? 1 : 0.05) : 0.3 }}
                        />
                    );
                })}

                <g className="sm-core">
                    <circle r="66" className="sm-core-ring" />
                    <circle r="48" className="sm-core-ring sm-core-ring-inner" />
                    <circle r="6" className="sm-core-dot" />
                    <text className="sm-core-label" y="90" textAnchor="middle">
                        stack
                    </text>
                </g>

                {nodes.map((n, i) => {
                    const end = n.x < 0;
                    const isCat = n.depth === 1;
                    return (
                        <g
                            key={n.id}
                            className={`sm-node sm-d${n.depth}`}
                            style={{ ['--i' as string]: i % 12, opacity: dimmed(n.id) ? 0.2 : 1 }}
                            transform={`translate(${n.x} ${n.y})`}
                            onMouseEnter={() => setHover(n.id)}
                            onMouseLeave={() => setHover((h) => (h === n.id ? null : h))}
                            onFocus={() => setHover(n.id)}
                            onBlur={() => setHover(null)}
                        >
                            {/* Inner group carries the drift. A CSS transform on the
                                positioned node would override its SVG transform. */}
                            <g className="sm-float">
                                <circle r="20" className="sm-hit" />
                                <circle r={isCat ? 15 : 11} className="sm-halo" />
                                {isCat && <circle r="15" className="sm-cat-ring" />}
                                <circle r={isCat ? 5.5 : n.depth === 2 ? 4.5 : 3.5} className="sm-dot" />
                                <text
                                    className="sm-label"
                                    x={end ? (isCat ? -26 : -18) : isCat ? 26 : 18}
                                    y={n.note ? 0 : 5}
                                    textAnchor={end ? 'end' : 'start'}
                                >
                                    {n.name}
                                </text>
                                {n.note && (
                                    <text
                                        className="sm-note"
                                        x={end ? (isCat ? -26 : -18) : isCat ? 26 : 18}
                                        y="17"
                                        textAnchor={end ? 'end' : 'start'}
                                    >
                                        {n.note}
                                    </text>
                                )}
                            </g>
                        </g>
                    );
                })}
                </svg>
            </div>

        </div>
    );
}
