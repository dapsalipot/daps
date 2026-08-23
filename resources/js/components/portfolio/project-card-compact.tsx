import type { Project } from '@/types';
import { Link } from '@inertiajs/react';
import Card from './card';
import Chip from './chip';
import LangDot from './lang-dot';
import RepoChrome from './repo-chrome';
import Screenshot from './screenshot';

export default function ProjectCardCompact({ project }: { project: Project }) {
    const filename = '/' + project.slug;
    return (
        <Link href={`/projects/${project.slug}`} className="block">
            <Card pad={0} className="repo-card flex flex-1 flex-col overflow-hidden">
                <RepoChrome filename={filename} lang={project.lang} branch={project.branch}>
                    <div className="overflow-hidden">
                        <div className="repo-screenshot">
                            <Screenshot
                                title={project.screenshot.title}
                                subtitle={project.screenshot.subtitle}
                                tone={project.screenshot.tone}
                                ratio="16/10"
                                style={{
                                    borderRadius: 0,
                                    border: 'none',
                                    borderBottom: '1px solid var(--line)',
                                }}
                            />
                        </div>
                    </div>
                </RepoChrome>
                <div className="flex flex-col gap-2 px-[18px] py-3.5">
                    <div className="flex items-baseline justify-between">
                        <h4 className="text-fg text-[18px] font-medium tracking-tight">{project.name}</h4>
                        <span className="text-fg-dim font-mono text-[11px]">{project.year}</span>
                    </div>
                    {project.tag && <span className="text-portfolio-accent font-mono text-[11px]">{project.tag}</span>}
                    <p className="text-fg-mid text-[13px] leading-[1.55]">{project.blurb}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                        {project.stack.map((s) => (
                            <Chip key={s}>
                                <LangDot name={s} size={6} />
                                {s}
                            </Chip>
                        ))}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
