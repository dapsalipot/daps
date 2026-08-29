import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';

export default function Footer() {
    const { portfolio } = usePage<SharedData>().props;
    const year = new Date().getFullYear();
    return (
        <footer className="border-line text-fg-dim flex flex-col items-start justify-between gap-4 border-t px-6 py-10 font-mono text-[13.5px] md:flex-row md:items-center md:px-12">
            <div className="flex flex-col gap-1">
                <span className="text-fg">
                    © {year} {portfolio.identity.name}
                </span>
                <span>built with Laravel · Inertia · React</span>
            </div>
            <div className="flex items-center gap-4">
                <a href={portfolio.links.github} className="ulink link-slide" target="_blank" rel="noreferrer">
                    <GithubIcon /> github
                </a>
                <a href={portfolio.links.linkedin} className="ulink link-slide" target="_blank" rel="noreferrer">
                    <LinkedinIcon /> linkedin
                </a>
                <a href={`mailto:${portfolio.links.email}`} className="ulink link-slide">
                    <MailIcon /> {portfolio.links.email}
                </a>
            </div>
        </footer>
    );
}
