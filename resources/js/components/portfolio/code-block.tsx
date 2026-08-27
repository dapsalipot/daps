import { CSSProperties } from 'react';

export interface CodeLine {
    p?: string;
    t: string;
    c?: string;
    strong?: boolean;
}

interface CodeBlockProps {
    lines: CodeLine[];
    title?: string;
    style?: CSSProperties;
}

export default function CodeBlock({ lines, title, style }: CodeBlockProps) {
    return (
        <div
            className="bg-bg-elev-2 border-line overflow-hidden rounded-lg border font-mono text-[13px] leading-[1.7]"
            style={style}
        >
            {title && (
                <div className="border-line text-fg-dim flex items-center gap-2 border-b px-3.5 py-2 text-[12px]">
                    <span className="inline-flex gap-1">
                        <span className="bg-line-strong h-2 w-2 rounded-full" />
                        <span className="bg-line-strong h-2 w-2 rounded-full" />
                        <span className="bg-line-strong h-2 w-2 rounded-full" />
                    </span>
                    <span className="ml-1.5">{title}</span>
                </div>
            )}
            <div className="text-fg-mid px-4 py-3.5">
                {lines.map((l, i) => (
                    <div key={i} className="flex gap-2.5" style={{ color: l.c }}>
                        {l.p && <span className="text-portfolio-accent">{l.p}</span>}
                        <span className={`whitespace-pre-wrap ${l.strong ? 'text-fg' : ''}`}>{l.t}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
