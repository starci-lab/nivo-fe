import Image from "next/image"
import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { ProcessFlow, SectionIntro } from "../../layouts/SiteShell"
import {
    HomeMotionHeroReveal,
    HomeMotionRoleCard,
    HomeMotionSectionReveal,
} from "../../../components/blocks/landing/HomeMotion"
import { HomeMotionHeroParallax } from "../../../components/blocks/landing/HomeMotionHeroParallax"
import type { PublicFlowStep } from "../../../modules/landing/homepage"
import { CLASS_NAMES, homeRoleImageClassName } from "./classNames"

const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

type InlineRouteProps = { readonly parts: ReadonlyArray<string>; readonly joiner: string }
type HomeHeroProps = {
    readonly copy: {
        readonly eyebrow: string
        readonly titlePrefix: string
        readonly titleAccent: string
        readonly descriptor: string
        readonly supporting: string
        readonly philosophy: string
        readonly primary: string
        readonly secondary: string
        readonly signal: string
        readonly artworkAlt: string
        readonly artworkCaption: string
    }
    readonly hrefs: { readonly primary: string; readonly secondary: string }
}
type HomeRelevanceProps = {
    readonly copy: {
        readonly eyebrow: string
        readonly title: string
        readonly supporting: string
        readonly todayStatus: string
        readonly todayHeadline: string
        readonly focusLabel: string
        readonly principle: string
        readonly exampleLabel: string
        readonly responsibility: string
        readonly action: string
        readonly flowLabel: string
        readonly joiner: string
        readonly focus: ReadonlyArray<string>
        readonly steps: ReadonlyArray<PublicFlowStep>
    }
    readonly applicationsHref: string
}
type HomeRoleVisualCopy = { readonly id: string; readonly src: string; readonly label: string; readonly description: string }
type HomeOperatingModelProps = {
    readonly copy: {
        readonly eyebrow: string
        readonly title: string
        readonly supporting: string
        readonly rolesLabel: string
        readonly visualsLabel: string
        readonly flowLabel: string
        readonly principle: string
        readonly principleBody: string
        readonly primaryAction: string
        readonly secondaryAction: string
        readonly steps: ReadonlyArray<PublicFlowStep>
        readonly visuals: ReadonlyArray<HomeRoleVisualCopy>
    }
    readonly hrefs: { readonly primary: string; readonly responsibility: string }
}

/** A semantic path whose separators are real product icons, never text glyphs. */
export const InlineRoute = ({ parts, joiner }: InlineRouteProps) => (
    <span className={CLASS_NAMES.inlineRoute} aria-label={parts.join(joiner)}>
        {parts.map((part, index) => (
            <span key={part}>
                {index > 0 ? (
                    <span aria-hidden="true">
                        <NivoIcon props={NEXT_CHIP_ICON_PROPS} />
                    </span>
                ) : null}
                <span>{part}</span>
            </span>
        ))}
    </span>
)

/** Render the homepage promise and hero artwork. */
export const HomeHero = ({ copy, hrefs }: HomeHeroProps) => (
        <section className={CLASS_NAMES.hero.section} aria-labelledby="home-hero-title">
            <PageContainer className={CLASS_NAMES.hero.container}>
                <HomeMotionHeroReveal>
                    <Text as="p" size="xs" tone="accent" weight="semibold">
                        {copy.eyebrow}
                    </Text>
                    <Heading level={1} scale="display">
                        <span id="home-hero-title">
                            {copy.titlePrefix}{" "}
                            <span className={CLASS_NAMES.hero.titleAccent}>{copy.titleAccent}</span>
                        </span>
                    </Heading>
                    <Text as="p" size="sm" weight="semibold">
                        {copy.descriptor}
                    </Text>
                    <Text as="p" size="md" tone="muted">
                        {copy.supporting}
                    </Text>
                    <Text as="p" size="sm" weight="semibold">
                        {copy.philosophy}
                    </Text>
                    <div className={CLASS_NAMES.hero.actions}>
                        <Button
                            href={hrefs.primary}
                            variant="primary"
                            size="lg"
                            endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                        >
                            {copy.primary}
                        </Button>
                        <Button
                            href={hrefs.secondary}
                            variant="secondary"
                            size="lg"
                            endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                        >
                            {copy.secondary}
                        </Button>
                    </div>
                </HomeMotionHeroReveal>
                <figure className={CLASS_NAMES.hero.visual}>
                    <HomeMotionHeroParallax distance={26}>
                        <span className={CLASS_NAMES.hero.signal} aria-hidden="true">
                            {copy.signal}
                        </span>
                        <Image
                            className={CLASS_NAMES.hero.mascot}
                            src="/images/nivo-unicorn-responsibility-transparent-v18.png"
                            alt={copy.artworkAlt}
                            width={1254}
                            height={1254}
                            sizes="(max-width: 48rem) 100vw, 56vw"
                            priority
                        />
                    </HomeMotionHeroParallax>
                    <figcaption className={CLASS_NAMES.hero.screenReaderOnly}>
                        {copy.artworkCaption}
                    </figcaption>
                </figure>
            </PageContainer>
        </section>
)

