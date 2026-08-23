import { CSSProperties, ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    pad?: number;
    className?: string;
    style?: CSSProperties;
}

export default function Card({ children, pad = 24, className = '', style }: CardProps) {
    return (
        <div
            className={`bg-bg-elev border-line rounded-xl border ${className}`}
            style={{ padding: pad, ...style }}
        >
            {children}
        </div>
    );
}
