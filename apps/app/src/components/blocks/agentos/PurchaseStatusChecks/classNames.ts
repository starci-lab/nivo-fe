import { cn } from "@heroui/react"

/** One flush band inside a joined surface, with the final separator removed. */
export const BAND_CLASS_NAME = cn(
    "border-b",
    "border-separator",
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "px-4",
    "py-4",
    "last:border-b-0",
)

/** The offer banner strip inside purchase-facts and provisioning-order cards. */
export const BANNER_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-baseline",
    "gap-x-2",
    "gap-y-1",
    "rounded-lg",
    "bg-surface-secondary",
    "px-4",
    "py-3",
)

/** Arrange fact cells in two columns before the card narrows. */
export const FACT_GRID_CLASS_NAME = cn("grid", "min-w-0", "grid-cols-1", "gap-4", "sm:grid-cols-2")
/** Stack a fact label above its value. */
export const FACT_CELL_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Align a confirmed fact's label and value in one divided row. */
export const FACT_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-baseline", "justify-between", "gap-3")
/** Lay out a check or timeline mark beside its text. */
export const ROW_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3")
/** Keep one evidence row's text and timing as a single column. */
export const ROW_BODY_CLASS_NAME = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-0.5")
/** Keep a row label next to its status badge. */
export const ROW_HEAD_CLASS_NAME = cn("flex", "min-w-0", "items-center", "justify-between", "gap-2")
/** Give a caution notice a bordered, readable inset. */
export const NOTICE_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "items-start",
    "gap-3",
    "rounded-lg",
    "border",
    "border-separator",
    "bg-surface-secondary",
    "px-4",
    "py-3",
)
/** Center the loading caption below the payment recheck placeholder. */
export const SKELETON_CAPTION_CLASS_NAME = cn("text-center")

/** Reserve the confirmed-fact row's narrow-card height in the loading preview. */
export const SKELETON_FACT_ROW_RESERVED_CLASS_NAME = cn(
    BAND_CLASS_NAME,
    "@max-[400px]/starci-core-surface:min-h-[73px]",
)
/** Reserve the resolved provisioning footnote's phone-card height. */
export const SKELETON_FOOTNOTE_RESERVED_CLASS_NAME = cn(BAND_CLASS_NAME, "max-[620px]:min-h-[81px]")
/** Reserve the resolved offer banner's phone-card height. */
export const SKELETON_BANNER_RESERVED_CLASS_NAME = cn(BAND_CLASS_NAME, "max-[430px]:min-h-[105px]")
