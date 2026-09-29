import { cn } from "@heroui/react"

/** Vertical stack shared by the invite and acceptance forms. */
export const GROUP_CHAT_FORM_STACK_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-1",
    "flex-col",
    "gap-2",
    "min-[70rem]:[&>button]:mt-5",
)

/**
 * The docked-sheet invite form compresses one step under the rail rhythm. Its email field draws
 * no label at this size: HeroUI paints the required `*` on the bare label element itself
 * (`[data-required] > .label::after`), outside any wrapped text, so hiding only the label text
 * left the marker orphaned on its own row above the field. The compact stack takes the whole
 * label element off the surface instead - it stays in the a11y tree, so the input keeps its
 * accessible name through the `for` association and `aria-required` keeps the required state.
 */
export const GROUP_CHAT_FORM_STACK_COMPACT_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-1",
    "flex-col",
    "gap-1",
    "[&_[data-slot=label]]:sr-only",
)
