import CommandPalette from '@/components/portfolio/command-palette';
import LogoSplash from '@/components/portfolio/logo-splash';
import Footer from '@/components/portfolio/footer';
import GridBackground from '@/components/portfolio/grid-background';
import Nav from '@/components/portfolio/nav';
import ScrollProgress from '@/components/portfolio/scroll-progress';
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll';
import { Head } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';

interface PortfolioLayoutProps {
    children: ReactNode;
    title: string;
    active: 'home' | 'work' | 'about' | 'contact';
}

export default function PortfolioLayout({ children, title, active }: PortfolioLayoutProps) {
    useRevealOnScroll();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            <Head title={title} />
            <LogoSplash />
            <GridBackground />
            <ScrollProgress />
            <div className="text-fg relative z-10 min-h-screen">
                <Nav active={active} />
                <main className={mounted ? 'page-fade' : ''}>{children}</main>
                <Footer />
            </div>
            {/* Mounted once at layout level so ⌘K works from any page */}
            <CommandPalette />
        </>
    );
}
