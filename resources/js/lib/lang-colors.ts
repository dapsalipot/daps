const LANG_COLORS: Record<string, string> = {
    php: '#777BB4',
    js: '#F1E05A',
    javascript: '#F1E05A',
    ts: '#3178C6',
    typescript: '#3178C6',
    html: '#E34F26',
    css: '#563D7C',
    vue: '#41B883',
    'vue.js': '#41B883',
    react: '#61DAFB',
    dart: '#00B4AB',
    flutter: '#54C5F8',
    kotlin: '#A97BFF',
    java: '#B07219',
    'c#': '#178600',
    go: '#00ADD8',
    python: '#3572A5',
    py: '#3572A5',
    sql: '#E38C00',
    mysql: '#E38C00',
    blade: '#F05340',
    shell: '#89E051',
    laravel: '#FF2D20',
    livewire: '#FB70A9',
    filament: '#FFAB40',
    tailwind: '#38BDF8',
    bootstrap: '#7952B3',
    rfid: '#7DD96E',
    iot: '#7DD96E',
    n8n: '#EA4B71',
    qr: '#A1A1A1',
    webhooks: '#A1A1A1',
    webhook: '#A1A1A1',
    figma: '#F24E1E',
    // IoT / hardware tech swatches
    turnstile: '#F59E6B', // amber — mechanical/industrial
    biometric: '#A97BFF', // purple — security/identity
    serial: '#5BB1FF', // blue — electronics/protocol
    scanner: '#A97BFF', // purple — paired with biometric
    sms: '#7DD96E', // green — comms
    balance: '#E9D26E', // gold — finance/ledger
    json: '#A1A1A1',
    scrum: '#7DD96E',
    kanban: '#7DD96E',
    schemas: '#A1A1A1',
    normalization: '#A1A1A1',
    'sprint planning': '#7DD96E',
};

export function langColor(name: string | null | undefined): string {
    if (!name) return '#7DD96E';
    return LANG_COLORS[name.toLowerCase()] ?? '#7DD96E';
}
