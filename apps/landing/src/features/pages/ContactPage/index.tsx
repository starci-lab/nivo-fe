import { NivoIcon } from "@nivo/ui"
import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { useTranslations } from "next-intl"
import { SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import styles from "../../../app/commercial-corporate.module.css"

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

const DIRECT_PATHS: ReadonlyArray<PathId> = ["nivoOs", "applications", "pricing", "ecosystem", "trust", "company", "login"]
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
        <div className={`${styles.routeFrame} ${styles.contactRoute}`}>
            <SiteMain>
                <div className={styles.contactPage}>
                    <section id="choose-intent" className={styles.contactHero} aria-labelledby="contact-title">
                        <PageContainer className={styles.contactHeroGrid}>
                            <div className={styles.heroCopy}>
                                <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
                                <Heading level={1} scale="display"><span id="contact-title">{t("hero.title")}</span></Heading>
                                <Text as="p" size="md" tone="muted">{t("hero.body")}</Text>
                                <Button href="#intent-router" variant="primary" size="lg" endContent={<ArrowIcon />}>{t("hero.primary")}</Button>
                            </div>
                            <ol className={styles.contactRouteMap} aria-label={t("hero.routeLabel")}>
                                {ROUTE_STEP_IDS.map((step, index) => (
                                    <li key={step} data-active={index === 1 ? "true" : undefined}>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                        <strong>{t(`hero.steps.${step}`)}</strong>
                                    </li>
                                ))}
                            </ol>
                        </PageContainer>
                    </section>

                    <section className={styles.intentSection} id="intent-router" aria-labelledby="intent-title">
                        <PageContainer className={styles.intentLayout}>
                            <div className={styles.intentMain}>
                                <div className={styles.sectionHeading}>
                                    <span className={styles.eyebrow}>{t("router.eyebrow")}</span>
                                    <Heading level={2}><span id="intent-title">{t("router.title")}</span></Heading>
                                    <Text as="p" size="md" tone="muted">{t("router.description")}</Text>
                                </div>
                                <form id="adaptive-form" className={styles.intentForm} action={href(`${SITE_LINKS.contact}#intent-router`)} method="get">
                                    <fieldset>
                                        <legend>{t("router.legend")}</legend>
                                        <div className={styles.intentGrid}>
                                            {CONTACT_INTENTS.map((intent, index) => (
                                                <label className={styles.intentOption} key={intent.id} data-selected={selected?.id === intent.id ? "true" : undefined}>
                                                    <input type="radio" name="intent" value={intent.id} defaultChecked={selected?.id === intent.id} />
                                                    <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                                    <strong>{t(`intents.${intent.id}.label`)}</strong>
                                                    <small>{t(`intents.${intent.id}.userJob`)}</small>
                                                    <span className={styles.intentCheck} aria-hidden="true"><NivoIcon props={{ name: "complete", usage: "chip" }} /></span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <Button type="submit" variant="primary" size="lg" endContent={<ArrowIcon />}>{t("router.submit")}</Button>
                                </form>
                            </div>

                            <aside id="contact-next-step" className={styles.routeResult} aria-live="polite" aria-labelledby="route-result-title">
                                <span className={styles.eyebrow}>{t("result.eyebrow")}</span>
                                {selected === undefined ? (
                                    <>
                                        <span className={styles.resultIcon}><NivoIcon props={{ name: "overview", usage: "heading" }} /></span>
                                        <Heading level={3}><span id="route-result-title">{t("result.emptyTitle")}</span></Heading>
                                        <Text as="p" size="sm">{t("result.emptyBody")}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Badge tone="success">{t("result.resolved")}</Badge>
                                        <Heading level={3}><span id="route-result-title">{t(`intents.${selected.id}.label`)}</span></Heading>
                                        <Text as="p" size="sm">{t(`intents.${selected.id}.expectation`)}</Text>
                                        <nav className={styles.resultLinks} aria-label={t("result.pathsLabel", { intent: t(`intents.${selected.id}.label`) })}>
                                            {selected.directPaths.map((path) => <TextAction href={href(PATH_HREFS[path])} appearance="route" endContent={<ArrowIcon />} key={path}>{t(`paths.${path}`)}</TextAction>)}
                                        </nav>
                                    </>
                                )}
                            </aside>
                        </PageContainer>
                    </section>

                    <section className={styles.contactTruthSection} aria-labelledby="contact-truth-title">
                        <PageContainer className={styles.contactTruthGrid}>
                            <div>
                                <span className={styles.eyebrow}>{t("truth.eyebrow")}</span>
                                <Heading level={2}><span id="contact-truth-title">{t("truth.title")}</span></Heading>
                                <Text as="p" size="md">{t("truth.description")}</Text>
                            </div>
                            <div className={styles.privacyCard}>
                                <span className={styles.privacyIcon}><NivoIcon props={{ name: "complete", usage: "heading" }} /></span>
                                <Badge tone="warning">{t("truth.badge")}</Badge>
                                <Text as="p" size="sm">{t("truth.body")}</Text>
                            </div>
                            <div className={styles.noSubmission}>
                                <span>{t("truth.submittedLabel")}</span>
                                <p>{t("truth.submittedBody")}</p>
                            </div>
                        </PageContainer>
                    </section>

                    <section id="direct-paths" className={styles.directSection} aria-labelledby="direct-title">
                        <PageContainer className={styles.directGrid}>
                            <div className={styles.sectionHeadingInverse}>
                                <span className={styles.eyebrow}>{t("direct.eyebrow")}</span>
                                <Heading level={2}><span id="direct-title">{t("direct.title")}</span></Heading>
                                <Text as="p" size="md">{t("direct.description")}</Text>
                            </div>
                            <nav className={styles.directLinks} aria-label={t("direct.label")}>
                                {DIRECT_PATHS.map((path, index) => (
                                    <TextAction href={href(PATH_HREFS[path])} appearance="route" endContent={<ArrowIcon />} key={path}>
                                        <span><small>{String(index + 1).padStart(2, "0")}</small>{t(`paths.${path}`)}</span>
                                    </TextAction>
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
