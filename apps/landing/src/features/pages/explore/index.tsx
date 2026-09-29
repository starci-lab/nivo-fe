import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { SectionIntro, SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { SITE_LINKS } from "@/modules/landing/site"
import { CLASS_NAMES as C, SECTION_CLASS_NAMES } from "./classNames"

/** The brand mark: a proper name, not a sentence, so it is the same in every language. */
const BRAND_NAME = "NIVO"

/** The stable ids of the public knowledge formats; the `?type=` query and the catalog both use them. */
export const IDEA_TYPE_IDS = ["perspective", "framework", "building"] as const

/** One deliberate public knowledge format from the canonical Ideas contract. */
export type IdeaContentType = (typeof IDEA_TYPE_IDS)[number]

/** The secondary topics an Idea can be explored by. */
const IDEA_TOPIC_IDS = ["aiNativeBusiness", "leadership", "responsibility", "humanAi", "trust", "growth", "knowledge"] as const
type IdeaTopicId = (typeof IDEA_TOPIC_IDS)[number]

/** The canonical owners an Idea can continue to; the catalog labels them under `explore.links`. */
const LINK_HREFS = { nivoOs: SITE_LINKS.nivoOs, sor: SITE_LINKS.responsibility, trust: SITE_LINKS.trust } as const
type LinkId = keyof typeof LINK_HREFS

/** Public view model for an approved knowledge object; its copy lives in `explore.ideas.items.<slug>`. */
export type IdeaArticle = {
    readonly slug: string
    readonly contentType: IdeaContentType
    readonly topics: ReadonlyArray<IdeaTopicId>
    readonly sectionIds: ReadonlyArray<string>
    readonly canonicalReferenceHref: string
    readonly primaryNext: LinkId
    readonly relatedSlugs: ReadonlyArray<string>
}

type ExploreAction = { readonly label: string; readonly href: string }
type HeroProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly primary: ExploreAction
    readonly secondary?: ExploreAction
    readonly modelLabel: string
    readonly modelSteps: ReadonlyArray<string>
    readonly visual?: "trust" | "ecosystem" | "ideas"
}
type SectionProps = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description?: string
    readonly tone?: "default" | "soft" | "dark" | "burgundy"
    readonly children: ReactNode
}
type FlowStep = { readonly title: string; readonly description: string }
type FlowProps = { readonly label: string; readonly steps: ReadonlyArray<FlowStep> }
type NoticeProps = { readonly title: string; readonly children: ReactNode }
type PathGridProps = { readonly label: string; readonly paths: ReadonlyArray<ExploreAction> }

const IDEA_ARTICLES: ReadonlyArray<IdeaArticle> = [
    {
        slug: "responsibility-before-agent",
        contentType: "perspective",
        topics: ["responsibility", "humanAi"],
        sectionIds: ["observation", "thesis", "limit"],
        canonicalReferenceHref: SITE_LINKS.responsibility,
        primaryNext: "sor",
        relatedSlugs: ["context-responsibility-outcome", "earned-autonomy-needs-evidence"],
    },
    {
        slug: "context-responsibility-outcome",
        contentType: "framework",
        topics: ["aiNativeBusiness", "responsibility"],
        sectionIds: ["problem", "model", "limit"],
        canonicalReferenceHref: SITE_LINKS.nivoOs,
        primaryNext: "nivoOs",
        relatedSlugs: ["responsibility-before-agent", "earned-autonomy-needs-evidence"],
    },
    {
        slug: "earned-autonomy-needs-evidence",
        contentType: "building",
        topics: ["trust", "humanAi"],
        sectionIds: ["structured", "notClaimed", "open"],
        canonicalReferenceHref: SITE_LINKS.trust,
        primaryNext: "trust",
        relatedSlugs: ["responsibility-before-agent", "context-responsibility-outcome"],
    },
]

