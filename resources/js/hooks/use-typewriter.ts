import { useEffect, useState } from 'react';

export type TerminalStep =
    | { kind: 'type'; prompt: string; text: string; charDelay?: number; pauseAfter?: number }
    | { kind: 'output'; text: string; color?: string; pauseAfter?: number }
    | { kind: 'wait'; ms: number };

export interface RenderedLine {
    prompt?: string;
    text: string;
    color?: string;
    typing?: boolean;
}

interface UseTypewriterOptions {
    steps: TerminalStep[];
    loop?: boolean;
    loopDelayMs?: number;
}

/**
 * Plays through a script of terminal steps. Returns the list of fully-rendered
 * lines so the calling component can map over them. The last line is the one
 * currently being typed (if any) — host can render a blinking caret there.
 *
 * Respects prefers-reduced-motion: shows the final state of the script instantly.
 */
export function useTypewriter({ steps, loop = true, loopDelayMs = 2200 }: UseTypewriterOptions) {
    const [lines, setLines] = useState<RenderedLine[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Reduced motion: render the entire script as final state, no animation.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const final: RenderedLine[] = steps
                .filter((s) => s.kind !== 'wait')
                .map((s) =>
                    s.kind === 'type'
                        ? { prompt: s.prompt, text: s.text }
                        : { text: s.text, color: s.color }
                );
            setLines(final);
            return;
        }

        let cancelled = false;
        let timers: number[] = [];

        const sleep = (ms: number) =>
            new Promise<void>((resolve) => {
                const t = window.setTimeout(resolve, ms);
                timers.push(t);
            });

        const run = async () => {
            while (!cancelled) {
                setLines([]);
                for (const step of steps) {
                    if (cancelled) return;
                    if (step.kind === 'wait') {
                        await sleep(step.ms);
                        continue;
                    }
                    if (step.kind === 'output') {
                        setLines((prev) => [...prev, { text: step.text, color: step.color }]);
                        await sleep(step.pauseAfter ?? 300);
                        continue;
                    }
                    // step.kind === 'type'
                    setLines((prev) => [...prev, { prompt: step.prompt, text: '', typing: true }]);
                    const base = step.charDelay ?? 32;
                    for (let i = 0; i < step.text.length; i++) {
                        if (cancelled) return;
                        const ch = step.text[i];
                        // Slight jitter + extra pause on space/punctuation for "human" feel
                        const jitter = 0.6 + Math.random() * 0.8;
                        const punct = /[.,;:!? ]/.test(ch) ? 1.8 : 1;
                        await sleep(base * jitter * punct);
                        setLines((prev) => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            next[next.length - 1] = { ...last, text: last.text + ch };
                            return next;
                        });
                    }
                    setLines((prev) => {
                        const next = [...prev];
                        next[next.length - 1] = { ...next[next.length - 1], typing: false };
                        return next;
                    });
                    await sleep(step.pauseAfter ?? 350);
                }
                if (!loop) break;
                await sleep(loopDelayMs);
            }
        };

        run();
        return () => {
            cancelled = true;
            timers.forEach((t) => clearTimeout(t));
            timers = [];
        };
    }, [steps, loop, loopDelayMs]);

    return lines;
}
