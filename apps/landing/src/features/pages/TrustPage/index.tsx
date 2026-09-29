import { Badge, Heading, Text } from "@starci/grammar/common"
import { useTranslations } from "next-intl"
import ExploreCard from "@/components/blocks/explore/ExploreCard"
import ExploreFlow from "@/components/blocks/explore/ExploreFlow"
import ExploreGrid from "@/components/blocks/explore/ExploreGrid"
import ExploreHero from "@/components/blocks/explore/ExploreHero"
import ExploreNotice from "@/components/blocks/explore/ExploreNotice"
import ExplorePathGrid from "@/components/blocks/explore/ExplorePathGrid"
import ExploreQuote from "@/components/blocks/explore/ExploreQuote"
import ExploreSection from "@/components/blocks/explore/ExploreSection"
import ExploreSplit from "@/components/blocks/explore/ExploreSplit"
import ExploreSignature from "@/components/blocks/explore/ExploreSignature"
import ExploreSurface from "@/components/blocks/explore/ExploreSurface"
import { SiteMain } from "@/features/layouts/SiteShell"
import { SITE_LINKS } from "@/modules/landing/site"

const HERO_STEP_IDS = ["oneResponsibility", "verifiedOutcome", "trust"] as const
const CONTRACT_IDS = ["outcome", "accountability", "boundary", "permission", "evidence", "exception"] as const
const START_STEP_IDS = ["oneResponsibility", "controlledExecution", "verifiedOutcome"] as const
const PILLAR_IDS = ["minimumContext", "controlledAccess", "explicitPermission", "traceability", "humanOversight", "recovery"] as const
const LOOP_STEP_IDS = [
    "responsibility",
    "execution",
    "outcomeObserved",
    "evidence",
    "verification",
    "verifiedOutcome",
    "trust",
    "permission",
    "moreResponsibility",
] as const
const SEQUENCE_IDS = ["verifiedOutcomes", "evidence", "trust", "morePermission"] as const
const JOURNEY_STEP_IDS = ["humanDependent", "systemized", "governed", "reliable", "aiNative"] as const
const HORIZON_IDS = ["nearTerm", "validation", "longTerm", "conditional"] as const
const TERM_IDS = ["current", "verified", "experimental", "target", "longTerm"] as const

