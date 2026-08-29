import { ReactNode } from 'react';

export default function Kbd({ children }: { children: ReactNode }) {
    return (
        <span className="bg-bg-elev text-fg-mid border-line inline-flex items-center gap-1 rounded border px-1.5 py-1 font-mono text-[13.5px] font-medium leading-none">
            {children}
        </span>
    );
}
