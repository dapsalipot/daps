import { useCountUp } from '@/hooks/use-count-up';

interface CountUpProps {
    value: string;
    className?: string;
    durationMs?: number;
}

/**
 * Renders a value that counts up from 0 → value when scrolled into view.
 * Wraps the value in a span and pins the IntersectionObserver to it.
 */
export default function CountUp({ value, className, durationMs }: CountUpProps) {
    const [ref, display] = useCountUp(value, durationMs);
    return (
        <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
            {display}
        </span>
    );
}
