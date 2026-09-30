import { Badge, Heading, Text, TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { useTranslations } from "next-intl"
import ExploreCard from "../../../components/blocks/explore/ExploreCard"
import ExploreGrid from "../../../components/blocks/explore/ExploreGrid"
import ExploreHero from "../../../components/blocks/explore/ExploreHero"
import ExploreIdeaCard from "../../../components/blocks/explore/ExploreIdeaCard"
import ExploreNotice from "../../../components/blocks/explore/ExploreNotice"
import ExplorePathGrid from "../../../components/blocks/explore/ExplorePathGrid"
import ExploreSection from "../../../components/blocks/explore/ExploreSection"
import ExploreSurface from "../../../components/blocks/explore/ExploreSurface"
import ExploreTopicList from "../../../components/blocks/explore/ExploreTopicList"
import { SiteMain } from "../../layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { IDEA_ARTICLES, IDEA_TOPIC_IDS, IDEA_TYPE_IDS, type IdeaContentType } from "../../../modules/landing/ideas"
import { SITE_LINKS } from "../../../modules/landing/site"

const HERO_STEP_IDS = ["discover", "understand", "connect"] as const
const CONTINUE_PATHS = [
    ["nivoOs", SITE_LINKS.nivoOs],
    ["sor", SITE_LINKS.responsibility],
    ["applications", SITE_LINKS.applications],
    ["trust", SITE_LINKS.trust],
    ["company", SITE_LINKS.company],
] as const
const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

type ExplorePageProps = { readonly selectedType?: IdeaContentType | null }

/** Canonical `/ideas` discovery page and its stable type filter. */
const ExplorePage = ({ selectedType }: ExplorePageProps) => {
    const ideas = useTranslations("explore.ideas")
    const links = useTranslations("explore.links")
    const href = useLocalizedHref()
    const visible = selectedType == null ? IDEA_ARTICLES : IDEA_ARTICLES.filter((item) => item.contentType === selectedType)
    const [featured, ...supporting] = visible
    return (
        <SiteMain>
            <ExploreSurface page="ideas">
                <ExploreHero
                    id="knowledge-identity"
                    eyebrow={ideas("hero.eyebrow")}
                    title={ideas("hero.title")}
                    description={ideas("hero.body")}
                    primary={{ label: ideas("hero.primary"), href: "#featured" }}
                    secondary={{ label: links("nivoOs"), href: SITE_LINKS.nivoOs }}
                    modelLabel={ideas("hero.modelLabel")}
                    modelSteps={HERO_STEP_IDS.map((id) => ideas(`hero.steps.${id}`))}
                    visual="ideas"
                />
                <ExploreSection
                    id="featured"
                    eyebrow={ideas("featured.eyebrow")}
                    title={ideas("featured.title")}
                    description={ideas("featured.description")}
                    tone="soft"
                >
                    {featured === undefined ? (
                        <ExploreNotice title={ideas("featured.emptyTitle")}>{ideas("featured.emptyBody")}</ExploreNotice>
                    ) : (
                        <ExploreGrid>
                            <ExploreIdeaCard featured mark="NIVO / 01">
                                <Badge tone="accent">{ideas(`byType.types.${featured.contentType}.label`)}</Badge>
                                <Heading level={3}>{ideas(`items.${featured.slug}.title`)}</Heading>
                                <Text as="p" size="md">
                                    {ideas(`items.${featured.slug}.thesis`)}
                                </Text>
                                <TextAction
                                    href={href(`${SITE_LINKS.ideas}/${featured.slug}`)}
                                    appearance="route"
                                    endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                                >
                                    {ideas("featured.read")}
                                </TextAction>
                            </ExploreIdeaCard>
                            {supporting.map((idea, index) => (
                                <ExploreIdeaCard mark={`0${index + 2}`} key={idea.slug}>
                                    <Badge tone="neutral">{ideas(`byType.types.${idea.contentType}.label`)}</Badge>
                                    <Heading level={3}>{ideas(`items.${idea.slug}.title`)}</Heading>
                                    <Text as="p" size="sm">
                                        {ideas(`items.${idea.slug}.thesis`)}
                                    </Text>
                                    <TextAction
                                        href={href(`${SITE_LINKS.ideas}/${idea.slug}`)}
                                        appearance="route"
                                        endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                                    >
                                        {ideas("featured.read")}
                                    </TextAction>
                                </ExploreIdeaCard>
                            ))}
                        </ExploreGrid>
                    )}
                </ExploreSection>
                <ExploreSection
                    id="by-type"
                    eyebrow={ideas("byType.eyebrow")}
                    title={ideas("byType.title")}
                    description={ideas("byType.description")}
                >
                    <ExploreGrid as="nav" label={ideas("byType.label")}>
                        {IDEA_TYPE_IDS.map((id, index) => (
                            <ExploreCard index={`0${index + 1}`} staggered={index === 1} key={id}>
                                <Text as="p" size="xs" tone="accent">
                                    {ideas(`byType.types.${id}.role`)}
                                </Text>
                                <Heading level={3}>{ideas(`byType.types.${id}.label`)}</Heading>
                                <TextAction
                                    href={href(`${SITE_LINKS.ideas}?type=${id}#featured`)}
                                    appearance="route"
                                    endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                                >
                                    {ideas("byType.explore")}
                                </TextAction>
                            </ExploreCard>
                            ))}
                    </ExploreGrid>
                </ExploreSection>
                <ExploreSection
                    id="curated"
                    eyebrow={ideas("curated.eyebrow")}
                    title={ideas("curated.title")}
                    description={ideas("curated.description")}
                    tone="burgundy"
                >
                    <ExplorePathGrid
                        label={ideas("curated.label")}
                        paths={IDEA_ARTICLES.map((idea) => ({
                            label: ideas(`items.${idea.slug}.title`),
                            href: `${SITE_LINKS.ideas}/${idea.slug}`,
                        }))}
                    />
                </ExploreSection>
                <ExploreSection
                    id="by-topic"
                    eyebrow={ideas("byTopic.eyebrow")}
                    title={ideas("byTopic.title")}
                    description={ideas("byTopic.description")}
                >
                    <ExploreTopicList
                        topics={IDEA_TOPIC_IDS.map((id) => ideas(`byTopic.topics.${id}`))}
                    />
                </ExploreSection>
                <ExploreSection
                    id="continue-learning"
                    eyebrow={ideas("continue.eyebrow")}
                    title={ideas("continue.title")}
                    description={ideas("continue.description")}
                    tone="dark"
                >
                    <ExplorePathGrid
                        label={ideas("continue.label")}
                        paths={CONTINUE_PATHS.map(([id, path]) => ({ label: ideas(`continue.paths.${id}`), href: path }))}
                    />
                </ExploreSection>
            </ExploreSurface>
        </SiteMain>
    )
}

export default ExplorePage
