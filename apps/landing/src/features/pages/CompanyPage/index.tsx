import { NivoIcon } from "@nivo/ui"
import { Badge, Heading, PageContainer } from "@starci/grammar/common"
import { useTranslations } from "next-intl"
import { SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import { CardGrid } from "../../../components/blocks/commercial/CardGrid"
import { CompanyArrowIcon } from "./CompanyArrowIcon"
import { CompanyHero } from "./CompanyHero"
import { CompanyNextPath } from "./CompanyNextPath"
import { CLASS_NAMES } from "./classNames"

const VALUE_IDS = ["outcome", "simplify", "discipline", "ai", "evolve"] as const
const TODAY_IDS = ["today", "building", "toward", "notClaimed"] as const
const PROVENANCE_IDS = ["delivery", "systems", "operations", "today"] as const
const MISSION_STEP_IDS = ["context", "responsibility", "outcome", "capacity"] as const
const VISION_STEP_IDS = ["native", "autonomy", "selfSustaining"] as const
const PHILOSOPHY = [
    { id: "human", iconProps: { name: "account", usage: "heading" } },
    { id: "ai", iconProps: { name: "agentos", usage: "heading" } },
    { id: "system", iconProps: { name: "complete", usage: "heading" } },
] as const
const NEXT_LINKS = [
    { id: "nivoOs", href: SITE_LINKS.nivoOs },
    { id: "ecosystem", href: SITE_LINKS.ecosystem },
    { id: "contact", href: SITE_LINKS.contact },
    { id: "trust", href: SITE_LINKS.trust },
] as const

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
        <div className={CLASS_NAMES.page}>
            <SiteMain>
                <article>
                    <CompanyHero
                        copy={{
                            eyebrow: t("hero.eyebrow"),
                            title: t("hero.title"),
                            titleEmphasis: t("hero.titleEmphasis"),
                            lede: t("hero.lede"),
                            primaryAction: t("hero.primaryAction"),
                            secondaryAction: t("hero.secondaryAction"),
                            visualLabel: t("hero.visualLabel"),
                            visualBrand: t("hero.visualBrand"),
                            visualCore: t("hero.visualCore"),
                            organization: t("hero.visualCards.organization"),
                            product: t("hero.visualCards.product"),
                            responsibility: t("hero.visualCards.responsibility"),
                        }}
                        hrefs={{ nivoOs: href(SITE_LINKS.nivoOs), ecosystem: href(SITE_LINKS.ecosystem) }}
                    />

                    <section id="nivo-today" className={CLASS_NAMES.todaySection} aria-labelledby="company-today-title">
                        <PageContainer>
                            <div className={CLASS_NAMES.sectionHeading}>
                                <span className={CLASS_NAMES.eyebrow}>{t("today.eyebrow")}</span>
                                <Heading level={2}><span id="company-today-title">{t("today.title")}</span></Heading>
                                <p className={CLASS_NAMES.sectionCopyMuted}>
                                    {t("today.lede")}
                                </p>
                            </div>
                            <CardGrid variant="today">
                                {TODAY_IDS.map((id, index) => (
                                    <article
                                        className={
                                            index === 1
                                                ? `${CLASS_NAMES.todayCard} ${CLASS_NAMES.todayCardHighlight}`
                                                : CLASS_NAMES.todayCard
                                        }
                                        key={id}
                                    >
                                        <span className={CLASS_NAMES.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <Heading level={3}><span>{t(`today.items.${id}.title`)}</span></Heading>
                                        <p className={CLASS_NAMES.cardCopy}>
                                            {t(`today.items.${id}.body`)}
                                        </p>
                                    </article>
                                ))}
                            </CardGrid>
                        </PageContainer>
                    </section>

                    <section
                        id="provenance"
                        className={CLASS_NAMES.provenanceSection}
                        aria-labelledby="company-provenance-title"
                    >
                        <PageContainer>
                            <div className={CLASS_NAMES.sectionHeading}>
                                <span className={CLASS_NAMES.eyebrow}>{t("provenance.eyebrow")}</span>
                                <Heading level={2}><span id="company-provenance-title">{t("provenance.title")}</span></Heading>
                                <p className={CLASS_NAMES.sectionCopyMuted}>
                                    {t("provenance.lede")}
                                </p>
                            </div>
                            <ol className={CLASS_NAMES.provenanceLine} aria-label={t("provenance.label")}>
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

                    <section id="mission" className={CLASS_NAMES.statementSection} aria-labelledby="company-mission-title">
                        <PageContainer className={CLASS_NAMES.statementGrid}>
                            <div className={CLASS_NAMES.statementLead}>
                                <span className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                    {t("mission.eyebrow")}
                                </span>
                                <Heading level={2}><span id="company-mission-title" className={CLASS_NAMES.inverseHeadingText}>{t("mission.title")}</span></Heading>
                                <div className={CLASS_NAMES.sequence} aria-label={t("mission.sequenceLabel")}>
                                    {MISSION_STEP_IDS.map((id, index) => (
                                        <span key={id}>
                                            <strong>{t(`mission.steps.${id}`)}</strong>
                                            {index < MISSION_STEP_IDS.length - 1 ? <CompanyArrowIcon /> : null}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <blockquote className={CLASS_NAMES.missionQuote}>
                                {t("mission.quoteLead")} <strong>{t("mission.quoteStrong")}</strong>{" "}
                                {t("mission.quoteTail")}
                            </blockquote>
                        </PageContainer>
                    </section>

                    <section id="vision" className={CLASS_NAMES.visionSection} aria-labelledby="company-vision-title">
                        <PageContainer className={CLASS_NAMES.visionGrid}>
                            <div className={CLASS_NAMES.sectionHeading}>
                                <span className={CLASS_NAMES.eyebrow}>{t("vision.eyebrow")}</span>
                                <Heading level={2}><span id="company-vision-title">{t("vision.title")}</span></Heading>
                                <p className={CLASS_NAMES.sectionCopy}>
                                    {t("vision.body")}
                                </p>
                            </div>
                            <ol className={CLASS_NAMES.visionSteps}>
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
                        className={CLASS_NAMES.philosophySection}
                        aria-labelledby="company-philosophy-title"
                    >
                        <PageContainer>
                            <div className={CLASS_NAMES.sectionHeadingInverse}>
                                <span className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                    {t("philosophy.eyebrow")}
                                </span>
                                <Heading level={2}><span id="company-philosophy-title" className={CLASS_NAMES.inverseHeadingText}>{t("philosophy.title")}</span></Heading>
                                <p className={CLASS_NAMES.sectionCopyInverse}>
                                    {t("philosophy.lede")}
                                </p>
                            </div>
                            <CardGrid variant="philosophy">
                                {PHILOSOPHY.map((item, index) => (
                                    <article key={item.id}>
                                        <span className={CLASS_NAMES.philosophyIcon}>
                                            <NivoIcon props={item.iconProps} />
                                        </span>
                                        <span className={CLASS_NAMES.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <Heading level={3}><span className={CLASS_NAMES.inverseHeadingText}>{t(`philosophy.items.${item.id}.title`)}</span></Heading>
                                        <p className={CLASS_NAMES.philosophyCardCopy}>
                                            {t(`philosophy.items.${item.id}.body`)}
                                        </p>
                                    </article>
                                ))}
                            </CardGrid>
                        </PageContainer>
                    </section>

                    <section id="values" className={CLASS_NAMES.valuesSection} aria-labelledby="company-values-title">
                        <PageContainer>
                            <div className={CLASS_NAMES.sectionHeading}>
                                <span className={CLASS_NAMES.eyebrow}>{t("values.eyebrow")}</span>
                                <Heading level={2}><span id="company-values-title">{t("values.title")}</span></Heading>
                                <p className={CLASS_NAMES.sectionCopyMuted}>
                                    {t("values.lede")}
                                </p>
                            </div>
                            <CardGrid variant="values">
                                {VALUE_IDS.map((id, index) => (
                                    <article key={id}>
                                        <span className={CLASS_NAMES.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                                        <Heading level={3}><span className={index === 2 ? CLASS_NAMES.inverseHeadingText : undefined}>{t(`values.items.${id}.name`)}</span></Heading>
                                        <p className={CLASS_NAMES.cardCopy}>
                                            {t(`values.items.${id}.meaning`)}
                                        </p>
                                        <Badge tone="neutral">{t(`values.items.${id}.implication`)}</Badge>
                                    </article>
                                ))}
                            </CardGrid>
                        </PageContainer>
                    </section>

                    <section id="leadership" className={CLASS_NAMES.truthSection} aria-labelledby="company-truth-title">
                        <PageContainer className={CLASS_NAMES.truthGrid}>
                            <div>
                                <span className={CLASS_NAMES.eyebrow}>{t("leadership.eyebrow")}</span>
                                <Heading level={2}><span id="company-truth-title">{t("leadership.title")}</span></Heading>
                            </div>
                            <div className={CLASS_NAMES.truthNotice}>
                                <Badge tone="warning">{t("leadership.badge")}</Badge>
                                <p className={CLASS_NAMES.truthNoticeCopy}>
                                    {t("leadership.notice")}
                                </p>
                            </div>
                        </PageContainer>
                    </section>

                    <CompanyNextPath
                        eyebrow={t("next.eyebrow")}
                        title={t("next.title")}
                        label={t("next.label")}
                        links={NEXT_LINKS.map((link) => ({
                            id: link.id,
                            href: href(link.href),
                            label: t(`next.links.${link.id}`),
                        }))}
                    />
                </article>
            </SiteMain>
        </div>
    )
}

export default CompanyPage
