import Image from "next/image"
import { NivoIcon } from "@nivo/ui"
import { Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import { ProcessFlow, SectionIntro } from "../../layouts/SiteShell"
import { HomeMotionRoleCard, HomeMotionSectionReveal } from "../../../components/blocks/landing/HomeMotion"
import type { PublicFlowStep } from "../../../modules/landing/homepage"
import { CLASS_NAMES, homeRoleImageClassName } from "./classNames"

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
