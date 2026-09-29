import { cn } from "@heroui/react"

/**
 * Canonical classes for the public-site section introduction, mirroring SITE_CLASS_NAMES: the
 * `site-section-intro` marker stays while the home-area rules in globals.css still select it.
 */
export const CLASS_NAMES = {
    standard: cn(
        "site-section-intro",
        "max-w-[50rem]",
        "[@media(max-width:48rem)]:flex-col",
        "[@media(max-width:48rem)]:items-start!",
    ),
    inverse: cn(
        "site-section-intro",
        "max-w-[50rem]",
        "text-surface",
        "[@media(max-width:48rem)]:flex-col",
        "[@media(max-width:48rem)]:items-start!",
    ),
} as const
