import { Badge, Heading, Text, TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { useTranslations } from "next-intl"
import ExploreCard from "../../../components/blocks/explore/ExploreCard"
import ExploreArticleBody from "../../../components/blocks/explore/ExploreArticleBody"
import ExploreArticleHero from "../../../components/blocks/explore/ExploreArticleHero"
import ExploreArticleSection from "../../../components/blocks/explore/ExploreArticleSection"
import ExploreGrid from "../../../components/blocks/explore/ExploreGrid"
import ExploreIdeaCard from "../../../components/blocks/explore/ExploreIdeaCard"
import ExploreNotice from "../../../components/blocks/explore/ExploreNotice"
import ExplorePathGrid from "../../../components/blocks/explore/ExplorePathGrid"
import ExploreSection from "../../../components/blocks/explore/ExploreSection"
import ExploreSurface from "../../../components/blocks/explore/ExploreSurface"
import { SiteMain } from "../../layouts/SiteShell"
import { useLocalizedHref } from "../../../hooks"
import { IDEA_ARTICLES, type IdeaArticle } from "../../../modules/landing/ideas"
import { SITE_LINKS } from "../../../modules/landing/site"

type ExploreIdeaPageProps = { readonly idea: IdeaArticle }
const LINK_HREFS = { nivoOs: SITE_LINKS.nivoOs, sor: SITE_LINKS.responsibility, trust: SITE_LINKS.trust } as const
const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

/** Editorial owner for one approved Idea and its evidence, references and related paths. */
const ExploreIdeaPage = ({ idea }: ExploreIdeaPageProps) => {
    const ideas = useTranslations("explore.ideas")
    const detail = useTranslations("explore.ideaDetail")
    const links = useTranslations("explore.links")
    const href = useLocalizedHref()
    const related = idea.relatedSlugs
        .map((slug) => IDEA_ARTICLES.find((item) => item.slug === slug))
        .filter((item): item is IdeaArticle => item !== undefined)
        .slice(0, 3)
    return (
        <SiteMain>
            <ExploreSurface page="idea-detail" as="article">
                <ExploreArticleHero
                    thesis={ideas(`items.${idea.slug}.thesis`)}
                    metadata={[
                        { label: detail("labels.author"), value: detail("author") },
                        { label: detail("labels.publisher"), value: detail("publisher") },
                        { label: detail("labels.lifecycle"), value: detail("lifecyclePublished") },
                        { label: detail("labels.source"), value: detail("sourceVersion") },
                    ]}
                    dateNote={detail("dateNote")}
                >
                    <Badge tone="accent">{ideas(`byType.types.${idea.contentType}.label`)}</Badge>
                    <Heading level={1} scale="display">
                        {ideas(`items.${idea.slug}.title`)}
                    </Heading>
                </ExploreArticleHero>
                <ExploreSection id="idea-body" eyebrow={detail("body.eyebrow")} title={detail("body.title")}>
                    <ExploreArticleBody>
                        {idea.sectionIds.map((sectionId, index) => {
                            const labelledBy = `idea-section-${index}`
                            return (
                                <ExploreArticleSection
                                    index={index}
                                    labelledBy={labelledBy}
                                    title={ideas(`items.${idea.slug}.sections.${sectionId}.title`)}
                                    body={ideas(`items.${idea.slug}.sections.${sectionId}.body`)}
                                    key={sectionId}
                                />
                            )
                        })}
                    </ExploreArticleBody>
                </ExploreSection>
                <ExploreSection
                    id="idea-truth-context"
                    eyebrow={detail("truth.eyebrow")}
                    title={detail("truth.title")}
                    tone="soft"
                >
                    <ExploreNotice title={detail("truth.noticeTitle")}>
                        {ideas(`items.${idea.slug}.truthContext`)}
                    </ExploreNotice>
                    <ExploreCard>
                        <Text as="p" size="xs" tone="accent">
                            {detail("truth.canonicalReference")}
                        </Text>
                        <TextAction
                            href={href(idea.canonicalReferenceHref)}
                            appearance="route"
                            endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                        >
                            {ideas(`items.${idea.slug}.canonicalReference`)}
                        </TextAction>
                    </ExploreCard>
                </ExploreSection>
                <ExploreSection
                    id="idea-next-path"
                    eyebrow={detail("next.eyebrow")}
                    title={detail("next.title")}
                    tone="burgundy"
                >
                    <ExplorePathGrid
                        label={detail("next.label")}
                        paths={[{ label: links(idea.primaryNext), href: LINK_HREFS[idea.primaryNext] }]}
                    />
                    <ExploreGrid as="nav" label={detail("next.relatedLabel")}>
                        {related.map((item) => (
                            <ExploreIdeaCard key={item.slug}>
                                <Badge tone="neutral">{ideas(`byType.types.${item.contentType}.label`)}</Badge>
                                <Heading level={3}>{ideas(`items.${item.slug}.title`)}</Heading>
                                <TextAction
                                    href={href(`${SITE_LINKS.ideas}/${item.slug}`)}
                                    appearance="route"
                                    endContent={<NivoIcon props={NEXT_CHIP_ICON_PROPS} />}
                                >
                                    {detail("next.read")}
                                </TextAction>
                            </ExploreIdeaCard>
                        ))}
                    </ExploreGrid>
                </ExploreSection>
            </ExploreSurface>
        </SiteMain>
    )
}

export default ExploreIdeaPage
