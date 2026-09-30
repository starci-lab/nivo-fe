import { cn } from "@heroui/react"

/** Constrained column that may shrink but never claim extra width. */
export const GROUP_CHAT_FIELD_BODY_CLASS_NAME = cn("min-w-0")

/** Pick the composer spacing for the active viewport and Office state. */
export const getGroupChatComposerClassName = (compact: boolean, decision: boolean): ReturnType<typeof cn> => {
    if (compact) return GROUP_CHAT_COMPOSER_COMPACT_CLASS_NAME
    if (decision) return GROUP_CHAT_COMPOSER_DECISION_CLASS_NAME
    return GROUP_CHAT_COMPOSER_CLASS_NAME
}

/**
 * Composer row pinned below the conversation scroll region. At desktop width the band
 * centers the single outlined editor frame the accepted composites draw; the accepted
 * grouping keeps the draft, the glyph cluster and the send inside that one frame, so the
 * earlier desktop-only split into an input row above a separate tool row is gone.
 */
const GROUP_CHAT_COMPOSER_CLASS_NAME = cn(
    "flex",
    "items-end",
    "gap-2",
    "p-3",
    "min-[70rem]:h-[7.125rem]",
    "min-[70rem]:flex-col",
    "min-[70rem]:items-stretch",
    "min-[70rem]:justify-center",
)

/** The decision composer keeps the approval band's shorter inset and seats the frame at its lower edge. */
const GROUP_CHAT_COMPOSER_DECISION_CLASS_NAME = cn(
    GROUP_CHAT_COMPOSER_CLASS_NAME,
    "min-[70rem]:h-[5.625rem]",
    "min-[70rem]:p-2",
    "min-[70rem]:justify-end",
)

/** The compact composer keeps the same row on a shorter inset. */
const GROUP_CHAT_COMPOSER_COMPACT_CLASS_NAME = cn("flex", "items-end", "gap-2", "p-1")

/** Pick the editor frame for the active Office state; the compact row keeps no frame box. */
export const getGroupChatComposerFrameClassName = (decision: boolean): ReturnType<typeof cn> =>
    decision ? GROUP_CHAT_COMPOSER_FRAME_DECISION_CLASS_NAME : GROUP_CHAT_COMPOSER_FRAME_CLASS_NAME

/**
 * The single outlined editor frame of the accepted desktop composites: the draft field,
 * the decorative glyph cluster and the send control sit inside one bordered group. Below
 * desktop width the wrapper contributes no box, so the accepted compact row is unchanged.
 */
const GROUP_CHAT_COMPOSER_FRAME_CLASS_NAME = cn(
    "contents",
    "min-[70rem]:flex",
    "min-[70rem]:h-[5.375rem]",
    "min-[70rem]:w-full",
    "min-[70rem]:flex-col",
    "min-[70rem]:rounded-xl",
    "min-[70rem]:border",
    "min-[70rem]:border-separator",
    "min-[70rem]:bg-surface",
    "min-[70rem]:px-3",
    "min-[70rem]:py-1.5",
)

/** The decision frame keeps the draft, the glyph cluster and the round send on one line. */
const GROUP_CHAT_COMPOSER_FRAME_DECISION_CLASS_NAME = cn(
    "contents",
    "min-[70rem]:flex",
    "min-[70rem]:h-16",
    "min-[70rem]:w-full",
    "min-[70rem]:items-center",
    "min-[70rem]:gap-2",
    "min-[70rem]:rounded-xl",
    "min-[70rem]:border",
    "min-[70rem]:border-separator",
    "min-[70rem]:bg-surface",
    "min-[70rem]:px-3",
)

/**
 * The composer's leading glyph cluster. The accepted composite draws an
 * attachment, an emoji and a mention affordance; the surface owns no such
 * command, so the cluster is decorated and never a keyboard stop - the mention
 * itself is the typed `@module` address the thread already renders.
 */
/**
 * Let the draft take the mobile row, grow across the invite frame's first line and take
 * the flexible share of the decision frame's single line. Inside the accepted desktop
 * frame the field draws no box of its own - its border, fill and shadow move out to the
 * frame so the group reads as one editor instead of a field above a tool row.
 */
export const GROUP_CHAT_COMPOSER_INPUT_CLASS_NAME = cn(
    "min-w-0",
    "flex-1",
    "min-[70rem]:[&_[data-slot=input]]:h-8",
    "min-[70rem]:[&_[data-slot=input]]:border-0",
    "min-[70rem]:[&_[data-slot=input]]:bg-transparent",
    "min-[70rem]:[&_[data-slot=input]]:px-1",
    "min-[70rem]:[&_[data-slot=input]]:shadow-none",
)

/** Pick the action-row spread for the active Office state; compact keeps the shared row. */
export const getGroupChatComposerActionsClassName = (decision: boolean): ReturnType<typeof cn> =>
    decision ? GROUP_CHAT_COMPOSER_ACTIONS_DECISION_CLASS_NAME : GROUP_CHAT_COMPOSER_ACTIONS_CLASS_NAME

/**
 * On compact the glyph cluster and the send share the composer row as before; on the
 * invite desktop they take the frame's lower line and face each other across it.
 */
const GROUP_CHAT_COMPOSER_ACTIONS_CLASS_NAME = cn(
    "flex",
    "shrink-0",
    "items-center",
    "gap-2",
    "min-[70rem]:w-full",
    "min-[70rem]:justify-between",
)

/** On the decision frame's single line the cluster and the round send stay one trailing group. */
const GROUP_CHAT_COMPOSER_ACTIONS_DECISION_CLASS_NAME = cn("flex", "shrink-0", "items-center", "gap-2")

/** Keep decorative controls together without covering the draft placeholder. */
export const GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME = cn(
    "flex",
    "shrink-0",
    "items-center",
    "gap-1.5",
    "px-1",
    "text-muted-foreground",
)

/** Keep the send icon and visible action label on one line. */
export const GROUP_CHAT_COMPOSER_SEND_CLASS_NAME = cn(
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-1",
    "whitespace-nowrap",
)

/** The in-progress send keeps its draft visible and locked above the composer. */
export const GROUP_CHAT_SEND_STATE_CLASS_NAME = cn("flex", "items-center", "justify-between", "gap-3", "px-3", "py-2")

/** The composer's accessible label stays off the visual surface; the placeholder carries meaning. */
export const GROUP_CHAT_SR_ONLY_CLASS_NAME = cn("sr-only")
