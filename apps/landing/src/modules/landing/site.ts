/** One public destination owned by the NIVO information architecture. */
export type SiteLink = {
    readonly id: string
    readonly href: string
    readonly external?: boolean
}

/** A first-level navigation item with at most one discovery layer. */
export type SiteNavigationItem =
    | SiteLink
    | {
          readonly id: string
          readonly children: ReadonlyArray<SiteLink>
      }

/** The canonical public origin used by metadata, robots, and sitemap adapters. */
export const PUBLIC_SITE_URL = "https://nivo.vn"

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

/**
 * The final two-level primary navigation defined by the Master IA. The `id` is the key of the
 * label in `site.navigation`; the words live in the catalogs, never here.
 */
export const SITE_NAVIGATION: ReadonlyArray<SiteNavigationItem> = [
    { id: "nivoOs", href: SITE_LINKS.nivoOs },
    { id: "applications", href: SITE_LINKS.applications },
    {
        id: "explore",
        children: [
            { id: "ideas", href: SITE_LINKS.ideas },
            { id: "ecosystem", href: SITE_LINKS.ecosystem },
        ],
    },
    {
        id: "about",
        children: [
            { id: "company", href: SITE_LINKS.company },
            { id: "trust", href: SITE_LINKS.trust },
            { id: "contact", href: SITE_LINKS.contact },
        ],
    },
    { id: "pricing", href: SITE_LINKS.pricing },
]

/**
 * Compact footer groups; taxonomy and unverified legal surfaces are intentionally omitted. A group
 * `id` keys `site.footer.groups`, a link `id` keys `site.footer.links`.
 */
export const SITE_FOOTER_GROUPS = [
    {
        id: "nivoOs",
        links: [
            { id: "nivoOs", href: SITE_LINKS.nivoOs },
            { id: "responsibility", href: SITE_LINKS.responsibility },
            { id: "trust", href: SITE_LINKS.trust },
        ],
    },
    {
        id: "solutions",
        links: [
            { id: "applications", href: SITE_LINKS.applications },
            { id: "pricing", href: SITE_LINKS.pricing },
        ],
    },
    {
        id: "explore",
        links: [
            { id: "ideas", href: SITE_LINKS.ideas },
            { id: "ecosystem", href: SITE_LINKS.ecosystem },
        ],
    },
    {
        id: "about",
        links: [
            { id: "company", href: SITE_LINKS.company },
            { id: "contact", href: SITE_LINKS.contact },
            { id: "login", href: SITE_LINKS.login, external: true },
        ],
    },
] as const
