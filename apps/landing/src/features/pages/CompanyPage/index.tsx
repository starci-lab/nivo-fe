import { NivoIcon } from "@nivo/ui"
import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { useTranslations } from "next-intl"
import { SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import styles from "../../../app/commercial-corporate.module.css"

const VALUE_IDS = ["outcome", "simplify", "discipline", "ai", "evolve"] as const
const TODAY_IDS = ["today", "building", "toward", "notClaimed"] as const
const PROVENANCE_IDS = ["delivery", "systems", "operations", "today"] as const
const MISSION_STEP_IDS = ["context", "responsibility", "outcome", "capacity"] as const
const VISION_STEP_IDS = ["native", "autonomy", "selfSustaining"] as const
const PHILOSOPHY = [
    { id: "human", icon: "account" },
    { id: "ai", icon: "agentos" },
    { id: "system", icon: "complete" },
] as const
const NEXT_LINKS = [
    { id: "nivoOs", href: SITE_LINKS.nivoOs },
    { id: "ecosystem", href: SITE_LINKS.ecosystem },
    { id: "contact", href: SITE_LINKS.contact },
    { id: "trust", href: SITE_LINKS.trust },
] as const

const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />

/**
 * The canonical `/company` page.
 *
 * It draws the organizational profile and decides nothing: who NIVO is, what it is building, what it
 * will not claim, and where a reader goes next. The routing tree mounts it and names the URL.
 *
 * @returns The page.
 */
export const CompanyPage = () => {
    const t = useTranslations("company")
    const href = useLocalizedHref()
    return (
        <div className={`${styles.routeFrame} ${styles.companyRoute}`}>
            <SiteMain>
                <article className={styles.companyPage}>
                    <section id="nivo-is" className={styles.companyHero} aria-labelledby="company-title">
                        <PageContainer className={styles.heroGrid}>
                            <div className={styles.heroCopy}>
                                <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
                                <Heading level={1} scale="display">
                                    <span id="company-title">
                                        {t("hero.title")} <em>{t("hero.titleEmphasis")}</em>
                                    </span>
                                </Heading>
                                <Text as="p" size="md" tone="muted">
                                    {t("hero.lede")}
                                </Text>
                                <div className={styles.actionRow}>
                                    <Button
                                        href={href(SITE_LINKS.nivoOs)}
                                        variant="primary"
                                        size="lg"
                                        endContent={<ArrowIcon />}
                                    >
                                        {t("hero.primaryAction")}
                                    </Button>
                                    <Button
                                        href={href(SITE_LINKS.ecosystem)}
                                        variant="secondary"
                                        size="lg"
                                        endContent={<ArrowIcon />}
                                    >
                                        {t("hero.secondaryAction")}
                                    </Button>
                                </div>
                            </div>
                            <div className={styles.companyVisual} aria-label={t("hero.visualLabel")}>
                                <span className={styles.visualOrbit} aria-hidden="true" />
                                <div className={styles.visualCore}>
                                    <span>{t("hero.visualBrand")}</span>
                                    <strong>{t("hero.visualCore")}</strong>
                                </div>
                                <div className={`${styles.orbitCard} ${styles.orbitCardOne}`}>
                                    <span>01</span>
                                    <strong>{t("hero.visualCards.organization")}</strong>
                                </div>
                                <div className={`${styles.orbitCard} ${styles.orbitCardTwo}`}>
                                    <span>02</span>
                                    <strong>{t("hero.visualCards.product")}</strong>
                                </div>
                                <div className={`${styles.orbitCard} ${styles.orbitCardThree}`}>
                                    <span>03</span>
                                    <strong>{t("hero.visualCards.responsibility")}</strong>
                                </div>
                            </div>
                        </PageContainer>
                    </section>

                    <section id="nivo-today" className={styles.todaySection} aria-labelledby="company-today-title">
                        <PageContainer>
                            <div className={styles.sectionHeading}>
                                <span className={styles.eyebrow}>{t("today.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-today-title">{t("today.title")}</span>
                                </Heading>
                                <Text as="p" size="md" tone="muted">
                                    {t("today.lede")}
                                </Text>
                            </div>
                            <div className={styles.todayGrid}>
                                {TODAY_IDS.map((id, index) => (
                                    <article className={styles.todayCard} key={id}>
                                        <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <Heading level={3}>{t(`today.items.${id}.title`)}</Heading>
                                        <Text as="p" size="sm" tone="muted">
                                            {t(`today.items.${id}.body`)}
                                        </Text>
                                    </article>
                                ))}
                            </div>
                        </PageContainer>
                    </section>

                    <section
                        id="provenance"
                        className={styles.provenanceSection}
                        aria-labelledby="company-provenance-title"
                    >
                        <PageContainer>
                            <div className={styles.sectionHeading}>
                                <span className={styles.eyebrow}>{t("provenance.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-provenance-title">{t("provenance.title")}</span>
                                </Heading>
                                <Text as="p" size="md" tone="muted">
                                    {t("provenance.lede")}
                                </Text>
                            </div>
                            <ol className={styles.provenanceLine} aria-label={t("provenance.label")}>
                                {PROVENANCE_IDS.map((id, index) => (
                                    <li key={id}>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                        <div>
                                            <strong>{t(`provenance.items.${id}.title`)}</strong>
                                            <small>{t(`provenance.items.${id}.body`)}</small>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </PageContainer>
                    </section>

                    <section id="mission" className={styles.statementSection} aria-labelledby="company-mission-title">
                        <PageContainer className={styles.statementGrid}>
                            <div className={styles.statementLead}>
                                <span className={styles.eyebrow}>{t("mission.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-mission-title">{t("mission.title")}</span>
                                </Heading>
                                <div className={styles.sequence} aria-label={t("mission.sequenceLabel")}>
                                    {MISSION_STEP_IDS.map((id, index) => (
                                        <span key={id}>
                                            <strong>{t(`mission.steps.${id}`)}</strong>
                                            {index < MISSION_STEP_IDS.length - 1 ? <ArrowIcon /> : null}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <blockquote className={styles.missionQuote}>
                                {t("mission.quoteLead")} <strong>{t("mission.quoteStrong")}</strong>{" "}
                                {t("mission.quoteTail")}
                            </blockquote>
                        </PageContainer>
                    </section>

                    <section id="vision" className={styles.visionSection} aria-labelledby="company-vision-title">
                        <PageContainer className={styles.visionGrid}>
                            <div className={styles.sectionHeading}>
                                <span className={styles.eyebrow}>{t("vision.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-vision-title">{t("vision.title")}</span>
                                </Heading>
                                <Text as="p" size="md">
                                    {t("vision.body")}
                                </Text>
                            </div>
                            <ol className={styles.visionSteps}>
                                {VISION_STEP_IDS.map((id, index) => (
                                    <li key={id}>
                                        <span>{String(index + 1).padStart(2, "0")}</span>
                                        <div>
                                            <strong>{t(`vision.steps.${id}.title`)}</strong>
                                            <small>{t(`vision.steps.${id}.body`)}</small>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </PageContainer>
                    </section>

                    <section
                        id="philosophy"
                        className={styles.philosophySection}
                        aria-labelledby="company-philosophy-title"
                    >
                        <PageContainer>
                            <div className={styles.sectionHeadingInverse}>
                                <span className={styles.eyebrow}>{t("philosophy.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-philosophy-title">{t("philosophy.title")}</span>
                                </Heading>
                                <Text as="p" size="md">
                                    {t("philosophy.lede")}
                                </Text>
                            </div>
                            <div className={styles.philosophyGrid}>
                                {PHILOSOPHY.map((item, index) => (
                                    <article key={item.id}>
                                        <span className={styles.philosophyIcon}>
                                            <NivoIcon props={{ name: item.icon, usage: "heading" }} />
                                        </span>
                                        <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <Heading level={3}>{t(`philosophy.items.${item.id}.title`)}</Heading>
                                        <Text as="p" size="sm">
                                            {t(`philosophy.items.${item.id}.body`)}
                                        </Text>
                                    </article>
                                ))}
                            </div>
                        </PageContainer>
                    </section>

                    <section id="values" className={styles.valuesSection} aria-labelledby="company-values-title">
                        <PageContainer>
                            <div className={styles.sectionHeading}>
                                <span className={styles.eyebrow}>{t("values.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-values-title">{t("values.title")}</span>
                                </Heading>
                                <Text as="p" size="md" tone="muted">
                                    {t("values.lede")}
                                </Text>
                            </div>
                            <div className={styles.valuesGrid}>
                                {VALUE_IDS.map((id, index) => (
                                    <article key={id}>
                                        <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <Heading level={3}>{t(`values.items.${id}.name`)}</Heading>
                                        <Text as="p" size="sm" tone="muted">
                                            {t(`values.items.${id}.meaning`)}
                                        </Text>
                                        <Badge tone="neutral">{t(`values.items.${id}.implication`)}</Badge>
                                    </article>
                                ))}
                            </div>
                        </PageContainer>
                    </section>

                    <section id="leadership" className={styles.truthSection} aria-labelledby="company-truth-title">
                        <PageContainer className={styles.truthGrid}>
                            <div>
                                <span className={styles.eyebrow}>{t("leadership.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-truth-title">{t("leadership.title")}</span>
                                </Heading>
                            </div>
                            <div className={styles.truthNotice}>
                                <Badge tone="warning">{t("leadership.badge")}</Badge>
                                <Text as="p" size="sm">
                                    {t("leadership.notice")}
                                </Text>
                            </div>
                        </PageContainer>
                    </section>

                    <section id="company-next-path" className={styles.companyCta} aria-labelledby="company-next-title">
                        <PageContainer className={styles.ctaGrid}>
                            <div>
                                <span className={styles.eyebrow}>{t("next.eyebrow")}</span>
                                <Heading level={2}>
                                    <span id="company-next-title">{t("next.title")}</span>
                                </Heading>
                            </div>
                            <nav className={styles.ctaLinks} aria-label={t("next.label")}>
                                {NEXT_LINKS.map((link) => (
                                    <TextAction
                                        href={href(link.href)}
                                        appearance="route"
                                        endContent={<ArrowIcon />}
                                        key={link.id}
                                    >
                                        {t(`next.links.${link.id}`)}
                                    </TextAction>
                                ))}
                            </nav>
                        </PageContainer>
                    </section>
                </article>
            </SiteMain>
        </div>
    )
}

export default CompanyPage
