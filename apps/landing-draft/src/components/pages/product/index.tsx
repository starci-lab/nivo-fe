import type { Metadata } from "next"
import Image from "next/image"
import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import type { CSSProperties, ReactNode } from "react"
import { NivoIcon } from "@nivo/ui"
import { SectionIntro, SiteMain } from "@/components/site"
import { ACTIVATION_LINK } from "@/resources/site"
import rawProductContent from "./content.json"
import {
    PRODUCT_CLASS_NAMES,
    productGridClassName,
    productOfferClassName,
    productSectionClassName,
} from "./classNames"

type ProductPageId = "nivo-os" | "system-of-responsibility" | "applications" | "pricing"

type ActionData = {
    readonly label: string
    readonly href?: string
    readonly appearance?: string
    readonly activation?: boolean
}

type CardData = {
    readonly id?: string
    readonly label?: string
    readonly title: string
    readonly body: string
    readonly strong?: boolean
}

type FlowStepData = {
    readonly label: string
    readonly description: string
}

type PathData = {
    readonly label: string
    readonly title: string
    readonly body: string
    readonly href?: string
    readonly action?: string
    readonly activation?: boolean
}

type OfferData = {
    readonly label: string
    readonly title: string
    readonly price: string
    readonly period: string
    readonly state: string
    readonly detail: string
    readonly body: string
    readonly bullets: ReadonlyArray<string>
    readonly action: ActionData
    readonly qualifier: string
    readonly featured?: boolean
}

type FaqData = {
    readonly question: string
    readonly answer: string
}

type BlockData = {
    readonly type: string
    readonly label?: string
    readonly detail?: string
    readonly tone?: string
    readonly text?: string
    readonly columns?: number
    readonly items?: ReadonlyArray<CardData | ActionData | PathData | OfferData | FaqData>
    readonly steps?: ReadonlyArray<FlowStepData>
    readonly headers?: ReadonlyArray<string>
    readonly rows?: ReadonlyArray<ReadonlyArray<string>>
}

type SectionData = {
    readonly id: string
    readonly eyebrow: string
    readonly title: string
    readonly description?: string
    readonly tone: string
    readonly blocks: ReadonlyArray<BlockData>
}

type ProductPageData = {
    readonly metadata: {
        readonly title: string
        readonly description: string
        readonly canonical: string
    }
    readonly hero: {
        readonly eyebrow: string
        readonly title: string
        readonly descriptor?: string
        readonly supporting: string
        readonly philosophy?: string
        readonly signalLabel: string
        readonly signalValue: string
        readonly signalNote: string
        readonly actions: ReadonlyArray<ActionData>
    }
    readonly sections: ReadonlyArray<SectionData>
}

type ProductPageProps = {
    readonly page: ProductPageId
}

type ProductHeroVisualProps = {
    readonly page: ProductPageId
    readonly hero: ProductPageData["hero"]
}

const PRODUCT_CONTENT: Record<ProductPageId, ProductPageData> = { ...rawProductContent }

const CARD_ICONS = ["complete", "agentos", "review", "apps"] as const

