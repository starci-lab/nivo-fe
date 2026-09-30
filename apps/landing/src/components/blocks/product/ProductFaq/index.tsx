import type { BlockStructure, ProductBlockContext } from "../../../../modules/product/types"
import { PRODUCT_FAQ_CLASS_NAMES as styles } from "./classNames"

type ProductFaqProps = {
    readonly block: Extract<BlockStructure, { kind: "faq" }>
    readonly context: ProductBlockContext
}

/** Product FAQs keep each answer available through native disclosure controls. */
export const ProductFaq = (props: ProductFaqProps) => {
    const { block, context } = props
    const t = context.t
    return (
    <div className={styles.list}>
        {block.items.map((item) => (
            <details className={styles.item} key={item}>
                <summary className={styles.summary}>
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${item}.question`)}
                </summary>
                <div className={styles.answer}>
                    {t(`${context.page}.sections.${context.section.key}.${block.key}.items.${item}.answer`)}
                </div>
            </details>
        ))}
    </div>
    )
}
