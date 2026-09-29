import type { BlockStructure, ProductBlockContext } from "@/modules/product/types"
import { productSelectorClassName, productSelectorLinkClassName } from "./classNames"

type ProductSelectorProps = {
    readonly block: Extract<BlockStructure, { kind: "selector" }>
    readonly context: ProductBlockContext
}

/** Product selectors link between related choices in a page section. */
export const ProductSelector = (props: ProductSelectorProps) => {
    const { block, context } = props
    return (
    <nav
        className={productSelectorClassName(context)}
        aria-label={context.t(context.page + ".sections." + context.section.key + "." + block.key + ".label")}
    >
        {block.items.map((item, index) => (
            <a
                className={productSelectorLinkClassName(context, index)}
                href={context.href(item.href)}
                key={item.key}
            >
                {context.t(
                    context.page +
                        ".sections." +
                        context.section.key +
                        "." +
                        block.key +
                        ".items." +
                        item.key,
                )}
            </a>
        ))}
    </nav>
    )
}
