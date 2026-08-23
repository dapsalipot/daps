/**
 * Single source of truth for top-level navigation entries.
 * Used by the desktop nav, mobile drawer, and the ⌘K command palette.
 */

export type NavKey = 'home' | 'work' | 'about' | 'contact';

export interface NavItem {
    k: NavKey;
    l: string;
    n: string;
    href: string;
    /** Optional short subtitle shown in the command palette. */
    sub?: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
    { k: 'home', l: 'home', n: '01', href: '/', sub: 'overview · selected work · contact' },
    { k: 'work', l: 'work', n: '02', href: '/projects', sub: 'filterable grid · all projects' },
    { k: 'about', l: 'about', n: '03', href: '/about', sub: 'story · skills · experience · education' },
    { k: 'contact', l: 'contact', n: '04', href: '/contact', sub: 'message form · social links' },
] as const;
