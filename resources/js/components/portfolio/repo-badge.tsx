import { GitBranchIcon } from './icons';

export default function RepoBadge({ branch = 'main', hash = 'a4f9c1d' }: { branch?: string; hash?: string }) {
    return (
        <span className="text-fg-mid border-line inline-flex items-center gap-1.5 rounded border px-[7px] py-[3px] font-mono text-[10.5px] leading-none">
            <GitBranchIcon />
            <span className="text-fg">{branch}</span>
            <span className="text-fg-dim">·</span>
            <span className="text-fg-dim">{hash}</span>
        </span>
    );
}
