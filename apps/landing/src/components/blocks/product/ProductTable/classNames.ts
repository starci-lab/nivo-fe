import { cn } from "@heroui/react"

/** Shared responsive comparison table and accessible-only roles. */
export const PRODUCT_TABLE_CLASS_NAMES = {
    frame: cn("max-w-full", "overflow-x-auto", "rounded-2xl", "border", "border-border", "bg-surface"),
    table: cn("w-full", "min-w-[42rem]", "border-collapse", "text-background-inverse", "max-[769px]:min-w-[34rem]"),
    headerCell: cn(
        "border-b", "border-border", "px-5", "py-4", "text-left", "align-top",
        "bg-[var(--product-table-heading-background)]",
        "text-[0.8rem]",
        "tracking-[0.06em]",
        "uppercase",
    ),
    cell: cn("border-b", "border-border", "px-5", "py-4", "text-left", "align-top"),
    lastRow: cn("[&>*]:border-b-0"),
    screenReaderOnly: cn("sr-only"),
} as const
