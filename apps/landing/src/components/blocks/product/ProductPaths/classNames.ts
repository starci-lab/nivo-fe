import { cn } from "@heroui/react"
import type { ProductBlockContext } from "../../../../modules/product/types"

/** Shared route card, index, and action roles for product paths. */
export const PRODUCT_PATHS_CLASS_NAMES = {
    grid: cn("grid", "grid-cols-3", "gap-4", "min-[769px]:max-lg:grid-cols-2", "max-[769px]:grid-cols-1"),
    path: cn(
        "relative", "flex", "min-h-[17rem]", "min-w-0", "flex-col", "items-start", "justify-start", "gap-[0.9rem]",
        "rounded-3xl", "bg-surface", "p-[clamp(1.25rem,3vw,2rem)]", "shadow-[var(--product-card-shadow)]",
        "transition-[transform,box-shadow]", "duration-[180ms]", "ease-[ease]", "hover:-translate-y-[0.3rem]",
        "hover:shadow-[var(--product-card-hover-shadow)]", "motion-reduce:transition-none", "forced-colors:bg-[Canvas]",
        "forced-colors:text-[CanvasText]",
    ),
    pathIndex: cn(
        "absolute",
        "right-5",
        "top-4",
        "text-[3.25rem]",
        "font-[850]",
        "leading-none",
        "text-[var(--product-path-index)]",
    ),
    label: cn("mb-0"),
    body: cn("leading-[1.65]"),
    action: cn("mt-auto"),
} as const

/** Route cards use translucent surfaces when they sit on an inverse section. */
export const productPathClassName = (context: ProductBlockContext) => {
    const inverse = context.section.tone === "dark" || context.section.tone === "crimson"
    return cn(
        PRODUCT_PATHS_CLASS_NAMES.path,
        inverse && "bg-[var(--product-inverse-card-background)]",
        inverse && "text-surface",
    )
}
