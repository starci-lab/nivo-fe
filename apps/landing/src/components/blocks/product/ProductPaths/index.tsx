import { Heading, Text } from "@starci/grammar/common"
import type {
    BlockStructure,
    ProductActionRenderer,
    ProductBlockContext,
} from "@/modules/product/types"
import { PRODUCT_PATHS_CLASS_NAMES as styles, productPathClassName } from "./classNames"

type ProductPathsProps = {
    readonly block: Extract<BlockStructure, { kind: "paths" }>
    readonly context: ProductBlockContext
    readonly renderAction: ProductActionRenderer
}

/** Directional product paths keep the route choices separate from the current offer. */
export const ProductPaths = (props: ProductPathsProps) => {
    const { block, context, renderAction } = props
    return (
        <div className={styles.grid}>
        {block.items.map((path, index) => (
            <article className={productPathClassName(context)} key={path.key}>
                <span className={styles.pathIndex}>0{index + 1}</span>
                <Text as="p" size="xs" tone="accent" weight="semibold">
                    {context.t(
                        context.page +
                            ".sections." +
                            context.section.key +
                            "." +
                            block.key +
                            ".items." +
                            path.key +
                            ".label",
                    )}
                </Text>
                <Heading level={3}>
                    {context.t(
                        context.page +
                            ".sections." +
                            context.section.key +
                            "." +
                            block.key +
                            ".items." +
                            path.key +
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
                                path.key +
                                ".body",
                        )}
                    </Text>
                </div>
                <div className={styles.action}>
                    {renderAction(
                        {
                            key: path.key + "-path",
                            href: path.href,
                            activation: path.activation,
                            appearance: "link",
                        },
                        context.t(
                            context.page +
                                ".sections." +
                                context.section.key +
                                "." +
                                block.key +
                                ".items." +
                                path.key +
                                ".action",
                        ),
                        context.href,
                    )}
                </div>
            </article>
        ))}
        </div>
    )
}
