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
 * header. Below 48rem the compact navigation band and the rail-trigger boundary ride too; the
 * 70rem step matches WorkspaceShell dropping its compact navigation band. The bounded height is
 * what keeps the composer pinned at the region's bottom edge instead of the document's.
 */
export const GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME = cn(
  "flex",
  "h-[calc(100dvh-17.25rem)]",
  "min-h-0",
  "min-w-0",
  "flex-col",
  "md:h-[calc(100dvh-13.5rem)]",
  "min-[70rem]:h-[calc(100dvh-13rem)]",
);

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
