import { Badge, Heading, Text } from "@starci/grammar/common"
import type {
    BlockStructure,
    ProductActionRenderer,
    ProductBlockContext,
} from "../../../../modules/product/types"
import { PRODUCT_OFFERS_CLASS_NAMES as styles, productOfferClassName } from "./classNames"

type ProductOffersProps = {
    readonly block: Extract<BlockStructure, { kind: "offers" }>
    readonly context: ProductBlockContext
    readonly renderAction: ProductActionRenderer
}

/** Product offer cards distinguish the current offer from later growth options. */
export const ProductOffers = (props: ProductOffersProps) => {
    const { block, context, renderAction } = props
    const t = context.t
    return (
        <div className={styles.grid}>
        {block.items.map((offer) => (
            <article className={productOfferClassName(offer.featured === true)} key={offer.key}>
                <div className={styles.truthLine}>
                    <Badge tone={offer.featured === true ? "accent" : "neutral"}>
                        {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.state`)}
                    </Badge>
                    <Text as="span" size="xs" tone="muted">
                        {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.detail`)}
                    </Text>
                </div>
                <Text as="p" size="xs" tone="accent" weight="semibold">
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.label`)}
                </Text>
                <Heading level={3}>
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.title`)}
                </Heading>
                <span className={styles.price}>
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.price`)}
                </span>
                <Text as="p" size="sm">
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.period`)}
                </Text>
                <div className={styles.body}>
                    <Text as="p" size="sm" tone="muted">
                        {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.body`)}
                    </Text>
                </div>
                <ul className={styles.semanticList}>
                    {offer.bullets.map((bullet) => (
                        <li className={styles.semanticListItem} key={bullet}>
                            {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.bullets.${bullet}`)}
                        </li>
                    ))}
                </ul>
                {renderAction(
                    { ...offer.action, key: offer.key + "-action" },
                    t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.action`),
                    context.href,
                )}
                <span className={styles.priceQualifier}>
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${offer.key}.qualifier`)}
                </span>
            </article>
        ))}
        </div>
    )
}
