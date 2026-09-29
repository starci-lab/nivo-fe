import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { useLocalizedHref } from "@/hooks"
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
} from "@/modules/landing/homepage"
import { SITE_LINKS } from "@/modules/landing/site"
import { ProcessFlow, SectionIntro, SITE_CLASS_NAMES, SiteMain } from "@/features/layouts/SiteShell"
import {
    HomeMotionHeroParallax,
    HomeMotionHeroReveal,
    HomeMotionRoleCard,
    HomeMotionSectionReveal,
} from "@/components/blocks/landing/HomeMotion"

const COMMERCIAL_ROUTE_ICONS = ["search", "code", "complete"] as const

type InlineRouteProps = { readonly parts: ReadonlyArray<string>; readonly joiner: string }

/** A semantic path whose separators are real product icons, never text glyphs. */
const InlineRoute = ({ parts, joiner }: InlineRouteProps) => (
    <span className={SITE_CLASS_NAMES.inlineRoute} aria-label={parts.join(joiner)}>
        {parts.map((part, index) => (
            <span key={part}>
                {index > 0 ? (
                    <span aria-hidden="true">
                        <NivoIcon props={{ name: "next", usage: "chip" }} />
                    </span>
                ) : null}
                <span>{part}</span>
            </span>
        ))}
    </span>
)

