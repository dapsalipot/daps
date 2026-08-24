import LangDot from '@/components/portfolio/lang-dot';
import ProjectCardCompact from '@/components/portfolio/project-card-compact';
import PortfolioLayout from '@/layouts/portfolio-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function ProjectsIndex() {
    const { portfolio } = usePage<SharedData>().props;
    const [filter, setFilter] = useState<string | null>(null);

    const allLangs = useMemo(() => {
        const set = new Set<string>();
        portfolio.projects.forEach((p) => p.stack.forEach((s) => set.add(s)));
        return Array.from(set).sort();
    }, [portfolio.projects]);

    const filtered = filter ? portfolio.projects.filter((p) => p.stack.includes(filter)) : portfolio.projects;

    return (
        <PortfolioLayout title="Work - Daniel Andrei Salipot" active="work">
            <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
                <section className="pt-20 pb-14 md:pt-28 md:pb-20">
                    <h1 className="text-fg max-w-[16ch] font-sans text-[46px] leading-[1.03] font-semibold tracking-[-0.03em] md:text-[76px]">
                        Selected work, 2022 to 2026.
                    </h1>
                    <p className="text-fg-mid mt-6 max-w-[52ch] text-[17px] leading-relaxed md:text-[19px]">
                        {portfolio.projects.length} end-to-end builds: shipped production systems, active side
                        projects, and academic work.
                    </p>
                </section>

                <section className="border-line flex flex-wrap items-center gap-x-2 gap-y-3 border-t py-8">
                    <button
                        onClick={() => setFilter(null)}
                        aria-pressed={filter === null}
                        className={`rounded-full px-4 py-2 font-mono text-[12px] transition-colors ${
                            filter === null
                                ? 'bg-fg text-bg'
                                : 'text-fg-mid hover:text-fg hover:bg-bg-elev'
                        }`}
                    >
                        all
                    </button>
                    {allLangs.map((l) => (
                        <button
                            key={l}
                            onClick={() => setFilter(l)}
                            aria-pressed={filter === l}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[12px] transition-colors ${
                                filter === l ? 'bg-fg text-bg' : 'text-fg-mid hover:text-fg hover:bg-bg-elev'
                            }`}
                        >
                            <LangDot name={l} size={6} />
                            {l}
                        </button>
                    ))}
                    <span className="text-fg-dim ml-auto font-mono text-[12px] tabular-nums">
                        {filtered.length} of {portfolio.projects.length}
                    </span>
                </section>

                <section className="pt-4 pb-32">
                    {filtered.length > 0 ? (
                        <div className="stagger-in grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {filtered.map((p) => (
                                <ProjectCardCompact key={p.slug} project={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="border-line flex flex-col items-start gap-4 rounded-2xl border border-dashed px-8 py-16">
                            <p className="text-fg text-[17px]">Nothing built with {filter} yet.</p>
                            <button
                                onClick={() => setFilter(null)}
                                className="text-portfolio-accent font-mono text-[13px] underline underline-offset-4"
                            >
                                Show all work
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </PortfolioLayout>
    );
}
