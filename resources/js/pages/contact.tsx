import Button from '@/components/portfolio/button';
import Card from '@/components/portfolio/card';
import CodeBlock from '@/components/portfolio/code-block';
import { ArrowNEIcon, CheckIcon, GithubIcon, LinkedinIcon, MailIcon } from '@/components/portfolio/icons';
import SectionHead from '@/components/portfolio/section-head';
import PortfolioLayout from '@/layouts/portfolio-layout';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, ReactNode } from 'react';

export default function Contact() {
    const { portfolio, flash } = usePage<SharedData>().props;
    const sent = flash?.contact === 'sent';
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/contact', { onSuccess: () => reset('name', 'email', 'subject', 'message') });
    };

    return (
        <PortfolioLayout title="Contact - Daniel Andrei Salipot" active="contact">
            <section className="max-w-5xl px-6 pt-12 pb-8 md:px-12 md:pt-16 md:pb-10">
                <span className="text-portfolio-accent font-mono text-[12px]">// 01 - contact</span>
                <h1 className="text-fg mt-3.5 font-sans text-[48px] leading-none font-medium tracking-tight md:text-[80px]">
                    Contact.
                </h1>
                <p className="text-fg-mid mt-5 max-w-2xl text-[16px] leading-relaxed">
                    Available {portfolio.identity.available.since} for full-time and contract work. Laravel back-ends, IoT integration, and production web systems. Reply within 48h.
                </p>
            </section>

            <section className="grid grid-cols-1 gap-8 px-6 pb-24 md:px-12 lg:grid-cols-[1.4fr_1fr]">
                <Card pad={28}>
                    <SectionHead n="02" title="message.form" />
                    {sent && (
                        <div className="border-portfolio-accent/30 bg-[var(--portfolio-accent-sage)] text-portfolio-accent mt-5 inline-flex items-center gap-2.5 rounded-lg border p-4 font-mono text-[12px]">
                            <CheckIcon /> Message sent. I'll reply within 48 hours.
                        </div>
                    )}
                    <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="name" error={errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="bg-bg-elev-2 border-line text-fg focus:border-line-strong w-full rounded-lg border px-3.5 py-2.5 text-[14px] focus:outline-none"
                            />
                        </Field>
                        <Field label="email" error={errors.email}>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="bg-bg-elev-2 border-line text-fg focus:border-line-strong w-full rounded-lg border px-3.5 py-2.5 text-[14px] focus:outline-none"
                            />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="subject (optional)" error={errors.subject}>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="bg-bg-elev-2 border-line text-fg focus:border-line-strong w-full rounded-lg border px-3.5 py-2.5 text-[14px] focus:outline-none"
                                />
                            </Field>
                        </div>
                        <div className="md:col-span-2">
                            <Field label="message" error={errors.message}>
                                <textarea
                                    rows={6}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    required
                                    className="bg-bg-elev-2 border-line text-fg focus:border-line-strong w-full resize-y rounded-lg border px-3.5 py-3 text-[14px] focus:outline-none"
                                />
                            </Field>
                        </div>
                        <input
                            type="text"
                            name="website"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            className="hidden"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                        />
                        <div className="flex items-center justify-end gap-2.5 md:col-span-2">
                            <span className="text-fg-dim mr-auto font-mono text-[12px]">replies within 48h</span>
                            <Button kind="accent" size="lg" type="submit" disabled={processing} trailing={<ArrowNEIcon />}>
                                {processing ? 'sending…' : 'send message'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <div className="flex flex-col gap-4">
                    <Card pad={22}>
                        <span className="text-portfolio-accent font-mono text-[12px]">// or skip the form</span>
                        <ul className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
                            <li>
                                <a href={`mailto:${portfolio.links.email}`} className="ulink link-slide text-[14px]">
                                    <MailIcon /> {portfolio.links.email}
                                </a>
                            </li>
                            <li>
                                <a href={portfolio.links.github} target="_blank" rel="noreferrer" className="ulink link-slide text-[14px]">
                                    <GithubIcon /> github.com/danielsalipot
                                </a>
                            </li>
                            <li>
                                <a href={portfolio.links.linkedin} target="_blank" rel="noreferrer" className="ulink link-slide text-[14px]">
                                    <LinkedinIcon /> linkedin.com/in/daniel-andrei-salipot
                                </a>
                            </li>
                            <li className="text-fg-dim mt-1 font-mono text-[12px]">{portfolio.links.phone}</li>
                        </ul>
                    </Card>
                    <CodeBlock
                        title="response.txt"
                        lines={[
                            { t: 'mon–fri · 09:00–18:00 PHT', strong: true },
                            { t: 'avg first-reply · 12 hours' },
                            { t: '' },
                            { c: 'var(--portfolio-accent)', t: '● open · accepting projects' },
                        ]}
                    />
                </div>
            </section>
        </PortfolioLayout>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="text-fg-dim font-mono text-[12px]">{label}</span>
            <div className="mt-1.5">{children}</div>
            {error && <span className="mt-1 block font-mono text-[12px] text-red-400">{error}</span>}
        </label>
    );
}