/** The canonical Homepage gateway assembled from shared public-site contracts. */
export const HomePage = () => {
    const t = useTranslations("home")
    const locale = useLocale()
    const href = useLocalizedHref()
    const joiner = t("routeJoiner")
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
    const commercialRoute = HOMEPAGE_COMMERCIAL_ROUTE.map((id) => t(`commercial.route.${id}`))
    const trustTitle = HOMEPAGE_TRUST_TITLE.map((id) => t(`trust.titleParts.${id}`))

    return (
        <SiteMain>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: homepageStructuredData({ locale, name: t("hero.title") }) }}
            />

            <section className={SITE_CLASS_NAMES.hero} aria-labelledby="home-hero-title">
                <PageContainer className={SITE_CLASS_NAMES.heroContainer}>
                    <HomeMotionHeroReveal>
                        <Text as="p" size="xs" tone="accent" weight="semibold">
                            {t("hero.eyebrow")}
                        </Text>
                        <Heading level={1} scale="display">
                            <span id="home-hero-title">
                                {t("hero.titlePrefix")}{" "}
                                <span className={SITE_CLASS_NAMES.textAccent}>{t("hero.titleAccent")}</span>
                            </span>
                        </Heading>
                        <Text as="p" size="sm" weight="semibold">
                            {t("hero.descriptor")}
                        </Text>
                        <Text as="p" size="md" tone="muted">
                            {t("hero.supporting")}
                        </Text>
                        <Text as="p" size="sm" weight="semibold">
                            {t("hero.philosophy")}
                        </Text>
                        <div className={SITE_CLASS_NAMES.actionRow}>
                            <Button
                                href={href(SITE_LINKS.nivoOs)}
                                variant="primary"
                                size="lg"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("hero.primary")}
                            </Button>
                            <Button
                                href={href(SITE_LINKS.applications)}
                                variant="secondary"
                                size="lg"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("hero.secondary")}
                            </Button>
                        </div>
                    </HomeMotionHeroReveal>

                    <figure className={SITE_CLASS_NAMES.heroVisual}>
                        <HomeMotionHeroParallax distance={26}>
                            <span className={SITE_CLASS_NAMES.heroSignal} aria-hidden="true">
                                {t("hero.signal")}
                            </span>
                            <Image
                                className={SITE_CLASS_NAMES.heroMascot}
                                src="/images/nivo-unicorn-responsibility-transparent-v18.png"
                                alt={t("hero.artworkAlt")}
                                width={1254}
                                height={1254}
                                sizes="(max-width: 48rem) 100vw, 56vw"
                                priority
                            />
                        </HomeMotionHeroParallax>
                        <figcaption className={SITE_CLASS_NAMES.screenReaderOnly}>
                            {t("hero.artworkCaption")}
                        </figcaption>
                    </figure>
                </PageContainer>
            </section>

            <section className={SITE_CLASS_NAMES.relevance} aria-labelledby="home-relevance-title">
                <PageContainer>
                    <HomeMotionSectionReveal direction="left">
                        <SectionIntro
                            id="home-relevance-title"
                            eyebrow={t("relevance.eyebrow")}
                            title={t("relevance.title")}
                            description={t("relevance.supporting")}
                            inverse
                        />
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal>
                        <aside className={SITE_CLASS_NAMES.today} aria-labelledby="home-today-title">
                            <div className={SITE_CLASS_NAMES.todayIdentity}>
                                <Text as="p" size="xs" weight="semibold">
                                    {t("today.status")}
                                </Text>
                                <Heading level={3}>
                                    <span id="home-today-title">{t("today.headline")}</span>
                                </Heading>
                            </div>
                            <div className={SITE_CLASS_NAMES.todayFocus}>
                                <Text as="p" size="xs" weight="semibold">
                                    {t("today.focusLabel")}
                                </Text>
                                <Text as="p" size="metric-lead" weight="semibold">
                                    <InlineRoute parts={focus} joiner={joiner} />
                                </Text>
                            </div>
                            <div className={SITE_CLASS_NAMES.todayPrinciple}>
                                <Text as="p" size="sm" weight="semibold">
                                    {t("today.principle")}
                                </Text>
                            </div>
                        </aside>
                    </HomeMotionSectionReveal>
                    <div className={SITE_CLASS_NAMES.relevanceBody}>
                        <HomeMotionSectionReveal direction="left">
                            <div className={SITE_CLASS_NAMES.relevanceExample}>
                                <Text as="p" size="xs" weight="semibold">
                                    {t("relevance.exampleLabel")}
                                </Text>
                                <Heading level={3}>
                                    <InlineRoute parts={focus} joiner={joiner} />
                                </Heading>
                                <Text as="p" size="md">
                                    {t("relevance.responsibility")}
                                </Text>
                                <Button
                                    href={href(SITE_LINKS.applications)}
                                    variant="secondary"
                                    endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                                >
                                    {t("relevance.action")}
                                </Button>
                            </div>
                        </HomeMotionSectionReveal>
                        <HomeMotionSectionReveal direction="right" delay={0.08}>
                            <ProcessFlow
                                label={t("relevance.flowLabel")}
                                steps={relevanceSteps}
                                emphasisId="responsibility"
                                inverse
                            />
                        </HomeMotionSectionReveal>
                    </div>
                </PageContainer>
            </section>

            <section className={SITE_CLASS_NAMES.operatingModel} aria-labelledby="home-operating-model-title">
                <PageContainer>
                    <HomeMotionSectionReveal direction="left">
                        <SectionIntro
                            id="home-operating-model-title"
                            eyebrow={t("operatingModel.eyebrow")}
                            title={t("operatingModel.title")}
                            description={t("operatingModel.supporting")}
                        />
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal direction="left">
                        <div className={SITE_CLASS_NAMES.operatingModelLabel}>
                            <Text as="p" size="xs" tone="accent" weight="semibold">
                                {t("operatingModel.rolesLabel")}
                            </Text>
                        </div>
                    </HomeMotionSectionReveal>
                    <div
                        className={SITE_CLASS_NAMES.operatingModelVisuals}
                        aria-label={t("operatingModel.visualsLabel")}
                    >
                        {HOMEPAGE_ROLE_VISUALS.map((visual, index) => (
                            <HomeMotionRoleCard key={visual.id} index={index}>
                                <div className={SITE_CLASS_NAMES.operatingModelVisualMedia}>
                                    <Image
                                        src={visual.src}
                                        alt=""
                                        width={1254}
                                        height={1254}
                                        sizes="(max-width: 48rem) 82vw, (max-width: 64rem) 42vw, 22vw"
                                    />
                                </div>
                                <figcaption className={SITE_CLASS_NAMES.operatingModelVisualCaption}>
                                    <Text as="p" size="xs" tone="accent" weight="semibold">
                                        {String(index + 1).padStart(2, "0")}
                                    </Text>
                                    <Heading level={3}>{t(`operatingModel.visuals.${visual.id}.label`)}</Heading>
                                    <Text as="p" size="sm" tone="muted">
                                        {t(`operatingModel.visuals.${visual.id}.description`)}
                                    </Text>
                                </figcaption>
                            </HomeMotionRoleCard>
                        ))}
                    </div>
                    <HomeMotionSectionReveal delay={0.08}>
                        <ProcessFlow
                            label={t("operatingModel.flowLabel")}
                            steps={operatingSteps}
                            emphasisId="responsibility"
                        />
                    </HomeMotionSectionReveal>
                    <div className={SITE_CLASS_NAMES.operatingModelFooter}>
                        <div className={SITE_CLASS_NAMES.operatingModelPrinciple}>
                            <Text as="p" size="metric-lead" weight="semibold">
                                {t("operatingModel.principle")}
                            </Text>
                            <Text as="p" size="sm" tone="muted">
                                {t("operatingModel.principleBody")}
                            </Text>
                        </div>
                        <div className={SITE_CLASS_NAMES.actionRow}>
                            <Button href={href(SITE_LINKS.nivoOs)} variant="primary">
                                {t("operatingModel.primaryAction")}
                            </Button>
                            <TextAction
                                href={href(SITE_LINKS.responsibility)}
                                appearance="route"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {t("operatingModel.secondaryAction")}
                            </TextAction>
                        </div>
                    </div>
                </PageContainer>
            </section>

            <section className={SITE_CLASS_NAMES.commercial} aria-labelledby="home-commercial-title">
                <PageContainer className={SITE_CLASS_NAMES.commercialContainer}>
                    <HomeMotionSectionReveal direction="left">
                        <div className={SITE_CLASS_NAMES.commercialCopy}>
                            <SectionIntro
                                id="home-commercial-title"
                                eyebrow={t("commercial.eyebrow")}
                                title={t("commercial.title")}
                                description={t("commercial.supporting")}
                            />
                            <div className={SITE_CLASS_NAMES.actionRow}>
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
                        <div className={SITE_CLASS_NAMES.commercialRoute} aria-label={t("commercial.routeLabel")}>
                            {commercialRoute.map((step, index) => (
                                <div className={SITE_CLASS_NAMES.commercialRouteStep} key={step}>
                                    <span className={SITE_CLASS_NAMES.commercialRouteIndex}>
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className={SITE_CLASS_NAMES.commercialRouteMarker} aria-hidden="true">
                                        <NivoIcon
                                            props={{ name: COMMERCIAL_ROUTE_ICONS[index] ?? "next", usage: "heading" }}
                                        />
                                    </span>
                                    <strong className={SITE_CLASS_NAMES.commercialRouteCopy}>{step}</strong>
                                    {index < commercialRoute.length - 1 ? (
                                        <span className={SITE_CLASS_NAMES.commercialRouteArrow} aria-hidden="true">
                                            <NivoIcon props={{ name: "next", usage: "chip" }} />
                                        </span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </HomeMotionSectionReveal>
                </PageContainer>
            </section>

            <section className={SITE_CLASS_NAMES.trust} aria-labelledby="home-trust-title">
                <PageContainer className={SITE_CLASS_NAMES.trustContainer}>
                    <HomeMotionSectionReveal direction="left">
                        <div className={SITE_CLASS_NAMES.trustCopy}>
                            <SectionIntro
                                id="home-trust-title"
                                eyebrow={t("trust.eyebrow")}
                                title={<InlineRoute parts={trustTitle} joiner={joiner} />}
                                description={t("trust.supporting")}
                                inverse
                            />
                            <div className={SITE_CLASS_NAMES.trustLinks}>
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
                        <aside className={SITE_CLASS_NAMES.trustFuture} aria-label={t("trust.futureLabel")}>
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

            <section className={SITE_CLASS_NAMES.nextPath} aria-labelledby="home-next-path-title">
                <PageContainer>
                    <HomeMotionSectionReveal>
                        <div className={SITE_CLASS_NAMES.nextPathIdeas}>
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
                    <div className={SITE_CLASS_NAMES.nextPathRoutes} aria-label={t("nextPaths.label")}>
                        {HOMEPAGE_NEXT_PATHS.map((path, pathIndex) => (
                            <section aria-labelledby={`next-path-${pathIndex}`} key={path.id}>
                                <Text as="p" id={`next-path-${pathIndex}`} size="xs" weight="semibold">
                                    {t(`nextPaths.groups.${path.id}`)}
                                </Text>
                                <ul>
                                    {path.links.map((link) => (
                                        <li key={link.id}>
                                            <TextAction
                                                href={href(link.href)}
                                                appearance="route"
                                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
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
        </SiteMain>
    )
}
