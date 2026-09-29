import { SITE_LINKS } from "./site"

/** Stable public knowledge formats used by the Ideas filter and catalogs. */
export const IDEA_TYPE_IDS = ["perspective", "framework", "building"] as const

/** Stable content type carried by every approved public Idea. */
export type IdeaContentType = (typeof IDEA_TYPE_IDS)[number]

/** Public topics represented by the Ideas catalog. */
export const IDEA_TOPIC_IDS = [
    "aiNativeBusiness",
    "leadership",
    "responsibility",
    "humanAi",
    "trust",
    "growth",
    "knowledge",
] as const

type IdeaTopicId = (typeof IDEA_TOPIC_IDS)[number]
type IdeaLinkId = "nivoOs" | "sor" | "trust"

/** Public view model for an approved knowledge object; its copy lives in the message catalog. */
export type IdeaArticle = {
    readonly slug: string
    readonly contentType: IdeaContentType
    readonly topics: ReadonlyArray<IdeaTopicId>
    readonly sectionIds: ReadonlyArray<string>
    readonly canonicalReferenceHref: string
    readonly primaryNext: IdeaLinkId
    readonly relatedSlugs: ReadonlyArray<string>
}

/** The approved public Ideas inventory and its canonical continuation routes. */
export const IDEA_ARTICLES: ReadonlyArray<IdeaArticle> = [
    {
        slug: "responsibility-before-agent",
        contentType: "perspective",
        topics: ["responsibility", "humanAi"],
        sectionIds: ["observation", "thesis", "limit"],
        canonicalReferenceHref: SITE_LINKS.responsibility,
        primaryNext: "sor",
        relatedSlugs: ["context-responsibility-outcome", "earned-autonomy-needs-evidence"],
    },
    {
        slug: "context-responsibility-outcome",
        contentType: "framework",
        topics: ["aiNativeBusiness", "responsibility"],
        sectionIds: ["problem", "model", "limit"],
        canonicalReferenceHref: SITE_LINKS.nivoOs,
        primaryNext: "nivoOs",
        relatedSlugs: ["responsibility-before-agent", "earned-autonomy-needs-evidence"],
    },
    {
        slug: "earned-autonomy-needs-evidence",
        contentType: "building",
        topics: ["trust", "humanAi"],
        sectionIds: ["structured", "notClaimed", "open"],
        canonicalReferenceHref: SITE_LINKS.trust,
        primaryNext: "trust",
        relatedSlugs: ["responsibility-before-agent", "context-responsibility-outcome"],
    },
]

/** Resolves one approved public Idea by its stable route slug. */
export const getIdeaBySlug = (slug: string) => IDEA_ARTICLES.find((idea) => idea.slug === slug)

/** Static route identities for the approved public Idea objects. */
export const IDEA_SLUGS = IDEA_ARTICLES.map(({ slug }) => ({ slug }))

/** Resolves a public Ideas query to a stable type id. */
export const normalizeIdeaType = (value: string | ReadonlyArray<string> | undefined): IdeaContentType | null => {
    const candidate = Array.isArray(value) ? value[0] : value
    return IDEA_TYPE_IDS.find((id) => id === candidate) ?? null
}
