export type ScreenshotTone = 'plum' | 'forest' | 'ember' | 'slate' | 'ocean' | 'paper';

export interface CaseStudyScreenshot {
    src: string;
    caption: string;
    alt: string;
}

export interface CaseStudyModule {
    name: string;
    desc: string;
}

export interface Project {
    slug: string;
    name: string;
    kicker: string;
    year: string;
    featured: boolean;
    tag: string | null;
    blurb: string;
    stack: string[];
    lang: string;
    branch: string;
    hash: string;
    screenshot: { title: string; subtitle: string | null; tone: ScreenshotTone };
    metrics: [string, string][];
    case_study: {
        problem: string;
        role: string;
        outcome: string;
        links: { live: string | null; repo: string | null };
        /** External write-ups or announcements about the project. */
        coverage?: { label: string; url: string }[];
        /** Optional list of major modules built. Renders as a labelled grid when present. */
        modules?: CaseStudyModule[];
        /** Optional real-product screenshots (path under /public). Replaces the placeholder Screenshot when present. */
        screenshots?: CaseStudyScreenshot[];
    };
}

export interface ExperienceProject {
    /** Technologies/capabilities used — the headline. */
    tech: string[];
    /** One-line context describing what was built with the tech. */
    context: string;
}

export interface ExperienceEntry {
    from: string;
    to: string;
    role: string;
    org: string;
    loc: string;
    note: string;
    stack: string[];
    projects: ExperienceProject[];
}

export interface EducationEntry {
    yr: string;
    degree: string;
    org: string;
    note: string;
    honor: string;
    gpa: string | null;
    active: boolean;
}

export interface Certification {
    org: string;
    org_mark: string;
    org_bg: string;
    t: string;
    sub: string;
    yr: string;
    cred: string;
    status: string;
    skills: string[];
}

export interface Achievement {
    yr: string;
    t: string;
    where: string;
    note: string;
}

export interface Portfolio {
    identity: {
        name: string;
        handle: string;
        role: string;
        tagline: string;
        location: { city: string; tz: string };
        available: { status: string; since: string; label: string };
    };
    links: {
        email: string;
        phone: string;
        github: string;
        linkedin: string;
    };
    stats: { n: string; l: string }[];
    now: { label: string; title: string; sub: string }[];
    projects: Project[];
    stack: Record<'backend' | 'frontend' | 'platforms' | 'adjacent', [string, string][]>;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    certifications: Certification[];
    achievements: Achievement[];
}
