import Image from "next/image"
import { Badge, Button, Heading, PageContainer, Text, TextAction } from "@starci/grammar/common"
import type { CSSProperties } from "react"
import { useLocale, useTranslations } from "next-intl"
import { NivoIcon } from "@nivo/ui"
import { SectionIntro, SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { ACTIVATION_LINK, PUBLIC_SITE_URL } from "@/modules/landing/site"
import { PRODUCT_CLASS_NAMES, productGridClassName, productOfferClassName, productSectionClassName } from "./classNames"
import {
    PRODUCT_PAGES,
    type ActionStructure,
    type BlockStructure,
    type ProductPageId,
    type SectionStructure,
} from "./structure"

type Translate = ReturnType<typeof useTranslations>
type Href = (href: string) => string

type ProductPageProps = {
    readonly page: ProductPageId
}

type ProductHeroVisualProps = {
    readonly page: ProductPageId
    readonly t: Translate
    readonly signal: React.ReactNode
}

/** What every block renderer needs: the translator, the link resolver and where in the catalog it is. */
type BlockContext = {
    readonly t: Translate
    readonly href: Href
    readonly page: ProductPageId
    readonly section: SectionStructure
}

const CARD_ICONS = ["complete", "agentos", "review", "apps"] as const

const OPERATING_NODES = [
    { key: "businessIntent", icon: "overview" },
    { key: "humanLeads", icon: "account" },
    { key: "aiOperates", icon: "agentos" },
    { key: "outcomeVerified", icon: "complete" },
] as const

const ASSURANCE_STEPS = [
    { key: "context", index: "01" },
    { key: "boundary", index: "02" },
    { key: "evidence", index: "03" },
] as const

const APPLICATION_GALLERY = [
    { key: "growth", src: "/images/intent/revenue-v2.png" },
    { key: "operate", src: "/images/intent/operate-v2.png" },
    { key: "money", src: "/images/intent/money-v2.png" },
    { key: "create", src: "/images/intent/create-v2.png" },
] as const

const ProductHeroVisual = (props: ProductHeroVisualProps) => {
    const { t, signal } = props
    const signalLabel = t(`${props.page}.hero.signalLabel`)

    if (props.page === "nivoOs") {
        return (
            <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={signalLabel}>
                <div className={PRODUCT_CLASS_NAMES.heroCanvas}>
                    <span className={PRODUCT_CLASS_NAMES.heroOrbit} aria-hidden="true" />
                    <div className={PRODUCT_CLASS_NAMES.heroCore}>
                        <NivoIcon props={{ name: "agentos", usage: "heading" }} />
                        <strong>{t("nivoOs.hero.visual.coreName")}</strong>
                        <small>{t("nivoOs.hero.visual.coreLabel")}</small>
                    </div>
                    <ul className={PRODUCT_CLASS_NAMES.heroNodes} aria-label={t("nivoOs.hero.visual.nodesLabel")}>
                        {OPERATING_NODES.map((node) => (
                            <li className={PRODUCT_CLASS_NAMES.heroNode} key={node.key}>
                                <NivoIcon props={{ name: node.icon, usage: "chip" }} />
                                <span>{t(`nivoOs.hero.visual.nodes.${node.key}`)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {signal}
            </aside>
        )
    }

    if (props.page === "systemOfResponsibility") {
        return (
            <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={signalLabel}>
                <div className={PRODUCT_CLASS_NAMES.heroCanvas}>
                    <div className={PRODUCT_CLASS_NAMES.heroArtwork} aria-hidden="true">
                        <Image
                            src="/images/nivo-unicorn-responsibility-transparent-v18.png"
                            alt=""
                            width={1536}
                            height={1024}
                            priority
                            sizes="(max-width: 768px) 88vw, 38vw"
                        />
                    </div>
                    <div className={PRODUCT_CLASS_NAMES.heroResponsibility}>
                        <span>
                            <NivoIcon props={{ name: "complete", usage: "heading" }} />
                        </span>
                        <small>{t("systemOfResponsibility.hero.visual.owner")}</small>
                        <strong>{t("systemOfResponsibility.hero.visual.responsibility")}</strong>
                    </div>
                    <ol
                        className={PRODUCT_CLASS_NAMES.heroSteps}
                        aria-label={t("systemOfResponsibility.hero.visual.stepsLabel")}
                    >
                        {ASSURANCE_STEPS.map((step) => (
                            <li key={step.key}>
                                <span>{step.index}</span>
                                <strong>{t(`systemOfResponsibility.hero.visual.steps.${step.key}`)}</strong>
                            </li>
                        ))}
                    </ol>
                </div>
                {signal}
            </aside>
        )
    }

    if (props.page === "applications") {
        return (
            <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={signalLabel}>
                <div className={PRODUCT_CLASS_NAMES.heroGallery}>
                    {APPLICATION_GALLERY.map((card, index) => (
                        <figure className={PRODUCT_CLASS_NAMES.heroGalleryCard} key={card.key}>
                            <Image
                                src={card.src}
                                alt=""
                                width={1536}
                                height={1152}
                                priority={index < 2}
                                sizes="(max-width: 768px) 42vw, 18vw"
                            />
                            <figcaption>
                                <span>0{index + 1}</span>
                                {t(`applications.hero.visual.gallery.${card.key}`)}
                            </figcaption>
                        </figure>
                    ))}
                </div>
                {signal}
            </aside>
        )
    }

    return (
        <aside className={PRODUCT_CLASS_NAMES.heroVisual} aria-label={signalLabel}>
            {signal}
        </aside>
    )
}

const badgeTone = (tone: string): "neutral" | "accent" | "warning" | "success" => {
    if (tone === "accent" || tone === "warning" || tone === "success") return tone
    return "neutral"
}

const renderAction = (action: ActionStructure, label: string, href: Href) => {
    if (action.activation === true) {
        return (
            <div key={action.key}>
                {ACTIVATION_LINK === null ? (
                    <Button variant={action.appearance === "primary" ? "primary" : "secondary"} isDisabled>
                        {label}
                    </Button>
                ) : (
                    <Button
                        href={href(ACTIVATION_LINK.href)}
                        variant={action.appearance === "primary" ? "primary" : "secondary"}
                    >
                        {label}
                    </Button>
                )}
            </div>
        )
    }

    if (action.href === undefined) return null
    const target = href(action.href)
    if (action.appearance === "link")
        return (
            <TextAction
                href={target}
                appearance="route"
                endContent={<NivoIcon props={{ name: "next", usage: "chip" }} />}
                key={action.key}
            >
                {label}
            </TextAction>
        )

    const variant =
        action.appearance === "primary" ? "primary" : action.appearance === "tertiary" ? "tertiary" : "secondary"
    return (
        <Button href={target} variant={variant} key={action.key}>
            {label}
        </Button>
    )
}

const renderCards = (block: Extract<BlockStructure, { kind: "cards" }>, ctx: BlockContext) => {
    const { t } = ctx
    return (
        <div className={productGridClassName(block.columns)}>
            {block.items.map((item, index) => (
                <article
                    className={item.strong === true ? PRODUCT_CLASS_NAMES.conceptStrong : PRODUCT_CLASS_NAMES.concept}
                    id={item.anchor}
                    key={item.key}
                >
                    <span className={PRODUCT_CLASS_NAMES.conceptIcon} aria-hidden="true">
                        <NivoIcon props={{ name: CARD_ICONS[index % CARD_ICONS.length]!, usage: "heading" }} />
                    </span>
                    {item.labelled === true ? (
                        <Text as="p" size="xs" tone="accent" weight="semibold">
                            {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${item.key}.label`)}
                        </Text>
                    ) : null}
                    <Heading level={3}>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${item.key}.title`)}
                    </Heading>
                    <Text as="p" size="sm" tone="muted">
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${item.key}.body`)}
                    </Text>
                </article>
            ))}
        </div>
    )
}

const renderFlow = (block: Extract<BlockStructure, { kind: "flow" }>, ctx: BlockContext) => {
    const { t } = ctx
    const flowStyle = { "--product-flow-count": block.steps.length } as CSSProperties
    const steps = block.steps.map((step) => ({
        key: step,
        label: t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.steps.${step}.label`),
        description: t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.steps.${step}.description`),
    }))
    return (
        <figure>
            <ol
                className={PRODUCT_CLASS_NAMES.flow}
                aria-label={t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.label`)}
                style={flowStyle}
            >
                {steps.map((step) => (
                    <li className={PRODUCT_CLASS_NAMES.flowStep} key={step.key}>
                        <span className={PRODUCT_CLASS_NAMES.flowNode} aria-hidden="true" />
                        <span className={PRODUCT_CLASS_NAMES.flowCopy}>
                            <Text as="span" size="sm" weight="semibold">
                                {step.label}
                            </Text>
                            <Text as="span" size="xs" tone="muted">
                                {step.description}
                            </Text>
                        </span>
                    </li>
                ))}
            </ol>
            <figcaption className={PRODUCT_CLASS_NAMES.screenReaderOnly}>
                {steps.map((step) => `${step.label}: ${step.description}`).join("; ")}
            </figcaption>
        </figure>
    )
}

const renderTable = (block: Extract<BlockStructure, { kind: "table" }>, ctx: BlockContext) => {
    const { t } = ctx
    return (
        <div className={PRODUCT_CLASS_NAMES.tableFrame}>
            <table className={PRODUCT_CLASS_NAMES.table}>
                <caption className={PRODUCT_CLASS_NAMES.screenReaderOnly}>
                    {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.label`)}
                </caption>
                <thead>
                    <tr>
                        {block.headers.map((header) => (
                            <th scope="col" key={header}>
                                {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.headers.${header}`)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {block.rows.map((row) => (
                        <tr key={row}>
                            {block.headers.map((header, cellIndex) => {
                                const cell = t(
                                    `${ctx.page}.sections.${ctx.section.key}.${block.key}.rows.${row}.${header}`,
                                )
                                return cellIndex === 0 && block.headers.length > 2 ? (
                                    <th scope="row" key={header}>
                                        {cell}
                                    </th>
                                ) : (
                                    <td key={header}>{cell}</td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const renderOffers = (block: Extract<BlockStructure, { kind: "offers" }>, ctx: BlockContext) => {
    const { t } = ctx
    return (
        <div className={PRODUCT_CLASS_NAMES.offerGrid}>
            {block.items.map((offer) => (
                <article className={productOfferClassName(offer.featured === true)} key={offer.key}>
                    <div className={PRODUCT_CLASS_NAMES.truthLine}>
                        <Badge tone={offer.featured === true ? "accent" : "neutral"}>
                            {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.state`)}
                        </Badge>
                        <Text as="span" size="xs" tone="muted">
                            {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.detail`)}
                        </Text>
                    </div>
                    <Text as="p" size="xs" tone="accent" weight="semibold">
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.label`)}
                    </Text>
                    <Heading level={3}>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.title`)}
                    </Heading>
                    <span className={PRODUCT_CLASS_NAMES.price}>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.price`)}
                    </span>
                    <Text as="p" size="sm">
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.period`)}
                    </Text>
                    <Text as="p" size="sm" tone="muted">
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.body`)}
                    </Text>
                    <ul className={PRODUCT_CLASS_NAMES.semanticList}>
                        {offer.bullets.map((bullet) => (
                            <li key={bullet}>
                                {t(
                                    `${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.bullets.${bullet}`,
                                )}
                            </li>
                        ))}
                    </ul>
                    {renderAction(
                        { ...offer.action, key: `${offer.key}-action` },
                        t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.action`),
                        ctx.href,
                    )}
                    <span className={PRODUCT_CLASS_NAMES.priceQualifier}>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${offer.key}.qualifier`)}
                    </span>
                </article>
            ))}
        </div>
    )
}

const renderPaths = (block: Extract<BlockStructure, { kind: "paths" }>, ctx: BlockContext) => {
    const { t } = ctx
    return (
        <div className={PRODUCT_CLASS_NAMES.pathGrid}>
            {block.items.map((path, index) => (
                <article className={PRODUCT_CLASS_NAMES.path} key={path.key}>
                    <span className={PRODUCT_CLASS_NAMES.pathIndex}>0{index + 1}</span>
                    <Text as="p" size="xs" tone="accent" weight="semibold">
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${path.key}.label`)}
                    </Text>
                    <Heading level={3}>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${path.key}.title`)}
                    </Heading>
                    <Text as="p" size="sm" tone="muted">
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${path.key}.body`)}
                    </Text>
                    {renderAction(
                        { key: `${path.key}-path`, href: path.href, activation: path.activation, appearance: "link" },
                        t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${path.key}.action`),
                        ctx.href,
                    )}
                </article>
            ))}
        </div>
    )
}

const renderBlock = (block: BlockStructure, ctx: BlockContext) => {
    const { t } = ctx
    if (block.kind === "cards") return <div key={block.key}>{renderCards(block, ctx)}</div>
    if (block.kind === "flow") return <div key={block.key}>{renderFlow(block, ctx)}</div>
    if (block.kind === "table") return <div key={block.key}>{renderTable(block, ctx)}</div>
    if (block.kind === "offers") return <div key={block.key}>{renderOffers(block, ctx)}</div>
    if (block.kind === "paths") return <div key={block.key}>{renderPaths(block, ctx)}</div>
    if (block.kind === "status")
        return (
            <div className={PRODUCT_CLASS_NAMES.truthLine} key={block.key}>
                <Badge tone={badgeTone(block.tone)}>
                    {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.label`)}
                </Badge>
                <Text as="span" size="xs" tone="muted">
                    {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.detail`)}
                </Text>
            </div>
        )
    if (block.kind === "note")
        return (
            <Heading level={3} key={block.key}>
                {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.text`)}
            </Heading>
        )
    if (block.kind === "actions")
        return (
            <div className={PRODUCT_CLASS_NAMES.actionRow} key={block.key}>
                {block.items.map((action) =>
                    renderAction(
                        action,
                        t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${action.key}`),
                        ctx.href,
                    ),
                )}
            </div>
        )
    if (block.kind === "selector")
        return (
            <nav
                className={PRODUCT_CLASS_NAMES.selector}
                aria-label={t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.label`)}
                key={block.key}
            >
                {block.items.map((item) => (
                    <a className={PRODUCT_CLASS_NAMES.selectorLink} href={ctx.href(item.href)} key={item.key}>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${item.key}`)}
                    </a>
                ))}
            </nav>
        )
    return (
        <div className={PRODUCT_CLASS_NAMES.faq} key={block.key}>
            {block.items.map((item) => (
                <details className={PRODUCT_CLASS_NAMES.faqItem} key={item}>
                    <summary>
                        {t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${item}.question`)}
                    </summary>
                    <div>{t(`${ctx.page}.sections.${ctx.section.key}.${block.key}.items.${item}.answer`)}</div>
                </details>
            ))}
        </div>
    )
}

/** One canonical server-rendered product page selected by the route adapter. */
export const ProductPage = (props: ProductPageProps) => {
    const t = useTranslations("product")
    const locale = useLocale()
    const href = useLocalizedHref()
    const structure = PRODUCT_PAGES[props.page]
    const page = props.page

    const structuredData = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: t(`${page}.metadata.title`),
        description: t(`${page}.metadata.description`),
        url: `${PUBLIC_SITE_URL}${href(structure.path)}`,
        inLanguage: locale,
        isPartOf: { "@id": `${PUBLIC_SITE_URL}/#website` },
        publisher: { "@id": `${PUBLIC_SITE_URL}/#organization` },
    }).replaceAll("<", "\\u003c")

    const signal = (
        <div className={PRODUCT_CLASS_NAMES.heroSignal}>
            <Text as="p" size="xs" tone="accent" weight="semibold">
                {t(`${page}.hero.signalLabel`)}
            </Text>
            <span className={PRODUCT_CLASS_NAMES.heroSignalValue}>{t(`${page}.hero.signalValue`)}</span>
            <span className={PRODUCT_CLASS_NAMES.heroSignalNote}>{t(`${page}.hero.signalNote`)}</span>
        </div>
    )

    return (
        <SiteMain>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
            <div className={PRODUCT_CLASS_NAMES.page} data-product-page={structure.slug}>
                <section className={PRODUCT_CLASS_NAMES.hero} aria-labelledby="product-page-title">
                    <PageContainer className={PRODUCT_CLASS_NAMES.heroInner}>
                        <div className={PRODUCT_CLASS_NAMES.heroCopy}>
                            <Text as="p" size="xs" tone="accent" weight="semibold">
                                {t(`${page}.hero.eyebrow`)}
                            </Text>
                            <Heading level={1} scale="display">
                                <span id="product-page-title">{t(`${page}.hero.title`)}</span>
                            </Heading>
                            {structure.hero.descriptor ? (
                                <Text as="p" size="sm" weight="semibold">
                                    {t(`${page}.hero.descriptor`)}
                                </Text>
                            ) : null}
                            <Text as="p" size="md" tone="muted">
                                {t(`${page}.hero.supporting`)}
                            </Text>
                            {structure.hero.philosophy ? (
                                <Text as="p" size="sm" weight="semibold">
                                    {t(`${page}.hero.philosophy`)}
                                </Text>
                            ) : null}
                            <div className={PRODUCT_CLASS_NAMES.actionRow}>
                                {structure.hero.actions.map((action) =>
                                    renderAction(action, t(`${page}.hero.actions.${action.key}`), href),
                                )}
                            </div>
                        </div>
                        <ProductHeroVisual page={page} t={t} signal={signal} />
                    </PageContainer>
                </section>

                {structure.sections.map((section) => {
                    const inverse = section.tone === "dark" || section.tone === "crimson"
                    const ctx: BlockContext = { t, href, page, section }
                    return (
                        <section
                            className={productSectionClassName(section.tone)}
                            data-product-section={section.id}
                            aria-labelledby={section.id}
                            key={section.id}
                        >
                            <PageContainer>
                                <SectionIntro
                                    id={section.id}
                                    eyebrow={t(`${page}.sections.${section.key}.eyebrow`)}
                                    title={t(`${page}.sections.${section.key}.title`)}
                                    description={
                                        section.description
                                            ? t(`${page}.sections.${section.key}.description`)
                                            : undefined
                                    }
                                    inverse={inverse}
                                />
                                <div className={PRODUCT_CLASS_NAMES.sectionBody}>
                                    {section.blocks.map((block) => renderBlock(block, ctx))}
                                </div>
                            </PageContainer>
                        </section>
                    )
                })}
            </div>
        </SiteMain>
    )
}
