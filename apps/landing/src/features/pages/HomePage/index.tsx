import { useLocale, useTranslations } from "next-intl"
import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { useLocalizedHref } from "@/hooks"
import { SiteMain, SectionIntro } from "../../layouts/SiteShell"
import { HomeMotionSectionReveal } from "../../../components/blocks/landing/HomeMotion"
import {
    HOMEPAGE_COMMERCIAL_ROUTE,
    HOMEPAGE_FOCUS,
    HOMEPAGE_NEXT_PATHS,
    HOMEPAGE_OPERATING_STEPS,
    HOMEPAGE_RELEVANCE_STEPS,
    HOMEPAGE_ROLE_VISUALS,
    HOMEPAGE_TRUST_TITLE,
    homepageStructuredData,
    type PublicFlowStep,
} from "../../../modules/landing/homepage"
import { SITE_LINKS } from "../../../modules/landing/site"
import { CLASS_NAMES, homeCommercialRouteMarkerClassName, homeCommercialRouteStepClassName } from "./classNames"
import { HomeHero, HomeOperatingModel, HomeRelevance, InlineRoute } from "./component"

const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const
const ROUTE_ICON_NAMES = ["search", "code", "complete"] as const
const ROUTE_ICON_PROPS = {
    search: { name: "search", usage: "heading" },
    code: { name: "code", usage: "heading" },
    complete: { name: "complete", usage: "heading" },
    next: { name: "next", usage: "heading" },
} as const

