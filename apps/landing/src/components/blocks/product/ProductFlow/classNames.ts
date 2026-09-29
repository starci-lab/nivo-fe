import { cn } from "@heroui/react"
import type { ProductBlockContext } from "../../../../modules/product/types"

const inverse = (context: ProductBlockContext) =>
    context.section.tone === "dark" || context.section.tone === "crimson"

/** Timeline columns and focus treatment for each ordered product flow. */
export const productFlowClassName = (context: ProductBlockContext, count: number) =>
    cn(
        "m-0",
        "grid",
        count === 3 ? "grid-cols-3" : count === 4 ? "grid-cols-4" : "grid-cols-5",
        "[counter-reset:product-flow]",
        "list-none",
        "p-0",
        "max-lg:grid-cols-1",
        context.page === "applications" && context.section.id === "current-focus" && "rounded-3xl",
        context.page === "applications" &&
            context.section.id === "current-focus" &&
            "bg-[var(--product-flow-surface-inverse)]",
        context.page === "applications" && context.section.id === "current-focus" && "p-6",
    )

/** Shared step, node, copy, and accessible-only roles in a product timeline. */
export const PRODUCT_FLOW_CLASS_NAMES = {
    step: cn(
        "relative",
        "grid",
        "min-w-0",
        "grid-rows-[auto_1fr]",
        "gap-4",
        "pr-5",
        "[counter-increment:product-flow]",
        "max-lg:grid-cols-[auto_1fr]",
        "max-lg:grid-rows-[auto]",
        "max-lg:gap-4",
        "max-lg:p-0",
        "max-lg:pb-8",
        "after:absolute",
        "after:left-[1.35rem]",
        "after:right-0",
        "after:top-[0.7rem]",
        "after:h-px",
        "after:bg-border",
        "after:content-['']",
        "last:after:content-none",
        "max-lg:after:bottom-0",
        "max-lg:after:left-[0.65rem]",
        "max-lg:after:right-auto",
        "max-lg:after:top-5",
        "max-lg:after:h-auto",
        "max-lg:after:w-px",
    ),
    node: cn(
        "relative",
        "z-[1]",
        "size-[1.35rem]",
        "rounded-full",
        "border-4",
        "border-surface",
        "bg-accent",
        "shadow-[var(--product-flow-node-shadow)]",
        "forced-colors:bg-[Highlight]",
        "after:absolute",
        "after:left-1/2",
        "after:top-1/2",
        "after:-translate-x-1/2",
        "after:-translate-y-1/2",
        "after:text-[0.48rem]",
        "after:font-extrabold",
        "after:text-surface",
        "after:content-[counter(product-flow,decimal-leading-zero)]",
    ),
    nodeInverse: cn("border-background-inverse"),
    nodeCrimson: cn(
        "border-[var(--landing-accent-ink)]",
        "bg-surface",
        "shadow-[var(--product-flow-crimson-node-shadow)]",
    ),
    copy: cn("flex", "flex-col", "gap-[0.4rem]", "leading-[1.55]"),
    screenReaderOnly: cn("sr-only"),
    inverseDivider: cn("after:bg-[var(--product-flow-divider-inverse)]"),
} as const

/** Timeline connector color follows the current section's surface tone. */
export const productFlowStepClassName = (context: ProductBlockContext) =>
    cn(PRODUCT_FLOW_CLASS_NAMES.step, inverse(context) && PRODUCT_FLOW_CLASS_NAMES.inverseDivider)

/** Timeline marker contrast and shadow follow the current section's surface tone. */
export const productFlowNodeClassName = (context: ProductBlockContext) => {
    if (context.section.tone === "crimson") return cn(PRODUCT_FLOW_CLASS_NAMES.node, PRODUCT_FLOW_CLASS_NAMES.nodeCrimson)
    if (inverse(context)) return cn(PRODUCT_FLOW_CLASS_NAMES.node, PRODUCT_FLOW_CLASS_NAMES.nodeInverse)
    return PRODUCT_FLOW_CLASS_NAMES.node
}
