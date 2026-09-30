import { cn } from "@heroui/react"

/** Page column: the bounded Office/Tasks workbench is the single content block. */
export const GROUP_CHAT_PAGE_CLASS_NAME = cn("flex", "min-w-0", "flex-col")

/**
 * The host row: the bounded workbench card plus the persistent member rail,
 * measured as the viewport minus the chrome above the card - top bar, page
 * padding and the page-level offsets. The 70rem step matches WorkspaceShell
 * dropping its compact navigation band. The bounded height is what keeps the
 * conversation scroll, the pinned composer and the docked member sheet inside
 * the viewport instead of the document's flow.
 */
const GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME = cn(
    "flex",
    "h-[calc(100dvh-13.5rem)]",
    "min-h-0",
    "min-w-0",
    "gap-6",
    "md:h-[calc(100dvh-10rem)]",
    "min-[70rem]:h-[calc(100dvh-6.375rem)]",
    "min-[70rem]:-mx-5",
    "min-[70rem]:mt-2",
)

/** The decision state leaves a narrow gutter before its roster panel. */
export const GROUP_CHAT_WORKSPACE_HOST_DECISION_CLASS_NAME = cn(
    GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME,
    "min-[70rem]:gap-3",
)

/** The invitation state joins the workbench and rail edges. */
export const GROUP_CHAT_WORKSPACE_HOST_INVITE_CLASS_NAME = cn(GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME, "min-[70rem]:gap-0")

/**
 * The workbench card: one bounded surface carrying the peer tabs, the workspace
 * header, the conversation scroll, the pinned composer and the docked compact
 * member sheet - the accepted direction's single card anatomy. Nested depth
 * keeps the visible hairline the open canvas lacked.
 */
export const GROUP_CHAT_WORKBENCH_CLASS_NAME = cn(
    "flex",
    "min-h-0",
    "min-w-0",
    "flex-1",
    "flex-col",
    "overflow-hidden",
    "rounded-xl",
    "border",
    "border-separator",
    "bg-surface",
)

/** The peer tab band at the card's top edge; the member chip docks on its right on compact. */
export const GROUP_CHAT_TABS_BAND_CLASS_NAME = cn(
    "flex",
    "min-h-9",
    "flex-none",
    "items-center",
    "justify-between",
    "gap-3",
    "border-b",
    "border-separator",
    "px-2",
    "min-[70rem]:min-h-[3.375rem]",
    "min-[70rem]:px-4",
)

/** The decision tab band uses the taller desktop direction rhythm. */
export const GROUP_CHAT_TABS_BAND_DECISION_CLASS_NAME = cn(
    GROUP_CHAT_TABS_BAND_CLASS_NAME,
    "min-[70rem]:min-h-[3.875rem]",
)

/** The tab strip shrinks inside the band so the member chip keeps its count label. */
export const GROUP_CHAT_TAB_STRIP_CLASS_NAME = cn("min-w-0", "flex-1", "min-[70rem]:[&_[role=tab]]:text-xl")

/**
 * The workspace header band between the tabs and the conversation: title and
 * description on the left, the day indicator and rail toggle or the compact
 * member chip on the right.
 */
export const GROUP_CHAT_HEADER_BAND_CLASS_NAME = cn(
    "flex-none",
    "border-b",
    "border-separator",
    "px-4",
    "py-2.5",
    "min-[70rem]:py-3",
)

/**
 * The compact header row the mobile direction draws: title and subtitle stacked
 * against the member chip in one short band instead of the wide band's
 * section-header stack, so the conversation keeps a readable remainder above
 * the docked invitation sheet.
 */
export const GROUP_CHAT_HEADER_BAND_COMPACT_CLASS_NAME = cn("flex-none", "border-b", "border-separator", "px-3", "py-2")

/** Align the compact workspace name with its member control. */
export const GROUP_CHAT_HEADER_COMPACT_ROW_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "items-center",
    "justify-between",
    "gap-3",
)

/** Trailing controls inside the workspace header band. */
export const GROUP_CHAT_HEADER_ACTIONS_CLASS_NAME = cn("flex", "items-center", "gap-2")

/** The compact day indicator reads like the accepted direction's quiet select. */
export const GROUP_CHAT_DAY_SELECT_CLASS_NAME = cn(
    "h-8",
    "rounded-lg",
    "border",
    "border-separator",
    "bg-surface",
    "px-2",
    "text-xs",
    "text-muted-foreground",
)

/**
 * The flexible workspace region inside the card: ChatWorkspace owns the
 * conversation scroll and the composer boundary; the host only supplies the
 * remaining card height and the surface background under the Grammar skin.
 */
export const GROUP_CHAT_WORKSPACE_WRAP_CLASS_NAME = cn(
    "flex",
    "min-h-0",
    "min-w-0",
    "flex-1",
    "flex-col",
    "bg-surface",
    "[&_.starci-core-chat-workspace]:bg-surface",
    "[&_.starci-core-chat-workspace-composer]:bg-surface",
)

/** The persistent member rail: a fixed-width column beside the workbench card. */
const GROUP_CHAT_RAIL_ASIDE_CLASS_NAME = cn(
    "hidden",
    "w-80",
    "flex-none",
    "min-h-0",
    "min-w-0",
    "flex-col",
    "min-[48rem]:flex",
)

/** The decision roster rail matches the narrower accepted panel. */
export const GROUP_CHAT_RAIL_ASIDE_DECISION_CLASS_NAME = cn(GROUP_CHAT_RAIL_ASIDE_CLASS_NAME, "min-[70rem]:w-[19.7rem]")

/** The invitation rail has room for single-line module descriptions. */
export const GROUP_CHAT_RAIL_ASIDE_INVITE_CLASS_NAME = cn(GROUP_CHAT_RAIL_ASIDE_CLASS_NAME, "min-[70rem]:w-[23.125rem]")

/** The rail's own scroll owner when the roster is taller than the workbench. */
export const GROUP_CHAT_RAIL_SCROLL_CLASS_NAME = cn(
    "flex",
    "min-h-0",
    "flex-1",
    "flex-col",
    "overflow-y-auto",
    "min-[70rem]:[&_[data-grammar-surface-card]]:min-h-full",
)

/** Card bands inside one joined surface: action, consequence, attribution, decision row. */
export const GROUP_CHAT_CARD_BAND_CLASS_NAME = cn(
    "flex",
    "items-start",
    "gap-3",
    "px-4",
    "py-2.5",
    "min-[70rem]:py-[1.125rem]",
)

/** Vertical stack shared by the invite and acceptance forms. */
export const GROUP_CHAT_FORM_STACK_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-1",
    "flex-col",
    "gap-2",
    "min-[70rem]:[&>button]:mt-5",
)

/** The Tasks panel owns a plain vertical scroll region inside the workbench card. */
export const GROUP_CHAT_TAB_PANEL_SCROLL_CLASS_NAME = cn("min-h-0", "flex-1", "overflow-y-auto")

/** The loading read stays centered inside the workbench card. */
export const GROUP_CHAT_LOADING_CLASS_NAME = cn(
    "flex",
    "min-h-0",
    "flex-1",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-3",
)
