import { cn } from "@heroui/react"

/** Base card surface used by all commercial offers. */
export const productOfferBaseClassName = cn(
    "relative", "flex", "min-w-0", "flex-col", "items-start", "gap-[0.9rem]", "rounded-3xl", "bg-surface",
    "p-[clamp(1.5rem,4vw,2.5rem)]", "shadow-[var(--product-card-shadow)]", "forced-colors:bg-[Canvas]",
    "forced-colors:text-[CanvasText]",
)

/** Shared offer grid, text, bullet, and base card roles. */
export const PRODUCT_OFFERS_CLASS_NAMES = {
    grid: cn("grid", "grid-cols-2", "gap-4", "max-[769px]:grid-cols-1"),
    offer: productOfferBaseClassName,
    truthLine: cn("flex", "flex-wrap", "items-center", "gap-3"),
    price: cn(
        "text-[clamp(2rem,5vw,3.25rem)]",
        "font-extrabold",
        "leading-none",
        "tracking-[-0.04em]",
        "text-landing-accent-ink",
    ),
    priceQualifier: cn("text-[0.78rem]", "leading-[1.55]", "text-landing-ink-soft"),
    semanticList: cn("m-0", "grid", "list-none", "gap-3", "p-0"),
    semanticListItem: cn(
        "relative",
        "pl-5",
        "leading-[1.6]",
        "before:absolute",
        "before:left-0",
        "before:top-[0.68rem]",
        "before:size-[0.4rem]",
        "before:rounded-full",
        "before:bg-accent",
        "forced-colors:before:bg-[Highlight]",
        "before:content-['']",
    ),
    body: cn("leading-[1.65]"),
} as const

/** Featured offers keep their highlighted surface while sharing the base card layout. */
export const productOfferClassName = (featured: boolean) =>
    featured
        ? cn(
              productOfferBaseClassName,
              "bg-[image:var(--product-featured-card-background)]",
              "shadow-[var(--product-featured-card-shadow)]",
          )
        : productOfferBaseClassName