const Hero = (props: HeroProps) => {
    const href = useLocalizedHref()
    return (
        <section id={props.id} className={C.hero} data-visual={props.visual} aria-labelledby={`${props.id}-title`}>
            <PageContainer className={C.heroInner}>
                <div className={C.heroCopy}>
                    <Text as="p" size="xs" tone="accent" weight="semibold">{props.eyebrow}</Text>
                    <Heading level={1} scale="display"><span id={`${props.id}-title`}>{props.title}</span></Heading>
                    <Text as="p" size="md" tone="muted">{props.description}</Text>
                    <div className={C.actionRow}>
                        <Button href={href(props.primary.href)} variant="primary" size="lg" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{props.primary.label}</Button>
                        {props.secondary === undefined ? null : <Button href={href(props.secondary.href)} variant="secondary" size="lg" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{props.secondary.label}</Button>}
                    </div>
                </div>
                <div className={C.heroModel} aria-label={props.modelLabel}>
                    <div className={C.heroModelTop}><span className={C.heroModelPulse} aria-hidden="true" /><Text as="span" size="xs" weight="semibold">{props.modelLabel}</Text></div>
                    <ol className={C.heroModelList}>
                        {props.modelSteps.map((step, index) => <li key={step}>
                            <span className={C.heroModelIndex}>{String(index + 1).padStart(2, "0")}</span>
                            <span className={C.heroModelIcon} aria-hidden="true"><NivoIcon props={{ name: index === props.modelSteps.length - 1 ? "complete" : index === 0 ? "search" : "code", usage: "heading" }} /></span>
                            <strong>{step}</strong>
                            {index < props.modelSteps.length - 1 ? <span className={C.heroModelNext} aria-hidden="true"><NivoIcon props={{ name: "next", usage: "chip" }} /></span> : null}
                        </li>)}
                    </ol>
                </div>
            </PageContainer>
        </section>
    )
}

const Section = (props: SectionProps) => {
    const inverse = props.tone === "dark" || props.tone === "burgundy"
    return <section id={props.id} className={SECTION_CLASS_NAMES[props.tone ?? "default"]} aria-labelledby={`${props.id}-title`}><PageContainer className={C.sectionInner}><SectionIntro id={`${props.id}-title`} eyebrow={props.eyebrow} title={props.title} description={props.description} inverse={inverse} />{props.children}</PageContainer></section>
}

