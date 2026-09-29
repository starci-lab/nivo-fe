import { cn } from "@heroui/styles"
import type { NivoBrandScale } from "./index"

/** Stable classes for the Nivo brand wrapper and artwork. */
export const NIVO_BRAND_WRAPPER_CLASS_NAMES: Record<NivoBrandScale, ReturnType<typeof cn>> = {
    navbar: cn("inline-flex", "h-8", "w-auto", "shrink-0", "items-center"),
    hero: cn("inline-flex", "h-20", "w-auto", "shrink-0", "items-center"),
}
/** The artwork fills the wrapper while retaining its intrinsic aspect ratio. */
export const NIVO_BRAND_ARTWORK_CLASS_NAME = cn("h-full", "w-auto", "overflow-visible")
/** The loading state is a circular mark-sized skeleton. */
export const NIVO_BRAND_RESTING_CLASS_NAME = cn("aspect-square", "rounded-full")
/** The dark wordmark paths read the family's brand-ink token. */
export const NIVO_BRAND_INK_CLASS_NAME = cn("fill-[var(--nivo-brand-ink)]")
/** The orbit paths stroke the family's brand-accent token at the artwork's fixed weight. */
export const NIVO_BRAND_ACCENT_CLASS_NAME = cn(
    "fill-none",
    "stroke-[var(--nivo-brand-accent)]",
    "[stroke-linecap:butt]",
    "stroke-[18]",
)
