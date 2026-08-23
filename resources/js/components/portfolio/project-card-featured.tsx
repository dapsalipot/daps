import type { Project } from '@/types';
import { Link } from '@inertiajs/react';
import Card from './card';
import Chip from './chip';
import CommitBars from './commit-bars';
import { ArrowIcon } from './icons';
import LangDot from './lang-dot';
import RepoChrome from './repo-chrome';
import Screenshot from './screenshot';

export default function ProjectCardFeatured({ project }: { project: Project }) {
    return (
        <Card pad={0} className="repo-card relative flex flex-col overflow-hidden">
            <RepoChrome
                filename={`projects/${project.slug}/README.md`}
                lang={project.lang}
                branch={project.branch}
                hash={project.hash}
            >
                <div className="relative overflow-hidden">
                    <div className="repo-screenshot">
                        <Screenshot
                            title={project.screenshot.title}
                            subtitle={project.screenshot.subtitle}
                            tone={project.screenshot.tone}
                            ratio="16/9"
                            style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--line)' }}
                        />
                    </div>
                    <div
                        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40"
                        style={{ background: 'radial-gradient(circle, rgba(125,217,110,0.18), transparent 70%)' }}
                    />
                </div>
            </RepoChrome>

            <div className="flex flex-col gap-3.5 px-7 pt-6 pb-6">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-2">
                        <Chip tone="accent">case study</Chip>
                        {project.tag && <span className="text-fg-mid font-mono text-[11px]">{project.tag}</span>}
                    </div>
                    <span className="text-fg-dim font-mono text-[11px]">{project.year}</span>
                </div>

                <div>
                    <h3 className="text-fg text-[32px] leading-[1.1] font-medium tracking-tight">{project.name}</h3>
                    <span className="text-portfolio-accent font-mono text-[12px]">{project.kicker}</span>
                </div>

                <p className="text-fg-mid text-[14px] leading-relaxed">{project.blurb}</p>

                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {project.stack.map((s) => (
                            <Chip key={s}>
                                <LangDot name={s} size={7} />
                                {s}
                            </Chip>
                        ))}
                    </div>
                    <Link
                        href={`/projects/${project.slug}`}
                        className="link-slide text-fg inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px]"
                    >
                        read case study <ArrowIcon size={11} />
                    </Link>
                </div>

                {project.metrics.length > 0 && (
                    <div
                        className="border-line grid gap-2.5 border-t pt-4"
                        style={{ gridTemplateColumns: `repeat(${project.metrics.length}, 1fr)` }}
                    >
                        {project.metrics.map(([n, l]) => (
                            <div key={l}>
                                <div className="text-portfolio-accent text-[20px] font-medium tracking-tight">{n}</div>
                                <span className="text-fg-dim font-mono text-[10.5px]">{l}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-line bg-bg-elev-2 text-fg-dim mt-auto flex items-center justify-between border-t px-4 py-2 font-mono text-[10.5px]">
                <span className="inline-flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="bg-portfolio-accent h-1.5 w-1.5 rounded-full" /> deployed
                    </span>
                    <span>· UTF-8</span>
                    <span>· LF</span>
                </span>
                <CommitBars h={12} />
            </div>
        </Card>
    );
}
