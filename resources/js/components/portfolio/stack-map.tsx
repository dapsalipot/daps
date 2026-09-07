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
    used_in?: string[];
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
    usedIn: string[];
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

export default function StackMap({
    graph,
    links,
    projects,
}: {
    graph: RawNode[];
    links: [string, string][];
    projects: { slug: string; name: string; stack: string[] }[];
}) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);
    const [hover, setHover] = useState<string | null>(null);
    const [view, setView] = useState({ z: 1, x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

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
                out.push({
                    id, name: item.name, note: item.note ?? '', depth, angle, r, x, y,
                    parent, branch: ownBranch, usedIn: item.used_in ?? [],
                });
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

    const active = hover ? byId.get(hover) : null;

    /** Declared usage, plus any project whose own stack names this node. Nothing
     *  invented: both halves come from config. */
    const appliedIn = useMemo(() => {
        if (!active) return [];
        const slugs = new Set(active.usedIn);
        projects.forEach((p) => {
            if (p.stack.some((t) => t.toLowerCase() === active.name.toLowerCase())) slugs.add(p.slug);
        });
        return projects.filter((p) => slugs.has(p.slug));
    }, [active, projects]);

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

    const clampZoom = (z: number) => Math.min(Math.max(z, 0.6), 2.6);
    const zoomBy = (f: number) => setView((v) => ({ ...v, z: clampZoom(v.z * f) }));
    const resetView = () => setView({ z: 1, x: 0, y: 0 });

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return; // plain wheel belongs to the page
            e.preventDefault();
            setView((v) => ({ ...v, z: clampZoom(v.z * (e.deltaY < 0 ? 1.12 : 0.89)) }));
        };

        let dragging = false;
        let sx = 0;
        let sy = 0;
        let ox = 0;
        let oy = 0;
        const down = (e: PointerEvent) => {
            if (e.button !== 0) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            setView((v) => { ox = v.x; oy = v.y; return v; });
            svg.setPointerCapture(e.pointerId);
        };
        const move = (e: PointerEvent) => {
            if (!dragging) return;
            const k = 1240 / svg.clientWidth; // viewBox units per css px
            setView((v) => ({ ...v, x: ox + (e.clientX - sx) * k, y: oy + (e.clientY - sy) * k }));
        };
        const up = (e: PointerEvent) => {
            dragging = false;
            if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId);
        };

        svg.addEventListener('wheel', onWheel, { passive: false });
        svg.addEventListener('pointerdown', down);
        svg.addEventListener('pointermove', move);
        svg.addEventListener('pointerup', up);
        svg.addEventListener('pointercancel', up);
        return () => {
            svg.removeEventListener('wheel', onWheel);
            svg.removeEventListener('pointerdown', down);
            svg.removeEventListener('pointermove', move);
            svg.removeEventListener('pointerup', up);
            svg.removeEventListener('pointercancel', up);
        };
    }, []);

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
            <div className="relative grid items-center gap-8 lg:grid-cols-[300px_1fr] lg:pr-[248px]">
                <ul className="sm-index order-2 list-none p-0 lg:order-1 lg:columns-2 lg:gap-x-7">
                    {index.map(({ cat, tools }) => (
                        <li key={cat.id} className="mb-5 break-inside-avoid">
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

                <div className="sm-canvas order-1 relative lg:order-2">
                    <svg
                        ref={svgRef}
                        viewBox="-620 -470 1240 940"
                        preserveAspectRatio="xMidYMid meet"
                        className="block max-h-[70dvh] w-full cursor-grab touch-pan-y active:cursor-grabbing"
                        role="img"
                        aria-label="Stack shown as a layered connection map of categories, tools and practices"
                    >
                    <g transform={`translate(${view.x} ${view.y}) scale(${view.z})`}>
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
                    </g>
                    </svg>

                    <div className="sm-zoom">
                        <button type="button" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
                        <button type="button" onClick={() => zoomBy(0.8)} aria-label="Zoom out">&minus;</button>
                        <button type="button" onClick={resetView} aria-label="Reset view" className="sm-zoom-reset">
                            reset
                        </button>
                    </div>
                </div>

                    {/* Overlaid, not a column: a third grid track would cost the map
                        the width this change was meant to give it. */}
                    <div
                        className="sm-card pointer-events-none absolute top-1/2 right-0 hidden w-[228px] -translate-y-1/2 lg:block"
                        style={{
                            opacity: active ? 1 : 0,
                            transform: `translateY(-50%) translateX(${active ? 0 : 10}px)`,
                        }}
                        aria-live="polite"
                    >
                        <div className="text-portfolio-accent font-mono text-[13px] tracking-[0.08em]">
                            {active ? graph[active.branch]?.name : ' '}
                        </div>
                        <div className="text-fg mt-2 text-[24px] leading-tight tracking-tight">
                            {active?.name ?? ' '}
                        </div>
                        <div className="text-fg-mid mt-1.5 font-mono text-[13.5px]">{active?.note || ' '}</div>

                        <div className="border-line mt-5 border-t pt-4">
                            <div className="text-fg-fade font-mono text-[12px] tracking-[0.08em]">
                                applied in
                            </div>
                            {appliedIn.length ? (
                                <ul className="mt-2.5 flex list-none flex-wrap gap-1.5 p-0">
                                    {appliedIn.map((p) => (
                                        <li
                                            key={p.slug}
                                            className="border-line text-fg-mid rounded-md border px-2 py-1 font-mono text-[12px]"
                                        >
                                            {p.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-fg-dim mt-2 font-mono text-[12.5px]">
                                    {active ? 'client work, not a public project' : ' '}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

        </div>
    );
}
