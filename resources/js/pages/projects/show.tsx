import Button from '@/components/portfolio/button';
import Card from '@/components/portfolio/card';
import Chip from '@/components/portfolio/chip';
import { ArrowIcon, ArrowNEIcon, ExtIcon } from '@/components/portfolio/icons';
import LangDot from '@/components/portfolio/lang-dot';
import RepoChrome from '@/components/portfolio/repo-chrome';
import Screenshot from '@/components/portfolio/screenshot';
import SectionHead from '@/components/portfolio/section-head';
import PortfolioLayout from '@/layouts/portfolio-layout';
import type { Project } from '@/types';
import { Link } from '@inertiajs/react';

export default function ProjectShow({ project }: { project: Project }) {
    return (
        <PortfolioLayout title={`${project.name} - Case study`} active="work">
            <section className="px-6 pt-12 pb-8 md:px-12 md:pt-16 md:pb-10">
                <Link href="/projects" className="link-slide text-fg-mid inline-flex items-center gap-1.5 font-mono text-[11px]">
                    <ArrowIcon className="rotate-180" /> all projects
                </Link>
                <div className="mt-6 grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.6fr_1fr]">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Chip tone="accent">case study</Chip>
                            {project.tag && <span className="text-fg-mid font-mono text-[11px]">{project.tag}</span>}
                            <span className="text-fg-dim font-mono text-[11px]">· {project.year}</span>
                        </div>
                        <h1 className="text-fg mt-4 font-sans text-[48px] leading-none font-medium tracking-tight md:text-[72px]">
                            {project.name}
                        </h1>
                        <p className="text-portfolio-accent mt-2 font-mono text-[14px]">{project.kicker}</p>
                        <p className="text-fg-mid mt-5 max-w-2xl text-[16px] leading-relaxed">{project.blurb}</p>
                        <div className="mt-5 flex flex-wrap gap-1.5">
                            {project.stack.map((s) => (
                                <Chip key={s}>
                                    <LangDot name={s} size={7} />
                                    {s}
                                </Chip>
                            ))}
                        </div>
                    </div>
                    {project.metrics.length > 0 && (
                        <Card pad={22}>
                            <span className="text-portfolio-accent font-mono text-[11px]">// outcomes</span>
                            <div className="mt-3.5 grid grid-cols-3 gap-3">
                                {project.metrics.map(([n, l]) => (
                                    <div key={l}>
                                        <div className="text-fg text-[28px] font-medium tracking-tight">{n}</div>
                                        <span className="text-fg-dim font-mono text-[10.5px]">{l}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </section>

            {/* Hero. Real capture when one exists; otherwise a plain placeholder,
                without inventing a filename or commit for something that has none. */}
            <section className="px-6 pb-10 md:px-12">
                <Card pad={0} className="overflow-hidden">
                    {project.case_study.screenshots?.length ? (
                        <RepoChrome
                            filename={project.case_study.screenshots[0].src.replace(/^\//, '')}
                            lang={project.lang}
                            branch={project.branch}
                            hash={project.hash}
                        >
                            <img
                                src={project.case_study.screenshots[0].src}
                                alt={project.case_study.screenshots[0].alt}
                                className="block h-auto w-full"
                                loading="eager"
                            />
                        </RepoChrome>
                    ) : (
                        <Screenshot
                            title={project.screenshot.title}
                            subtitle={project.screenshot.subtitle}
                            tone={project.screenshot.tone}
                            ratio="16/9"
                            style={{ borderRadius: 0, border: 'none' }}
                        />
                    )}
                </Card>
                {project.case_study.screenshots?.length ? (
                    <p className="text-fg-dim mt-3 max-w-3xl font-mono text-[11px] leading-relaxed">
                        ↳ {project.case_study.screenshots[0].caption}
                    </p>
                ) : null}
            </section>

            <section className="px-6 pb-10 md:px-12">
                <SectionHead n="01" title="case_study.md" right="problem · role · outcome" />
                <div className="mt-8 flex flex-col">
                    {(
                        [
                            ['Problem', project.case_study.problem],
                            ['Role', project.case_study.role],
                            ['Outcome', project.case_study.outcome],
                        ] as const
                    ).map(([label, body]) => (
                        <div
                            key={label}
                            className="border-line grid grid-cols-1 gap-3 border-t py-7 md:grid-cols-[160px_1fr] md:gap-10"
                        >
                            <span className="text-fg text-[15px] font-medium tracking-tight">{label}</span>
                            <p className="text-fg-mid max-w-3xl text-[17px] leading-relaxed">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modules grid - only renders when project ships them */}
            {project.case_study.modules?.length ? (
                <section className="px-6 pb-10 md:px-12">
                    <SectionHead n="02" title="modules" right={`${project.case_study.modules.length} shipped`} />
                    <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {project.case_study.modules.map((m, i) => (
                            <Card key={m.name} pad={18} className="repo-card">
                                <span className="text-fg-fade font-mono text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                                <div className="text-fg mt-2 text-[16px] font-medium tracking-tight">{m.name}</div>
                                <p className="text-fg-mid mt-1.5 text-[13px] leading-relaxed">{m.desc}</p>
                            </Card>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* Screenshot gallery - only renders extras beyond the hero shot */}
            {project.case_study.screenshots && project.case_study.screenshots.length > 1 ? (
                <section className="px-6 pb-10 md:px-12">
                    <SectionHead
                        n={project.case_study.modules?.length ? '03' : '02'}
                        title="screenshots"
                        right={`${project.case_study.screenshots.length - 1} more`}
                    />
                    <div className="mt-7 flex flex-col gap-8">
                        {project.case_study.screenshots.slice(1).map((s, i) => (
                            <figure key={s.src} className="flex flex-col gap-3">
                                <Card pad={0} className="overflow-hidden">
                                    <RepoChrome
                                        filename={s.src.replace(/^\//, '')}
                                        lang={project.lang}
                                        branch={project.branch}
                                        hash={`${project.hash.slice(0, -1)}${i + 1}`}
                                    >
                                        <img
                                            src={s.src}
                                            alt={s.alt}
                                            className="block h-auto w-full"
                                            loading="lazy"
                                        />
                                    </RepoChrome>
                                </Card>
                                <figcaption className="text-fg-dim max-w-3xl font-mono text-[11px] leading-relaxed">
                                    ↳ {s.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* Actions */}
            {project.case_study.links.live || project.case_study.links.repo ? (
                <section className="px-6 pb-10 md:px-12">
                    <div className="border-line flex flex-wrap gap-3 border-t pt-10">
                        {project.case_study.links.live && (
                            <Button
                                kind="accent"
                                size="lg"
                                trailing={<ExtIcon />}
                                as="a"
                                href={project.case_study.links.live}
                            >
                                visit live
                            </Button>
                        )}
                        {project.case_study.links.repo && (
                            <Button
                                kind="secondary"
                                size="lg"
                                trailing={<ExtIcon />}
                                as="a"
                                href={project.case_study.links.repo}
                            >
                                view repo
                            </Button>
                        )}
                    </div>
                </section>
            ) : null}

            {/* Coverage. For work with no shippable artifact this is the record,
                so it gets a section of its own rather than a footnote. */}
            {project.case_study.coverage?.length ? (
                <section className="px-6 pb-24 md:px-12">
                    <div className="border-line border-t pt-12">
                        <h2 className="text-fg font-sans text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">
                            Written about
                        </h2>
                        <p className="text-fg-mid mt-3 max-w-[54ch] text-[16px] leading-relaxed">
                            Independent coverage of this work.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {project.case_study.coverage.map((c) => (
                                <a
                                    key={c.url}
                                    href={c.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group border-line bg-bg-elev hover:border-portfolio-accent/40 flex items-start justify-between gap-5 rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <div className="min-w-0">
                                        <span className="text-fg-dim font-mono text-[10.5px]">
                                            {new URL(c.url).hostname.replace(/^www\./, '')}
                                        </span>
                                        <div className="text-fg group-hover:text-portfolio-accent mt-2 text-[17px] leading-snug font-medium tracking-tight transition-colors">
                                            {c.label}
                                        </div>
                                    </div>
                                    <span className="text-fg-dim group-hover:text-portfolio-accent mt-1 shrink-0 transition-colors">
                                        <ArrowNEIcon size={17} />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

        </PortfolioLayout>
    );
}
