export default function Mark({
    only = false,
    handle = 'daniel.andrei.salipot',
}: {
    only?: boolean;
    handle?: string;
}) {
    // First segment carries full weight; the rest trail off dimmed, so the
    // wordmark reads the same whether the handle has two segments or four.
    const [first, ...rest] = handle.split('.');

    return (
        <div className="inline-flex items-center gap-2.5 text-fg">
            <span className="bg-fg text-bg border-line inline-flex border px-1.5 py-1 font-mono text-[13.5px] font-semibold leading-none tracking-tight">
                ds
            </span>
            {!only && (
                <span className="font-mono text-[14.5px] font-medium tracking-tight">
                    {first}
                    {rest.length > 0 && <span className="text-fg-dim">.{rest.join('.')}</span>}
                </span>
            )}
        </div>
    );
}
