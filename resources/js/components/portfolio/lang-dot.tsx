import { langColor } from '@/lib/lang-colors';

export default function LangDot({ name, size = 9 }: { name: string; size?: number }) {
    return (
        <span
            className="inline-block flex-shrink-0 rounded-full"
            style={{ width: size, height: size, background: langColor(name) }}
        />
    );
}
