import { ReactNode } from 'react';
import { GitBranchIcon } from './icons';
import LangDot from './lang-dot';

interface RepoChromeProps {
    filename: string;
    lang: string;
    branch?: string;
    hash?: string;
    children: ReactNode;
}

export default function RepoChrome({ filename, lang, branch, hash, children }: RepoChromeProps) {
    return (
        <div className="flex flex-1 flex-col">
            <div className="bg-bg-elev-2 border-line text-fg-dim flex items-center justify-between border-b px-3.5 py-2 font-mono text-[11px]">
                <span className="inline-flex items-center gap-2">
                    <LangDot name={lang} />
                    <span className="text-fg">{filename}</span>
                </span>
                {(branch || hash) && (
                    <span className="text-fg-dim inline-flex items-center gap-1.5">
                        <GitBranchIcon />
                        {branch && <span className="text-fg">{branch}</span>}
                        {hash && <span>· {hash}</span>}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}
