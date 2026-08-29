import type { ScreenshotTone } from '@/types';
import { CSSProperties, ReactNode } from 'react';

const TONES: Record<ScreenshotTone, [string, string, string]> = {
    plum: ['#1c1a2a', '#2a2240', '#7c6cd6'],
    forest: ['#0f1a14', '#15311f', '#7DD96E'],
    ember: ['#1f1410', '#3a1d10', '#f59e6b'],
    slate: ['#0f1216', '#1c2128', '#8b95a5'],
    ocean: ['#0c1620', '#143046', '#5bb1ff'],
    paper: ['#f0eee9', '#e2dfd6', '#6b6b6b'],
};

interface ScreenshotProps {
    title: string;
    subtitle?: string | null;
    tone?: ScreenshotTone;
    ratio?: string;
    style?: CSSProperties;
    children?: ReactNode;
}

export default function Screenshot({
    title = 'product.app',
    subtitle,
    tone = 'plum',
    ratio = '16/10',
    style,
    children,
}: ScreenshotProps) {
    const [a, b, accent] = TONES[tone];
    return (
        <div
            className="border-line relative overflow-hidden rounded-lg border"
            style={{ aspectRatio: ratio, background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`, ...style }}
        >
            <div className="absolute top-0 right-0 left-0 flex h-7 items-center border-b border-white/5 bg-black/25 px-3">
                <div className="flex gap-1.5">
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                        <span key={c} className="h-2 w-2 rounded-full" style={{ background: c, opacity: 0.8 }} />
                    ))}
                </div>
                <span className="ml-3 font-mono text-[13.5px] text-white/50">{title}</span>
            </div>
            <div className="absolute inset-0 top-7 flex">
                <div className="flex w-1/5 flex-col gap-1.5 border-r border-white/5 bg-black/25 p-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-2 rounded-sm"
                            style={{
                                background: i === 1 ? accent : 'rgba(255,255,255,0.07)',
                                opacity: i === 1 ? 0.85 : 1,
                                width: i === 1 ? '85%' : `${60 + i * 7}%`,
                            }}
                        />
                    ))}
                </div>
                <div className="relative flex flex-1 flex-col gap-2.5 p-3.5">
                    <div className="h-3.5 w-1/2 rounded-sm bg-white/20" />
                    <div className="h-2 w-1/3 rounded-sm bg-white/10" />
                    <div className="mt-1 grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 rounded-md border border-white/5 bg-white/5" />
                        ))}
                    </div>
                    <div className="relative mt-1 h-[90px] overflow-hidden rounded-md bg-white/5">
                        <div
                            className="absolute bottom-0 left-0 h-[70%] w-[60%]"
                            style={{ background: `linear-gradient(180deg, transparent, ${accent}40)` }}
                        />
                    </div>
                    {subtitle && (
                        <div className="absolute right-3.5 bottom-2.5 font-mono text-[13.5px] text-white/50">
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}
