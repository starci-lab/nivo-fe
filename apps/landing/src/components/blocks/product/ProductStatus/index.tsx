import { Badge, Text } from "@starci/grammar/common"
import type { BlockStructure, ProductBlockContext } from "../../../../modules/product/types"
import { productStatusClassName } from "./classNames"

type ProductStatusProps = {
    readonly block: Extract<BlockStructure, { kind: "status" }>
    readonly context: ProductBlockContext
}

const badgeTone = (tone: string): "neutral" | "accent" | "warning" | "success" => {
    if (tone === "accent" || tone === "warning" || tone === "success") return tone
    return "neutral"
}

/** Product status pairs a concise state badge with its supporting detail. */
export const ProductStatus = (props: ProductStatusProps) => {
    const { block, context } = props
    return (
    <div className={productStatusClassName(context)}>
        <Badge tone={badgeTone(block.tone)}>
            {context.t(context.page + ".sections." + context.section.key + "." + block.key + ".label")}
        </Badge>
        <Text as="span" size="xs" tone="muted">
            {context.t(context.page + ".sections." + context.section.key + "." + block.key + ".detail")}
        </Text>
    </div>
    )
}
