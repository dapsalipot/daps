import { ReactNode } from 'react';

type Tone = 'default' | 'strong' | 'accent';

export default function Chip({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
    const toneClass = {
        default: 'bg-bg-elev text-fg-mid border-line',
        strong: 'bg-fg text-bg border-fg',
        accent: 'bg-[var(--portfolio-accent-sage)] text-portfolio-accent border-[color:var(--portfolio-accent-sage)]',
    }[tone];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[12px] font-medium leading-none ${toneClass}`}>
            {children}
        </span>
    );
}
