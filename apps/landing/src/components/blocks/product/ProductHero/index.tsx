import Image from "next/image"
import { Heading, PageContainer, Text } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import type {
    ProductActionRenderer,
    ProductHref,
    ProductPageId,
    ProductPageStructure,
    ProductTranslate,
} from "../../../../modules/product/types"
import {
    PRODUCT_HERO_CLASS_NAMES as styles,
    productHeroCanvasClassName,
    productHeroGalleryCardClassName,
    productHeroNodeClassName,
    productHeroRootClassName,
} from "./classNames"

type ProductHeroProps = {
    readonly page: ProductPageId
    readonly structure: ProductPageStructure
    readonly t: ProductTranslate
    readonly href: ProductHref
    readonly renderAction: ProductActionRenderer
}

const OPERATING_NODES = [
    { key: "businessIntent", iconProps: { name: "overview", usage: "chip" } },
    { key: "humanLeads", iconProps: { name: "account", usage: "chip" } },
    { key: "aiOperates", iconProps: { name: "agentos", usage: "chip" } },
    { key: "outcomeVerified", iconProps: { name: "complete", usage: "chip" } },
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

const ProductHeroSignal = ({ page, t }: Pick<ProductHeroProps, "page" | "t">) => (
    <div className={styles.signal}>
        <div className={styles.signalLabel}>
            <Text as="p" size="xs" tone="accent" weight="semibold">
                {t(`${page}.hero.signalLabel`)}
            </Text>
        </div>
        <span className={styles.signalValue}>{t(`${page}.hero.signalValue`)}</span>
        <span className={styles.signalNote}>{t(`${page}.hero.signalNote`)}</span>
    </div>
)

const ProductHeroVisual = ({ page, t }: Pick<ProductHeroProps, "page" | "t">) => {
    const signalLabel = t(`${page}.hero.signalLabel`)
    const signal = <ProductHeroSignal page={page} t={t} />

    if (page === "nivoOs") {
        return (
            <aside className={styles.visual} aria-label={signalLabel}>
                <div className={productHeroCanvasClassName(page)}>
                    <span className={styles.orbit} aria-hidden="true" />
                    <div className={styles.core}>
                        <span className={styles.coreIcon}>
                            <NivoIcon props={{ name: "agentos", usage: "heading" }} />
                        </span>
                        <strong className={styles.coreName}>{t("nivoOs.hero.visual.coreName")}</strong>
                        <small className={styles.coreLabel}>{t("nivoOs.hero.visual.coreLabel")}</small>
                    </div>
                    <ul className={styles.nodes} aria-label={t("nivoOs.hero.visual.nodesLabel")}>
                        {OPERATING_NODES.map((node, index) => (
                            <li className={productHeroNodeClassName(index)} key={node.key}>
                                <span className={styles.nodeIcon}>
                                    <NivoIcon props={node.iconProps} />
                                </span>
                                <span>{t(`nivoOs.hero.visual.nodes.${node.key}`)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {signal}
            </aside>
        )
    }

    if (page === "systemOfResponsibility") {
        return (
            <aside className={styles.visual} aria-label={signalLabel}>
                <div className={productHeroCanvasClassName(page)}>
                    <div className={styles.artwork} aria-hidden="true">
                        <Image
                            className={styles.artworkImage}
                            src="/images/nivo-unicorn-responsibility-transparent-v18.png"
                            alt=""
                            width={1536}
                            height={1024}
                            priority
                            sizes="(max-width: 768px) 88vw, 38vw"
                        />
                    </div>
                    <div className={styles.responsibility}>
                        <span className={styles.responsibilityIcon}>
                            <NivoIcon props={{ name: "complete", usage: "heading" }} />
                        </span>
                        <small className={styles.responsibilityMuted}>
                            {t("systemOfResponsibility.hero.visual.owner")}
                        </small>
                        <strong className={styles.responsibilityTitle}>
                            {t("systemOfResponsibility.hero.visual.responsibility")}
                        </strong>
                    </div>
                    <ol className={styles.steps} aria-label={t("systemOfResponsibility.hero.visual.stepsLabel")}>
                        {ASSURANCE_STEPS.map((step) => (
                            <li className={styles.step} key={step.key}>
                                <span className={styles.stepIndex}>{step.index}</span>
                                <strong className={styles.stepTitle}>
                                    {t(`systemOfResponsibility.hero.visual.steps.${step.key}`)}
                                </strong>
                            </li>
                        ))}
                    </ol>
                </div>
                {signal}
            </aside>
        )
    }

    if (page === "applications") {
        return (
            <aside className={styles.visual} aria-label={signalLabel}>
                <div className={styles.gallery}>
                    {APPLICATION_GALLERY.map((card, index) => (
                        <figure
                            className={productHeroGalleryCardClassName(index)}
                            key={card.key}
                        >
                            <Image
                                className={styles.galleryImage}
                                src={card.src}
                                alt=""
                                width={1536}
                                height={1152}
                                priority={index < 2}
                                sizes="(max-width: 768px) 42vw, 18vw"
                            />
                            <figcaption className={styles.galleryCaption}>
                                <span className={styles.galleryIndex}>0{index + 1}</span>
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
        <aside className={styles.visual} aria-label={signalLabel}>
            {signal}
        </aside>
    )
}

/** Product hero unites page copy, actions, and its product-specific visual. */
export const ProductHero = (props: ProductHeroProps) => {
    const { page, structure, t, href, renderAction } = props
    return (
        <section className={productHeroRootClassName(page)} aria-labelledby="product-page-title">
            <PageContainer className={styles.inner}>
                <div className={styles.copy}>
                <div className={styles.eyebrow}>
                    <Text as="p" size="xs" tone="accent" weight="semibold">
                        {t(`${page}.hero.eyebrow`)}
                    </Text>
                </div>
                <div className={styles.title}>
                    <Heading level={1} scale="display">
                        <span id="product-page-title">{t(`${page}.hero.title`)}</span>
                    </Heading>
                </div>
                {structure.hero.descriptor ? (
                    <Text as="p" size="sm" weight="semibold">
                        {t(`${page}.hero.descriptor`)}
                    </Text>
                ) : null}
                <div className={styles.supporting}>
                    <Text as="p" size="md" tone="muted">
                        {t(`${page}.hero.supporting`)}
                    </Text>
                </div>
                {structure.hero.philosophy ? (
                    <Text as="p" size="sm" weight="semibold">
                        {t(`${page}.hero.philosophy`)}
                    </Text>
                ) : null}
                    <div className={styles.actionRow}>
                        {structure.hero.actions.map((action) =>
                            renderAction(action, t(`${page}.hero.actions.${action.key}`), href),
                        )}
                    </div>
                </div>
                <ProductHeroVisual page={page} t={t} />
            </PageContainer>
        </section>
    )
}
