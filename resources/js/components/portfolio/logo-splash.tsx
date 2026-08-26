import Mark from '@/components/portfolio/mark';
import { useEffect, useState } from 'react';

/**
 * Brand splash shown once per browser session.
 *
 * Three beats: the mark settles in, holds briefly, then the overlay lifts
 * while the hero is already composed underneath, so the handover reads as one
 * continuous move rather than a cut. Skipped for repeat views in the same
 * session and under prefers-reduced-motion.
 */

const SESSION_KEY = 'daps_splash_seen';
const HOLD_MS = 640;
const LIFT_MS = 640;

export default function LogoSplash() {
    const [active, setActive] = useState(false);
    const [lifting, setLifting] = useState(false);

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

        const timers = [
            window.setTimeout(() => setLifting(true), HOLD_MS),
            window.setTimeout(() => {
                setActive(false);
                document.body.style.overflow = '';
            }, HOLD_MS + LIFT_MS),
        ];

        return () => {
            timers.forEach(clearTimeout);
            document.body.style.overflow = '';
        };
    }, []);

    if (!active) return null;

    return (
        <div className={`splash ${lifting ? 'is-lifting' : ''}`} aria-hidden="true">
            {/* Same accent wash as the hero, so the ground does not shift
                underneath the fade. */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 55% at 50% 0%, var(--portfolio-accent-sage), transparent 70%)',
                }}
            />
            <div className="splash-mark relative">
                <Mark />
            </div>
        </div>
    );
}
