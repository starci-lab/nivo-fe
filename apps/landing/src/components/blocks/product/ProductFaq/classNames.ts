import { cn } from "@heroui/react"

/** Shared disclosure layout for product frequently asked questions. */
export const PRODUCT_FAQ_CLASS_NAMES = {
    list: cn("grid", "border-t", "border-border"),
    item: cn("group", "border-b", "border-border"),
    summary: cn(
        "flex",
        "min-h-14",
        "cursor-pointer",
        "items-center",
        "justify-between",
        "gap-4",
        "font-bold",
        "list-none",
        "[&::-webkit-details-marker]:hidden",
        "after:text-accent",
        "after:text-2xl",
        "after:content-['+']",
        "group-open:after:content-['−']",
    ),
    answer: cn("max-w-[52rem]", "pb-6", "leading-[1.7]", "text-landing-ink-soft"),
} as const
