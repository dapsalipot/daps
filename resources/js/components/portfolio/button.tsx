import { ReactNode } from 'react';

type Kind = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: ReactNode;
    kind?: Kind;
    size?: Size;
    icon?: ReactNode;
    trailing?: ReactNode;
    full?: boolean;
    as?: 'button' | 'a' | 'span';
    href?: string;
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
    target?: string;
    rel?: string;
}

export default function Button({
    children,
    kind = 'primary',
    size = 'md',
    icon,
    trailing,
    full = false,
    as = 'button',
    href,
    type = 'button',
    disabled,
    onClick,
    target,
    rel,
}: ButtonProps) {
    const sizes: Record<Size, string> = {
        sm: 'px-3 py-[7px] text-[12px]',
        md: 'px-4 py-2.5 text-[13px]',
        lg: 'px-5 py-3 text-[14px]',
    };
    const kinds: Record<Kind, string> = {
        primary: 'bg-fg text-bg border-fg hover:opacity-90',
        accent: 'bg-portfolio-accent text-[#0A0A0A] border-transparent hover:bg-portfolio-accent-dim',
        secondary: 'bg-bg-elev text-fg border-line hover:border-line-strong',
        ghost: 'bg-transparent text-fg-mid border-transparent hover:text-fg',
    };
    const cls = `inline-flex items-center justify-center gap-2 font-sans font-medium tracking-tight border rounded-lg leading-none transition-colors ${sizes[size]} ${kinds[kind]} ${full ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
    const inner = (
        <>
            {icon}
            {children}
            {trailing}
        </>
    );
    if (as === 'a' && href) {
        return (
            <a href={href} className={cls} target={target} rel={rel}>
                {inner}
            </a>
        );
    }
    if (as === 'span') return <span className={cls}>{inner}</span>;
    return (
        <button type={type} className={cls} disabled={disabled} onClick={onClick}>
            {inner}
        </button>
    );
}
