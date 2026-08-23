import LangDot from '@/components/portfolio/lang-dot';
import ProjectCardCompact from '@/components/portfolio/project-card-compact';
import SectionHead from '@/components/portfolio/section-head';
import TechMarquee from '@/components/portfolio/tech-marquee';
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
            <section className="px-6 pt-12 pb-8 md:px-12 md:pt-16 md:pb-10">
                <span className="text-portfolio-accent font-mono text-[11px]">// 01 - selected_work</span>
                <h1 className="text-fg mt-3.5 font-sans text-[48px] leading-none font-medium tracking-tight md:text-[80px]">
                    Selected work, 2022 - 2026.
                </h1>
                <p className="text-fg-mid mt-4 max-w-2xl text-[16px]">
                    {portfolio.projects.length} end-to-end builds: shipped production systems, active side projects, and academic work.
                </p>
            </section>

            <TechMarquee stacks={portfolio.projects.map((p) => p.stack)} />

            <section className="px-6 pb-6 md:px-12">
                <div className="text-fg-mid bg-bg-elev border-line flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 font-mono text-[12px]">
                    <span className="text-portfolio-accent">$ filter</span>
                    <button
                        onClick={() => setFilter(null)}
                        className={`hover:text-fg rounded-md px-2.5 py-1 transition-colors ${filter === null ? 'bg-fg text-bg' : ''}`}
                    >
                        all
                    </button>
                    {allLangs.map((l) => (
                        <button
                            key={l}
                            onClick={() => setFilter(l)}
                            className={`hover:text-fg inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors ${filter === l ? 'bg-fg text-bg' : ''}`}
                        >
                            <LangDot name={l} size={6} />
                            {l}
                        </button>
                    ))}
                </div>
            </section>

            <section className="px-6 pb-24 md:px-12">
                <SectionHead n="02" title="grid" right={`${filtered.length} of ${portfolio.projects.length}`} />
                <div className="stagger-in mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((p) => (
                        <ProjectCardCompact key={p.slug} project={p} />
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="text-fg-mid mt-8 font-mono text-[13px]">No projects match this filter.</div>
                )}
            </section>
        </PortfolioLayout>
    );
}
