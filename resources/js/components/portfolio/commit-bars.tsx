export default function CommitBars({
    data = [3, 6, 2, 8, 4, 7, 5, 9, 3, 6, 8, 4, 7, 5],
    h = 22,
}: {
    data?: number[];
    h?: number;
}) {
    const max = Math.max(...data);
    return (
        <span className="inline-flex items-end gap-0.5" style={{ height: h }}>
            {data.map((v, i) => (
                <span
                    key={i}
                    className="commit-bar rounded-[1px]"
                    style={{
                        width: 3,
                        height: Math.max(2, (v / max) * h),
                        opacity: 0.4 + (v / max) * 0.6,
                        animationDelay: `${i * 35}ms`,
                        background: i === data.length - 1 ? 'var(--portfolio-accent)' : undefined,
                    }}
                />
            ))}
        </span>
    );
}
