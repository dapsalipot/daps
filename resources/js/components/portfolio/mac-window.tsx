import { CSSProperties, ReactNode } from 'react';

interface MacWindowProps {
    title?: string;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    /** Dim the chrome when the window is a background/secondary element. */
    muted?: boolean;
}

/**
 * macOS-style window frame: traffic lights, centred title, rounded corners,
 * layered shadow. Used as the container for work cards so the whole set reads
 * as one hardware language.
 */
export default function MacWindow({ title, children, className = '', style, muted = false }: MacWindowProps) {
    return (
        <div
            className={`bg-bg-elev border-line relative flex flex-col overflow-hidden rounded-xl border ${className}`}
            style={{
                boxShadow: '0 1px 1px rgba(0,0,0,.04), 0 8px 24px -8px rgba(0,0,0,.25), 0 24px 64px -24px rgba(0,0,0,.35)',
                ...style,
            }}
        >
            <div className="border-line bg-bg-elev-2 relative flex h-9 shrink-0 items-center border-b px-3.5">
                <div className="flex gap-[7px]">
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                        <span
                            key={c}
                            className="h-[11px] w-[11px] rounded-full"
                            style={{ background: c, opacity: muted ? 0.45 : 0.9 }}
                        />
                    ))}
                </div>
                {title && (
                    <span className="text-fg-dim pointer-events-none absolute inset-x-0 text-center font-mono text-[13.5px]">
                        {title}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}