const ProductHeroVisual = (props: ProductHeroVisualProps) => {
    const signal = (
        <div className={PRODUCT_CLASS_NAMES.heroSignal}>
            <Text as="p" size="xs" tone="accent" weight="semibold">{props.hero.signalLabel}</Text>
            <span className={PRODUCT_CLASS_NAMES.heroSignalValue}>{props.hero.signalValue}</span>
            <span className={PRODUCT_CLASS_NAMES.heroSignalNote}>{props.hero.signalNote}</span>
        </div>
    )

    if (props.page === "nivo-os") {
        return (
            <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={props.hero.signalLabel}>
                <div className={PRODUCT_CLASS_NAMES.heroCanvas}>
                    <span className={PRODUCT_CLASS_NAMES.heroOrbit} aria-hidden="true" />
                    <div className={PRODUCT_CLASS_NAMES.heroCore}>
                        <NivoIcon props={{ name: "agentos", usage: "heading" }} />
                        <strong>NIVO OS</strong>
                        <small>Responsibility core</small>
                    </div>
                    <ul className={PRODUCT_CLASS_NAMES.heroNodes} aria-label="NIVO OS operating model">
                        {[
                            ["Business intent", "overview"],
                            ["Human leads", "account"],
                            ["AI operates", "agentos"],
                            ["Outcome verified", "complete"],
                        ].map(([label, icon]) => (
                            <li className={PRODUCT_CLASS_NAMES.heroNode} key={label}>
                                <NivoIcon props={{ name: icon as "overview" | "account" | "agentos" | "complete", usage: "chip" }} />
                                <span>{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {signal}
            </aside>
        )
    }

    if (props.page === "system-of-responsibility") {
        return (
            <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={props.hero.signalLabel}>
                <div className={PRODUCT_CLASS_NAMES.heroCanvas}>
                    <div className={PRODUCT_CLASS_NAMES.heroArtwork} aria-hidden="true">
                        <Image src="/images/nivo-unicorn-responsibility-transparent-v18.png" alt="" width={1536} height={1024} priority sizes="(max-width: 768px) 88vw, 38vw" />
                    </div>
                    <div className={PRODUCT_CLASS_NAMES.heroResponsibility}>
                        <span><NivoIcon props={{ name: "complete", usage: "heading" }} /></span>
                        <small>Outcome owner</small>
                        <strong>Responsibility</strong>
                    </div>
                    <ol className={PRODUCT_CLASS_NAMES.heroSteps} aria-label="Responsibility assurance loop">
                        {[
                            ["01", "Context"],
                            ["02", "Boundary"],
                            ["03", "Evidence"],
                        ].map(([index, label]) => <li key={index}><span>{index}</span><strong>{label}</strong></li>)}
                    </ol>
                </div>
                {signal}
            </aside>
        )
    }

    if (props.page === "applications") {
        const applications = [
            ["Tạo tăng trưởng", "/images/intent/revenue-v2.png"], // vn-ok: Canonical Vietnamese public label.
            ["Vận hành tốt hơn", "/images/intent/operate-v2.png"], // vn-ok: Canonical Vietnamese public label.
            ["Quản trị dòng tiền", "/images/intent/money-v2.png"], // vn-ok: Canonical Vietnamese public label.
            ["Tạo điều mới", "/images/intent/create-v2.png"], // vn-ok: Canonical Vietnamese public label.
        ] as const
        return (
            <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={props.hero.signalLabel}>
                <div className={PRODUCT_CLASS_NAMES.heroGallery}>
                    {applications.map(([label, src], index) => (
                        <figure className={PRODUCT_CLASS_NAMES.heroGalleryCard} key={label}>
                            <Image src={src} alt="" width={1536} height={1152} priority={index < 2} sizes="(max-width: 768px) 42vw, 18vw" />
                            <figcaption><span>0{index + 1}</span>{label}</figcaption>
                        </figure>
                    ))}
                </div>
                {signal}
            </aside>
        )
    }

    return <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={props.hero.signalLabel}>{signal}</aside>
}

const badgeTone = (tone: string | undefined): "neutral" | "accent" | "warning" | "success" => {
    if (tone === "accent" || tone === "warning" || tone === "success") return tone
    return "neutral"
}

const renderAction = (action: ActionData, key: string): ReactNode => {
    if (action.activation === true) {
        return (
            <div key={key}>
                {ACTIVATION_LINK === null ? (
                    <Button variant={action.appearance === "primary" ? "primary" : "secondary"} isDisabled>{action.label}</Button>
                ) : (
                    <Button href={ACTIVATION_LINK.href} variant={action.appearance === "primary" ? "primary" : "secondary"}>{action.label}</Button>
                )}
            </div>
        )
    }

    if (action.href === undefined) return null
    if (action.appearance === "link") return <TextAction href={action.href} appearance="route" endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />} key={key}>{action.label}</TextAction>

    const variant = action.appearance === "primary"
        ? "primary"
        : action.appearance === "tertiary"
            ? "tertiary"
            : "secondary"
    return <Button href={action.href} variant={variant} key={key}>{action.label}</Button>
}

const renderCards = (block: BlockData): ReactNode => {
    const items = (block.items ?? []) as ReadonlyArray<CardData>
    return (
        <div className={productGridClassName(block.columns ?? 2)}>
            {items.map((item, index) => (
                <article className={item.strong === true ? PRODUCT_CLASS_NAMES.conceptStrong : PRODUCT_CLASS_NAMES.concept} id={item.id} key={`${item.label ?? "card"}-${item.title}`}>
                    <span className={PRODUCT_CLASS_NAMES.conceptIcon} aria-hidden="true"><NivoIcon props={{ name: CARD_ICONS[index % CARD_ICONS.length]!, usage: "heading" }} /></span>
                    {item.label === undefined ? null : <Text as="p" size="xs" tone="accent" weight="semibold">{item.label}</Text>}
                    <Heading level={3}>{item.title}</Heading>
                    <Text as="p" size="sm" tone="muted">{item.body}</Text>
                </article>
            ))}
        </div>
    )
}

const renderFlow = (block: BlockData): ReactNode => {
    const steps = block.steps ?? []
    const flowStyle = { "--product-flow-count": steps.length } as CSSProperties
    return (
        <figure>
            <ol className={PRODUCT_CLASS_NAMES.flow} aria-label={block.label} style={flowStyle}>
                {steps.map((step, index) => (
                    <li className={PRODUCT_CLASS_NAMES.flowStep} key={`${index}-${step.label}`}>
                        <span className={PRODUCT_CLASS_NAMES.flowNode} aria-hidden="true" />
                        <span className={PRODUCT_CLASS_NAMES.flowCopy}>
                            <Text as="span" size="sm" weight="semibold">{step.label}</Text>
                            <Text as="span" size="xs" tone="muted">{step.description}</Text>
                        </span>
                    </li>
                ))}
            </ol>
            <figcaption className={PRODUCT_CLASS_NAMES.screenReaderOnly}>{steps.map((step) => `${step.label}: ${step.description}`).join("; ")}</figcaption>
        </figure>
    )
}

const renderTable = (block: BlockData): ReactNode => (
    <div className={PRODUCT_CLASS_NAMES.tableFrame}>
        <table className={PRODUCT_CLASS_NAMES.table}>
            <caption className={PRODUCT_CLASS_NAMES.screenReaderOnly}>{block.label}</caption>
            <thead><tr>{(block.headers ?? []).map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
            <tbody>
                {(block.rows ?? []).map((row, rowIndex) => (
                    <tr key={`${rowIndex}-${row[0]}`}>
                        {row.map((cell, cellIndex) => cellIndex === 0 && (block.headers?.length ?? 0) > 2
                            ? <th scope="row" key={`${cellIndex}-${cell}`}>{cell}</th>
                            : <td key={`${cellIndex}-${cell}`}>{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

const renderOffers = (block: BlockData): ReactNode => {
    const offers = (block.items ?? []) as ReadonlyArray<OfferData>
    return (
        <div className={PRODUCT_CLASS_NAMES.offerGrid}>
            {offers.map((offer) => (
                <article className={productOfferClassName(offer.featured === true)} key={offer.label}>
                    <div className={PRODUCT_CLASS_NAMES.truthLine}><Badge tone={offer.featured === true ? "accent" : "neutral"}>{offer.state}</Badge><Text as="span" size="xs" tone="muted">{offer.detail}</Text></div>
                    <Text as="p" size="xs" tone="accent" weight="semibold">{offer.label}</Text>
                    <Heading level={3}>{offer.title}</Heading>
                    <span className={PRODUCT_CLASS_NAMES.price}>{offer.price}</span>
                    <Text as="p" size="sm">{offer.period}</Text>
                    <Text as="p" size="sm" tone="muted">{offer.body}</Text>
                    <ul className={PRODUCT_CLASS_NAMES.semanticList}>{offer.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                    {renderAction(offer.action, `${offer.label}-action`)}
                    <span className={PRODUCT_CLASS_NAMES.priceQualifier}>{offer.qualifier}</span>
                </article>
            ))}
        </div>
    )
}

const renderPaths = (block: BlockData): ReactNode => {
    const paths = (block.items ?? []) as ReadonlyArray<PathData>
    return (
        <div className={PRODUCT_CLASS_NAMES.pathGrid}>
            {paths.map((path, index) => (
                <article className={PRODUCT_CLASS_NAMES.path} key={path.label}>
                    <span className={PRODUCT_CLASS_NAMES.pathIndex}>0{index + 1}</span>
                    <Text as="p" size="xs" tone="accent" weight="semibold">{path.label}</Text>
                    <Heading level={3}>{path.title}</Heading>
                    <Text as="p" size="sm" tone="muted">{path.body}</Text>
                    {renderAction({ label: path.action ?? path.title, href: path.href, activation: path.activation, appearance: "link" }, `${path.label}-path`)}
                </article>
            ))}
        </div>
    )
}

const renderBlock = (block: BlockData, index: number): ReactNode => {
    if (block.type === "cards") return <div key={index}>{renderCards(block)}</div>
    if (block.type === "flow") return <div key={index}>{renderFlow(block)}</div>
    if (block.type === "table") return <div key={index}>{renderTable(block)}</div>
    if (block.type === "offers") return <div key={index}>{renderOffers(block)}</div>
    if (block.type === "paths") return <div key={index}>{renderPaths(block)}</div>
    if (block.type === "status") return <div className={PRODUCT_CLASS_NAMES.truthLine} key={index}><Badge tone={badgeTone(block.tone)}>{block.label}</Badge><Text as="span" size="xs" tone="muted">{block.detail}</Text></div>
    if (block.type === "note") return <Heading level={3} key={index}>{block.text}</Heading>
    if (block.type === "actions") return <div className={PRODUCT_CLASS_NAMES.actionRow} key={index}>{((block.items ?? []) as ReadonlyArray<ActionData>).map((action, actionIndex) => renderAction(action, `${actionIndex}-${action.label}`))}</div>
    if (block.type === "selector") return <nav className={PRODUCT_CLASS_NAMES.selector} aria-label={block.label} key={index}>{((block.items ?? []) as ReadonlyArray<ActionData>).map((item) => <a className={PRODUCT_CLASS_NAMES.selectorLink} href={item.href} key={item.label}>{item.label}</a>)}</nav>
    if (block.type === "faq") return <div className={PRODUCT_CLASS_NAMES.faq} key={index}>{((block.items ?? []) as ReadonlyArray<FaqData>).map((item) => <details className={PRODUCT_CLASS_NAMES.faqItem} key={item.question}><summary>{item.question}</summary><div>{item.answer}</div></details>)}</div>
    return null
}

const structuredData = (data: ProductPageData): string => JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.metadata.title,
    description: data.metadata.description,
    url: `https://nivo.vn${data.metadata.canonical}`,
    inLanguage: "vi",
    isPartOf: { "@id": "https://nivo.vn/#website" },
    publisher: { "@id": "https://nivo.vn/#organization" },
}).replaceAll("<", "\\u003c")

/** Metadata contracts consumed by the four thin App Router adapters. */
export const PRODUCT_PAGE_METADATA: Record<ProductPageId, Metadata> = Object.fromEntries(
    Object.entries(PRODUCT_CONTENT).map(([page, data]) => [page, {
        title: data.metadata.title,
        description: data.metadata.description,
        alternates: { canonical: data.metadata.canonical },
        openGraph: {
            type: "website",
            locale: "vi_VN",
            url: data.metadata.canonical,
            title: data.metadata.title,
            description: data.metadata.description,
        },
    }]),
) as Record<ProductPageId, Metadata>

/** One canonical server-rendered product page selected by the route adapter. */
export const ProductPage = (props: ProductPageProps) => {
    const data = PRODUCT_CONTENT[props.page]

    return (
        <SiteMain>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(data) }} />
            <div className={PRODUCT_CLASS_NAMES.page} data-product-page={props.page}>
                <section className={PRODUCT_CLASS_NAMES.hero} aria-labelledby="product-page-title">
                    <PageContainer className={PRODUCT_CLASS_NAMES.heroInner}>
                        <div className={PRODUCT_CLASS_NAMES.heroCopy}>
                            <Text as="p" size="xs" tone="accent" weight="semibold">{data.hero.eyebrow}</Text>
                            <Heading level={1} scale="display"><span id="product-page-title">{data.hero.title}</span></Heading>
                            {data.hero.descriptor === undefined ? null : <Text as="p" size="sm" weight="semibold">{data.hero.descriptor}</Text>}
                            <Text as="p" size="md" tone="muted">{data.hero.supporting}</Text>
                            {data.hero.philosophy === undefined ? null : <Text as="p" size="sm" weight="semibold">{data.hero.philosophy}</Text>}
                            <div className={PRODUCT_CLASS_NAMES.actionRow}>{data.hero.actions.map((action, index) => renderAction(action, `${index}-${action.label}`))}</div>
                        </div>
                        <ProductHeroVisual page={props.page} hero={data.hero} />
                    </PageContainer>
                </section>

                {data.sections.map((section) => {
                    const inverse = section.tone === "dark" || section.tone === "crimson"
                    return (
                        <section className={productSectionClassName(section.tone)} data-product-section={section.id} aria-labelledby={section.id} key={section.id}>
                            <PageContainer>
                                <SectionIntro id={section.id} eyebrow={section.eyebrow} title={section.title} description={section.description} inverse={inverse} />
                                <div className={PRODUCT_CLASS_NAMES.sectionBody}>{section.blocks.map(renderBlock)}</div>
                            </PageContainer>
                        </section>
                    )
                })}
            </div>
        </SiteMain>
    )
}
