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