/** Public Trust page with a measured progression from responsibility to earned autonomy. */
const TrustPage = () => {
    const trust = useTranslations("explore.trust")
    const links = useTranslations("explore.links")
    return (
        <SiteMain>
            <ExploreSurface page="trust">
                <ExploreHero
                    id="future-worth-earning"
                    eyebrow={trust("hero.eyebrow")}
                    title={trust("hero.title")}
                    description={trust("hero.body")}
                    primary={{ label: trust("hero.primary"), href: "#trust-starts-small" }}
                    modelLabel={trust("hero.modelLabel")}
                    modelSteps={HERO_STEP_IDS.map((id) => trust(`hero.steps.${id}`))}
                    visual="trust"
                />
                <ExploreSection
                    id="trust-starts-small"
                    eyebrow={trust("start.eyebrow")}
                    title={trust("start.title")}
                    description={trust("start.description")}
                    tone="soft"
                >
                    <ExploreGrid>
                        {CONTRACT_IDS.map((id, index) => (
                            <ExploreCard staggered={index === 1 || index === 4} key={id}>
                                <Text as="p" size="xs" tone="accent" weight="semibold">
                                    {trust(`start.contract.${id}.term`)}
                                </Text>
                                <Text as="p" size="sm">
                                    {trust(`start.contract.${id}.body`)}
                                </Text>
                            </ExploreCard>
                        ))}
                    </ExploreGrid>
                    <ExploreFlow
                        label={trust("start.flowLabel")}
                        steps={START_STEP_IDS.map((id) => ({
                            title: trust(`start.steps.${id}.title`),
                            description: trust(`start.steps.${id}.description`),
                        }))}
                    />
                </ExploreSection>
                <ExploreSection
                    id="human-ai-governance"
                    eyebrow={trust("governance.eyebrow")}
                    title={trust("governance.title")}
                    description={trust("governance.description")}
                >
                    <ExploreSplit>
                        <ExploreQuote>{trust("governance.quote")}</ExploreQuote>
                        <ExploreGrid>
                            {PILLAR_IDS.map((id) => (
                                <ExploreCard key={id}>
                                    <Heading level={3}>{trust(`governance.pillars.${id}`)}</Heading>
                                </ExploreCard>
                            ))}
                        </ExploreGrid>
                    </ExploreSplit>
                    <ExploreNotice title={trust("governance.noticeTitle")}>
                        {trust("governance.noticeBody")}
                    </ExploreNotice>
                </ExploreSection>
                <ExploreSection
                    id="evidence-before-scale"
                    eyebrow={trust("evidence.eyebrow")}
                    title={trust("evidence.title")}
                    description={trust("evidence.description")}
                    tone="burgundy"
                >
                    <ExploreFlow
                        label={trust("evidence.loopLabel")}
                        tabletResponsive
                        steps={LOOP_STEP_IDS.map((id) => ({
                            title: trust(`evidence.steps.${id}`),
                            description: trust("evidence.stepDescription"),
                        }))}
                    />
                    <ExploreSignature
                        title={trust("evidence.signatureTitle")}
                        label={trust("evidence.sequenceLabel")}
                        sequence={SEQUENCE_IDS.map((id) => trust(`evidence.sequence.${id}`))}
                    />
                </ExploreSection>
                <ExploreSection
                    id="transformation-journey"
                    eyebrow={trust("journey.eyebrow")}
                    title={trust("journey.title")}
                    description={trust("journey.description")}
                >
                    <ExploreFlow
                        label={trust("journey.flowLabel")}
                        steps={JOURNEY_STEP_IDS.map((id) => ({
                            title: trust(`journey.steps.${id}`),
                            description: trust("journey.stepDescription"),
                        }))}
                    />
                </ExploreSection>
                <ExploreSection
                    id="what-becomes-possible"
                    eyebrow={trust("possible.eyebrow")}
                    title={trust("possible.title")}
                    description={trust("possible.description")}
                    tone="soft"
                >
                    <ExploreGrid columns="two">
                        {HORIZON_IDS.map((id) => (
                            <ExploreCard key={id}>
                                <Badge tone="neutral">{trust(`possible.horizons.${id}.state`)}</Badge>
                                <Heading level={3}>{trust(`possible.horizons.${id}.title`)}</Heading>
                            </ExploreCard>
                        ))}
                    </ExploreGrid>
                    <ExploreNotice title={trust("possible.noticeTitle")}>
                        {trust("possible.noticeBody")}
                    </ExploreNotice>
                </ExploreSection>
                <ExploreSection
                    id="truth-before-promise"
                    eyebrow={trust("truth.eyebrow")}
                    title={trust("truth.title")}
                    description={trust("truth.description")}
                    tone="dark"
                >
                    <ExploreGrid>
                        {TERM_IDS.map((id) => (
                            <ExploreCard key={id}>
                                <Heading level={3}>{trust(`truth.terms.${id}.term`)}</Heading>
                                <Text as="p" size="sm">
                                    {trust(`truth.terms.${id}.meaning`)}
                                </Text>
                            </ExploreCard>
                        ))}
                    </ExploreGrid>
                    <ExplorePathGrid
                        label={trust("truth.pathsLabel")}
                        paths={[
                            { label: links("nivoOs"), href: SITE_LINKS.nivoOs },
                            { label: links("contactTrust"), href: `${SITE_LINKS.contact}?intent=product` },
                            { label: links("sor"), href: SITE_LINKS.responsibility },
                        ]}
                    />
                </ExploreSection>
            </ExploreSurface>
        </SiteMain>
    )
}

export default TrustPage
