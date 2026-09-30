import { cn } from "@heroui/react"

/** Parallax-owned utilities for the public homepage hero artwork. */
export const CLASS_NAMES = {
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
} as const

/** Add the pointer-highlight opacity utility while keeping coarse and reduced motion behavior. */
export const homeSpotlightClassName = (active: boolean) =>
    cn(CLASS_NAMES.heroSpotlight, active && "opacity-[0.92]")