const Flow = (props: FlowProps) => <ol className={C.flow} aria-label={props.label}>{props.steps.map((step, index) => <li key={step.title}><span className={C.flowIndex}>{String(index + 1).padStart(2, "0")}</span><span className={C.flowTitle}>{step.title}</span><span className={C.flowBody}>{step.description}</span></li>)}</ol>
const Notice = (props: NoticeProps) => <aside className={C.truthNotice}><strong>{props.title}</strong><Text as="p" size="sm" tone="muted">{props.children}</Text></aside>
const PathGrid = (props: PathGridProps) => {
    const href = useLocalizedHref()
    return <nav className={C.pathGrid} aria-label={props.label}>{props.paths.map((path, index) => <div className={C.card} key={path.href}><span className={C.pathIndex}>{String(index + 1).padStart(2, "0")}</span><TextAction href={href(path.href)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{path.label}</TextAction></div>)}</nav>
}

const TRUST_HERO_STEP_IDS = ["oneResponsibility", "verifiedOutcome", "trust"] as const
const TRUST_CONTRACT_IDS = ["outcome", "accountability", "boundary", "permission", "evidence", "exception"] as const
const TRUST_START_STEP_IDS = ["oneResponsibility", "controlledExecution", "verifiedOutcome"] as const
const TRUST_PILLAR_IDS = ["minimumContext", "controlledAccess", "explicitPermission", "traceability", "humanOversight", "recovery"] as const
const TRUST_LOOP_STEP_IDS = ["responsibility", "execution", "outcomeObserved", "evidence", "verification", "verifiedOutcome", "trust", "permission", "moreResponsibility"] as const
const TRUST_SEQUENCE_IDS = ["verifiedOutcomes", "evidence", "trust", "morePermission"] as const
const TRUST_JOURNEY_STEP_IDS = ["humanDependent", "systemized", "governed", "reliable", "aiNative"] as const
const TRUST_HORIZON_IDS = ["nearTerm", "validation", "longTerm", "conditional"] as const
const TRUST_TERM_IDS = ["current", "verified", "experimental", "target", "longTerm"] as const

/** Canonical `/trust` page owner. */
export const TrustPage = () => {
    const trust = useTranslations("explore.trust")
    const links = useTranslations("explore.links")
    return <SiteMain><div className={C.page} data-page="trust">
        <Hero id="future-worth-earning" eyebrow={trust("hero.eyebrow")} title={trust("hero.title")} description={trust("hero.body")} primary={{ label: trust("hero.primary"), href: "#trust-starts-small" }} modelLabel={trust("hero.modelLabel")} modelSteps={TRUST_HERO_STEP_IDS.map((id) => trust(`hero.steps.${id}`))} visual="trust" />
        <Section id="trust-starts-small" eyebrow={trust("start.eyebrow")} title={trust("start.title")} description={trust("start.description")} tone="soft"><div className={C.contractGrid}>{TRUST_CONTRACT_IDS.map((id) => <article className={C.card} key={id}><Text as="p" size="xs" tone="accent" weight="semibold">{trust(`start.contract.${id}.term`)}</Text><Text as="p" size="sm">{trust(`start.contract.${id}.body`)}</Text></article>)}</div><Flow label={trust("start.flowLabel")} steps={TRUST_START_STEP_IDS.map((id) => ({ title: trust(`start.steps.${id}.title`), description: trust(`start.steps.${id}.description`) }))} /></Section>
        <Section id="human-ai-governance" eyebrow={trust("governance.eyebrow")} title={trust("governance.title")} description={trust("governance.description")}><div className={C.sectionSplit}><blockquote className={C.quote}>{trust("governance.quote")}</blockquote><div className={C.contractGrid}>{TRUST_PILLAR_IDS.map((id) => <article className={C.card} key={id}><Heading level={3}>{trust(`governance.pillars.${id}`)}</Heading></article>)}</div></div><Notice title={trust("governance.noticeTitle")}>{trust("governance.noticeBody")}</Notice></Section>
        <Section id="evidence-before-scale" eyebrow={trust("evidence.eyebrow")} title={trust("evidence.title")} description={trust("evidence.description")} tone="burgundy"><Flow label={trust("evidence.loopLabel")} steps={TRUST_LOOP_STEP_IDS.map((id) => ({ title: trust(`evidence.steps.${id}`), description: trust("evidence.stepDescription") }))} /><div className={C.signaturePanel}><span className={C.signatureIcon} aria-hidden="true"><NivoIcon props={{ name: "complete", usage: "heading" }} /></span><strong>{trust("evidence.signatureTitle")}</strong><div className={C.inlineSequence} aria-label={trust("evidence.sequenceLabel")}>{TRUST_SEQUENCE_IDS.map((id, index) => <span key={id}>{trust(`evidence.sequence.${id}`)}{index < TRUST_SEQUENCE_IDS.length - 1 ? <NivoIcon props={{ name: "next", usage: "chip" }} /> : null}</span>)}</div></div></Section>
        <Section id="transformation-journey" eyebrow={trust("journey.eyebrow")} title={trust("journey.title")} description={trust("journey.description")}><Flow label={trust("journey.flowLabel")} steps={TRUST_JOURNEY_STEP_IDS.map((id) => ({ title: trust(`journey.steps.${id}`), description: trust("journey.stepDescription") }))} /></Section>
        <Section id="what-becomes-possible" eyebrow={trust("possible.eyebrow")} title={trust("possible.title")} description={trust("possible.description")} tone="soft"><div className={C.valueGrid}>{TRUST_HORIZON_IDS.map((id) => <article className={C.card} key={id}><Badge tone="neutral">{trust(`possible.horizons.${id}.state`)}</Badge><Heading level={3}>{trust(`possible.horizons.${id}.title`)}</Heading></article>)}</div><Notice title={trust("possible.noticeTitle")}>{trust("possible.noticeBody")}</Notice></Section>
        <Section id="truth-before-promise" eyebrow={trust("truth.eyebrow")} title={trust("truth.title")} description={trust("truth.description")} tone="dark"><div className={C.definitionGrid}>{TRUST_TERM_IDS.map((id) => <article className={C.card} key={id}><Heading level={3}>{trust(`truth.terms.${id}.term`)}</Heading><Text as="p" size="sm">{trust(`truth.terms.${id}.meaning`)}</Text></article>)}</div><PathGrid label={trust("truth.pathsLabel")} paths={[{ label: links("nivoOs"), href: SITE_LINKS.nivoOs }, { label: links("contactTrust"), href: `${SITE_LINKS.contact}?intent=product` }, { label: links("sor"), href: SITE_LINKS.responsibility }]} /></Section>
    </div></SiteMain>
}

const ACTORS = [
    { id: "customers", href: SITE_LINKS.applications, future: false },
    { id: "partners", href: `${SITE_LINKS.contact}?intent=partnership`, future: false },
    { id: "institutions", href: `${SITE_LINKS.contact}?intent=institution`, future: false },
    { id: "futureBuilders", href: SITE_LINKS.nivoOs, future: true },
] as const
const ACTOR_FIELDS = ["contribution", "value", "outcome", "status"] as const
const ECOSYSTEM_HERO_STEP_IDS = ["contribution", "scopedCollaboration", "evidence", "reusableCapacity"] as const
const ECOSYSTEM_VALUE_STEP_IDS = ["realContext", "domainExpertise", "implementationCapacity", "institutionalContext", "scopedCollaboration", "evidence", "reusableCapacity"] as const
const ECOSYSTEM_GROWTH_STEP_IDS = ["interest", "fit", "context", "scopedCollaboration", "evidence", "deeperRelationship"] as const

/** Canonical `/ecosystem` page owner with exactly four actor groups. */
export const EcosystemPage = () => {
    const ecosystem = useTranslations("explore.ecosystem")
    const links = useTranslations("explore.links")
    const href = useLocalizedHref()
    return <SiteMain><div className={C.page} data-page="ecosystem">
        <Hero id="why-ecosystem" eyebrow={ecosystem("hero.eyebrow")} title={ecosystem("hero.title")} description={ecosystem("hero.body")} primary={{ label: ecosystem("hero.primary"), href: "#value-exchange" }} secondary={{ label: links("nivoOs"), href: SITE_LINKS.nivoOs }} modelLabel={ecosystem("hero.modelLabel")} modelSteps={ECOSYSTEM_HERO_STEP_IDS.map((id) => ecosystem(`hero.steps.${id}`))} visual="ecosystem" />
        <Section id="value-exchange" eyebrow={ecosystem("value.eyebrow")} title={ecosystem("value.title")} description={ecosystem("value.description")} tone="burgundy"><Flow label={ecosystem("value.flowLabel")} steps={ECOSYSTEM_VALUE_STEP_IDS.map((id) => ({ title: ecosystem(`value.steps.${id}`), description: ecosystem("value.stepDescription") }))} /><Notice title={ecosystem("value.noticeTitle")}>{ecosystem("value.noticeBody")}</Notice></Section>
        <Section id="actors" eyebrow={ecosystem("actors.eyebrow")} title={ecosystem("actors.title")} description={ecosystem("actors.description")}><div className={C.actorGrid} role="list" aria-label={ecosystem("actors.listLabel")}>{ACTORS.map((actor, index) => <article className={C.actor} data-future={actor.future ? "true" : undefined} role="listitem" key={actor.id}><span className={C.actorIndex}>{String(index + 1).padStart(2, "0")}</span><Badge tone={actor.future ? "accent" : "neutral"}>{actor.future ? ecosystem("actors.badgeFuture") : ecosystem("actors.badgeCurrent")}</Badge><Heading level={3}>{ecosystem(`actors.items.${actor.id}.name`)}</Heading><Text as="p" size="sm" weight="semibold">{ecosystem(`actors.items.${actor.id}.role`)}</Text><dl>{ACTOR_FIELDS.map((field) => <div key={field}><dt>{ecosystem(`actors.labels.${field}`)}</dt><dd>{ecosystem(`actors.items.${actor.id}.${field}`)}</dd></div>)}</dl><TextAction href={href(actor.href)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{ecosystem(`actors.items.${actor.id}.action`)}</TextAction></article>)}</div></Section>
        <Section id="relationship-growth" eyebrow={ecosystem("growth.eyebrow")} title={ecosystem("growth.title")} description={ecosystem("growth.description")} tone="soft"><Flow label={ecosystem("growth.flowLabel")} steps={ECOSYSTEM_GROWTH_STEP_IDS.map((id) => ({ title: ecosystem(`growth.steps.${id}`), description: ecosystem("growth.stepDescription") }))} /><TextAction href={href(SITE_LINKS.trust)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{links("trust")}</TextAction></Section>
        <Section id="ecosystem-proof" eyebrow={ecosystem("proof.eyebrow")} title={ecosystem("proof.title")}><Notice title={ecosystem("proof.noticeTitle")}>{ecosystem("proof.noticeBody")}</Notice></Section>
        <Section id="choose-path" eyebrow={ecosystem("path.eyebrow")} title={ecosystem("path.title")} description={ecosystem("path.description")} tone="dark"><PathGrid label={ecosystem("path.label")} paths={ACTORS.map((actor) => ({ label: ecosystem("path.route", { name: ecosystem(`actors.items.${actor.id}.name`), action: ecosystem(`actors.items.${actor.id}.action`) }), href: actor.href }))} /></Section>
    </div></SiteMain>
}

const IDEAS_HERO_STEP_IDS = ["discover", "understand", "connect"] as const
const IDEAS_CONTINUE_PATHS = [["nivoOs", SITE_LINKS.nivoOs], ["sor", SITE_LINKS.responsibility], ["applications", SITE_LINKS.applications], ["trust", SITE_LINKS.trust], ["company", SITE_LINKS.company]] as const

/** Props for the Ideas discovery page owner. */
export type IdeasPageProps = { readonly selectedType?: IdeaContentType | null }
/** Canonical `/ideas` knowledge discovery owner. */
export const IdeasPage = (props: IdeasPageProps) => {
    const ideas = useTranslations("explore.ideas")
    const links = useTranslations("explore.links")
    const href = useLocalizedHref()
    const visible = props.selectedType === null || props.selectedType === undefined ? IDEA_ARTICLES : IDEA_ARTICLES.filter(({ contentType }) => contentType === props.selectedType)
    const [featured, ...supporting] = visible
    return <SiteMain><div className={C.page} data-page="ideas">
        <Hero id="knowledge-identity" eyebrow={ideas("hero.eyebrow")} title={ideas("hero.title")} description={ideas("hero.body")} primary={{ label: ideas("hero.primary"), href: "#featured" }} secondary={{ label: links("nivoOs"), href: SITE_LINKS.nivoOs }} modelLabel={ideas("hero.modelLabel")} modelSteps={IDEAS_HERO_STEP_IDS.map((id) => ideas(`hero.steps.${id}`))} visual="ideas" />
        <Section id="featured" eyebrow={ideas("featured.eyebrow")} title={ideas("featured.title")} description={ideas("featured.description")} tone="soft">{featured === undefined ? <Notice title={ideas("featured.emptyTitle")}>{ideas("featured.emptyBody")}</Notice> : <div className={C.ideaGrid}><article className={C.ideaCardFeatured}><span className={C.editorialMark}>{BRAND_NAME} / 01</span><Badge tone="accent">{ideas(`byType.types.${featured.contentType}.label`)}</Badge><Heading level={3}>{ideas(`items.${featured.slug}.title`)}</Heading><Text as="p" size="md">{ideas(`items.${featured.slug}.thesis`)}</Text><TextAction href={href(`${SITE_LINKS.ideas}/${featured.slug}`)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{ideas("featured.read")}</TextAction></article>{supporting.map((idea, index) => <article className={C.ideaCard} key={idea.slug}><span className={C.editorialMark}>0{index + 2}</span><Badge tone="neutral">{ideas(`byType.types.${idea.contentType}.label`)}</Badge><Heading level={3}>{ideas(`items.${idea.slug}.title`)}</Heading><Text as="p" size="sm">{ideas(`items.${idea.slug}.thesis`)}</Text><TextAction href={href(`${SITE_LINKS.ideas}/${idea.slug}`)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{ideas("featured.read")}</TextAction></article>)}</div>}</Section>
        <Section id="by-type" eyebrow={ideas("byType.eyebrow")} title={ideas("byType.title")} description={ideas("byType.description")}><nav className={C.typeGrid} aria-label={ideas("byType.label")}>{IDEA_TYPE_IDS.map((id, index) => <article className={C.card} key={id}><span className={C.pathIndex}>0{index + 1}</span><Text as="p" size="xs" tone="accent">{ideas(`byType.types.${id}.role`)}</Text><Heading level={3}>{ideas(`byType.types.${id}.label`)}</Heading><TextAction href={href(`${SITE_LINKS.ideas}?type=${id}#featured`)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{ideas("byType.explore")}</TextAction></article>)}</nav></Section>
        <Section id="curated" eyebrow={ideas("curated.eyebrow")} title={ideas("curated.title")} description={ideas("curated.description")} tone="burgundy"><PathGrid label={ideas("curated.label")} paths={IDEA_ARTICLES.map((idea) => ({ label: ideas(`items.${idea.slug}.title`), href: `${SITE_LINKS.ideas}/${idea.slug}` }))} /></Section>
        <Section id="by-topic" eyebrow={ideas("byTopic.eyebrow")} title={ideas("byTopic.title")} description={ideas("byTopic.description")}><ul className={C.topicList}>{IDEA_TOPIC_IDS.map((id) => <li key={id}><span>{ideas(`byTopic.topics.${id}`)}</span></li>)}</ul></Section>
        <Section id="continue-learning" eyebrow={ideas("continue.eyebrow")} title={ideas("continue.title")} description={ideas("continue.description")} tone="dark"><PathGrid label={ideas("continue.label")} paths={IDEAS_CONTINUE_PATHS.map(([id, path]) => ({ label: ideas(`continue.paths.${id}`), href: path }))} /></Section>
    </div></SiteMain>
}

/** Props for one canonical Idea detail page owner. */
export type IdeaDetailPageProps = { readonly idea: IdeaArticle }
/** Article owner keeping direct thesis, authority, truth and continuation explicit. */
export const IdeaDetailPage = (props: IdeaDetailPageProps) => {
    const ideas = useTranslations("explore.ideas")
    const detail = useTranslations("explore.ideaDetail")
    const links = useTranslations("explore.links")
    const href = useLocalizedHref()
    const { idea } = props
    const related = idea.relatedSlugs.map((slug) => IDEA_ARTICLES.find((item) => item.slug === slug)).filter((item): item is IdeaArticle => item !== undefined).slice(0, 3)
    return <SiteMain><article className={C.page} data-page="idea-detail"><header className={C.articleHero}><PageContainer><div className={C.articleHeader}><Badge tone="accent">{ideas(`byType.types.${idea.contentType}.label`)}</Badge><Heading level={1} scale="display">{ideas(`items.${idea.slug}.title`)}</Heading><p className={C.articleThesis}>{ideas(`items.${idea.slug}.thesis`)}</p><dl className={C.articleMeta}><div><dt>{detail("labels.author")}</dt><dd>{detail("author")}</dd></div><div><dt>{detail("labels.publisher")}</dt><dd>{detail("publisher")}</dd></div><div><dt>{detail("labels.lifecycle")}</dt><dd>{detail("lifecyclePublished")}</dd></div><div><dt>{detail("labels.source")}</dt><dd>{detail("sourceVersion")}</dd></div></dl><Text as="p" size="sm" tone="muted">{detail("dateNote")}</Text></div></PageContainer></header><Section id="idea-body" eyebrow={detail("body.eyebrow")} title={detail("body.title")}><div className={C.articleBody}>{idea.sectionIds.map((sectionId, index) => <section className={C.articleSection} aria-labelledby={`idea-section-${index}`} key={sectionId}><span className={C.articleSectionIndex}>{String(index + 1).padStart(2, "0")}</span><Heading level={2}><span id={`idea-section-${index}`}>{ideas(`items.${idea.slug}.sections.${sectionId}.title`)}</span></Heading><Text as="p" size="md">{ideas(`items.${idea.slug}.sections.${sectionId}.body`)}</Text></section>)}</div></Section><Section id="idea-truth-context" eyebrow={detail("truth.eyebrow")} title={detail("truth.title")} tone="soft"><Notice title={detail("truth.noticeTitle")}>{ideas(`items.${idea.slug}.truthContext`)}</Notice><div className={C.card}><Text as="p" size="xs" tone="accent">{detail("truth.canonicalReference")}</Text><TextAction href={href(idea.canonicalReferenceHref)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{ideas(`items.${idea.slug}.canonicalReference`)}</TextAction></div></Section><Section id="idea-next-path" eyebrow={detail("next.eyebrow")} title={detail("next.title")} tone="burgundy"><PathGrid label={detail("next.label")} paths={[{ label: links(idea.primaryNext), href: LINK_HREFS[idea.primaryNext] }]} /><nav className={C.ideaGrid} aria-label={detail("next.relatedLabel")}>{related.map((item) => <article className={C.ideaCard} key={item.slug}><Badge tone="neutral">{ideas(`byType.types.${item.contentType}.label`)}</Badge><Heading level={3}>{ideas(`items.${item.slug}.title`)}</Heading><TextAction href={href(`${SITE_LINKS.ideas}/${item.slug}`)} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}>{detail("next.read")}</TextAction></article>)}</nav></Section></article></SiteMain>
}

/** Returns a public Idea by its stable route slug. */
export const getIdeaBySlug = (slug: string) => IDEA_ARTICLES.find((idea) => idea.slug === slug)

/** Static route identities for the approved public Idea objects. */
export const IDEA_SLUGS = IDEA_ARTICLES.map(({ slug }) => ({ slug }))

/** Resolves a public Ideas query to a stable type id without changing truth state or lifecycle. */
export const normalizeIdeaType = (value: string | ReadonlyArray<string> | undefined): IdeaContentType | null => {
    const candidate = Array.isArray(value) ? value[0] : value
    return IDEA_TYPE_IDS.find((id) => id === candidate) ?? null
}
