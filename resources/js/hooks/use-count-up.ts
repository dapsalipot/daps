import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 → target when the host element enters viewport.
 * Handles values like "12+" or "1st" by extracting the digits, counting up,
 * then re-attaching the suffix.
 *
 * @param raw  The display string (e.g. "12+", "3", "1st")
 * @returns    [ref to attach, currently-displayed string]
 *
 * Respects prefers-reduced-motion (snaps directly to final value).
 */
export function useCountUp(raw: string, durationMs = 900) {
    const elRef = useRef<HTMLElement | null>(null);
    const [display, setDisplay] = useState(raw);

    useEffect(() => {
        const match = raw.match(/^(\d+)(.*)$/);
        if (!match) {
            setDisplay(raw);
            return;
        }
        const target = parseInt(match[1], 10);
        const suffix = match[2];

        // Respect motion preferences — show final value, skip animation.
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplay(raw);
            return;
        }

        const el = elRef.current;
        if (!el) return;

        let frameId: number;
        let started = false;

        const animate = (startTs: number) => {
            const tick = (ts: number) => {
                const elapsed = ts - startTs;
                const t = Math.min(elapsed / durationMs, 1);
                // ease-out cubic — fast then slow, matches build/compile feel
                const eased = 1 - Math.pow(1 - t, 3);
                const value = Math.round(target * eased);
                setDisplay(value + suffix);
                if (t < 1) frameId = requestAnimationFrame(tick);
            };
            frameId = requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !started) {
                        started = true;
                        // Initial frame at 0 so the eye sees the count start
                        setDisplay('0' + suffix);
                        requestAnimationFrame((ts) => animate(ts));
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        observer.observe(el);

        return () => {
            cancelAnimationFrame(frameId);
            observer.disconnect();
        };
    }, [raw, durationMs]);

    return [elRef, display] as const;
}
