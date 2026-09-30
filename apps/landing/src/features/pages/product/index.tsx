import { useLocale, useTranslations } from "next-intl"
import { Button, TextAction } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import { ProductCards } from "../../../components/blocks/product/ProductCards"
import { ProductFaq } from "../../../components/blocks/product/ProductFaq"
import { ProductFlow } from "../../../components/blocks/product/ProductFlow"
import { ProductHero } from "../../../components/blocks/product/ProductHero"
import { ProductNote } from "../../../components/blocks/product/ProductNote"
import { ProductOffers } from "../../../components/blocks/product/ProductOffers"
import { ProductPaths } from "../../../components/blocks/product/ProductPaths"
import { ProductSection } from "../../../components/blocks/product/ProductSection"
import { PRODUCT_SECTION_CLASS_NAMES } from "../../../components/blocks/product/ProductSection/classNames"
import { ProductSelector } from "../../../components/blocks/product/ProductSelector"
import { ProductStatus } from "../../../components/blocks/product/ProductStatus"
import { ProductTable } from "../../../components/blocks/product/ProductTable"
import { SectionIntro, SiteMain } from "@/features/layouts/SiteShell"
import { useLocalizedHref } from "@/hooks"
import { ACTIVATION_LINK, PUBLIC_SITE_URL } from "@/modules/landing/site"
import {
    PRODUCT_PAGES,
    type BlockStructure,
    type ProductPageId,
    type ProductActionRenderer,
    type ProductBlockContext,
} from "../../../modules/product"
import { PRODUCT_PAGE_CLASS_NAMES } from "./classNames"

type ProductPageProps = {
    readonly page: ProductPageId
}

type ProductBlockProps = {
    readonly block: BlockStructure
    readonly context: ProductBlockContext
    readonly renderAction: ProductActionRenderer
}

const renderProductAction: ProductActionRenderer = (action, label, href) => {
    if (action.activation === true) {
        return ACTIVATION_LINK === null ? (
            <div key={action.key}>
                <Button variant={action.appearance === "primary" ? "primary" : "secondary"} isDisabled>
                    {label}
                </Button>
            </div>
        ) : (
            <div key={action.key}>
                <Button
                    href={href(ACTIVATION_LINK.href)}
                    variant={action.appearance === "primary" ? "primary" : "secondary"}
                >
                    {label}
                </Button>
            </div>
        )
    }

    if (action.href === undefined) return null
    const target = href(action.href)
    if (action.appearance === "link") {
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
    }

    const variant =
        action.appearance === "primary" ? "primary" : action.appearance === "tertiary" ? "tertiary" : "secondary"
    return (
        <Button href={target} variant={variant} key={action.key}>
            {label}
        </Button>
    )
}

const ProductBlock = (props: ProductBlockProps) => {
    const { block, context, renderAction } = props
    const t = context.t
    if (block.kind === "cards")
        return (
            <div className={PRODUCT_SECTION_CLASS_NAMES.block} key={block.key}>
                <ProductCards block={block} context={context} />
            </div>
        )
    if (block.kind === "flow")
        return (
            <div className={PRODUCT_SECTION_CLASS_NAMES.block} key={block.key}>
                <ProductFlow block={block} context={context} />
            </div>
        )
    if (block.kind === "table")
        return (
            <div className={PRODUCT_SECTION_CLASS_NAMES.block} key={block.key}>
                <ProductTable block={block} context={context} />
            </div>
        )
    if (block.kind === "offers")
        return (
            <div className={PRODUCT_SECTION_CLASS_NAMES.block} key={block.key}>
                <ProductOffers block={block} context={context} renderAction={renderAction} />
            </div>
        )
    if (block.kind === "paths")
        return (
            <div className={PRODUCT_SECTION_CLASS_NAMES.block} key={block.key}>
                <ProductPaths block={block} context={context} renderAction={renderAction} />
            </div>
        )
    if (block.kind === "status") return <ProductStatus key={block.key} block={block} context={context} />
    if (block.kind === "note") return <ProductNote key={block.key} block={block} context={context} />
    if (block.kind === "actions")
        return (
            <div className={PRODUCT_PAGE_CLASS_NAMES.actions} key={block.key}>
                {block.items.map((action) =>
                    renderAction(
                        action,
                        t(`${context.page}.sections.${context.section.key}.${block.key}.items.${action.key}`),
                        context.href,
                    ),
                )}
            </div>
        )
    if (block.kind === "selector") return <ProductSelector key={block.key} block={block} context={context} />
    return <ProductFaq key={block.key} block={block} context={context} />
}

/** A single localized page joins its product structure to the visual blocks. */
export const ProductPage = (props: ProductPageProps) => {
    const { page } = props
    const t = useTranslations("product")
    const locale = useLocale()
    const href = useLocalizedHref()
    const structure = PRODUCT_PAGES[page]

    const structuredData = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: t(`${page}.metadata.title`),
        description: t(`${page}.metadata.description`),
        url: PUBLIC_SITE_URL + href(structure.path),
        inLanguage: locale,
        isPartOf: { "@id": PUBLIC_SITE_URL + "/#website" },
        publisher: { "@id": PUBLIC_SITE_URL + "/#organization" },
    }).replaceAll("<", "\\u003c")

    return (
        <SiteMain>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
            <div className={PRODUCT_PAGE_CLASS_NAMES.root} data-product-page={structure.slug}>
                <ProductHero
                    page={page}
                    structure={structure}
                    t={t}
                    href={href}
                    renderAction={renderProductAction}
                />
                {structure.sections.map((section) => {
                    const context: ProductBlockContext = { t, href, page, section }
                    const inverse = section.tone === "dark" || section.tone === "crimson"
                    return (
                        <ProductSection
                            key={section.id}
                            section={section}
                            context={context}
                            intro={
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
                            }
                        >
                            {section.blocks.map((block) => (
                                <ProductBlock
                                    key={block.key}
                                    block={block}
                                    context={context}
                                    renderAction={renderProductAction}
                                />
                            ))}
                        </ProductSection>
                    )
                })}
            </div>
        </SiteMain>
    )
}
