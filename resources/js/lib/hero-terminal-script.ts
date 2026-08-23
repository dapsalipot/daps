import type { TerminalStep } from '@/hooks/use-typewriter';

/**
 * The script the live hero terminal types out, on loop.
 *
 * This is where your voice goes. Edit freely. Each `type` step is a command
 * you "type" character by character; each `output` step appears all at once
 * like real terminal output; `wait` adds dead air for pacing.
 *
 * Tips:
 *   - Keep prompts short (`$`, `>`, `~`). Long prompts visually drown the line.
 *   - Use `output` with color `var(--portfolio-accent)` for "success" lines.
 *   - End with a `wait` before the loop restarts so the last frame can be read.
 *   - Total runtime feels right around 12–20 seconds before looping.
 *
 * The component preserves whitespace, so indent freely inside strings.
 */
export const HERO_TERMINAL_SCRIPT: TerminalStep[] = [
    { kind: 'type', prompt: '$', text: 'whoami', pauseAfter: 200 },
    { kind: 'output', text: 'daniel salipot - backend developer', color: 'var(--fg)', pauseAfter: 650 },

    { kind: 'type', prompt: '$', text: 'cat scale.txt', pauseAfter: 250 },
    { kind: 'output', text: 'tapso        10,000+ cardholders · ~10 campuses · 80 devices' },
    { kind: 'output', text: '             500+ daily payments · PHP 2M+ monthly volume' },
    { kind: 'output', text: 'schoolaide   60,000 students · ~60 tenants · db-per-tenant', pauseAfter: 900 },

    { kind: 'type', prompt: '$', text: 'cat stack.json | jq -r .backend', pauseAfter: 250 },
    { kind: 'output', text: '["laravel", "php", "livewire", "filament", "mysql"]', pauseAfter: 800 },

    { kind: 'type', prompt: '$', text: 'status', pauseAfter: 250 },
    { kind: 'output', text: '● open · remote, hybrid, or onsite (metro manila)', color: 'var(--portfolio-accent)', pauseAfter: 1600 },

    { kind: 'type', prompt: '$', text: 'clear', charDelay: 50, pauseAfter: 300 },
];
