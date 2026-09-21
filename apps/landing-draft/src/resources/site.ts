/** One public destination owned by the NIVO information architecture. */
export type SiteLink = {
    readonly href: string
    readonly label: string
    readonly external?: boolean
}

/** A first-level navigation item with at most one discovery layer. */
export type SiteNavigationItem = SiteLink | {
    readonly label: string
    readonly children: readonly SiteLink[]
}

/** The canonical public origin used by metadata, robots, and sitemap adapters. */
export const PUBLIC_SITE_URL = "https://nivo.vn"

/** Search and social description for the canonical NIVO public gateway. */
export const SITE_DESCRIPTION = "NIVO là AI-Native Business Operating Platform xây dựng NIVO OS để chuyển bối cảnh kinh doanh thành trách nhiệm rõ và kết quả có thể kiểm chứng."

/** Canonical title shared by browser and social metadata. */
export const SITE_TITLE = "NIVO — Nền tảng vận hành kinh doanh AI-Native"

/** Stable Vietnamese shell copy kept outside component source. */
export const SITE_COPY = {
    homeLabel: "NIVO — về trang chủ",
    primaryNavigationLabel: "Điều hướng chính",
    mobileNavigationLabel: "Điều hướng di động",
    quickActionsLabel: "Hành động nhanh",
    openNavigationLabel: "Mở điều hướng",
    closeNavigationLabel: "Đóng điều hướng",
    login: "Đăng nhập",
    contact: "Liên hệ",
    skipToContent: "Bỏ qua đến nội dung chính",
    philosophy: "Human Leads. AI Operates. System Learns.",
    distinction: "NIVO là corporate brand. NIVO OS là master product.",
    copyright: "© 2026 NIVO. All rights reserved.",
    contactNivo: "Liên hệ NIVO",
} as const

/** Canonical public destinations shared by every public-site route. */
export const SITE_LINKS = {
    home: "/",
    nivoOs: "/nivo-os",
    responsibility: "/system-of-responsibility",
    applications: "/applications",
    pricing: "/pricing",
    ideas: "/ideas",
    ecosystem: "/ecosystem",
    company: "/company",
    trust: "/trust",
    contact: "/contact",
    login: "https://app.nivo.vn",
} as const

/**
 * Product activation stays absent until Product/Engineering publishes its exact destination.
 * The canonical documents explicitly forbid inferring that route from Pricing or app.nivo.vn.
 */
export const ACTIVATION_LINK: SiteLink | null = null

/** The final two-level primary navigation defined by the Master IA. */
export const SITE_NAVIGATION: readonly SiteNavigationItem[] = [
    { href: SITE_LINKS.nivoOs, label: "NIVO OS" },
    { href: SITE_LINKS.applications, label: "Giải pháp" },
    {
        label: "Khám phá",
        children: [
            { href: SITE_LINKS.ideas, label: "Ideas" },
            { href: SITE_LINKS.ecosystem, label: "Hệ sinh thái NIVO" },
        ],
    },
    {
        label: "Về NIVO",
        children: [
            { href: SITE_LINKS.company, label: "Company" },
            { href: SITE_LINKS.trust, label: "Trust" },
            { href: SITE_LINKS.contact, label: "Liên hệ" },
        ],
    },
    { href: SITE_LINKS.pricing, label: "Mức giá" },
]

/** Compact footer groups; taxonomy and unverified legal surfaces are intentionally omitted. */
export const SITE_FOOTER_GROUPS = [
    {
        title: "NIVO OS",
        links: [
            { href: SITE_LINKS.nivoOs, label: "NIVO OS" },
            { href: SITE_LINKS.responsibility, label: "System of Responsibility" },
            { href: SITE_LINKS.trust, label: "Trust" },
        ],
    },
    {
        title: "Giải pháp",
        links: [
            { href: SITE_LINKS.applications, label: "Giải pháp" },
            { href: SITE_LINKS.pricing, label: "Mức giá" },
        ],
    },
    {
        title: "Khám phá",
        links: [
            { href: SITE_LINKS.ideas, label: "Ideas" },
            { href: SITE_LINKS.ecosystem, label: "Hệ sinh thái" },
        ],
    },
    {
        title: "Về NIVO",
        links: [
            { href: SITE_LINKS.company, label: "Company" },
            { href: SITE_LINKS.contact, label: "Liên hệ" },
            { href: SITE_LINKS.login, label: "Đăng nhập", external: true },
        ],
    },
] as const
