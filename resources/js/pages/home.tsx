import Button from '@/components/portfolio/button';
import CodeBlock from '@/components/portfolio/code-block';
import { ArrowIcon, ArrowNEIcon, ExtIcon, LinkedinIcon } from '@/components/portfolio/icons';
import LangDot from '@/components/portfolio/lang-dot';
import IntroSequence from '@/components/portfolio/intro-sequence';
import SectionHead from '@/components/portfolio/section-head';
import StackMap from '@/components/portfolio/stack-map';
import WorkCarousel from '@/components/portfolio/work-carousel';
import StatusDot from '@/components/portfolio/status-dot';
import PortfolioLayout from '@/layouts/portfolio-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Home() {
    const { portfolio } = usePage<SharedData>().props;

    return (
        <PortfolioLayout title="Daniel Andrei Salipot - Portfolio" active="home">
            {/* INTRO - scrollable, object scrubs while detail beats transition */}
            <IntroSequence
                poster="/intro/object-poster.png"
                finale={
                    <>
                    <div className="relative mx-auto w-full max-w-3xl text-center">
                        <div className="mb-7 flex justify-center">
                            <span className="border-line bg-bg-elev/70 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 backdrop-blur">
                                <StatusDot>{portfolio.identity.available.label}</StatusDot>
                            </span>
                        </div>

                        <h1 className="text-fg font-sans text-[52px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[84px]">
                            Daniel Andrei Salipot
                        </h1>

                        <p className="text-fg-mid mx-auto mt-5 max-w-[42ch] font-sans text-[20.5px] leading-[1.38] tracking-[-0.01em] md:text-[27px]">
                            Backend developer building production systems end to end, from database design to hardware.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="/projects"
                                className="bg-portfolio-accent inline-flex items-center gap-2 rounded-full px-7 py-3 text-[16.5px] font-medium text-on-accent transition hover:opacity-90"
                            >
                                View work
                                <ArrowIcon size={15} />
                            </a>
                            <a
                                href="/resume.pdf"
                                target="_blank"
                                rel="noreferrer"
                                className="border-line bg-bg-elev/70 text-fg hover:border-line-strong inline-flex items-center gap-2 rounded-full border px-7 py-3 text-[16.5px] font-medium backdrop-blur transition"
                            >
                                Resume
                                <ExtIcon size={13} />
                            </a>
                        </div>
                    </div>
            
                    </>
                }
            />

            {/* WORK CAROUSEL - scroll-driven, pins while rotating */}
            <WorkCarousel projects={portfolio.projects} />

            {/* NOW */}
            <section className="relative" style={{ height: 'calc(100dvh + 55vh)' }}>
                <div className="sticky top-0 flex min-h-dvh flex-col justify-center px-6 py-20 md:px-12">
                <SectionHead n="01" title="now()" right="updated 14 may 2026" />
                <div className="stagger-in mt-10 flex flex-col">
                    {portfolio.now.map((it, i) => (
                        <div
                            key={`${it.label}-${it.title}`}
                            className="border-line group grid grid-cols-1 items-baseline gap-4 border-t py-10 transition-colors md:grid-cols-[52px_170px_1fr] md:gap-8"
                        >
                            <span className="text-fg-fade group-hover:text-portfolio-accent font-mono text-[13.5px] tabular-nums transition-colors">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-portfolio-accent font-mono text-[15px] lowercase">
                                {it.label}
                            </span>
                            <div>
                                <div className="text-fg text-[26px] leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-1 md:text-[34px]">
                                    {it.title}
                                </div>
                                <p className="text-fg-mid mt-3 max-w-2xl font-mono text-[14.5px] leading-[1.75] md:text-[15.5px]">
                                    {it.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </section>

            {/* STACK */}
            <section className="relative" style={{ height: 'calc(100dvh + 55vh)' }}>
                <div className="sticky top-0 flex min-h-dvh flex-col justify-center px-6 py-20 md:px-12">
                <SectionHead n="02" title="stack.json" right="daily drivers · 2026" />
                <div className="mt-6 flex flex-1 items-center">
                    <StackMap
                        graph={portfolio.stack_graph}
                        links={portfolio.stack_links}
                        projects={portfolio.projects}
                    />
                </div>
                </div>
            </section>

            {/* EXPERIENCE */}
            <section className="flex min-h-dvh flex-col justify-center px-6 py-20 md:px-12">
                <SectionHead n="03" title="experience.log" right="most recent first" />
                <div className="mt-6">
                    {portfolio.experience.map((e) => (
                        <div
                            key={`${e.from}-${e.role}`}
                            className="border-line border-t py-6"
                        >
                            <div className="grid grid-cols-1 items-baseline gap-4 md:grid-cols-[180px_1.4fr_1fr_40px] md:gap-8">
                                <span className="text-portfolio-accent font-mono text-[13.5px]">
                                    {e.from} - {e.to}
                                </span>
                                <div>
                                    <div className="text-fg text-[24px] font-medium tracking-tight">
                                        {e.role} · <span className="text-fg-mid">{e.org}</span>
                                    </div>
                                    <span className="text-fg-dim font-mono text-[13.5px]">{e.loc}</span>
                                </div>
                                <div className="text-fg-mid text-[15.5px] leading-[1.75]">{e.note}</div>
                                <div className="text-fg-mid text-right">
                                    <ArrowNEIcon />
                                </div>
                            </div>

                            {e.projects.length > 0 && (
                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr] md:gap-8">
                                    <span className="text-fg-dim font-mono text-[13.5px]">
                                        selected highlights
                                    </span>
                                    <ul className="flex list-none flex-col gap-4 p-0">
                                        {e.projects.map((p, idx) => (
                                            <li
                                                key={idx}
                                                className="flex flex-col gap-2"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="bg-portfolio-accent/15 text-portfolio-accent border-portfolio-accent/25 inline-flex items-center gap-1 rounded border px-1.5 py-[2px] font-mono text-[13.5px] font-medium uppercase tracking-wider">
                                                        IoT
                                                    </span>
                                                    {p.tech.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="text-fg bg-bg-elev border-line inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[13.5px] font-medium leading-none"
                                                        >
                                                            <LangDot name={t.split(' ')[0]} size={6} />
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-fg-dim text-[14.5px] leading-relaxed">
                                                    ↳ {p.context}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ACHIEVEMENTS */}
            <section className="relative" style={{ height: 'calc(100dvh + 55vh)' }}>
                <div className="sticky top-0 flex min-h-dvh flex-col justify-center px-6 py-20 md:px-12">
                <SectionHead n="04" title="achievements" right="awards · certs · honors" />
                <div className="mt-12 grid flex-1 grid-cols-1 content-center gap-x-16 md:grid-cols-2">
                    {portfolio.achievements.map((a) => (
                        <div
                            key={`${a.yr}-${a.t}`}
                            className="border-line flex items-baseline gap-6 border-t py-8 md:gap-8"
                        >
                            <span className="text-fg-fade shrink-0 font-mono text-[28px] leading-none font-medium tracking-tight tabular-nums md:text-[34px]">
                                {a.yr}
                            </span>
                            <div className="min-w-0">
                                <div className="text-fg text-[20.5px] leading-tight font-medium tracking-tight">
                                    {a.t}
                                </div>
                                <div className="text-portfolio-accent mt-1 font-mono text-[13.5px]">{a.where}</div>
                                <p className="text-fg-mid mt-3 max-w-[52ch] text-[15.5px] leading-[1.75]">{a.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </section>

            {/* CONTACT CTA */}
            <section className="relative" style={{ height: 'calc(100dvh + 55vh)' }}>
                <div className="sticky top-0 flex min-h-dvh flex-col justify-center px-6 py-24 md:px-12">
                <div
                    className="border-line relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-2xl border p-8 md:p-14 lg:grid-cols-[1.4fr_1fr]"
                    style={{ background: 'linear-gradient(135deg, var(--bg-elev) 0%, var(--bg) 100%)' }}
                >
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(125,217,110,0.08) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <div className="relative">
                        <h2 className="text-fg font-sans text-[40px] leading-none font-medium tracking-tight md:text-[52px]">
                            Have a project
                            <br />
                            in mind?
                        </h2>
                        <p className="text-fg-mid mt-4 max-w-md text-[17.5px] leading-relaxed">
                            Open to remote, hybrid, and onsite work in Metro Manila. Laravel and PHP backends, multi-tenant SaaS, payments, and hardware integration. Reply within 48h.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2.5">
                            <Button kind="accent" size="lg" trailing={<ArrowNEIcon />} as="a" href={`mailto:${portfolio.links.email}`}>
                                {portfolio.links.email}
                            </Button>
                            <Button kind="secondary" size="lg" icon={<LinkedinIcon />} as="a" href={portfolio.links.linkedin} target="_blank" rel="noreferrer">
                                LinkedIn
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <CodeBlock
                            lines={[
                                { p: '$', t: 'mail -s "hello daniel"' },
                                { t: `  --to ${portfolio.links.email}` },
                                { t: '' },
                                { c: 'var(--portfolio-accent)', t: '⌛ replies within 48h' },
                            ]}
                        />
                    </div>
                </div>
                </div>
            </section>
        </PortfolioLayout>
    );
}
