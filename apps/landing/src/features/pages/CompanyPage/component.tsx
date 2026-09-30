import { NivoIcon, type NivoIconData } from "@nivo/ui"
import {
    Badge,
    Heading,
    PageContainer,
    Text,
    SurfaceCard,
    SurfaceListCard,
    StaticStateRow,
} from "@starci/grammar/common"
import { SiteMain } from "@/features/layouts/SiteShell"
import { CardGrid } from "@/components/blocks/commercial/CardGrid"
import { SectionIntro } from "@/components/blocks/landing/SectionIntro"
import { CompanyHero } from "./CompanyHero"
import { CompanyNextPath } from "./CompanyNextPath"
import { CLASS_NAMES } from "./classNames"
import type { CompanyPageData } from "./index"

/** Pure company-page contract. */
export type CompanyPageBaseProps = { readonly props: CompanyPageData }

const NEXT_CHIP_ICON_PROPS = { name: "next", usage: "chip" } as const

type CompanyProfileCardProps = {
    readonly item: CompanyPageData["today"][number] & {
        readonly implication?: string
        readonly iconProps?: NivoIconData
    }
    readonly index: number
    readonly variant: "today" | "values" | "philosophy"
}
const CompanyProfileCard = (props: CompanyProfileCardProps) => {
    const { item, index, variant } = props
    const isInverse = variant === "philosophy" || (variant === "values" && index === 2)
    return (
        <article
            className={
                variant === "today"
                    ? index === 1
                        ? `${CLASS_NAMES.todayCard} ${CLASS_NAMES.todayCardHighlight}`
                        : CLASS_NAMES.todayCard
                    : undefined
            }
        >
            {item.iconProps === undefined ? null : (
                <div className={CLASS_NAMES.philosophyIcon}>
                    <NivoIcon props={item.iconProps} />
                </div>
            )}
            <div className={CLASS_NAMES.cardIndex}>
                <Text as="span" size="xs" tone="accent">
                    {String(index + 1).padStart(2, "0")}
                </Text>
            </div>
            <div className={isInverse ? CLASS_NAMES.inverseHeadingText : undefined}>
                <Heading level={3}>{item.title}</Heading>
            </div>
            <div className={variant === "philosophy" ? CLASS_NAMES.philosophyCardCopy : CLASS_NAMES.cardCopy}>
                <Text as="p" size="sm" tone={isInverse ? "default" : "muted"}>
                    {item.body}
                </Text>
            </div>
            {item.implication === undefined ? null : <Badge tone="neutral">{item.implication}</Badge>}
        </article>
    )
}

