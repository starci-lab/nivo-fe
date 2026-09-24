import { cn } from "@heroui/react";

/** Page column: peer tabs, then the bounded Office/Tasks content. */
export const GROUP_CHAT_PAGE_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4");

/** Office tab column: the workspace composition supplies its own rail placement. */
export const GROUP_CHAT_OFFICE_COLUMN_CLASS_NAME = cn("flex", "min-w-0", "flex-1", "flex-col");

/** The conversation column stacks the header, the notice band and the bounded workspace. */
export const GROUP_CHAT_CONVERSATION_CLASS_NAME = cn("flex", "min-w-0", "flex-col");

/**
 * The host height ChatWorkspace's contract demands ("the host supplies a height"), measured as the
 * viewport minus the chrome above the section: top bar, page padding, the peer tabs and the page
 * header. Below 48rem the workspace header rides inside the conversation scroll region and the
 * rail-trigger boundary is gone, but the shell's fixed destination nav still owns the bottom
 * 65px of the viewport, so the compact chrome is the top bar, page padding, the tab/member-chip
 * row and that nav; the 70rem step matches WorkspaceShell dropping its compact navigation band.
 * The bounded height is what keeps the composer pinned at the region's bottom edge instead of the
 * document's.
 */
export const GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME = cn(
  "flex",
  "h-[calc(100dvh-17rem)]",
  "min-h-0",
  "min-w-0",
  "flex-col",
  "md:h-[calc(100dvh-13.5rem)]",
  "min-[70rem]:h-[calc(100dvh-13rem)]",
);

/** Compact chrome row: the peer tab strip on the left and the member chip on the right. */
export const GROUP_CHAT_TAB_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "justify-between", "gap-3");

/** The tab strip shrinks inside the compact row so the member chip keeps its count label. */
export const GROUP_CHAT_TAB_STRIP_CLASS_NAME = cn("min-w-0", "flex-1");

/** Compact member chip: a keyboard-sized pill that opens the member bottom sheet. */
export const GROUP_CHAT_MEMBER_CHIP_CLASS_NAME = cn(
  "inline-flex",
  "h-10",
  "shrink-0",
  "items-center",
  "gap-1.5",
  "rounded-full",
  "border",
  "border-separator",
  "bg-surface",
  "px-3",
  "text-sm",
  "font-semibold",
  "text-foreground",
  "outline-none",
  "data-[focus-visible=true]:ring-2",
  "data-[focus-visible=true]:ring-accent",
);

/** The workspace header rides as the conversation scroll region's first item on compact widths. */
export const GROUP_CHAT_SCROLL_HEADER_CLASS_NAME = cn("px-4", "pt-4", "pb-1");

/** Compact member sheet dialog: flush bands replace the vendor padding; top corners stay rounded. */
export const GROUP_CHAT_SHEET_DIALOG_CLASS_NAME = cn("p-0", "pt-1");

/** Sheet title row under the drag handle; the end padding clears the absolute close control. */
export const GROUP_CHAT_SHEET_HEAD_CLASS_NAME = cn("flex", "items-center", "justify-between", "gap-3", "px-4", "py-2", "pe-14");

/** Sheet title reads at the same weight as the rail's card labels. */
export const GROUP_CHAT_SHEET_TITLE_CLASS_NAME = cn("text-base", "font-semibold", "text-foreground");

/** Sheet close control keeps a keyboard-sized target on the title row. */
export const GROUP_CHAT_SHEET_CLOSE_CLASS_NAME = cn(
  "inline-flex",
  "h-10",
  "w-10",
  "items-center",
  "justify-center",
  "rounded-full",
  "text-foreground",
  "outline-none",
  "data-[focus-visible=true]:ring-2",
  "data-[focus-visible=true]:ring-accent",
);

/** The sheet body scrolls inside the 85vh bound instead of growing past the page edge. */
export const GROUP_CHAT_SHEET_BODY_CLASS_NAME = cn("min-h-0", "overflow-y-auto", "px-4", "pb-6", "pt-1");

/** Roster groups inside the member sheet when the viewer may not invite; rows stay edge-flush. */
export const GROUP_CHAT_SHEET_ROSTER_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4", "-mx-4");

/** One roster group in the member sheet: a section label above plain member rows. */
export const GROUP_CHAT_SHEET_SECTION_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-1");

/** One conversation entry: avatar rail plus a message or card column. */
export const GROUP_CHAT_ENTRY_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3", "px-4", "py-3");

/** A card entry indents under the author column on wide screens so the card reads attached to its message. */
export const GROUP_CHAT_CARD_INSET_CLASS_NAME = cn("min-w-0", "flex-1", "xl:pl-12");

