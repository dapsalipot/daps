import type { Project } from '@/types';
import { Link } from '@inertiajs/react';
import Chip from './chip';
import { ArrowIcon } from './icons';
import LangDot from './lang-dot';
import Screenshot from './screenshot';

/**
 * Grid card for the work index. Leads with the project's own screenshot when
 * one exists, falling back to the tonal placeholder otherwise. Deliberately
 * quiet: no repo chrome, no branch label, no status decoration.
 */
export default function ProjectCardCompact({ project }: { project: Project }) {
    const shot = project.case_study.screenshots?.[0];

    return (
        <Link
            href={`/projects/${project.slug}`}
            className="group border-line bg-bg-elev hover:border-line-strong flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}
        >
            <div className="border-line overflow-hidden border-b">
                {shot ? (
                    <img
                        src={shot.src}
                        alt={shot.alt}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="transition-transform duration-500 group-hover:scale-[1.02]">
                        <Screenshot
                            title={project.screenshot.title}
                            subtitle={project.screenshot.subtitle}
                            tone={project.screenshot.tone}
                            ratio="16/10"
                            style={{ borderRadius: 0, border: 'none' }}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-fg text-[19px] leading-tight font-medium tracking-tight">{project.name}</h3>
                    <span className="text-fg-dim shrink-0 font-mono text-[11px] tabular-nums">{project.year}</span>
                </div>

                {project.tag && (
                    <span className="text-portfolio-accent mt-1.5 font-mono text-[11px]">{project.tag}</span>
                )}

                <p className="text-fg-mid mt-3 line-clamp-2 text-[13.5px] leading-relaxed">{project.blurb}</p>

                <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {project.stack.slice(0, 3).map((s) => (
                            <Chip key={s}>
                                <LangDot name={s} size={6} />
                                {s}
                            </Chip>
                        ))}
                    </div>
                    <span className="text-fg-dim group-hover:text-fg shrink-0 transition-colors">
                        <ArrowIcon size={15} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
