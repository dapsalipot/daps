import { FORCE_DARK, useAppearance } from '@/hooks/use-appearance';
import { MoonIcon, SunIcon } from './icons';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    if (FORCE_DARK) return null;
    const isDark = appearance === 'dark' || (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return (
        <button
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="bg-bg-elev text-fg-mid border-line hover:text-fg inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 font-mono text-[12px] transition-colors"
        >
            {isDark ? <SunIcon size={12} /> : <MoonIcon size={12} />}
            <span>{isDark ? 'light' : 'dark'}</span>
        </button>
    );
}
