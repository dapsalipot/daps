import { ReactNode } from 'react';

export default function StatusDot({ children = 'Available for work' }: { children?: ReactNode }) {
    return (
        <span className="text-fg-mid inline-flex items-center gap-2 font-mono text-[12px] tracking-wide">
            <span className="relative h-2 w-2">
                <span className="pulse-ring bg-portfolio-accent absolute inset-0 rounded-full" />
                <span className="bg-portfolio-accent absolute inset-0 rounded-full" />
            </span>
            <span>{children}</span>
        </span>
    );
}
