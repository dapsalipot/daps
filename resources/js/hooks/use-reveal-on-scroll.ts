import { useEffect } from 'react';

/**
 * Adds a fade-up reveal to every <main> > <section> EXCEPT the first one (hero).
 * Sections already in the viewport on first paint reveal immediately.
 */
export function useRevealOnScroll() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const targets = Array.from(
            document.querySelectorAll<HTMLElement>('main > section')
        ).slice(1); // skip hero

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            targets.forEach((el) => el.classList.add('reveal', 'is-visible'));
            return;
        }

        targets.forEach((el) => el.classList.add('reveal'));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );

        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}
