import { cn } from "@heroui/react"

/** Component-owned utilities for the public-site section introduction. */
export const CLASS_NAMES = {
    standard: cn(
        "max-w-[50rem]",
        "[&_.starci-core-section-eyebrow>span]:tracking-home-eyebrow",
        "[@media(max-width:48rem)]:flex-col",
        "[@media(max-width:48rem)]:items-start",
    ),
    inverse: cn(
        "max-w-[50rem]",
        "text-surface",
        "[&_.starci-core-section-title]:text-surface",
        "[&_.starci-core-section-eyebrow>span[data-tone=muted]]:text-landing-inverse-muted",
        "[&_.starci-core-section-eyebrow>span]:tracking-home-eyebrow",
        "[&_.starci-core-section-description>[data-tone=default]]:text-surface",
        "[@media(max-width:48rem)]:flex-col",
        "[@media(max-width:48rem)]:items-start",
    ),
} as const

/** Resolve the section intro presentation from its semantic inverse flag. */
export const sectionIntroClassName = (inverse: boolean) => (inverse ? CLASS_NAMES.inverse : CLASS_NAMES.standard)
