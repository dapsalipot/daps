import { useEffect, useRef } from 'react';

/**
 * Full-viewport grid of accent-color dots that get pushed away from the cursor
 * within a "force-field" radius, then spring back to their home positions.
 *
 * Implementation notes:
 *   - Canvas (not DOM) for performance — ~2000 dots draw in one composited frame.
 *   - Spring physics: each dot has velocity + friction + return-to-home pull.
 *   - Theme-aware: reads --portfolio-accent on mount + on `<html>` class change.
 *   - Disabled on touch devices and prefers-reduced-motion (renders static dots).
 *
 * Tunables grouped at the top so feel can be tweaked without reading the loop.
 */

// ── Tunables ────────────────────────────────────────────────────────────
const SPACING = 28;            // px between dots (smaller = denser grid)
const RADIUS = 1.4;            // dot radius in px
const PUSH_RADIUS = 140;       // px — distance at which the cursor influences a dot
const MAX_PUSH = 1.4;          // acceleration multiplier near cursor
const RETURN_STRENGTH = 0.06;  // 0-1 — how strongly each dot pulls back to home
const FRICTION = 0.82;         // 0-1 — velocity decay per frame (lower = stickier)
const ALPHA_BASE = 0.18;       // base dot opacity
const ALPHA_BOOST = 0.55;      // extra opacity for dots currently displaced
// ────────────────────────────────────────────────────────────────────────

interface Dot {
    x: number;   // home position
    y: number;
    dx: number;  // current offset from home
    dy: number;
    vx: number;  // velocity
    vy: number;
}

export default function GridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isTouch = window.matchMedia('(hover: none)').matches;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Read accent color from CSS var so it flips with theme automatically
        const readAccent = () =>
            getComputedStyle(document.documentElement).getPropertyValue('--portfolio-accent').trim() || '#7DD96E';
        let accent = readAccent();

        // Watch <html> class for dark/light toggles
        const observer = new MutationObserver(() => {
            accent = readAccent();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        let width = 0;
        let height = 0;
        let dpr = 1;
        let dots: Dot[] = [];
        const mouse = { x: -9999, y: -9999, active: false };

        const buildGrid = () => {
            dots = [];
            const cols = Math.ceil(width / SPACING) + 1;
            const rows = Math.ceil(height / SPACING) + 1;
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push({ x: i * SPACING, y: j * SPACING, dx: 0, dy: 0, vx: 0, vy: 0 });
                }
            }
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildGrid();
        };

        const onMove = (e: PointerEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };
        const onLeave = () => {
            mouse.active = false;
            mouse.x = -9999;
            mouse.y = -9999;
        };

        // Reduced motion: draw static grid once and bail
        if (reduced || isTouch) {
            resize();
            ctx.fillStyle = accent;
            ctx.globalAlpha = ALPHA_BASE;
            for (const dot of dots) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, RADIUS, 0, Math.PI * 2);
                ctx.fill();
            }
            window.addEventListener('resize', resize);
            return () => {
                window.removeEventListener('resize', resize);
                observer.disconnect();
            };
        }

        const pushRadiusSq = PUSH_RADIUS * PUSH_RADIUS;
        let rafId = 0;

        const tick = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = accent;

            for (const dot of dots) {
                // Distance from displaced position to mouse
                const px = dot.x + dot.dx;
                const py = dot.y + dot.dy;
                const ddx = px - mouse.x;
                const ddy = py - mouse.y;
                const distSq = ddx * ddx + ddy * ddy;

                // Apply repulsion if within field
                if (distSq < pushRadiusSq && distSq > 0.01 && mouse.active) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / PUSH_RADIUS) * MAX_PUSH;
                    dot.vx += (ddx / dist) * force;
                    dot.vy += (ddy / dist) * force;
                }

                // Spring back toward home
                dot.vx += -dot.dx * RETURN_STRENGTH;
                dot.vy += -dot.dy * RETURN_STRENGTH;

                // Friction
                dot.vx *= FRICTION;
                dot.vy *= FRICTION;

                // Apply
                dot.dx += dot.vx;
                dot.dy += dot.vy;

                // Draw — boost opacity for displaced dots for a subtle "glow" effect
                const displacement = Math.abs(dot.dx) + Math.abs(dot.dy);
                const alphaBoost = Math.min(displacement / 20, 1) * ALPHA_BOOST;
                ctx.globalAlpha = ALPHA_BASE + alphaBoost;
                ctx.beginPath();
                ctx.arc(px, py, RADIUS, 0, Math.PI * 2);
                ctx.fill();
            }

            rafId = requestAnimationFrame(tick);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerleave', onLeave);
        document.addEventListener('mouseleave', onLeave);
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerleave', onLeave);
            document.removeEventListener('mouseleave', onLeave);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0"
        />
    );
}
