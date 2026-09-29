import { cn } from "@heroui/react"

/** Motion-owned utilities for the public homepage. */
export const CLASS_NAMES = {
    heroCopy: cn(
        "relative",
        "z-[2]",
        "flex",
        "max-w-home-copy",
        "flex-col",
        "items-start",
        "gap-4",
        "[&>[data-component=Text]:nth-of-type(1)]:tracking-home-eyebrow",
        "[&>[data-component=Text]:nth-of-type(1)]:uppercase",
        "[&>[data-component=Text]:nth-of-type(2)]:text-landing-accent-ink",
        "[&>[data-component=Text]:nth-of-type(3)]:max-w-home-copy-text",
        "[&>[data-component=Text]:nth-of-type(3)]:leading-home-copy",
        "[@media(max-width:64rem)]:max-w-home-copy-wide",
        "[@media(max-width:48rem)]:gap-3.5",
    ),
    heroStage: cn(
        "relative",
        "grid",
        "min-h-home-hero-stage",
        "place-items-center",
        "overflow-visible",
        "rounded-full",
        "bg-landing-home-hero-stage",
        "[@media(max-width:64rem)]:min-h-home-hero-stage-tablet",
        "[@media(max-width:64rem)]:transform-none",
        "[@media(max-width:48rem)]:min-h-home-hero-stage-mobile",
        "[@media(max-width:48rem)]:rounded-3xl",
    ),
    heroSpotlight: cn(
        "pointer-events-none",
        "absolute",
        "inset-0",
        "z-[1]",
        "rounded-[inherit]",
        "mix-blend-normal",
        "transition-opacity",
        "duration-[220ms]",
        "opacity-[0.34]",
        "[@media(hover:none)]:opacity-[0.28]",
        "pointer-coarse:opacity-[0.28]",
        "motion-reduce:opacity-[0.28]",
        "motion-reduce:transition-none",
    ),
    roleCard: cn(
        "grid",
        "min-w-0",
        "grid-rows-[auto_1fr]",
        "overflow-hidden",
        "rounded-landing-home-surface",
        "bg-nivo-surface",
        "p-0",
        "m-0",
        "shadow-landing-home-visual",
    ),
} as const

/** Add the pointer-highlight opacity utility while keeping coarse and reduced motion behavior. */
export const homeSpotlightClassName = (active: boolean) =>
    cn(CLASS_NAMES.heroSpotlight, active && "opacity-[0.92]")
