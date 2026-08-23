import { useEffect, useState } from 'react';

interface BootLine {
    text: string;
    delay: number;
    color?: string;
}

/**
 * Mock terminal boot output shown once per browser session.
 * Lines reveal one at a time, then the whole overlay fades out.
 * Skipped on prefers-reduced-motion (no flash at all).
 */
const BOOT_LINES: BootLine[] = [
    { text: '> mounting daps.salipot.dev', delay: 0 },
    { text: '> fetching portfolio config        ok', delay: 280 },
    { text: '> loading components               ok', delay: 460 },
    { text: '> warming up scanners              ok', delay: 620 },
    { text: '> ready in 47ms', delay: 820, color: 'var(--portfolio-accent)' },
];

const SESSION_KEY = 'daps_booted';

export default function BootSequence() {
    const [shown, setShown] = useState(0);
    const [active, setActive] = useState(false);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (sessionStorage.getItem(SESSION_KEY) === '1') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            sessionStorage.setItem(SESSION_KEY, '1');
            return;
        }

        sessionStorage.setItem(SESSION_KEY, '1');
        setActive(true);
        document.body.style.overflow = 'hidden';

        const timers: number[] = [];
        BOOT_LINES.forEach((line, i) => {
            timers.push(window.setTimeout(() => setShown(i + 1), line.delay));
        });
        // Start fade after the final line has been visible
        timers.push(
            window.setTimeout(() => setFading(true), BOOT_LINES[BOOT_LINES.length - 1].delay + 700)
        );
        // Remove from DOM after the fade
        timers.push(
            window.setTimeout(() => {
                setActive(false);
                document.body.style.overflow = '';
            }, BOOT_LINES[BOOT_LINES.length - 1].delay + 1300)
        );

        return () => {
            timers.forEach((t) => clearTimeout(t));
            document.body.style.overflow = '';
        };
    }, []);

    if (!active) return null;

    return (
        <div
            aria-hidden="true"
            className={`bg-bg fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
            <div className="font-mono text-[13px] leading-[2]">
                {BOOT_LINES.slice(0, shown).map((l, i) => (
                    <div
                        key={i}
                        className="text-fg-mid anim-fadeUp"
                        style={{ animationDuration: '220ms', color: l.color }}
                    >
                        {l.text}
                    </div>
                ))}
                {shown > 0 && shown < BOOT_LINES.length && (
                    <span
                        className="caret bg-portfolio-accent ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px]"
                    />
                )}
            </div>
        </div>
    );
}
