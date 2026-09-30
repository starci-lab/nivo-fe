import { NivoIcon } from "@nivo/ui"
import {
    Badge,
    Button,
    Heading,
    PageContainer,
    TextAction,
    Text,
    SurfaceCard,
    SurfaceListCard,
    StaticStateRow,
} from "@starci/grammar/common"
import { SiteMain } from "@/features/layouts/SiteShell"
import { SectionIntro } from "@/components/blocks/landing/SectionIntro"
import { HeroBand } from "@/components/blocks/commercial/HeroBand"
import { ContactIntentForm } from "@/components/blocks/commercial/ContactIntentForm"
import { CLASS_NAMES } from "./classNames"
import type { ContactIntentId } from "./index"

type ContactPath = { readonly id: string; readonly label: string; readonly href: string }
/** Resolved content and destinations for the relationship router. */
export type ContactPageData = {
    readonly copy: {
        readonly "hero.eyebrow": string
        readonly "hero.title": string
        readonly "hero.body": string
        readonly "hero.primary": string
        readonly "hero.routeLabel": string
        readonly "router.eyebrow": string
        readonly "router.title": string
        readonly "router.description": string
        readonly "router.legend": string
        readonly "router.submit": string
        readonly "result.eyebrow": string
        readonly "result.emptyTitle": string
        readonly "result.emptyBody": string
        readonly "result.resolved": string
        readonly "truth.eyebrow": string
        readonly "truth.title": string
        readonly "truth.description": string
        readonly "truth.badge": string
        readonly "truth.body": string
        readonly "truth.submittedLabel": string
        readonly "truth.submittedBody": string
        readonly "direct.eyebrow": string
        readonly "direct.title": string
        readonly "direct.description": string
        readonly "direct.label": string
    }
    readonly routeSteps: ReadonlyArray<import("@starci/grammar/common").StaticStateRowData>
    readonly formAction: string
    readonly options: ReadonlyArray<{
        readonly id: ContactIntentId
        readonly label: string
        readonly description: string
    }>
    readonly selected?: {
        readonly id: ContactIntentId
        readonly label: string
        readonly expectation: string
        readonly pathsLabel: string
        readonly paths: ReadonlyArray<ContactPath>
    }
    readonly directPaths: ReadonlyArray<ContactPath>
}
/** Pure presentation contract. */
export type ContactPageBaseProps = { readonly props: ContactPageData }
const ArrowIcon = () => <NivoIcon props={{ name: "next", usage: "chip" }} />
/** Draw the contact router from resolved intent and localized copy. */
export const ContactPageBase = (props: ContactPageBaseProps) => {
    const data = props.props
    const { copy } = data
    return (
        <div className={CLASS_NAMES.page}>
            <SiteMain>
                <div>
                    <HeroBand id="choose-intent" variant="contact" aria-labelledby="contact-title">
                        <PageContainer className={CLASS_NAMES.contactHeroGrid}>
                            <div className={CLASS_NAMES.heroCopy}>
                                <div className={CLASS_NAMES.eyebrow}>
                                    <Text as="span">{copy["hero.eyebrow"]}</Text>
                                </div>
                                <div id="contact-title">
                                    <Heading level={1} scale="display">
                                        {copy["hero.title"]}
                                    </Heading>
                                </div>
                                <div className={CLASS_NAMES.heroBody}>
                                    <Text as="p">{copy["hero.body"]}</Text>
                                </div>
                                <Button href="#intent-router" variant="primary" size="lg" endContent={<ArrowIcon />}>
                                    {copy["hero.primary"]}
                                </Button>
                            </div>
                            <div className={CLASS_NAMES.contactRouteMap}>
                                <SurfaceListCard ariaLabel={copy["hero.routeLabel"]}>
                                    {data.routeSteps.map((step) => (
                                        <StaticStateRow key={step.id} item={step} />
                                    ))}
                                </SurfaceListCard>
                            </div>
                        </PageContainer>
                    </HeroBand>

                    <div
                        role="region"
                        className={CLASS_NAMES.intentSection}
                        id="intent-router"
                        aria-labelledby="intent-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer className={CLASS_NAMES.intentLayout}>
                                <div className={CLASS_NAMES.intentMain}>
                                    <SectionIntro
                                        id="intent-title"
                                        eyebrow={copy["router.eyebrow"]}
                                        title={copy["router.title"]}
                                        description={copy["router.description"]}
                                    />
                                    <ContactIntentForm
                                        action={data.formAction}
                                        initialIntent={data.selected?.id}
                                        legend={copy["router.legend"]}
                                        options={data.options}
                                        submitLabel={copy["router.submit"]}
                                    />
                                </div>

                                <aside
                                    id="contact-next-step"
                                    className={CLASS_NAMES.routeResult}
                                    aria-live="polite"
                                    aria-labelledby="route-result-title"
                                >
                                    <div className={`${CLASS_NAMES.eyebrow} ${CLASS_NAMES.eyebrowInverse}`}>
                                        <Text as="span">{copy["result.eyebrow"]}</Text>
                                    </div>
                                    {data.selected === undefined ? (
                                        <div className={CLASS_NAMES.resultIcon}>
                                            <NivoIcon props={{ name: "overview", usage: "heading" }} />
                                        </div>
                                    ) : (
                                        <Badge tone="success">{copy["result.resolved"]}</Badge>
                                    )}
                                    <div id="route-result-title">
                                        <Heading level={3}>{data.selected?.label ?? copy["result.emptyTitle"]}</Heading>
                                    </div>
                                    <div className={CLASS_NAMES.resultCopy}>
                                        <Text as="p">{data.selected?.expectation ?? copy["result.emptyBody"]}</Text>
                                    </div>
                                    {data.selected === undefined ? null : (
                                        <div
                                            role="navigation"
                                            className={CLASS_NAMES.resultLinks}
                                            aria-label={data.selected.pathsLabel}
                                        >
                                            {data.selected.paths.map((path) => (
                                                <TextAction
                                                    href={path.href}
                                                    appearance="route"
                                                    endContent={<ArrowIcon />}
                                                    key={path.id}
                                                >
                                                    {path.label}
                                                </TextAction>
                                            ))}
                                        </div>
                                    )}
                                </aside>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        className={CLASS_NAMES.contactTruthSection}
                        aria-labelledby="contact-truth-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer className={CLASS_NAMES.contactTruthGrid}>
                                <SectionIntro
                                    id="contact-truth-title"
                                    eyebrow={copy["truth.eyebrow"]}
                                    title={copy["truth.title"]}
                                    description={copy["truth.description"]}
                                    inverse
                                />
                                <div className={CLASS_NAMES.privacyCard}>
                                    <div className={CLASS_NAMES.privacyIcon}>
                                        <Text as="span">
                                            <NivoIcon props={{ name: "complete", usage: "heading" }} />
                                        </Text>
                                    </div>
                                    <Badge tone="warning">{copy["truth.badge"]}</Badge>
                                    <div className={CLASS_NAMES.privacyCopy}>
                                        <Text as="p">{copy["truth.body"]}</Text>
                                    </div>
                                </div>
                                <div className={CLASS_NAMES.noSubmission}>
                                    <Text as="span">{copy["truth.submittedLabel"]}</Text>
                                    <Text as="p">{copy["truth.submittedBody"]}</Text>
                                </div>
                            </PageContainer>
                        </SurfaceCard>
                    </div>

                    <div
                        role="region"
                        id="direct-paths"
                        className={CLASS_NAMES.directSection}
                        aria-labelledby="direct-title"
                    >
                        <SurfaceCard frame="frameless">
                            <PageContainer className={CLASS_NAMES.directGrid}>
                                <SectionIntro
                                    id="direct-title"
                                    eyebrow={copy["direct.eyebrow"]}
                                    title={copy["direct.title"]}
                                    description={copy["direct.description"]}
                                    inverse
                                />
                                <div
                                    role="navigation"
                                    className={CLASS_NAMES.directLinks}
                                    aria-label={copy["direct.label"]}
                                >
                                    {data.directPaths.map((path, index) => (
                                        <TextAction
                                            href={path.href}
                                            appearance="route"
                                            endContent={<ArrowIcon />}
                                            key={path.id}
                                        >
                                            <div className={CLASS_NAMES.directLinkContent}>
                                                <Text as="span">
                                                    <small>{String(index + 1).padStart(2, "0")}</small>
                                                    {path.label}
                                                </Text>
                                            </div>
                                        </TextAction>
                                    ))}
                                </div>
                            </PageContainer>
                        </SurfaceCard>
                    </div>
                </div>
            </SiteMain>
        </div>
    )
}
