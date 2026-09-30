import { Badge, Heading, Text, TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { useTranslations } from "next-intl"
import ExploreActorCard from "../../../components/blocks/explore/ExploreActorCard"
import ExploreFlow from "../../../components/blocks/explore/ExploreFlow"
import ExploreGrid from "../../../components/blocks/explore/ExploreGrid"
import ExploreHero from "../../../components/blocks/explore/ExploreHero"
import ExploreNotice from "../../../components/blocks/explore/ExploreNotice"
import ExplorePathGrid from "../../../components/blocks/explore/ExplorePathGrid"
import ExploreSection from "../../../components/blocks/explore/ExploreSection"
import ExploreSurface from "../../../components/blocks/explore/ExploreSurface"
import { SiteMain } from "../../layouts/SiteShell"
import { useLocalizedHref } from "../../../hooks"
import { SITE_LINKS } from "../../../modules/landing/site"

const NEXT_CHIP_ICON = { name: "next", usage: "chip" } as const

const ACTORS = [
    { id: "customers", href: SITE_LINKS.applications, future: false },
    { id: "partners", href: `${SITE_LINKS.contact}?intent=partnership`, future: false },
    { id: "institutions", href: `${SITE_LINKS.contact}?intent=institution`, future: false },
    { id: "futureBuilders", href: SITE_LINKS.nivoOs, future: true },
] as const
const ACTOR_FIELDS = ["contribution", "value", "outcome", "status"] as const
const HERO_STEP_IDS = ["contribution", "scopedCollaboration", "evidence", "reusableCapacity"] as const
const VALUE_STEP_IDS = [
    "realContext",
    "domainExpertise",
    "implementationCapacity",
    "institutionalContext",
    "scopedCollaboration",
    "evidence",
    "reusableCapacity",
] as const
const GROWTH_STEP_IDS = ["interest", "fit", "context", "scopedCollaboration", "evidence", "deeperRelationship"] as const

/** Public ecosystem page with four explicit actor groups and a bounded contribution model. */
const EcosystemPage = () => {
    const ecosystem = useTranslations("explore.ecosystem")
    const links = useTranslations("explore.links")
    const href = useLocalizedHref()
    return (
        <SiteMain>
            <ExploreSurface page="ecosystem">
                <ExploreHero
                    id="why-ecosystem"
                    eyebrow={ecosystem("hero.eyebrow")}
                    title={ecosystem("hero.title")}
                    description={ecosystem("hero.body")}
                    primary={{ label: ecosystem("hero.primary"), href: "#value-exchange" }}
                    secondary={{ label: links("nivoOs"), href: SITE_LINKS.nivoOs }}
                    modelLabel={ecosystem("hero.modelLabel")}
                    modelSteps={HERO_STEP_IDS.map((id) => ecosystem(`hero.steps.${id}`))}
                    visual="ecosystem"
                />
                <ExploreSection
                    id="value-exchange"
                    eyebrow={ecosystem("value.eyebrow")}
                    title={ecosystem("value.title")}
                    description={ecosystem("value.description")}
                    tone="burgundy"
                >
                    <ExploreFlow
                        label={ecosystem("value.flowLabel")}
                        steps={VALUE_STEP_IDS.map((id) => ({
                            title: ecosystem(`value.steps.${id}`),
                            description: ecosystem("value.stepDescription"),
                        }))}
                    />
                    <ExploreNotice title={ecosystem("value.noticeTitle")}>
                        {ecosystem("value.noticeBody")}
                    </ExploreNotice>
                </ExploreSection>
                <ExploreSection
                    id="actors"
                    eyebrow={ecosystem("actors.eyebrow")}
                    title={ecosystem("actors.title")}
                    description={ecosystem("actors.description")}
                >
                    <ExploreGrid columns="two" role="list" label={ecosystem("actors.listLabel")}>
                        {ACTORS.map((actor, index) => (
                            <ExploreActorCard
                                index={index}
                                future={actor.future}
                                staggered={index === 1 || index === 3}
                                fields={ACTOR_FIELDS.map((field) => ({
                                    label: ecosystem(`actors.labels.${field}`),
                                    value: ecosystem(`actors.items.${actor.id}.${field}`),
                                }))}
                                footer={
                                    <TextAction
                                        href={href(actor.href)}
                                        appearance="route"
                                        endContent={<NivoIcon props={NEXT_CHIP_ICON} />}
                                    >
                                        {ecosystem(`actors.items.${actor.id}.action`)}
                                    </TextAction>
                                }
                                key={actor.id}
                            >
                                <Badge tone={actor.future ? "accent" : "neutral"}>
                                    {actor.future
                                        ? ecosystem("actors.badgeFuture")
                                        : ecosystem("actors.badgeCurrent")}
                                </Badge>
                                <Heading level={3}>{ecosystem(`actors.items.${actor.id}.name`)}</Heading>
                                <Text as="p" size="sm" weight="semibold">
                                    {ecosystem(`actors.items.${actor.id}.role`)}
                                </Text>
                            </ExploreActorCard>
                        ))}
                    </ExploreGrid>
                </ExploreSection>
                <ExploreSection
                    id="relationship-growth"
                    eyebrow={ecosystem("growth.eyebrow")}
                    title={ecosystem("growth.title")}
                    description={ecosystem("growth.description")}
                    tone="soft"
                >
                    <ExploreFlow
                        label={ecosystem("growth.flowLabel")}
                        steps={GROWTH_STEP_IDS.map((id) => ({
                            title: ecosystem(`growth.steps.${id}`),
                            description: ecosystem("growth.stepDescription"),
                        }))}
                    />
                    <TextAction
                        href={href(SITE_LINKS.trust)}
                        appearance="route"
                        endContent={<NivoIcon props={NEXT_CHIP_ICON} />}
                    >
                        {links("trust")}
                    </TextAction>
                </ExploreSection>
                <ExploreSection id="ecosystem-proof" eyebrow={ecosystem("proof.eyebrow")} title={ecosystem("proof.title")}>
                    <ExploreNotice title={ecosystem("proof.noticeTitle")}>
                        {ecosystem("proof.noticeBody")}
                    </ExploreNotice>
                </ExploreSection>
                <ExploreSection
                    id="choose-path"
                    eyebrow={ecosystem("path.eyebrow")}
                    title={ecosystem("path.title")}
                    description={ecosystem("path.description")}
                    tone="dark"
                >
                    <ExplorePathGrid
                        label={ecosystem("path.label")}
                        paths={ACTORS.map((actor) => ({
                            label: ecosystem("path.route", {
                                name: ecosystem(`actors.items.${actor.id}.name`),
                                action: ecosystem(`actors.items.${actor.id}.action`),
                            }),
                            href: actor.href,
                        }))}
                    />
                </ExploreSection>
            </ExploreSurface>
        </SiteMain>
    )
}

export default EcosystemPage