/** Flexible content column inside one entry or band. */
export const GROUP_CHAT_GROW_CLASS_NAME = cn("min-w-0", "flex-1");

/** Constrained column that may shrink but never claim extra width. */
export const GROUP_CHAT_FIELD_BODY_CLASS_NAME = cn("min-w-0");

/** Initials avatar circle shared by humans and modules on the tertiary surface. */
export const GROUP_CHAT_AVATAR_CLASS_NAME = cn(
  "flex",
  "h-9",
  "w-9",
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-full",
  "bg-surface-tertiary",
  "text-sm",
  "font-semibold",
  "text-foreground",
);

/** A peer message bubble reads on the secondary surface. */
export const GROUP_CHAT_BUBBLE_CLASS_NAME = cn("max-w-[42rem]", "rounded-2xl", "px-4", "py-3", "bg-surface-secondary");

/** The viewer's own message bubble reads on the soft accent surface. */
export const GROUP_CHAT_BUBBLE_OWN_CLASS_NAME = cn("max-w-[42rem]", "rounded-2xl", "px-4", "py-3", "bg-accent-soft");

/** Card bands inside one joined surface: action, consequence, attribution, decision row. */
export const GROUP_CHAT_CARD_BAND_CLASS_NAME = cn("flex", "items-start", "gap-3", "px-4", "py-3");

/** Status badges float above a card's joined surface. */
export const GROUP_CHAT_BADGE_ROW_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-2", "pb-2");

/** Actions sit side by side inside the card's final band. */
export const GROUP_CHAT_CARD_ACTIONS_CLASS_NAME = cn("grid", "grid-cols-2", "gap-3", "px-4", "py-3");

/** Member rail stack: roster card, hired-module card, invite card. */
export const GROUP_CHAT_RAIL_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4");

/** One member row: avatar, name and role, presence kept textual. */
export const GROUP_CHAT_MEMBER_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3", "px-4", "py-2");

/** Native role choices sit on one wrapping line. */
export const GROUP_CHAT_ROLE_CHOICES_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-4");

/** One radio-like role choice keeps the native input for focus and keyboard behaviour. */
export const GROUP_CHAT_ROLE_CHOICE_CLASS_NAME = cn("inline-flex", "items-center", "gap-2");

/** Vertical stack shared by the invite and acceptance forms. */
export const GROUP_CHAT_FORM_STACK_CLASS_NAME = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-3");

/** Native labelled select, shared by the role and Tasks filters. */
export const GROUP_CHAT_NATIVE_FIELD_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");

/** The native select/input control keeps the app's control rhythm. */
export const GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME = cn("min-h-11", "w-full", "px-4", "py-3");

/** Composer row pinned below the conversation scroll region. */
export const GROUP_CHAT_COMPOSER_CLASS_NAME = cn("flex", "items-end", "gap-2", "p-3");

/** The in-progress send keeps its draft visible and locked above the composer. */
export const GROUP_CHAT_SEND_STATE_CLASS_NAME = cn("flex", "items-center", "justify-between", "gap-3", "px-3", "py-2");

/** Tasks filter row: three labelled selects in one reading line on wide screens. */
export const GROUP_CHAT_FILTERS_CLASS_NAME = cn("grid", "grid-cols-1", "gap-3", "sm:grid-cols-3");

/** The Tasks tab column: filters, hint, then the list card. */
export const GROUP_CHAT_TASKS_COLUMN_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4");

/** One Tasks row: ref, statement and status, then attribution, then the Office jump. */
export const GROUP_CHAT_TASK_ROW_CLASS_NAME = cn(
  "grid",
  "grid-cols-1",
  "gap-2",
  "px-4",
  "py-3",
  "lg:grid-cols-[6rem_1fr_auto_auto_auto_auto]",
  "lg:items-center",
  "lg:gap-4",
);

/** A task statement cell may shrink inside the row's flexible track so truncation works. */
export const GROUP_CHAT_TASK_STATEMENT_CLASS_NAME = cn("min-w-0");

/** The ordered conversation list inside the workspace's scroll region. */
export const GROUP_CHAT_CONVERSATION_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-col");

/** Narrow column for a notice row's follow action. */
export const GROUP_CHAT_NOTICE_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "justify-between", "gap-3", "px-4", "py-2");

/** The loading read keeps a compact pending line inside the page column. */
export const GROUP_CHAT_LOADING_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3");

/** The composer's accessible label stays off the visual surface; the placeholder carries meaning. */
export const GROUP_CHAT_SR_ONLY_CLASS_NAME = cn("sr-only");
