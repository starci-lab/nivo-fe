import { cn } from "@heroui/react"
import type { ProductBlockContext } from "@/modules/product/types"

const inverseTone = (context: ProductBlockContext) =>
    context.section.tone === "dark" || context.section.tone === "crimson"

/** Grid columns adapt card sets to each page's established editorial layout. */
export const productCardsGridClassName = (columns: number, context: ProductBlockContext) => {
    if (context.page === "systemOfResponsibility" && context.section.id === "core-anatomy") {
        return cn("grid", "grid-cols-4", "gap-5", "min-[769px]:max-lg:grid-cols-2", "max-[769px]:grid-cols-1")
    }
    if (columns === 4) return cn("grid", "grid-cols-4", "gap-4", "min-[769px]:max-lg:grid-cols-2", "max-[769px]:grid-cols-1")
    if (columns === 3) return cn("grid", "grid-cols-3", "gap-4", "min-[769px]:max-lg:grid-cols-2", "max-[769px]:grid-cols-1")
    return cn("grid", "grid-cols-2", "gap-4", "max-[769px]:grid-cols-1")
}

/** Card emphasis preserves the featured and staggered layouts used by product pages. */
export const productCardClassName = (
    context: ProductBlockContext,
    index: number,
    strong: boolean,
) => {
    const byNeed = context.page === "applications" && context.section.id === "by-need"
    const operatingCard =
        context.page === "nivoOs" &&
        (context.section.id === "responsibility-center" || context.section.id === "capability-model") &&
        index === 1
    const responsibilityCard =
        context.page === "systemOfResponsibility" &&
        context.section.id === "core-anatomy" &&
        index % 2 === 1
    const featuredNeedCard = byNeed && index === 0
    const featuredEvidenceCard =
        context.page === "applications" && context.section.id === "truth-evidence"
    return cn(
        "relative",
        "flex",
        "min-w-0",
        "flex-col",
        "items-start",
        "gap-[0.9rem]",
        "rounded-3xl",
        "bg-surface",
        "p-[clamp(1.25rem,3vw,2rem)]",
        "shadow-[var(--product-card-shadow)]",
        "transition-[transform,box-shadow]",
        "duration-[180ms]",
        "ease-[ease]",
        "hover:-translate-y-[0.3rem]",
        "hover:shadow-[var(--product-card-hover-shadow)]",
        "motion-reduce:transition-none",
        "forced-colors:bg-[Canvas]",
        "forced-colors:text-[CanvasText]",
        strong && !inverseTone(context) && "bg-[image:var(--product-featured-card-background)]",
        strong && "shadow-[var(--product-featured-card-shadow)]",
        inverseTone(context) && "bg-[var(--product-inverse-card-background)]",
        inverseTone(context) && "text-surface",
        operatingCard && "translate-y-7",
        operatingCard && "hover:translate-y-[1.45rem]",
        operatingCard && "max-[769px]:translate-y-0",
        responsibilityCard && "translate-y-5",
        responsibilityCard && "max-[769px]:translate-y-0",
        byNeed && index === 0 && "col-span-2",
        byNeed && index === 0 && "row-span-2",
        featuredNeedCard && "min-h-[22rem]",
        featuredNeedCard && "max-lg:min-h-0",
        featuredNeedCard && "justify-end",
        featuredNeedCard && "bg-[image:var(--product-feature-need-background)]",
        featuredNeedCard && "bg-cover",
        featuredNeedCard && "bg-center",
        featuredNeedCard && "bg-no-repeat",
        byNeed && index >= 3 && "col-span-2",
        byNeed && index !== 1 && index !== 2 && "max-lg:col-span-1",
        featuredEvidenceCard && "min-h-60",
        featuredEvidenceCard && "justify-end",
    )
}

/** Card icon contrast follows the surface used by its containing section. */
export const productCardIconClassName = (context: ProductBlockContext) => {
    const inverse =
        context.section.id === "trust-bridge" &&
        (context.page === "nivoOs" || context.page === "systemOfResponsibility")
    return cn(PRODUCT_CARDS_CLASS_NAMES.icon, inverse && PRODUCT_CARDS_CLASS_NAMES.iconOnInverse)
}

/** Shared visual roles for the card icon and explanatory copy. */
export const PRODUCT_CARDS_CLASS_NAMES = {
    icon: cn(
        "grid",
        "size-11",
        "place-items-center",
        "rounded-[0.9rem]",
        "bg-[var(--product-card-icon-background)]",
        "text-accent",
        "[&>svg]:size-[1.35rem]",
    ),
    iconOnInverse: cn("bg-[var(--product-inverse-icon-background)]", "text-surface"),
    body: cn("leading-[1.65]"),
} as const
