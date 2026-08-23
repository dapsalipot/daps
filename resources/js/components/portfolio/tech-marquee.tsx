import LangDot from './lang-dot';

/**
 * Auto-scrolling horizontal strip of language % across all projects.
 * Calculates percentages from a flat list of stack tags.
 * Pauses on hover (group-hover trick on the inner element).
 */
export default function TechMarquee({ stacks }: { stacks: string[][] }) {
    // Flatten + count
    const counts = stacks.flat().reduce<Record<string, number>>((acc, t) => {
        acc[t] = (acc[t] ?? 0) + 1;
        return acc;
    }, {});

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const entries = Object.entries(counts)
        .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) }))
        .sort((a, b) => b.pct - a.pct);

    // Duplicate the list so the marquee loops seamlessly
    const loop = [...entries, ...entries];

    return (
        <div className="border-line group relative overflow-hidden border-y py-3">
            {/* Fade masks on each edge so items appear/disappear softly */}
            <div className="from-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent" />
            <div className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent" />

            <div
                className="flex w-max gap-8 will-change-transform group-hover:[animation-play-state:paused]"
                style={{ animation: 'marquee 32s linear infinite' }}
            >
                {loop.map((e, i) => (
                    <span
                        key={`${e.name}-${i}`}
                        className="text-fg-mid inline-flex items-center gap-2 font-mono text-[12px] whitespace-nowrap"
                    >
                        <LangDot name={e.name} size={7} />
                        <span className="text-fg">{e.name}</span>
                        <span className="text-fg-dim">{e.pct}%</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
