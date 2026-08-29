import { type TerminalStep, useTypewriter } from '@/hooks/use-typewriter';

interface TypingTerminalProps {
    title?: string;
    steps: TerminalStep[];
}

/**
 * A CodeBlock that actually types itself. Loops indefinitely.
 * Visually consistent with the static CodeBlock (same chrome, mono font, colors).
 */
export default function TypingTerminal({ title, steps }: TypingTerminalProps) {
    const lines = useTypewriter({ steps, loop: true });

    return (
        <div
            className="bg-bg-elev-2 border-line overflow-hidden rounded-lg border font-mono text-[14.5px] leading-[1.7]"
            style={{ minHeight: 260 }}
        >
            {title && (
                <div className="border-line text-fg-dim flex items-center gap-2 border-b px-3.5 py-2 text-[13.5px]">
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
                    <div key={i} className="flex gap-2.5" style={{ color: l.color }}>
                        {l.prompt && <span className="text-portfolio-accent">{l.prompt}</span>}
                        <span className="whitespace-pre-wrap">
                            {l.text}
                            {l.typing && (
                                <span className="caret bg-portfolio-accent ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px]" />
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