/** Draw the profile from localized facts and destinations. */
export const CompanyPageBase = (props: CompanyPageBaseProps) => {
    const data = props.props
    const { copy } = data
    return (
        <div className={CLASS_NAMES.page}>
            <SiteMain>
                <article>
                    <CompanyHero
                        copy={{
                            eyebrow: copy["hero.eyebrow"],
                            title: copy["hero.title"],
                            titleEmphasis: copy["hero.titleEmphasis"],
                            lede: copy["hero.lede"],
                            primaryAction: copy["hero.primaryAction"],
                            secondaryAction: copy["hero.secondaryAction"],
                            visualLabel: copy["hero.visualLabel"],
                            visualBrand: copy["hero.visualBrand"],
                            visualCore: copy["hero.visualCore"],
                            organization: copy["hero.visualCards.organization"],
                            product: copy["hero.visualCards.product"],
                            responsibility: copy["hero.visualCards.responsibility"],
                        }}
                        hrefs={{ nivoOs: data.hrefs.nivoOs, ecosystem: data.hrefs.ecosystem }}
                    />

                    <div
                        role="region"
                        id="nivo-today"
                        className={CLASS_NAMES.todaySection}
                        aria-labelledby="company-today-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer>
                                <SectionIntro
                                    id="company-today-title"
                                    eyebrow={copy["today.eyebrow"]}
                                    title={copy["today.title"]}
                                    description={copy["today.lede"]}
                                />
                                <CardGrid variant="today">
                                    {data.today.map((item, index) => (
                                        <CompanyProfileCard key={item.id} item={item} index={index} variant="today" />
                                    ))}
                                </CardGrid>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="provenance"
                        className={CLASS_NAMES.provenanceSection}
                        aria-labelledby="company-provenance-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer>
                                <SectionIntro
                                    id="company-provenance-title"
                                    eyebrow={copy["provenance.eyebrow"]}
                                    title={copy["provenance.title"]}
                                    description={copy["provenance.lede"]}
                                />
                                <div className={CLASS_NAMES.provenanceLine}>
                                    <SurfaceListCard ariaLabel={copy["provenance.label"]}>
                                        {data.provenance.map((item) => (
                                            <StaticStateRow key={item.id} item={item} />
                                        ))}
                                    </SurfaceListCard>
                                </div>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="mission"
                        className={CLASS_NAMES.statementSection}
                        aria-labelledby="company-mission-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer className={CLASS_NAMES.statementGrid}>
                                <div className={CLASS_NAMES.statementLead}>
                                    <div className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                        <Text as="span">{copy["mission.eyebrow"]}</Text>
                                    </div>
                                    <div id="company-mission-title" className={CLASS_NAMES.inverseHeadingText}>
                                        <Heading level={2}>{copy["mission.title"]}</Heading>
                                    </div>
                                    <div className={CLASS_NAMES.sequence} aria-label={copy["mission.sequenceLabel"]}>
                                        {data.missionSteps.map((step, index) => (
                                            <Text as="span" key={step}>
                                                <strong>{step}</strong>
                                                {index < data.missionSteps.length - 1 ? (
                                                    <NivoIcon props={NEXT_CHIP_ICON_PROPS} />
                                                ) : null}
                                            </Text>
                                        ))}
                                    </div>
                                </div>
                                <blockquote className={CLASS_NAMES.missionQuote}>
                                    {copy["mission.quoteLead"]} <strong>{copy["mission.quoteStrong"]}</strong>{" "}
                                    {copy["mission.quoteTail"]}
                                </blockquote>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="vision"
                        className={CLASS_NAMES.visionSection}
                        aria-labelledby="company-vision-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer className={CLASS_NAMES.visionGrid}>
                                <SectionIntro
                                    id="company-vision-title"
                                    eyebrow={copy["vision.eyebrow"]}
                                    title={copy["vision.title"]}
                                    description={copy["vision.body"]}
                                />
                                <div className={CLASS_NAMES.visionSteps}>
                                    <SurfaceListCard ariaLabel={copy["vision.title"]}>
                                        {data.vision.map((item) => (
                                            <StaticStateRow key={item.id} item={item} />
                                        ))}
                                    </SurfaceListCard>
                                </div>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="philosophy"
                        className={CLASS_NAMES.philosophySection}
                        aria-labelledby="company-philosophy-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer>
                                <SectionIntro
                                    id="company-philosophy-title"
                                    eyebrow={copy["philosophy.eyebrow"]}
                                    title={copy["philosophy.title"]}
                                    description={copy["philosophy.lede"]}
                                    inverse
                                />
                                <CardGrid variant="philosophy">
                                    {data.philosophy.map((item, index) => (
                                        <CompanyProfileCard
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            variant="philosophy"
                                        />
                                    ))}
                                </CardGrid>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="values"
                        className={CLASS_NAMES.valuesSection}
                        aria-labelledby="company-values-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer>
                                <SectionIntro
                                    id="company-values-title"
                                    eyebrow={copy["values.eyebrow"]}
                                    title={copy["values.title"]}
                                    description={copy["values.lede"]}
                                />
                                <CardGrid variant="values">
                                    {data.values.map((item, index) => (
                                        <CompanyProfileCard key={item.id} item={item} index={index} variant="values" />
                                    ))}
                                </CardGrid>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="leadership"
                        className={CLASS_NAMES.truthSection}
                        aria-labelledby="company-truth-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer className={CLASS_NAMES.truthGrid}>
                                <div>
                                    <div className={CLASS_NAMES.eyebrow}>
                                        <Text as="span">{copy["leadership.eyebrow"]}</Text>
                                    </div>
                                    <div id="company-truth-title">
                                        <Heading level={2}>{copy["leadership.title"]}</Heading>
                                    </div>
                                </div>
                                <div className={CLASS_NAMES.truthNotice}>
                                    <Badge tone="warning">{copy["leadership.badge"]}</Badge>
                                    <div className={CLASS_NAMES.truthNoticeCopy}>
                                        <Text as="p">{copy["leadership.notice"]}</Text>
                                    </div>
                                </div>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <CompanyNextPath
                        eyebrow={copy["next.eyebrow"]}
                        title={copy["next.title"]}
                        label={copy["next.label"]}
                        links={data.nextLinks}
                    />
                </article>
            </SiteMain>
        </div>
    )
}
