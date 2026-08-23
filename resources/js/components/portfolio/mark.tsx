export default function Mark({ only = false, handle = 'daniel.salipot' }: { only?: boolean; handle?: string }) {
    const [first, dot] = handle.split('.');
    return (
        <div className="inline-flex items-center gap-2.5 text-fg">
            <span className="bg-fg text-bg border-line inline-flex border px-1.5 py-1 font-mono text-[12px] font-semibold leading-none tracking-tight">
                ds
            </span>
            {!only && (
                <span className="font-mono text-[13px] font-medium tracking-tight">
                    {first}
                    <span className="text-fg-dim">.{dot}</span>
                </span>
            )}
        </div>
    );
}
