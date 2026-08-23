import Button from '@/components/portfolio/button';
import Card from '@/components/portfolio/card';
import CodeBlock from '@/components/portfolio/code-block';
import { ArrowIcon, ArrowNEIcon, ExtIcon, LinkedinIcon } from '@/components/portfolio/icons';
import LangDot from '@/components/portfolio/lang-dot';
import SectionHead from '@/components/portfolio/section-head';
import WorkCarousel from '@/components/portfolio/work-carousel';
import StatusDot from '@/components/portfolio/status-dot';
import PortfolioLayout from '@/layouts/portfolio-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Home() {
    const { portfolio } = usePage<SharedData>().props;

    return (
        <PortfolioLayout title="Daniel Salipot - Portfolio" active="home">
            {/* HERO */}
            <section className="relative flex min-h-[72dvh] flex-col items-center justify-center overflow-hidden px-6 pt-16 pb-6 text-center md:px-12 md:pt-20">
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 55% at 50% 0%, var(--portfolio-accent-sage), transparent 70%)',
                    }}
                />

                <div className="anim-fadeUp relative mx-auto w-full max-w-3xl">
                    <div className="mb-7 flex justify-center">
                        <span className="border-line bg-bg-elev/70 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 backdrop-blur">
                            <StatusDot>{portfolio.identity.available.label}</StatusDot>
                        </span>
                    </div>

                    <h1 className="text-fg font-sans text-[52px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[84px]">
                        Daniel Salipot
                    </h1>

                    <p className="text-fg-mid mx-auto mt-5 max-w-[42ch] font-sans text-[19px] leading-[1.38] tracking-[-0.01em] md:text-[25px]">
                        Backend developer building production systems end to end, from database design to hardware.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                        <a
                            href="/projects"
                            className="bg-portfolio-accent inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-medium text-[#0A0A0A] transition hover:opacity-90"
                        >
                            View work
                            <ArrowIcon size={15} />
                        </a>
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noreferrer"
                            className="border-line bg-bg-elev/70 text-fg hover:border-line-strong inline-flex items-center gap-2 rounded-full border px-7 py-3 text-[15px] font-medium backdrop-blur transition"
                        >
                            Resume
                            <ExtIcon size={13} />
                        </a>
                    </div>
                </div>
            </section>

            {/* WORK CAROUSEL - starts inside the first screen so cards peek */}
            <section className="relative overflow-hidden pt-2 pb-16">
                <WorkCarousel projects={portfolio.projects} />
            </section>

            {/* NOW */}
            <section className="px-6 pt-6 pb-16 md:px-12">
                <SectionHead n="01" title="now()" right="updated 14 may 2026" />
                <div className="stagger-in mt-7 flex flex-col">
                    {portfolio.now.map((it) => (
                        <div
                            key={it.title}
                            className="border-line group grid grid-cols-1 gap-2 border-t py-6 md:grid-cols-[140px_1fr] md:gap-10"
                        >
                            <span className="text-fg-dim group-hover:text-portfolio-accent font-mono text-[11px] transition-colors">
                                {it.label}
                            </span>
                            <div>
                                <div className="text-fg text-[22px] leading-tight font-medium tracking-tight">
                                    {it.title}
                                </div>
                                <p className="text-fg-mid mt-1.5 max-w-xl text-[14px] leading-relaxed">{it.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STACK */}
            <section className="px-6 pt-6 pb-16 md:px-12">
                <SectionHead n="02" title="stack.json" right="daily drivers · 2026" />
                <div className="stagger-in mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(portfolio.stack).map(([cat, items]) => (
                        <Card key={cat} pad={18} className="repo-card">
                            <div className="border-line flex items-baseline justify-between border-b pb-3">
                                <span className="text-fg text-[15px] font-medium tracking-tight">{cat}</span>
                                <span className="text-fg-fade font-mono text-[10px] tabular-nums">
                                    {String(items.length).padStart(2, '0')}
                                </span>
                            </div>
                            <ul className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
                                {items.map(([k, v]) => (
                                    <li key={k} className="flex items-baseline justify-between text-[14px]">
                                        <span className="text-fg inline-flex items-center gap-2">
                                            <LangDot name={k.split(' ')[0]} size={7} />
                                            {k}
                                        </span>
                                        <span className="text-fg-dim font-mono text-[10.5px]">{v}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </section>

            {/* EXPERIENCE */}
            <section className="px-6 pt-6 pb-16 md:px-12">
                <SectionHead n="03" title="experience.log" right="most recent first" />
                <div className="mt-6">
                    {portfolio.experience.map((e) => (
                        <div
                            key={`${e.from}-${e.role}`}
                            className="border-line border-t py-6"
                        >
                            <div className="grid grid-cols-1 items-baseline gap-4 md:grid-cols-[180px_1.4fr_1fr_40px] md:gap-8">
                                <span className="text-portfolio-accent font-mono text-[11px]">
                                    {e.from} - {e.to}
                                </span>
                                <div>
                                    <div className="text-fg text-[22px] font-medium tracking-tight">
                                        {e.role} · <span className="text-fg-mid">{e.org}</span>
                                    </div>
                                    <span className="text-fg-dim font-mono text-[11px]">{e.loc}</span>
                                </div>
                                <div className="text-fg-mid text-[14px] leading-relaxed">{e.note}</div>
                                <div className="text-fg-mid text-right">
                                    <ArrowNEIcon />
                                </div>
                            </div>

                            {e.projects.length > 0 && (
                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr] md:gap-8">
                                    <span className="text-fg-dim font-mono text-[10.5px]">
                                        selected highlights
                                    </span>
                                    <ul className="flex list-none flex-col gap-4 p-0">
                                        {e.projects.map((p, idx) => (
                                            <li
                                                key={idx}
                                                className="flex flex-col gap-2"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="bg-portfolio-accent/15 text-portfolio-accent border-portfolio-accent/25 inline-flex items-center gap-1 rounded border px-1.5 py-[2px] font-mono text-[9.5px] font-medium uppercase tracking-wider">
                                                        IoT
                                                    </span>
                                                    {p.tech.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="text-fg bg-bg-elev border-line inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11.5px] font-medium leading-none"
                                                        >
                                                            <LangDot name={t.split(' ')[0]} size={6} />
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-fg-dim text-[13px] leading-relaxed">
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
            <section className="px-6 pt-6 pb-16 md:px-12">
                <SectionHead n="04" title="achievements" right="awards · certs · honors" />
                <div className="mt-7 grid grid-cols-1 gap-x-12 md:grid-cols-2">
                    {portfolio.achievements.map((a) => (
                        <div
                            key={`${a.yr}-${a.t}`}
                            className="border-line flex items-baseline gap-5 border-t py-6 md:gap-7"
                        >
                            <span className="text-fg-fade shrink-0 font-mono text-[28px] leading-none font-medium tracking-tight tabular-nums md:text-[34px]">
                                {a.yr}
                            </span>
                            <div className="min-w-0">
                                <div className="text-fg text-[19px] leading-tight font-medium tracking-tight">
                                    {a.t}
                                </div>
                                <div className="text-portfolio-accent mt-1 font-mono text-[11.5px]">{a.where}</div>
                                <p className="text-fg-mid mt-2 text-[13.5px] leading-relaxed">{a.note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CONTACT CTA */}
            <section className="px-6 pt-6 pb-24 md:px-12">
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
                        <p className="text-fg-mid mt-4 max-w-md text-[16px] leading-relaxed">
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
            </section>
        </PortfolioLayout>
    );
}
