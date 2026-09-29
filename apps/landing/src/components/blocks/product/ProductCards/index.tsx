import { Heading, Text } from "@starci/grammar/common"
import { NivoIcon } from "@nivo/ui"
import type { BlockStructure, ProductBlockContext } from "../../../../modules/product/types"
import {
    PRODUCT_CARDS_CLASS_NAMES as styles,
    productCardClassName,
    productCardIconClassName,
    productCardsGridClassName,
} from "./classNames"

type ProductCardsProps = {
    readonly block: Extract<BlockStructure, { kind: "cards" }>
    readonly context: ProductBlockContext
}

const CARD_ICONS = ["complete", "agentos", "review", "apps"] as const

/** Product cards present a responsive set of linked or explanatory product capabilities. */
export const ProductCards = (props: ProductCardsProps) => {
    const { block, context } = props
    return (
        <div className={productCardsGridClassName(block.columns, context)}>
            {block.items.map((item, index) => (
                <article
                    className={productCardClassName(context, index, item.strong === true)}
                    id={item.anchor}
                    key={item.key}
                >
                    <span className={productCardIconClassName(context)} aria-hidden="true">
                        <NivoIcon
                            props={{ name: CARD_ICONS[index % CARD_ICONS.length] ?? "complete", usage: "heading" }}
                        />
                    </span>
                    {item.labelled === true ? (
                        <Text as="p" size="xs" tone="accent" weight="semibold">
                            {context.t(
                                context.page +
                                    ".sections." +
                                    context.section.key +
                                    "." +
                                    block.key +
                                    ".items." +
                                    item.key +
                                    ".label",
                            )}
                        </Text>
                    ) : null}
                    <Heading level={3}>
                        {context.t(
                            context.page +
                                ".sections." +
                                context.section.key +
                                "." +
                                block.key +
                                ".items." +
                                item.key +
                                ".title",
                        )}
                    </Heading>
                    <div className={styles.body}>
                        <Text as="p" size="sm" tone="muted">
                            {context.t(
                                context.page +
                                    ".sections." +
                                    context.section.key +
                                    "." +
                                    block.key +
                                    ".items." +
                                    item.key +
                                    ".body",
                            )}
                        </Text>
                    </div>
                </article>
            ))}
        </div>
    )
}
