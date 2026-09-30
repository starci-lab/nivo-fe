import { useTranslations } from "next-intl"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import { ContactPageBase } from "./component"

/** The six stable relationship-routing intent ids; the `?intent=` query and the catalog both use them. */
export const CONTACT_INTENT_IDS = ["product", "partnership", "institution", "media", "talent", "general"] as const

/** One canonical relationship-routing intent. */
export type ContactIntentId = (typeof CONTACT_INTENT_IDS)[number]

/** The direct paths a visitor can take; the catalog labels them under `contact.paths`. */
const PATH_HREFS = {
    nivoOs: SITE_LINKS.nivoOs,
    applications: SITE_LINKS.applications,
    pricing: SITE_LINKS.pricing,
    ecosystem: SITE_LINKS.ecosystem,
    trust: SITE_LINKS.trust,
    company: SITE_LINKS.company,
    login: SITE_LINKS.login,
    home: SITE_LINKS.home,
} as const
type PathId = keyof typeof PATH_HREFS

/** Structure of one intent; its copy lives in `contact.intents.<id>`. */
type ContactIntent = {
    readonly id: ContactIntentId
    readonly directPaths: ReadonlyArray<PathId>
}

const CONTACT_INTENTS: ReadonlyArray<ContactIntent> = [
    { id: "product", directPaths: ["nivoOs", "applications", "pricing"] },
    { id: "partnership", directPaths: ["ecosystem"] },
    { id: "institution", directPaths: ["trust"] },
    { id: "media", directPaths: ["company"] },
    { id: "talent", directPaths: ["company"] },
    { id: "general", directPaths: ["home"] },
]

const DIRECT_PATHS: ReadonlyArray<PathId> = [
    "nivoOs",
    "applications",
    "pricing",
    "ecosystem",
    "trust",
    "company",
    "login",
]
const ROUTE_STEP_IDS = ["orient", "resolveIntent", "route", "confirmNextState"] as const

/** Props for {@link ContactPage}. */
type ContactPageProps = {
    /** The intent the query already resolved, if it named one this route supports. */
    readonly initialIntent?: ContactIntentId | null
}

/**
 * The canonical `/contact` page: the relationship router.
 *
 * IT OWNS THE DECISION THE ROUTE USED TO MAKE. Which intent is selected, and therefore which next
 * path is offered, is a property of this screen -- resolving it here is what lets the route stay an
 * adapter that hands over the query and nothing else.
 *
 * @param props - {@link ContactPageProps}
 * @returns The page.
 */
export const ContactPage = (props: ContactPageProps) => {
    const t = useTranslations("contact")
    const href = useLocalizedHref()
    const selected = CONTACT_INTENTS.find(({ id }): boolean => id === props.initialIntent)

    const pathData = (path: PathId) => ({ id: path, label: t(`paths.${path}`), href: href(PATH_HREFS[path]) })
    return (
        <ContactPageBase
            props={{
                copy: {
                    "hero.eyebrow": t("hero.eyebrow"),
                    "hero.title": t("hero.title"),
                    "hero.body": t("hero.body"),
                    "hero.primary": t("hero.primary"),
                    "hero.routeLabel": t("hero.routeLabel"),
                    "router.eyebrow": t("router.eyebrow"),
                    "router.title": t("router.title"),
                    "router.description": t("router.description"),
                    "router.legend": t("router.legend"),
                    "router.submit": t("router.submit"),
                    "result.eyebrow": t("result.eyebrow"),
                    "result.emptyTitle": t("result.emptyTitle"),
                    "result.emptyBody": t("result.emptyBody"),
                    "result.resolved": t("result.resolved"),
                    "truth.eyebrow": t("truth.eyebrow"),
                    "truth.title": t("truth.title"),
                    "truth.description": t("truth.description"),
                    "truth.badge": t("truth.badge"),
                    "truth.body": t("truth.body"),
                    "truth.submittedLabel": t("truth.submittedLabel"),
                    "truth.submittedBody": t("truth.submittedBody"),
                    "direct.eyebrow": t("direct.eyebrow"),
                    "direct.title": t("direct.title"),
                    "direct.description": t("direct.description"),
                    "direct.label": t("direct.label"),
                },
                routeSteps: ROUTE_STEP_IDS.map((step, index) => ({
                    id: step,
                    label: t(`hero.steps.${step}`),
                    description: String(index + 1).padStart(2, "0"),
                    state: index === 1 ? ("informative" as const) : ("neutral" as const),
                })),
                formAction: href(`${SITE_LINKS.contact}#intent-router`),
                options: CONTACT_INTENTS.map((intent) => ({
                    id: intent.id,
                    label: t(`intents.${intent.id}.label`),
                    description: t(`intents.${intent.id}.userJob`),
                })),
                selected:
                    selected === undefined
                        ? undefined
                        : {
                              id: selected.id,
                              label: t(`intents.${selected.id}.label`),
                              expectation: t(`intents.${selected.id}.expectation`),
                              pathsLabel: t("result.pathsLabel", { intent: t(`intents.${selected.id}.label`) }),
                              paths: selected.directPaths.map(pathData),
                          },
                directPaths: DIRECT_PATHS.map(pathData),
            }}
        />
    )
}

/** Resolves the `?intent=` query to one of the six stable intent ids, or nothing. */
export const normalizeContactIntent = (value: string | ReadonlyArray<string> | undefined): ContactIntentId | null => {
    const candidate = Array.isArray(value) ? value[0] : value
    return CONTACT_INTENT_IDS.find((id) => id === candidate) ?? null
}

export default ContactPage
