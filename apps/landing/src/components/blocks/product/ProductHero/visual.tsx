import Image from "next/image"
import { MediaFrame, Text, Timeline } from "@starci/grammar/common"
import type { ProductHeroCopy } from "./copy"
import { ProductHeroSignal } from "./signal"
import { NivoIcon } from "@nivo/ui"
import type { ProductPageId } from "../../../../modules/product/types"
import {
    PRODUCT_HERO_CLASS_NAMES as styles,
    productHeroCanvasClassName,
    productHeroGalleryCardClassName,
    productHeroNodeClassName,
} from "./classNames"

type ProductHeroVisualProps = { readonly page: ProductPageId; readonly copy: ProductHeroCopy }

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

/** Draw the product illustration from resolved sentences and a closed page identity. */
export const ProductHeroVisual = (props: ProductHeroVisualProps) => {
    const { page, copy } = props
    const signalLabel = copy.signalLabel
    const signal = <ProductHeroSignal copy={copy} />

    if (page === "nivoOs") {
        return (
            <aside className={styles.visual} aria-label={signalLabel}>
                <div className={productHeroCanvasClassName(page)}>
                    <div className={styles.orbit} aria-hidden="true" />
                    <div className={styles.core}>
                        <div className={styles.coreIcon}>
                            <NivoIcon props={{ name: "agentos", usage: "heading" }} />
                        </div>
                        <strong className={styles.coreName}>{copy.coreName}</strong>
                        <small className={styles.coreLabel}>{copy.coreLabel}</small>
                    </div>
                    <Timeline
                        className={styles.nodes}
                        label={copy.nodesLabel}
                        items={OPERATING_NODES.map((node, index) => ({
                            id: node.key,
                            title: (
                                <strong className={productHeroNodeClassName(index)}>
                                    <Text
                                        as="span"
                                        size="xs"
                                        weight="semibold"
                                        startContent={<NivoIcon props={node.iconProps} />}
                                    >
                                        {copy.nodes[node.key]}
                                    </Text>
                                </strong>
                            ),
                        }))}
                    />
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
                            sizes="(max-width: 48rem) 88vw, 38vw"
                        />
                    </div>
                    <div className={styles.responsibility}>
                        <div className={styles.responsibilityIcon}>
                            <NivoIcon props={{ name: "complete", usage: "heading" }} />
                        </div>
                        <small className={styles.responsibilityMuted}>{copy.owner}</small>
                        <strong className={styles.responsibilityTitle}>{copy.responsibility}</strong>
                    </div>
                    <Timeline
                        className={styles.steps}
                        label={copy.stepsLabel}
                        items={ASSURANCE_STEPS.map((step) => ({
                            id: step.key,
                            title: (
                                <strong className={styles.step}>
                                    <small className={styles.stepIndex}>
                                        <Text as="span" size="xs">
                                            {step.index}
                                        </Text>
                                    </small>
                                    <strong className={styles.stepTitle}>{copy.steps[step.key]}</strong>
                                </strong>
                            ),
                        }))}
                    />
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
                        <MediaFrame
                            className={productHeroGalleryCardClassName(index)}
                            key={card.key}
                            treatment="plain"
                            aspect="auto"
                            caption={
                                <div className={styles.galleryCaption}>
                                    <div className={styles.galleryIndex}>
                                        <Text as="span" size="xs">
                                            0{index + 1}
                                        </Text>
                                    </div>
                                    <Text as="span" size="sm">
                                        {copy.gallery[card.key]}
                                    </Text>
                                </div>
                            }
                        >
                            <Image
                                className={styles.galleryImage}
                                src={card.src}
                                alt=""
                                width={1536}
                                height={1152}
                                priority={index < 2}
                                sizes="(max-width: 48rem) 42vw, 18vw"
                            />
                        </MediaFrame>
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
