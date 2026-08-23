import Card from '@/components/portfolio/card';
import Chip from '@/components/portfolio/chip';
import { CheckIcon } from '@/components/portfolio/icons';
import LangDot from '@/components/portfolio/lang-dot';
import SectionHead from '@/components/portfolio/section-head';
import PortfolioLayout from '@/layouts/portfolio-layout';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function About() {
    const { portfolio } = usePage<SharedData>().props;
    return (
        <PortfolioLayout title="About - Daniel Salipot" active="about">
            <section className="grid grid-cols-1 items-end gap-12 px-6 pt-12 pb-10 md:px-12 md:pt-16 md:pb-14 lg:grid-cols-[1.5fr_1fr]">
                <div>
                    <span className="text-portfolio-accent font-mono text-[11px]">// 01 - about</span>
                    <h1 className="text-fg mt-3.5 font-sans text-[48px] leading-none font-medium tracking-tight md:text-[80px]">
                        Backend developer.
                        <br />
                        <span className="text-fg-mid">End-to-end ownership.</span>
                    </h1>
                </div>
                <Card pad={0} className="overflow-hidden">
                    <div
                        className="relative aspect-[4/5]"
                        style={{ background: 'linear-gradient(135deg, #15311f 0%, #0f1a14 100%)' }}
                    >
                        <div className="text-portfolio-accent absolute inset-0 flex items-center justify-center font-sans text-[120px] font-medium tracking-tight md:text-[140px]">
                            DS
                        </div>
                        <div className="absolute right-4 bottom-3.5 left-4 flex justify-between font-mono text-[10px] text-white/50">
                            <span>portrait.jpg</span>
                            <span>1080 × 1350</span>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="px-6 pt-6 pb-14 md:px-12">
                <SectionHead n="02" title="story" />
                <div className="mt-7 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.7fr]">
                    <div>
                        <h2 className="text-fg font-sans text-[28px] leading-tight font-medium tracking-tight md:text-[32px]">
                            <span className="text-portfolio-accent">Production SaaS in Laravel and PHP.</span> Owned end-to-end.
                        </h2>
                        <p className="text-fg-dim mt-4 font-mono text-[13px] leading-relaxed">
                            based in {portfolio.identity.location.city}
                            <br />
                            {portfolio.identity.location.tz} · english + tagalog
                            <br />
                            open to remote · contract or full-time
                        </p>
                    </div>
                    <div className="text-fg-mid flex flex-col gap-3.5 text-[16px] leading-[1.7]">
                        <p>
                            Three years at <span className="text-fg">Rakso CT</span> building and maintaining production SaaS. I am sole developer of <span className="text-fg">Tapso</span>, an RFID attendance and cashless payment platform across roughly 10 campuses, 80 field devices, and 10,000+ cardholders, handling over PHP 2M in monthly transaction volume. Before that I maintained core modules of <span className="text-fg">Schoolaide</span>, a multi-tenant school SaaS with about 60 tenants and 60,000 students on a database-per-tenant architecture.
                        </p>
                        <p>
                            The work I am best at sits close to the database and the money: schema design, indexing and query optimization, idempotent transaction handling, payment gateway and reconciliation pipelines, and getting a timed-out production system responding again. I also design the algorithms when a problem needs one, most recently a constraint-satisfaction scheduling engine that replaced a multi-day manual process.
                        </p>
                        <p>
                            BS Information Technology from <span className="text-fg">Adamson University</span>, <span className="text-fg">Summa Cum Laude</span>, July 2023. Capstone was <span className="text-fg">OASYS</span>, an HRIS with payroll, named Best of the IT&IS Department.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-6 pt-6 pb-14 md:px-12">
                <SectionHead n="03" title="skills" right="years × confidence" />
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(portfolio.stack).map(([cat, items]) => (
                        <Card key={cat} pad={18}>
                            <div className="border-line border-b pb-3">
                                <span className="text-fg text-[15px] font-medium tracking-tight">{cat}</span>
                            </div>
                            <ul className="mt-3.5 flex list-none flex-col gap-2 p-0">
                                {items.map(([k, v]) => (
                                    <li key={k} className="flex items-baseline justify-between text-[14px]">
                                        <span className="text-fg">{k}</span>
                                        <span className="text-fg-dim font-mono text-[11px]">{v}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="px-6 pt-6 pb-14 md:px-12">
                <SectionHead n="04" title="experience" right="most recent first" />
                <div className="mt-4">
                    {portfolio.experience.map((e) => (
                        <div
                            key={`${e.from}-${e.role}`}
                            className="border-line grid grid-cols-1 items-start gap-4 border-t py-6 md:grid-cols-[160px_1.3fr_1.6fr] md:gap-8"
                        >
                            <span className="text-portfolio-accent font-mono text-[11px]">
                                {e.from} - {e.to}
                            </span>
                            <div>
                                <div className="text-fg text-[22px] font-medium tracking-tight">{e.role}</div>
                                <div className="text-fg-mid mt-0.5 text-[14px]">
                                    {e.org} · {e.loc}
                                </div>
                            </div>
                            <div>
                                <p className="text-fg-mid text-[14px] leading-relaxed">{e.note}</p>

                                {e.projects.length > 0 && (
                                    <div className="border-line mt-5 border-t pt-5">
                                        <span className="text-fg-dim font-mono text-[10.5px]">
                                            selected highlights
                                        </span>
                                        <ul className="mt-4 flex list-none flex-col gap-4 p-0">
                                            {e.projects.map((p, idx) => (
                                                <li key={idx} className="flex flex-col gap-2">
                                                    <div className="flex flex-wrap gap-1.5">
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

                                <div className="mt-4 flex flex-wrap gap-1">
                                    {e.stack.map((s) => (
                                        <Chip key={s}>
                                            <LangDot name={s} size={6} />
                                            {s}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-6 pt-6 pb-20 md:px-12">
                <SectionHead n="05" title="education + certs" />
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                    <Card pad={22}>
                        <span className="text-fg text-[15px] font-medium tracking-tight">Education</span>
                        <div className="mt-4 flex flex-col gap-4">
                            {portfolio.education.map((e) => (
                                <div
                                    key={e.yr}
                                    className="grid grid-cols-1 items-baseline gap-4 md:grid-cols-[120px_1fr_auto]"
                                >
                                    <span className="text-fg-dim font-mono text-[11px]">{e.yr}</span>
                                    <div>
                                        <div className="text-fg text-[18px] font-medium tracking-tight">{e.degree}</div>
                                        <div className="text-fg-mid text-[13px]">{e.org}</div>
                                        {e.gpa && <div className="text-fg-dim mt-1 font-mono text-[10.5px]">gpa {e.gpa}</div>}
                                    </div>
                                    <Chip tone={e.active ? 'accent' : 'default'}>{e.honor}</Chip>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card pad={22}>
                        <span className="text-fg text-[15px] font-medium tracking-tight">Certifications</span>
                        <ul className="mt-3.5 flex list-none flex-col gap-3 p-0">
                            {portfolio.certifications.map((c) => (
                                <li key={c.cred} className="flex items-center gap-3">
                                    <span
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[14px] font-semibold text-white"
                                        style={{ background: c.org_bg }}
                                    >
                                        {c.org_mark}
                                    </span>
                                    <div className="flex-1">
                                        <div className="text-fg text-[14px] font-medium tracking-tight">{c.t}</div>
                                        <div className="text-fg-mid text-[12px]">
                                            {c.sub} · {c.yr}
                                        </div>
                                    </div>
                                    <CheckIcon className="text-portfolio-accent" />
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </section>
        </PortfolioLayout>
    );
}
