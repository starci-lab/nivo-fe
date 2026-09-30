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

const CARD_ICON_NAMES = ["complete", "agentos", "review", "apps"] as const
const CARD_ICON_PROPS = {
    complete: { name: "complete", usage: "heading" },
    agentos: { name: "agentos", usage: "heading" },
    review: { name: "review", usage: "heading" },
    apps: { name: "apps", usage: "heading" },
} as const

/** Product cards present a responsive set of linked or explanatory product capabilities. */
export const ProductCards = (props: ProductCardsProps) => {
    const { block, context } = props
    const t = context.t
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
                            props={CARD_ICON_PROPS[CARD_ICON_NAMES[index % CARD_ICON_NAMES.length] ?? "complete"]}
                        />
                    </span>
                    {item.labelled === true ? (
                        <Text as="p" size="xs" tone="accent" weight="semibold">
                            {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${item.key}.label`)}
                        </Text>
                    ) : null}
                    <Heading level={3}>
                        {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${item.key}.title`)}
                    </Heading>
                    <div className={styles.body}>
                        <Text as="p" size="sm" tone="muted">
                            {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${item.key}.body`)}
                        </Text>
                    </div>
                </article>
            ))}
        </div>
    )
}
