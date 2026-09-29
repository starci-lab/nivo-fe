import { SITE_LINKS } from "./site"

/** One step in a public explanatory flow; it never implies runtime completion. */
export type PublicFlowStep = {
    readonly id: string
    readonly label: string
    readonly description: string
}

/** The ids of the steps of the relevance flow; each keys `home.relevance.steps`. */
export const HOMEPAGE_RELEVANCE_STEPS = ["need", "responsibility", "execution", "evidence"] as const

/** The ids of the steps of the operating model; each keys `home.operatingModel.steps`. */
export const HOMEPAGE_OPERATING_STEPS = ["intent", "context", "responsibility", "execution", "outcome"] as const

/** The four role visuals of the operating model; the id keys `home.operatingModel.visuals`. */
export const HOMEPAGE_ROLE_VISUALS = [
    { id: "humanLeads", src: "/images/operating/human-leads-v2.png" },
    { id: "aiOperates", src: "/images/operating/ai-operates-v2.png" },
    { id: "systemLearns", src: "/images/operating/system-learns-v2.png" },
    { id: "verifiedOutcome", src: "/images/operating/verified-outcome-v2.png" },
] as const

/** The ids of the commercial route steps; each keys `home.commercial.route`. */
export const HOMEPAGE_COMMERCIAL_ROUTE = ["need", "understand", "start"] as const

/** The ids of the trust title parts; each keys `home.trust.titleParts`. */
export const HOMEPAGE_TRUST_TITLE = ["evidence", "trust", "permission"] as const

/** The ids of the focus words; each keys `home.focus`. */
export const HOMEPAGE_FOCUS = ["lead", "revenue"] as const

/** The language of the page and the name of the homepage in that language. */
export type HomepageStructuredDataInput = {
    readonly locale: string
    readonly name: string
}

/**
 * Valid structured data containing only canonical entity relationships.
 *
 * @param input - The language of the page and the name of the homepage in that language.
 * @returns The JSON-LD document, with `<` escaped so it cannot close its own script element.
 */
export const homepageStructuredData = ({ locale, name }: HomepageStructuredDataInput): string => JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://nivo.vn/#organization",
            name: "NIVO",
            url: "https://nivo.vn/",
        },
        {
            "@type": "WebSite",
            "@id": "https://nivo.vn/#website",
            name: "NIVO.VN",
            url: "https://nivo.vn/",
            inLanguage: locale,
            publisher: { "@id": "https://nivo.vn/#organization" },
        },
        {
            "@type": "WebPage",
            "@id": "https://nivo.vn/#webpage",
            name,
            url: "https://nivo.vn/",
            inLanguage: locale,
            isPartOf: { "@id": "https://nivo.vn/#website" },
            about: { "@id": "https://nivo.vn/#organization" },
        },
    ],
}).replaceAll("<", String.raw`\u003c`)

/**
 * Final intent routes preserve the six architectural user jobs without a CTA wall. A group `id`
 * keys `home.nextPaths.groups`, a link `id` keys `home.nextPaths.links`.
 */
export const HOMEPAGE_NEXT_PATHS = [
    {
        id: "learn",
        links: [
            { id: "nivoOs", href: SITE_LINKS.nivoOs },
            { id: "applications", href: SITE_LINKS.applications },
        ],
    },
    {
        id: "start",
        links: [
            { id: "pricing", href: SITE_LINKS.pricing },
        ],
    },
    {
        id: "connect",
        links: [
            { id: "company", href: SITE_LINKS.company },
            { id: "contact", href: SITE_LINKS.contact },
        ],
    },
] as const
