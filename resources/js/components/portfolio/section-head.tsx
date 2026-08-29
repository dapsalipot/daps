import { ReactNode } from 'react';

interface SectionHeadProps {
    n: string;
    title: string;
    right?: string;
    headline?: string;
    kicker?: string;
    icon?: ReactNode;
}

export default function SectionHead({ n, title, right, headline, kicker, icon }: SectionHeadProps) {
    return (
        <div className="anim-fadeUp">
            <div className="flex items-stretch font-mono text-[13.5px]">
                <div className="bg-bg-elev text-fg border-line relative -mb-px inline-flex items-center gap-2 rounded-t-md border border-b-0 px-3.5 py-2">
                    <span
                        className="bg-portfolio-accent h-1.5 w-1.5 rounded-full"
                        style={{ boxShadow: '0 0 6px var(--portfolio-accent)' }}
                    />
                    <span className="text-fg-fade">§</span>
                    <span className="text-fg-dim">{n}</span>
                    <span className="text-fg-fade">·</span>
                    <span className="text-fg font-medium">{title}</span>
                    {icon && <span className="text-fg-dim ml-1">{icon}</span>}
                </div>
                <div className="border-line flex-1 border-b" />
                {right && (
                    <div className="text-fg-dim inline-flex items-center gap-2 self-end px-1 pb-1.5">
                        <span className="text-fg-fade">↳</span>
                        <span>{right}</span>
                    </div>
                )}
            </div>
            {(headline || kicker) && (
                <div className="flex items-baseline justify-between gap-6 pt-5 pb-1">
                    {headline && (
                        <h2 className="text-fg m-0 font-sans text-[36px] leading-[1.05] font-medium tracking-tight">{headline}</h2>
                    )}
                    {kicker && <span className="text-fg-dim font-mono text-[13.5px] whitespace-nowrap">{kicker}</span>}
                </div>
            )}
        </div>
    );
}
