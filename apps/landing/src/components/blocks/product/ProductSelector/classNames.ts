import { cn } from "@heroui/react"
import type { ProductBlockContext } from "../../../../modules/product/types"

/** Selector layouts preserve the page-specific responsive treatment. */
export const productSelectorClassName = (context: ProductBlockContext) =>
    cn(
        "flex",
        "flex-wrap",
        "gap-3",
        context.page === "applications" && context.section.id === "need-selector" && "grid",
        context.page === "applications" && context.section.id === "need-selector" && "grid-cols-4",
        context.page === "applications" && context.section.id === "need-selector" && "max-[769px]:grid-cols-1",
    )

/** Selector links become larger cards only for the applications need picker. */
export const productSelectorLinkClassName = (context: ProductBlockContext, index: number) => {
    const needSelector = context.page === "applications" && context.section.id === "need-selector"
    return cn(
        "inline-flex",
        "min-h-11",
        "items-center",
        "rounded-full",
        "border",
        "border-border",
        "bg-surface",
        "px-4",
        "py-[0.7rem]",
        "text-sm",
        "font-[650]",
        "text-background-inverse",
        "no-underline",
        "hover:border-accent",
        "forced-colors:bg-[Canvas]",
        "forced-colors:text-[CanvasText]",
        needSelector && "min-h-28",
        needSelector && "items-end",
        needSelector && "rounded-3xl",
        needSelector && "border-0",
        needSelector && "shadow-[var(--product-card-shadow)]",
        needSelector && index % 2 === 1 && "translate-y-4",
        needSelector && index % 2 === 1 && "max-[769px]:translate-y-0",
    )
}
