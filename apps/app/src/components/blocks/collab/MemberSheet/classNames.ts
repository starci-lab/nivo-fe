import { cn } from "@heroui/react"

/**
 * The docked compact member sheet: an inline lower band of the workbench card,
 * below the pinned composer and above the shell's destination nav, so the
 * conversation keeps its readable remainder instead of collapsing under an
 * overlay. The body scrolls when the roster is taller than the band.
 */
export const GROUP_CHAT_SHEET_PANEL_CLASS_NAME = cn(
    "flex",
    "max-h-[19rem]",
    "flex-none",
    "flex-col",
    "border-t",
    "border-separator",
    "bg-surface",
)

/** The sheet's drag-handle suggestion rests centered at its top edge. */
export const GROUP_CHAT_SHEET_HANDLE_CLASS_NAME = cn("mx-auto", "my-0.5", "h-1", "w-9", "rounded-full", "bg-separator")

/**
 * Sheet title row under the handle; the close control sits at the end. A11Y-4 repair
 * (office-r7-rail-control-hit-area, owner decision office-hit-area-decision-r1): the close
 * IconButton's operable box grows to the 44x44 CSS px minimum while the approved round glyph
 * visual stays - size-11 takes the border box to 44, p-0.5 plus background-clip: content-box
 * keeps the painted circle at the accepted 40px (a layered utility wins the vendor's icon-only
 * padding, which lives in `@layer components`), and -m-0.5 keeps the row's
 * layout footprint unchanged so nothing else moves.
 */
export const GROUP_CHAT_SHEET_HEAD_CLASS_NAME = cn(
    "flex",
    "flex-none",
    "items-center",
    "justify-between",
    "gap-3",
    "px-4",
    "py-0.5",
    "[&_.starci-core-icon-button]:size-11",
    "[&_.starci-core-icon-button]:-m-0.5",
    "[&_.starci-core-icon-button]:p-0.5",
    "[&_.starci-core-icon-button]:bg-clip-content",
)

/** The sheet body scrolls inside the docked band instead of growing past the page edge. */
export const GROUP_CHAT_SHEET_BODY_CLASS_NAME = cn("min-h-0", "flex-1", "overflow-y-auto", "px-4", "pb-3")
