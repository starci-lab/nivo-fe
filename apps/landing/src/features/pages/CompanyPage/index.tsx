import type { NivoIconData } from "@nivo/ui"
import type { StaticStateRowData } from "@starci/grammar/common"
import { useTranslations } from "next-intl"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import { CompanyPageBase } from "./component"

type CompanyCard = { readonly id: string; readonly title: string; readonly body: string }
/** Localized content for the company profile. */
export type CompanyPageData = {
    readonly copy: {
        readonly "hero.eyebrow": string
        readonly "hero.title": string
        readonly "hero.titleEmphasis": string
        readonly "hero.lede": string
        readonly "hero.primaryAction": string
        readonly "hero.secondaryAction": string
        readonly "hero.visualLabel": string
        readonly "hero.visualBrand": string
        readonly "hero.visualCore": string
        readonly "hero.visualCards.organization": string
        readonly "hero.visualCards.product": string
        readonly "hero.visualCards.responsibility": string
        readonly "today.eyebrow": string
        readonly "today.title": string
        readonly "today.lede": string
        readonly "provenance.eyebrow": string
        readonly "provenance.title": string
        readonly "provenance.lede": string
        readonly "provenance.label": string
        readonly "mission.eyebrow": string
        readonly "mission.title": string
        readonly "mission.sequenceLabel": string
        readonly "mission.quoteLead": string
        readonly "mission.quoteStrong": string
        readonly "mission.quoteTail": string
        readonly "vision.eyebrow": string
        readonly "vision.title": string
        readonly "vision.body": string
        readonly "philosophy.eyebrow": string
        readonly "philosophy.title": string
        readonly "philosophy.lede": string
        readonly "values.eyebrow": string
        readonly "values.title": string
        readonly "values.lede": string
        readonly "leadership.eyebrow": string
        readonly "leadership.title": string
        readonly "leadership.badge": string
        readonly "leadership.notice": string
        readonly "next.eyebrow": string
        readonly "next.title": string
        readonly "next.label": string
    }
    readonly hrefs: { readonly nivoOs: string; readonly ecosystem: string }
    readonly today: ReadonlyArray<CompanyCard>
    readonly values: ReadonlyArray<CompanyCard & { readonly implication: string }>
    readonly philosophy: ReadonlyArray<CompanyCard & { readonly iconProps: NivoIconData }>
    readonly provenance: ReadonlyArray<StaticStateRowData>
    readonly vision: ReadonlyArray<StaticStateRowData>
    readonly missionSteps: ReadonlyArray<string>
    readonly nextLinks: ReadonlyArray<{ readonly id: string; readonly label: string; readonly href: string }>
}
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
        <CompanyPageBase
            props={{
                copy: {
                    "hero.eyebrow": t("hero.eyebrow"),
                    "hero.title": t("hero.title"),
                    "hero.titleEmphasis": t("hero.titleEmphasis"),
                    "hero.lede": t("hero.lede"),
                    "hero.primaryAction": t("hero.primaryAction"),
                    "hero.secondaryAction": t("hero.secondaryAction"),
                    "hero.visualLabel": t("hero.visualLabel"),
                    "hero.visualBrand": t("hero.visualBrand"),
                    "hero.visualCore": t("hero.visualCore"),
                    "hero.visualCards.organization": t("hero.visualCards.organization"),
                    "hero.visualCards.product": t("hero.visualCards.product"),
                    "hero.visualCards.responsibility": t("hero.visualCards.responsibility"),
                    "today.eyebrow": t("today.eyebrow"),
                    "today.title": t("today.title"),
                    "today.lede": t("today.lede"),
                    "provenance.eyebrow": t("provenance.eyebrow"),
                    "provenance.title": t("provenance.title"),
                    "provenance.lede": t("provenance.lede"),
                    "provenance.label": t("provenance.label"),
                    "mission.eyebrow": t("mission.eyebrow"),
                    "mission.title": t("mission.title"),
                    "mission.sequenceLabel": t("mission.sequenceLabel"),
                    "mission.quoteLead": t("mission.quoteLead"),
                    "mission.quoteStrong": t("mission.quoteStrong"),
                    "mission.quoteTail": t("mission.quoteTail"),
                    "vision.eyebrow": t("vision.eyebrow"),
                    "vision.title": t("vision.title"),
                    "vision.body": t("vision.body"),
                    "philosophy.eyebrow": t("philosophy.eyebrow"),
                    "philosophy.title": t("philosophy.title"),
                    "philosophy.lede": t("philosophy.lede"),
                    "values.eyebrow": t("values.eyebrow"),
                    "values.title": t("values.title"),
                    "values.lede": t("values.lede"),
                    "leadership.eyebrow": t("leadership.eyebrow"),
                    "leadership.title": t("leadership.title"),
                    "leadership.badge": t("leadership.badge"),
                    "leadership.notice": t("leadership.notice"),
                    "next.eyebrow": t("next.eyebrow"),
                    "next.title": t("next.title"),
                    "next.label": t("next.label"),
                },
                hrefs: { nivoOs: href(SITE_LINKS.nivoOs), ecosystem: href(SITE_LINKS.ecosystem) },
                today: TODAY_IDS.map((id) => ({
                    id,
                    title: t(`today.items.${id}.title`),
                    body: t(`today.items.${id}.body`),
                })),
                values: VALUE_IDS.map((id) => ({
                    id,
                    title: t(`values.items.${id}.name`),
                    body: t(`values.items.${id}.meaning`),
                    implication: t(`values.items.${id}.implication`),
                })),
                philosophy: PHILOSOPHY.map((item) => ({
                    ...item,
                    title: t(`philosophy.items.${item.id}.title`),
                    body: t(`philosophy.items.${item.id}.body`),
                })),
                provenance: PROVENANCE_IDS.map((id, index) => ({
                    id,
                    label: t(`provenance.items.${id}.title`),
                    description: `${String(index + 1).padStart(2, "0")} ${t(`provenance.items.${id}.body`)}`,
                })),
                vision: VISION_STEP_IDS.map((id, index) => ({
                    id,
                    label: t(`vision.steps.${id}.title`),
                    description: `${String(index + 1).padStart(2, "0")} ${t(`vision.steps.${id}.body`)}`,
                })),
                missionSteps: MISSION_STEP_IDS.map((id) => t(`mission.steps.${id}`)),
                nextLinks: NEXT_LINKS.map((link) => ({
                    id: link.id,
                    href: href(link.href),
                    label: t(`next.links.${link.id}`),
                })),
            }}
        />
    )
}
export default CompanyPage