/** Render the guided route from discovery through supported delivery. */
const HomeCommercial = () => {
    const t = useTranslations("home")
    const href = useLocalizedHref()
    const route = HOMEPAGE_COMMERCIAL_ROUTE.map((id) => t(`commercial.route.${id}`))

    return (
        <section className={CLASS_NAMES.commercial.section} aria-labelledby="home-commercial-title">
            <PageContainer className={CLASS_NAMES.commercial.container}>
                <HomeMotionSectionReveal direction="left">
                    <div className={CLASS_NAMES.commercial.copy}>
                        <SectionIntro
                            id="home-commercial-title"
                            eyebrow={t("commercial.eyebrow")}
                            title={t("commercial.title")}
                            description={t("commercial.supporting")}
                        />
                        <div className={CLASS_NAMES.commercial.actions}>
                            <Button
                                href={href(SITE_LINKS.pricing)}
                                variant="primary"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("commercial.primaryAction")}
                            </Button>
                            <TextAction
                                href={href(`${SITE_LINKS.contact}?intent=product`)}
                                appearance="route"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("commercial.assistedAction")}
                            </TextAction>
                        </div>
                    </div>
                </HomeMotionSectionReveal>
                <HomeMotionSectionReveal direction="right" delay={0.08}>
                    <div className={CLASS_NAMES.commercial.route} role="list" aria-label={t("commercial.routeLabel")}>
                        {route.map((step, index) => (
                            <div
                                className={homeCommercialRouteStepClassName(index)}
                                role="listitem"
                                key={step}
                            >
                                <span className={CLASS_NAMES.commercial.routeIndex}>
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span
                                    className={homeCommercialRouteMarkerClassName(index)}
                                    aria-hidden="true"
                                >
                                    <NivoIcon
                                        props={ROUTE_ICON_PROPS[ROUTE_ICON_NAMES[index] ?? "next"]}
                                    />
                                </span>
                                <strong className={CLASS_NAMES.commercial.routeCopy}>{step}</strong>
                                {index < route.length - 1 ? (
                                    <span className={CLASS_NAMES.commercial.routeArrow} aria-hidden="true">
                                        <NivoIcon props={NEXT_CHIP_ICON_PROPS} />
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </HomeMotionSectionReveal>
            </PageContainer>
        </section>
    )
}

/** Render the trust foundation and the direction it supports. */
const HomeTrust = () => {
    const t = useTranslations("home")
    const href = useLocalizedHref()
    const joiner = t("routeJoiner")
    const title = HOMEPAGE_TRUST_TITLE.map((id) => t(`trust.titleParts.${id}`))

    return (
        <section className={CLASS_NAMES.trust.section} aria-labelledby="home-trust-title">
            <PageContainer className={CLASS_NAMES.trust.container}>
                <HomeMotionSectionReveal direction="left">
                    <div>
                        <SectionIntro
                            id="home-trust-title"
                            eyebrow={t("trust.eyebrow")}
                            title={<InlineRoute parts={title} joiner={joiner} />}
                            description={t("trust.supporting")}
                            inverse
                        />
                        <div className={CLASS_NAMES.trust.links}>
                            <TextAction
                                href={href(SITE_LINKS.trust)}
                                appearance="route"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("trust.trustAction")}
                            </TextAction>
                            <TextAction
                                href={href(SITE_LINKS.ecosystem)}
                                appearance="route"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("trust.ecosystemAction")}
                            </TextAction>
                        </div>
                    </div>
                </HomeMotionSectionReveal>
                <HomeMotionSectionReveal direction="right" delay={0.08}>
                    <aside className={CLASS_NAMES.trust.future} aria-label={t("trust.futureLabel")}>
                        <Text as="p" size="xs" weight="semibold">
                            {t("trust.futureLabel")}
                        </Text>
                        <Heading level={3}>{t("trust.futureTitle")}</Heading>
                        <Text as="p" size="sm">
                            {t("trust.futureBody")}
                        </Text>
                    </aside>
                </HomeMotionSectionReveal>
            </PageContainer>
        </section>
    )
}

/** Render next steps and useful routes for each visitor. */
const HomeNextPath = () => {
    const t = useTranslations("home")
    const href = useLocalizedHref()

    return (
        <section className={CLASS_NAMES.nextPath.section} aria-labelledby="home-next-path-title">
            <PageContainer>
                <HomeMotionSectionReveal>
                    <div className={CLASS_NAMES.nextPath.ideas}>
                        <SectionIntro
                            id="home-next-path-title"
                            eyebrow={t("ideas.eyebrow")}
                            title={t("ideas.title")}
                            description={t("ideas.supporting")}
                            action={
                                <TextAction
                                    href={href(SITE_LINKS.ideas)}
                                    appearance="route"
                                    endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                                >
                                    {t("ideas.action")}
                                </TextAction>
                            }
                        />
                    </div>
                </HomeMotionSectionReveal>
                <div className={CLASS_NAMES.nextPath.routes} role="group" aria-label={t("nextPaths.label")}>
                    {HOMEPAGE_NEXT_PATHS.map((path, pathIndex) => (
                        <section
                            className={CLASS_NAMES.nextPath.group}
                            aria-labelledby={`next-path-${pathIndex}`}
                            key={path.id}
                        >
                            <Text as="p" id={`next-path-${pathIndex}`} size="xs" weight="semibold">
                                {t(`nextPaths.groups.${path.id}`)}
                            </Text>
                            <ul className={CLASS_NAMES.nextPath.routeList}>
                                {path.links.map((link) => (
                                    <li key={link.id}>
                                        <TextAction
                                            href={href(link.href)}
                                            appearance="route"
                                            endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                                        >
                                            {t(`nextPaths.links.${link.id}`)}
                                        </TextAction>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </PageContainer>
        </section>
    )
}

/** The canonical homepage assembled from page-owned sections. */
export const HomePage = () => {
    const t = useTranslations("home")
    const locale = useLocale()
    const href = useLocalizedHref()
    const focus = HOMEPAGE_FOCUS.map((id) => t(`focus.${id}`))
    const relevanceSteps: ReadonlyArray<PublicFlowStep> = HOMEPAGE_RELEVANCE_STEPS.map((id) => ({
        id,
        label: t(`relevance.steps.${id}.label`),
        description: t(`relevance.steps.${id}.description`),
    }))
    const operatingSteps: ReadonlyArray<PublicFlowStep> = HOMEPAGE_OPERATING_STEPS.map((id) => ({
        id,
        label: t(`operatingModel.steps.${id}.label`),
        description: t(`operatingModel.steps.${id}.description`),
    }))
    const heroCopy = {
        eyebrow: t("hero.eyebrow"), titlePrefix: t("hero.titlePrefix"), titleAccent: t("hero.titleAccent"),
        descriptor: t("hero.descriptor"), supporting: t("hero.supporting"), philosophy: t("hero.philosophy"),
        primary: t("hero.primary"), secondary: t("hero.secondary"), signal: t("hero.signal"),
        artworkAlt: t("hero.artworkAlt"), artworkCaption: t("hero.artworkCaption"),
    }
    const relevanceCopy = {
        eyebrow: t("relevance.eyebrow"), title: t("relevance.title"), supporting: t("relevance.supporting"),
        todayStatus: t("today.status"), todayHeadline: t("today.headline"), focusLabel: t("today.focusLabel"),
        principle: t("today.principle"), exampleLabel: t("relevance.exampleLabel"),
        responsibility: t("relevance.responsibility"), action: t("relevance.action"),
        flowLabel: t("relevance.flowLabel"), joiner: t("routeJoiner"), focus, steps: relevanceSteps,
    }
    const operatingModelCopy = {
        eyebrow: t("operatingModel.eyebrow"), title: t("operatingModel.title"),
        supporting: t("operatingModel.supporting"), rolesLabel: t("operatingModel.rolesLabel"),
        visualsLabel: t("operatingModel.visualsLabel"), flowLabel: t("operatingModel.flowLabel"),
        principle: t("operatingModel.principle"), principleBody: t("operatingModel.principleBody"),
        primaryAction: t("operatingModel.primaryAction"), secondaryAction: t("operatingModel.secondaryAction"),
        steps: operatingSteps,
        visuals: HOMEPAGE_ROLE_VISUALS.map((visual) => ({
            ...visual,
            label: t(`operatingModel.visuals.${visual.id}.label`),
            description: t(`operatingModel.visuals.${visual.id}.description`),
        })),
    }

    return (
        <SiteMain>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: homepageStructuredData({ locale, name: t("hero.title") }) }}
            />
            <HomeHero
                copy={heroCopy}
                hrefs={{ primary: href(SITE_LINKS.nivoOs), secondary: href(SITE_LINKS.applications) }}
            />
            <HomeRelevance copy={relevanceCopy} applicationsHref={href(SITE_LINKS.applications)} />
            <HomeOperatingModel
                copy={operatingModelCopy}
                hrefs={{ primary: href(SITE_LINKS.nivoOs), responsibility: href(SITE_LINKS.responsibility) }}
            />
            <HomeCommercial />
            <HomeTrust />
            <HomeNextPath />
        </SiteMain>
    )
}
