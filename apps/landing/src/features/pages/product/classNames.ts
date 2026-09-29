import { cn } from "@heroui/react"

/** Page-level surface and action layout roles shared by product routes. */
export const PRODUCT_PAGE_CLASS_NAMES = {
    root: cn("bg-surface", "text-background-inverse"),
    actions: cn(
        "mt-3",
        "flex",
        "flex-wrap",
        "items-center",
        "gap-x-4",
        "gap-y-3",
        "max-[769px]:flex-col",
        "max-[769px]:items-stretch",
        "max-[769px]:[&>*]:w-full",
        "max-[769px]:[&>*]:justify-center",
    ),
} as const
