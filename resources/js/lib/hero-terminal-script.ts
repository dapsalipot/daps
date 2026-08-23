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
    { kind: 'output', text: 'daniel salipot - software engineer', color: 'var(--fg)', pauseAfter: 600 },

    { kind: 'type', prompt: '$', text: 'cat stack.json | jq', pauseAfter: 250 },
    { kind: 'output', text: '{' },
    { kind: 'output', text: '  "primary":  ["laravel", "livewire", "filament"],' },
    { kind: 'output', text: '  "client":   ["react", "vue", "flutter"],' },
    { kind: 'output', text: '  "hardware": ["rfid", "biometric", "turnstile"]' },
    { kind: 'output', text: '}', pauseAfter: 700 },

    { kind: 'type', prompt: '$', text: 'ls hardware/', charDelay: 38, pauseAfter: 200 },
    { kind: 'output', text: 'rfid-reader.ts   turnstile-relay.ts   scanner-bridge.ts', pauseAfter: 600 },

    { kind: 'type', prompt: '$', text: 'status', pauseAfter: 250 },
    { kind: 'output', text: '● open · accepting projects for q3 2026', color: 'var(--portfolio-accent)', pauseAfter: 1400 },

    { kind: 'type', prompt: '$', text: 'clear', charDelay: 50, pauseAfter: 300 },
];
