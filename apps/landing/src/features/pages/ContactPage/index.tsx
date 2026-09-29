import { NivoIcon } from "@nivo/ui"
import { Badge, Button, Heading, PageContainer } from "@starci/grammar/common"
import { useTranslations } from "next-intl"
import { SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import { HeroBand } from "@/components/blocks/commercial/HeroBand"
import { ContactIntentForm } from "@/components/blocks/commercial/ContactIntentForm"
import { CLASS_NAMES } from "./classNames"

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

const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />

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

    return (
        <div className={CLASS_NAMES.page}>
            <SiteMain>
                <div>
                    <HeroBand
                        id="choose-intent"
                        variant="contact"
                        aria-labelledby="contact-title"
                    >
                        <PageContainer className={CLASS_NAMES.contactHeroGrid}>
                            <div className={CLASS_NAMES.heroCopy}>
                                <span className={CLASS_NAMES.eyebrow}>{t("hero.eyebrow")}</span>
                                <Heading level={1} scale="display"><span id="contact-title">{t("hero.title")}</span></Heading>
                                <p className={CLASS_NAMES.heroBody}>
                                    {t("hero.body")}
                                </p>
                                <Button href="#intent-router" variant="primary" size="lg" endContent={<ArrowIcon />}>
                                    {t("hero.primary")}
                                </Button>
                            </div>
                            <ol className={CLASS_NAMES.contactRouteMap} aria-label={t("hero.routeLabel")}>
                                {ROUTE_STEP_IDS.map((step, index) => (
                                    <li key={step} data-active={index === 1 ? "true" : undefined}>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                        <strong>{t(`hero.steps.${step}`)}</strong>
                                    </li>
                                ))}
                            </ol>
                        </PageContainer>
                    </HeroBand>

                    <section className={CLASS_NAMES.intentSection} id="intent-router" aria-labelledby="intent-title">
                        <PageContainer className={CLASS_NAMES.intentLayout}>
                            <div className={CLASS_NAMES.intentMain}>
                                <div className={CLASS_NAMES.sectionHeading}>
                                    <span className={CLASS_NAMES.eyebrow}>{t("router.eyebrow")}</span>
                                    <Heading level={2}><span id="intent-title">{t("router.title")}</span></Heading>
                                    <p className={CLASS_NAMES.sectionCopyMuted}>
                                        {t("router.description")}
                                    </p>
                                </div>
                                <ContactIntentForm
                                    action={href(`${SITE_LINKS.contact}#intent-router`)}
                                    initialIntent={selected?.id}
                                    legend={t("router.legend")}
                                    options={CONTACT_INTENTS.map((intent) => ({
                                        id: intent.id,
                                        label: t(`intents.${intent.id}.label`),
                                        description: t(`intents.${intent.id}.userJob`),
                                    }))}
                                    submitLabel={t("router.submit")}
                                />
                            </div>

                            <aside
                                id="contact-next-step"
                                className={CLASS_NAMES.routeResult}
                                aria-live="polite"
                                aria-labelledby="route-result-title"
                            >
                                <span className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                    {t("result.eyebrow")}
                                </span>
                                {selected === undefined ? (
                                    <>
                                        <span className={CLASS_NAMES.resultIcon}>
                                            <NivoIcon props={{ name: "overview", usage: "heading" }} />
                                        </span>
                                        <Heading level={3}><span id="route-result-title" className={CLASS_NAMES.inverseHeadingText}>{t("result.emptyTitle")}</span></Heading>
                                        <p className={CLASS_NAMES.resultCopy}>
                                            {t("result.emptyBody")}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Badge tone="success">{t("result.resolved")}</Badge>
                                        <Heading level={3}><span id="route-result-title" className={CLASS_NAMES.inverseHeadingText}>{t(`intents.${selected.id}.label`)}</span></Heading>
                                        <p className={CLASS_NAMES.resultCopy}>
                                            {t(`intents.${selected.id}.expectation`)}
                                        </p>
                                        <nav
                                            className={CLASS_NAMES.resultLinks}
                                            aria-label={t("result.pathsLabel", {
                                                intent: t(`intents.${selected.id}.label`),
                                            })}
                                        >
                                            {selected.directPaths.map((path) => (
                                                <a href={href(PATH_HREFS[path])} className={CLASS_NAMES.resultLink} key={path}>
                                                    {t(`paths.${path}`)}
                                                    <ArrowIcon />
                                                </a>
                                            ))}
                                        </nav>
                                    </>
                                )}
                            </aside>
                        </PageContainer>
                    </section>

                    <section className={CLASS_NAMES.contactTruthSection} aria-labelledby="contact-truth-title">
                        <PageContainer className={CLASS_NAMES.contactTruthGrid}>
                            <div>
                                <span className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                    {t("truth.eyebrow")}
                                </span>
                                <Heading level={2}><span id="contact-truth-title" className={CLASS_NAMES.inverseHeadingText}>{t("truth.title")}</span></Heading>
                                <p className={CLASS_NAMES.sectionCopyInverse}>
                                    {t("truth.description")}
                                </p>
                            </div>
                            <div className={CLASS_NAMES.privacyCard}>
                                <span className={CLASS_NAMES.privacyIcon}>
                                    <NivoIcon props={{ name: "complete", usage: "heading" }} />
                                </span>
                                <Badge tone="warning">{t("truth.badge")}</Badge>
                                <p className={CLASS_NAMES.privacyCopy}>
                                    {t("truth.body")}
                                </p>
                            </div>
                            <div className={CLASS_NAMES.noSubmission}>
                                <span>{t("truth.submittedLabel")}</span>
                                <p>{t("truth.submittedBody")}</p>
                            </div>
                        </PageContainer>
                    </section>

                    <section id="direct-paths" className={CLASS_NAMES.directSection} aria-labelledby="direct-title">
                        <PageContainer className={CLASS_NAMES.directGrid}>
                            <div className={CLASS_NAMES.sectionHeadingInverse}>
                                <span className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                    {t("direct.eyebrow")}
                                </span>
                                    <Heading level={2}><span id="direct-title" className={CLASS_NAMES.inverseHeadingText}>{t("direct.title")}</span></Heading>
                                    <p className={CLASS_NAMES.sectionCopyInverse}>
                                        {t("direct.description")}
                                    </p>
                            </div>
                            <nav className={CLASS_NAMES.directLinks} aria-label={t("direct.label")}>
                                {DIRECT_PATHS.map((path, index) => (
                                    <a href={href(PATH_HREFS[path])} className={CLASS_NAMES.directLink} key={path}>
                                        <span className={CLASS_NAMES.directLinkContent}>
                                            <small>{String(index + 1).padStart(2, "0")}</small>
                                            {t(`paths.${path}`)}
                                        </span>
                                        <ArrowIcon />
                                    </a>
                                ))}
                            </nav>
                        </PageContainer>
                    </section>
                </div>
            </SiteMain>
        </div>
    )
}

/** Resolves the `?intent=` query to one of the six stable intent ids, or nothing. */
export const normalizeContactIntent = (value: string | ReadonlyArray<string> | undefined): ContactIntentId | null => {
    const candidate = Array.isArray(value) ? value[0] : value
    return CONTACT_INTENT_IDS.find((id) => id === candidate) ?? null
}

export default ContactPage
