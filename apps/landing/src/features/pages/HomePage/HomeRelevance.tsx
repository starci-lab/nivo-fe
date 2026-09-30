import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text } from "@starci/grammar/common"
import { ProcessFlow, SectionIntro } from "../../layouts/SiteShell"
import { HomeMotionSectionReveal } from "../../../components/blocks/landing/HomeMotion"
import type { PublicFlowStep } from "../../../modules/landing/homepage"
import { InlineRoute } from "./InlineRoute"
import { CLASS_NAMES } from "./classNames"

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