/** Render the responsibility model and the current work story. */
export const HomeRelevance = ({ copy, applicationsHref }: HomeRelevanceProps) => (
        <section className={CLASS_NAMES.relevance.section} aria-labelledby="home-relevance-title">
            <PageContainer>
                <HomeMotionSectionReveal direction="left">
                    <SectionIntro
                        id="home-relevance-title"
                        eyebrow={copy.eyebrow}
                        title={copy.title}
                        description={copy.supporting}
                        inverse
                    />
                </HomeMotionSectionReveal>
                <HomeMotionSectionReveal>
                    <aside className={CLASS_NAMES.relevance.today} aria-labelledby="home-today-title">
                        <div className={CLASS_NAMES.relevance.todayGroup}>
                            <Text as="p" size="xs" weight="semibold">
                                {copy.todayStatus}
                            </Text>
                            <Heading level={3}>
                                <span id="home-today-title">{copy.todayHeadline}</span>
                            </Heading>
                        </div>
                        <div className={CLASS_NAMES.relevance.todayGroup}>
                            <Text as="p" size="xs" weight="semibold">
                                {copy.focusLabel}
                            </Text>
                            <Text as="p" size="metric-lead" weight="semibold">
                                <InlineRoute parts={copy.focus} joiner={copy.joiner} />
                            </Text>
                        </div>
                        <div className={CLASS_NAMES.relevance.todayPrinciple}>
                            <Text as="p" size="sm" weight="semibold">
                                {copy.principle}
                            </Text>
                        </div>
                    </aside>
                </HomeMotionSectionReveal>
                <div className={CLASS_NAMES.relevance.relevanceBody}>
                    <HomeMotionSectionReveal direction="left">
                        <div className={CLASS_NAMES.relevance.example}>
                            <Text as="p" size="xs" weight="semibold">
                                {copy.exampleLabel}
                            </Text>
                            <Heading level={3}>
                                <InlineRoute parts={copy.focus} joiner={copy.joiner} />
                            </Heading>
                            <Text as="p" size="md">
                                {copy.responsibility}
                            </Text>
                            <Button
                                href={applicationsHref}
                                variant="secondary"
                                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                            >
                                {copy.action}
                            </Button>
                        </div>
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal direction="right" delay={0.08}>
                        <ProcessFlow
                            label={copy.flowLabel}
                            steps={copy.steps}
                            emphasisId="responsibility"
                            inverse
                            columns={4}
                        />
                    </HomeMotionSectionReveal>
                </div>
            </PageContainer>
        </section>
)

/** Render operating roles, their work sequence and the responsibility principle. */
export const HomeOperatingModel = ({ copy, hrefs }: HomeOperatingModelProps) => (
        <section className={CLASS_NAMES.operatingModel.section} aria-labelledby="home-operating-model-title">
            <PageContainer>
                <HomeMotionSectionReveal direction="left">
                    <SectionIntro
                        id="home-operating-model-title"
                        eyebrow={copy.eyebrow}
                        title={copy.title}
                        description={copy.supporting}
                    />
                </HomeMotionSectionReveal>
                <HomeMotionSectionReveal direction="left">
                    <div className={CLASS_NAMES.operatingModel.label}>
                        <Text as="p" size="xs" tone="accent" weight="semibold">
                            {copy.rolesLabel}
                        </Text>
                    </div>
                </HomeMotionSectionReveal>
                <div className={CLASS_NAMES.operatingModel.visuals} aria-label={copy.visualsLabel}>
                    {copy.visuals.map((visual, index) => (
                        <HomeMotionRoleCard key={visual.id} index={index}>
                            <div className={CLASS_NAMES.operatingModel.visualMedia}>
                                <Image
                                    className={homeRoleImageClassName(index)}
                                    src={visual.src}
                                    alt=""
                                    width={1254}
                                    height={1254}
                                    sizes="(max-width: 48rem) 82vw, (max-width: 64rem) 42vw, 22vw"
                                />
                            </div>
                            <figcaption className={CLASS_NAMES.operatingModel.visualCaption}>
                                <Text as="p" size="xs" tone="accent" weight="semibold">
                                    {String(index + 1).padStart(2, "0")}
                                </Text>
                                <Heading level={3}>{visual.label}</Heading>
                                <Text as="p" size="sm" tone="muted">
                                    {visual.description}
                                </Text>
                            </figcaption>
                        </HomeMotionRoleCard>
                    ))}
                </div>
                <HomeMotionSectionReveal delay={0.08}>
                    <ProcessFlow
                        label={copy.flowLabel}
                        steps={copy.steps}
                        emphasisId="responsibility"
                        columns={5}
                        centered
                    />
                </HomeMotionSectionReveal>
                <div className={CLASS_NAMES.operatingModel.footer}>
                    <div className={CLASS_NAMES.operatingModel.principle}>
                        <Text as="p" size="metric-lead" weight="semibold">
                            {copy.principle}
                        </Text>
                        <Text as="p" size="sm" tone="muted">
                            {copy.principleBody}
                        </Text>
                    </div>
                    <div className={CLASS_NAMES.operatingModel.actions}>
                        <Button href={hrefs.primary} variant="primary">
                            {copy.primaryAction}
                        </Button>
                        <TextAction
                            href={hrefs.responsibility}
                            appearance="route"
                            endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                        >
                            {copy.secondaryAction}
                        </TextAction>
                    </div>
                </div>
            </PageContainer>
        </section>
)
