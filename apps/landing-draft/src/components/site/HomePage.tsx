import Image from "next/image"
import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { HOMEPAGE_COPY, HOMEPAGE_NEXT_PATHS, HOMEPAGE_STRUCTURED_DATA } from "@/resources/homepage"
import { SITE_LINKS } from "@/resources/site"
import { SITE_CLASS_NAMES } from "./classNames"
import { ProcessFlow } from "./ProcessFlow"
import { SectionIntro } from "./SectionIntro"
import { SiteMain } from "./SiteMain"
import { HomeMotionHeroParallax, HomeMotionHeroReveal, HomeMotionRoleCard, HomeMotionSectionReveal } from "./HomeMotion"

const COMMERCIAL_ROUTE_ICONS = ["search", "code", "complete"] as const

type InlineRouteProps = { readonly parts: readonly string[] }

/** A semantic path whose separators are real product icons, never text glyphs. */
const InlineRoute = ({ parts }: InlineRouteProps) => (
    <span className={SITE_CLASS_NAMES.inlineRoute} aria-label={parts.join(" then ")}>
        {parts.map((part, index) => (
            <span key={part}>
                {index > 0 ? <span aria-hidden="true"><NivoIcon props={{ name: "next", usage: "chip" }} /></span> : null}
                <span>{part}</span>
            </span>
        ))}
    </span>
)

/** The Homepage has no caller-owned visual or behavioral inputs. */
export type HomePageProps = Record<never, never>

