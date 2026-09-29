import { cn } from "@heroui/react"
import type { ProductBlockContext } from "@/modules/product/types"

/** Section surface, border, and text roles follow the section's semantic tone. */
export const productSectionClassName = (context: ProductBlockContext) =>
    cn(
        "relative",
        "overflow-clip",
        "py-[clamp(4.5rem,9vw,8rem)]",
        context.section.tone === "soft" && "[background:var(--product-section-soft-background)]",
        context.section.tone === "dark" && "[--foreground:var(--surface)]",
        context.section.tone === "dark" && "[--muted:var(--product-muted-inverse)]",
        context.section.tone === "dark" && "border-[var(--product-dark-border)]",
        context.section.tone === "dark" && "[background:var(--product-section-dark-background)]",
        context.section.tone === "dark" && "text-surface",
        context.section.tone === "crimson" && "[--foreground:var(--surface)]",
        context.section.tone === "crimson" && "[--muted:var(--product-muted-crimson)]",
        context.section.tone === "crimson" && "border-[var(--product-crimson-border)]",
        context.section.tone === "crimson" && "bg-[image:var(--product-section-crimson-background)]",
        context.section.tone === "crimson" && "text-surface",
        "forced-colors:bg-[Canvas]",
        "forced-colors:text-[CanvasText]",
    )

/** Section spacing and block wrappers shared by product pages. */
export const PRODUCT_SECTION_CLASS_NAMES = {
    body: cn("mt-[clamp(2.5rem,6vw,5rem)]", "grid", "gap-[clamp(2rem,5vw,4rem)]"),
    block: cn("min-w-0"),
} as const
