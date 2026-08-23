type IconProps = { size?: number; className?: string };

export const ArrowIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
        <path d="M2 7h10M8 3l4 4-4 4" />
    </svg>
);

export const ArrowNEIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
        <path d="M3.5 10.5L10.5 3.5M5 3.5h5.5V9" />
    </svg>
);

export const ExtIcon = ({ size = 12, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
        <path d="M5 2H2.5v7.5H10V7M7.5 2H10v2.5M10 2L5.5 6.5" />
    </svg>
);

export const GithubIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.72 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 014.01 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.49v2.2c0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
);

export const LinkedinIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M2 4a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm.2 2h2.6v8H2.2zM6.4 6h2.5v1.1h.04c.35-.66 1.2-1.35 2.47-1.35C13.97 5.75 14.5 7.4 14.5 9.5V14H12V10c0-.95-.02-2.17-1.32-2.17S9.2 8.86 9.2 9.93V14H6.4z" />
    </svg>
);

export const MailIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className}>
        <rect x="1.5" y="3.5" width="13" height="9" rx="0.5" />
        <path d="M2 4l6 4.5L14 4" />
    </svg>
);

export const TerminalIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 4.5L5.5 7 3 9.5M7.5 9.5h3.5" />
    </svg>
);

export const GitBranchIcon = ({ size = 10, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
        <circle cx="3" cy="2" r="1.2" />
        <circle cx="3" cy="8" r="1.2" />
        <circle cx="7" cy="5" r="1.2" />
        <path d="M3 3.2v3.6M3.5 7.2C4.5 6.8 5.5 6.2 6 5.5" strokeLinecap="round" />
    </svg>
);

export const CheckIcon = ({ size = 10, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
    </svg>
);

export const SunIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
);

export const MoonIcon = ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
        <path d="M13 9a5 5 0 11-6-6 4 4 0 006 6z" />
    </svg>
);

export const MenuIcon = ({ size = 18, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
        <path d="M3 5h12M3 9h12M3 13h12" />
    </svg>
);

export const CloseIcon = ({ size = 16, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
        <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
);