/** The canonical Homepage gateway assembled from shared public-site contracts. */
export const HomePage = (props: HomePageProps) => {
    void props
    const { hero, today, relevance, operatingModel, commercial, trust, ideas } = HOMEPAGE_COPY

    return (
        <SiteMain>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: HOMEPAGE_STRUCTURED_DATA }} />

            <section className={SITE_CLASS_NAMES.hero} aria-labelledby="home-hero-title">
                <PageContainer className={SITE_CLASS_NAMES.heroContainer}>
                    <HomeMotionHeroReveal>
                        <Text as="p" size="xs" tone="accent" weight="semibold">{hero.eyebrow}</Text>
                        <Heading level={1} scale="display">
                            <span id="home-hero-title">{hero.titlePrefix} <span className={SITE_CLASS_NAMES.textAccent}>{hero.titleAccent}</span></span>
                        </Heading>
                        <Text as="p" size="sm" weight="semibold">{hero.descriptor}</Text>
                        <Text as="p" size="md" tone="muted">{hero.supporting}</Text>
                        <Text as="p" size="sm" weight="semibold">{hero.philosophy}</Text>
                        <div className={SITE_CLASS_NAMES.actionRow}>
                            <Button href={hero.primary.href} variant="primary" size="lg" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>
                                {hero.primary.label}
                            </Button>
                            <Button href={hero.secondary.href} variant="secondary" size="lg" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>
                                {hero.secondary.label}
                            </Button>
                        </div>
                    </HomeMotionHeroReveal>

                    <figure className={SITE_CLASS_NAMES.heroVisual}>
                        <HomeMotionHeroParallax distance={26}>
                            <span className={SITE_CLASS_NAMES.heroSignal} aria-hidden="true">Human + AI</span>
                            <Image
                                className={SITE_CLASS_NAMES.heroMascot}
                                src="/images/nivo-unicorn-responsibility-transparent-v18.png"
                                alt={hero.artworkAlt}
                                width={1254}
                                height={1254}
                                sizes="(max-width: 48rem) 100vw, 56vw"
                                priority
                            />
                        </HomeMotionHeroParallax>
                        <figcaption className={SITE_CLASS_NAMES.screenReaderOnly}>{hero.artworkCaption}</figcaption>
                    </figure>
                </PageContainer>
            </section>

            <section className={SITE_CLASS_NAMES.relevance} aria-labelledby="home-relevance-title">
                <PageContainer>
                    <HomeMotionSectionReveal direction="left">
                        <SectionIntro
                            id="home-relevance-title"
                            eyebrow={relevance.eyebrow}
                            title={relevance.title}
                            description={relevance.supporting}
                            inverse
                        />
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal>
                        <aside className={SITE_CLASS_NAMES.today} aria-labelledby="home-today-title">
                            <div className={SITE_CLASS_NAMES.todayIdentity}>
                                <Text as="p" size="xs" weight="semibold">{today.status}</Text>
                                <Heading level={3}><span id="home-today-title">{today.headline}</span></Heading>
                            </div>
                            <div className={SITE_CLASS_NAMES.todayFocus}>
                                <Text as="p" size="xs" weight="semibold">{today.focusLabel}</Text>
                                <Text as="p" size="metric-lead" weight="semibold"><InlineRoute parts={today.focus} /></Text>
                            </div>
                            <div className={SITE_CLASS_NAMES.todayPrinciple}>
                                <Text as="p" size="sm" weight="semibold">{today.principle}</Text>
                            </div>
                        </aside>
                    </HomeMotionSectionReveal>
                    <div className={SITE_CLASS_NAMES.relevanceBody}>
                        <HomeMotionSectionReveal direction="left">
                            <div className={SITE_CLASS_NAMES.relevanceExample}>
                                <Text as="p" size="xs" weight="semibold">{relevance.exampleLabel}</Text>
                                <Heading level={3}><InlineRoute parts={relevance.example} /></Heading>
                                <Text as="p" size="md">{relevance.responsibility}</Text>
                                <Button href={SITE_LINKS.applications} variant="secondary" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>
                                    {relevance.action}
                                </Button>
                            </div>
                        </HomeMotionSectionReveal>
                        <HomeMotionSectionReveal direction="right" delay={0.08}>
                            <ProcessFlow label={relevance.flowLabel} steps={relevance.steps} emphasisId="responsibility" inverse />
                        </HomeMotionSectionReveal>
                    </div>
                </PageContainer>
            </section>

            <section className={SITE_CLASS_NAMES.operatingModel} aria-labelledby="home-operating-model-title">
                <PageContainer>
                    <HomeMotionSectionReveal direction="left">
                        <SectionIntro
                            id="home-operating-model-title"
                            eyebrow={operatingModel.eyebrow}
                            title={operatingModel.title}
                            description={operatingModel.supporting}
                        />
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal direction="left">
                        <div className={SITE_CLASS_NAMES.operatingModelLabel}>
                            <Text as="p" size="xs" tone="accent" weight="semibold">{operatingModel.rolesLabel}</Text>
                        </div>
                    </HomeMotionSectionReveal>
                    <div className={SITE_CLASS_NAMES.operatingModelVisuals} aria-label="Human leads. AI operates. System learns. Verified outcome.">
                        {operatingModel.roleVisuals.map((visual, index) => (
                            <HomeMotionRoleCard key={visual.label} index={index}>
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
                                    <Text as="p" size="xs" tone="accent" weight="semibold">{String(index + 1).padStart(2, "0")}</Text>
                                    <Heading level={3}>{visual.label}</Heading>
                                    <Text as="p" size="sm" tone="muted">{visual.description}</Text>
                                </figcaption>
                            </HomeMotionRoleCard>
                        ))}
                    </div>
                    <HomeMotionSectionReveal delay={0.08}>
                        <ProcessFlow
                            label={operatingModel.flowLabel}
                            steps={operatingModel.steps}
                            emphasisId="responsibility"
                        />
                    </HomeMotionSectionReveal>
                    <div className={SITE_CLASS_NAMES.operatingModelFooter}>
                        <div className={SITE_CLASS_NAMES.operatingModelPrinciple}>
                            <Text as="p" size="metric-lead" weight="semibold">{operatingModel.principle}</Text>
                            <Text as="p" size="sm" tone="muted">{operatingModel.principleBody}</Text>
                        </div>
                        <div className={SITE_CLASS_NAMES.actionRow}>
                            <Button href={SITE_LINKS.nivoOs} variant="primary">{operatingModel.primaryAction}</Button>
                            <TextAction href={SITE_LINKS.responsibility} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{operatingModel.secondaryAction}</TextAction>
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
                                eyebrow={commercial.eyebrow}
                                title={commercial.title}
                                description={commercial.supporting}
                            />
                            <div className={SITE_CLASS_NAMES.actionRow}>
                                <Button href={SITE_LINKS.pricing} variant="primary" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{commercial.primaryAction}</Button>
                                <TextAction href={`${SITE_LINKS.contact}?intent=product`} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{commercial.assistedAction}</TextAction>
                            </div>
                        </div>
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal direction="right" delay={0.08}>
                        <div className={SITE_CLASS_NAMES.commercialRoute} aria-label={commercial.routeLabel}>
                            {commercial.route.map((step, index) => (
                                <div className={SITE_CLASS_NAMES.commercialRouteStep} key={step}>
                                    <span className={SITE_CLASS_NAMES.commercialRouteIndex}>{String(index + 1).padStart(2, "0")}</span>
                                    <span className={SITE_CLASS_NAMES.commercialRouteMarker} aria-hidden="true">
                                        <NivoIcon props={{ name: COMMERCIAL_ROUTE_ICONS[index]!, usage: "heading" }} />
                                    </span>
                                    <strong className={SITE_CLASS_NAMES.commercialRouteCopy}>{step}</strong>
                                    {index < commercial.route.length - 1 ? (
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
                                eyebrow={trust.eyebrow}
                                title={<InlineRoute parts={trust.title} />}
                                description={trust.supporting}
                                inverse
                            />
                            <div className={SITE_CLASS_NAMES.trustLinks}>
                                <TextAction href={SITE_LINKS.trust} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{trust.trustAction}</TextAction>
                                <TextAction href={SITE_LINKS.ecosystem} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{trust.ecosystemAction}</TextAction>
                            </div>
                        </div>
                    </HomeMotionSectionReveal>
                    <HomeMotionSectionReveal direction="right" delay={0.08}>
                        <aside className={SITE_CLASS_NAMES.trustFuture} aria-label={trust.futureLabel}>
                            <Text as="p" size="xs" weight="semibold">{trust.futureLabel}</Text>
                            <Heading level={3}>{trust.futureTitle}</Heading>
                            <Text as="p" size="sm">{trust.futureBody}</Text>
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
                                eyebrow={ideas.eyebrow}
                                title={ideas.title}
                                description={ideas.supporting}
                                action={<TextAction href={SITE_LINKS.ideas} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{ideas.action}</TextAction>}
                            />
                        </div>
                    </HomeMotionSectionReveal>
                    <div className={SITE_CLASS_NAMES.nextPathRoutes} aria-label={HOMEPAGE_COPY.nextPathLabel}>
                        {HOMEPAGE_NEXT_PATHS.map((path, pathIndex) => (
                            <section aria-labelledby={`next-path-${pathIndex}`} key={path.title}>
                                <Text as="p" id={`next-path-${pathIndex}`} size="xs" weight="semibold">{path.title}</Text>
                                <ul>
                                    {path.links.map((link) => (
                                        <li key={link.href}>
                                            <TextAction href={link.href} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{link.label}</TextAction>
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
