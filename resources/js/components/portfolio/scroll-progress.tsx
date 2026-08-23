import { useEffect, useState } from 'react';

/**
 * Thin accent bar at the very top of the viewport that fills L→R
 * proportionally to scroll position. Uses `scaleX` (GPU-composited)
 * rather than `width` so it animates without triggering layout.
 *
 * Sits above the sticky nav (z-index higher than nav's z-40).
 */
export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;
        const update = () => {
            const h = document.documentElement;
            const scrolled = h.scrollTop;
            const max = h.scrollHeight - h.clientHeight;
            setProgress(max > 0 ? scrolled / max : 0);
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className="bg-portfolio-accent pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left"
            style={{ transform: `scaleX(${progress})`, transition: 'transform 120ms linear' }}
        />
    );
}
