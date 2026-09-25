import { cn } from "@heroui/react";

/** Page column: the bounded Office/Tasks workbench is the single content block. */
export const GROUP_CHAT_PAGE_CLASS_NAME = cn("flex", "min-w-0", "flex-col");

/**
 * The host row: the bounded workbench card plus the persistent member rail,
 * measured as the viewport minus the chrome above the card - top bar, page
 * padding and the page-level offsets. The 70rem step matches WorkspaceShell
 * dropping its compact navigation band. The bounded height is what keeps the
 * conversation scroll, the pinned composer and the docked member sheet inside
 * the viewport instead of the document's flow.
 */
export const GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME = cn(
  "flex",
  "h-[calc(100dvh-13.5rem)]",
  "min-h-0",
  "min-w-0",
  "gap-6",
  "md:h-[calc(100dvh-10rem)]",
  "min-[70rem]:h-[calc(100dvh-6.375rem)]",
  "min-[70rem]:-mx-5",
  "min-[70rem]:mt-2",
);

export const GROUP_CHAT_WORKSPACE_HOST_DECISION_CLASS_NAME = cn(GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME, "min-[70rem]:gap-3");
export const GROUP_CHAT_WORKSPACE_HOST_INVITE_CLASS_NAME = cn(GROUP_CHAT_WORKSPACE_HOST_CLASS_NAME, "min-[70rem]:gap-0");

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
);

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
);

export const GROUP_CHAT_TABS_BAND_DECISION_CLASS_NAME = cn(GROUP_CHAT_TABS_BAND_CLASS_NAME, "min-[70rem]:min-h-[3.875rem]");

/** The tab strip shrinks inside the band so the member chip keeps its count label. */
export const GROUP_CHAT_TAB_STRIP_CLASS_NAME = cn("min-w-0", "flex-1", "min-[70rem]:[&_[role=tab]]:text-xl");

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
);

/**
 * The compact header row the mobile direction draws: title and subtitle stacked
 * against the member chip in one short band instead of the wide band's
 * section-header stack, so the conversation keeps a readable remainder above
 * the docked invitation sheet.
 */
export const GROUP_CHAT_HEADER_BAND_COMPACT_CLASS_NAME = cn(
  "flex-none",
  "border-b",
  "border-separator",
  "px-3",
  "py-2",
);

/** The compact header's flexible text column; the chip keeps its intrinsic width. */
export const GROUP_CHAT_HEADER_TEXT_COMPACT_CLASS_NAME = cn("min-w-0", "flex-1");

/** Trailing controls inside the workspace header band. */
export const GROUP_CHAT_HEADER_ACTIONS_CLASS_NAME = cn("flex", "items-center", "gap-2");

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
);

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
);

/** Compact member chip: a keyboard-sized pill that opens the docked member sheet. */
export const GROUP_CHAT_MEMBER_CHIP_CLASS_NAME = cn(
  "inline-flex",
  "h-8",
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

/** The member chip's leading roster icon. */
export const GROUP_CHAT_MEMBER_CHIP_ICON_CLASS_NAME = cn("h-4", "w-4");

/** The member chip's trailing disclosure chevron. */
export const GROUP_CHAT_MEMBER_CHIP_CHEVRON_CLASS_NAME = cn("h-3.5", "w-3.5");

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
);

/** The sheet's drag-handle suggestion rests centered at its top edge. */
export const GROUP_CHAT_SHEET_HANDLE_CLASS_NAME = cn("mx-auto", "my-0.5", "h-1", "w-9", "rounded-full", "bg-separator");

/** Sheet title row under the handle; the close control sits at the end. */
export const GROUP_CHAT_SHEET_HEAD_CLASS_NAME = cn("flex", "flex-none", "items-center", "justify-between", "gap-3", "px-4", "py-0.5");

/** Sheet title reads at the same weight as the rail's card labels. */
export const GROUP_CHAT_SHEET_TITLE_CLASS_NAME = cn("text-base", "font-semibold", "text-foreground");

/** The sheet body scrolls inside the docked band instead of growing past the page edge. */
export const GROUP_CHAT_SHEET_BODY_CLASS_NAME = cn("min-h-0", "flex-1", "overflow-y-auto", "px-4", "pb-3");

/** Roster groups inside the member sheet when the viewer may not invite; rows stay edge-flush. */
export const GROUP_CHAT_SHEET_ROSTER_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "-mx-4");

/** One roster group in the member sheet: a section label above plain member rows. */
export const GROUP_CHAT_SHEET_SECTION_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-1");

/** A sheet section's label or note line keeps the body's horizontal inset. */
export const GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME = cn("px-4");

/** The persistent member rail: a fixed-width column beside the workbench card. */
export const GROUP_CHAT_RAIL_ASIDE_CLASS_NAME = cn(
  "hidden",
  "w-80",
  "flex-none",
  "min-h-0",
  "min-w-0",
  "flex-col",
  "min-[48rem]:flex",
);

export const GROUP_CHAT_RAIL_ASIDE_DECISION_CLASS_NAME = cn(GROUP_CHAT_RAIL_ASIDE_CLASS_NAME, "min-[70rem]:w-[19.7rem]");
export const GROUP_CHAT_RAIL_ASIDE_INVITE_CLASS_NAME = cn(GROUP_CHAT_RAIL_ASIDE_CLASS_NAME, "min-[70rem]:w-[23.125rem]");

/** The rail's own scroll owner when the roster is taller than the workbench. */
export const GROUP_CHAT_RAIL_SCROLL_CLASS_NAME = cn("flex", "min-h-0", "flex-1", "flex-col", "overflow-y-auto", "min-[70rem]:[&_[data-grammar-surface-card]]:min-h-full");

/** One section band inside the joined rail card: a small label above edge-flush rows. */
export const GROUP_CHAT_RAIL_SECTION_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-1", "py-1.5", "min-[70rem]:py-2");
export const GROUP_CHAT_RAIL_SECTION_INVITE_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_CLASS_NAME, "relative");
export const GROUP_CHAT_RAIL_SECTION_ROSTER_HEAD_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_CLASS_NAME, "min-[70rem]:pt-5");

/** Rail sections after the first separate with a hairline. */
export const GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1",
  "border-t",
  "border-separator",
  "py-1.5",
  "min-[70rem]:py-2",
);
export const GROUP_CHAT_RAIL_SECTION_INVITE_MODULES_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME, "min-[70rem]:mt-5");
export const GROUP_CHAT_RAIL_SECTION_INVITE_FORM_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME, "min-[70rem]:mt-4");
export const GROUP_CHAT_RAIL_SECTION_ROSTER_PEOPLE_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME, "min-[70rem]:pt-5");
export const GROUP_CHAT_RAIL_SECTION_ROSTER_MODULES_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME, "min-[70rem]:mt-6");
export const GROUP_CHAT_RAIL_HUMANS_BADGE_CLASS_NAME = cn("min-[70rem]:absolute", "min-[70rem]:right-16", "min-[70rem]:top-6");

/** A rail section's label line sits on the card's horizontal rhythm. */
export const GROUP_CHAT_RAIL_LABEL_CLASS_NAME = cn("flex", "items-center", "gap-2", "px-4");

/** A rail section's leading glyph inherits the muted rail tone. */
export const GROUP_CHAT_RAIL_LABEL_ICON_CLASS_NAME = cn("text-muted-foreground", "min-[70rem]:-translate-y-2");

/** The rail section header row carries the label and an optional trailing control. */
export const GROUP_CHAT_RAIL_HEAD_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-center",
  "justify-between",
  "gap-2",
  "px-4",
);

/** The invite form band keeps the card's horizontal inset. */
export const GROUP_CHAT_RAIL_FORM_CLASS_NAME = cn("px-4", "pt-1", "pb-3");

/** One member row: avatar, name and role, presence kept textual. */
export const GROUP_CHAT_MEMBER_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3", "px-4", "py-1.5");
export const GROUP_CHAT_MEMBER_ROW_ROOMY_CLASS_NAME = cn(GROUP_CHAT_MEMBER_ROW_CLASS_NAME, "min-[70rem]:py-2.5");

/** The member row's trailing options glyph stays decorative until member actions exist. */
export const GROUP_CHAT_MEMBER_ROW_TRAILING_CLASS_NAME = cn("ml-auto", "shrink-0", "text-muted-foreground");

/** The avatar frame both the wide and compact member avatars build on. */
export const GROUP_CHAT_AVATAR_BASE_CLASS_NAME = cn(
  "relative",
  "flex",
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-full",
  "font-semibold",
  "text-foreground",
);

/**
 * Tinted initials avatar circle shared by humans and modules. The tint answers
 * the member's name hash so roster, messages and headers agree on one member.
 */
export const GROUP_CHAT_AVATAR_CLASS_NAME = cn(GROUP_CHAT_AVATAR_BASE_CLASS_NAME, "h-10", "w-10", "text-sm");

/** The compact avatar the mobile direction's tighter message rows use. */
export const GROUP_CHAT_AVATAR_COMPACT_CLASS_NAME = cn(GROUP_CHAT_AVATAR_BASE_CLASS_NAME, "h-8", "w-8", "text-xs");

/** The presence dot docked at a member avatar's lower edge. */
export const GROUP_CHAT_AVATAR_PRESENCE_CLASS_NAME = cn(
  "absolute",
  "-bottom-0.5",
  "-right-0.5",
  "h-2.5",
  "w-2.5",
  "rounded-full",
  "bg-success",
  "ring-2",
  "ring-surface",
);

/** The fixed tints the avatar palette rotates through by member name. */
export const GROUP_CHAT_AVATAR_TINT_CLASS_NAMES = [
  cn("bg-accent-soft"),
  cn("bg-surface-tertiary"),
  cn("bg-success-soft"),
  cn("bg-warning-soft"),
] as const;

/** One conversation entry: avatar rail plus a message or card column. */
export const GROUP_CHAT_ENTRY_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3", "px-6", "py-4");

/**
 * The compact conversation entry the mobile direction draws: a shorter avatar
 * rail and tighter vertical rhythm, so two accepted messages and a decision card
 * fit the slot band above the docked invitation sheet.
 */
export const GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-2.5", "px-3", "py-0.5");

/** A card entry indents under the author column on wide screens so the card reads attached to its message. */
export const GROUP_CHAT_CARD_INSET_CLASS_NAME = cn("min-w-0", "flex-1", "min-[70rem]:ml-20");

/** Flexible content column inside one entry or band. */
export const GROUP_CHAT_GROW_CLASS_NAME = cn("min-w-0", "flex-1");

/** Constrained column that may shrink but never claim extra width. */
export const GROUP_CHAT_FIELD_BODY_CLASS_NAME = cn("min-w-0");

/** A peer message bubble in decision presentation reads on the secondary surface. */
export const GROUP_CHAT_BUBBLE_CLASS_NAME = cn("inline-block", "max-w-[38rem]", "rounded-xl", "px-3.5", "py-2", "min-[70rem]:ml-7", "min-[70rem]:py-3.5", "bg-surface-secondary");

/** The viewer's own message bubble reads on the soft accent surface. */
export const GROUP_CHAT_BUBBLE_OWN_CLASS_NAME = cn(
  "inline-block", "max-w-[38rem]", "rounded-xl", "px-3.5", "py-2", "bg-accent-soft",
  "min-[70rem]:ml-7", "min-[70rem]:w-[38.375rem]", "min-[70rem]:py-3.5",
  "min-[70rem]:[&_.starci-core-text]:inline-block", "min-[70rem]:[&_.starci-core-text]:max-w-[31rem]",
);

/** A plain message body in the growth presentation - text on the card, not a bubble. */
export const GROUP_CHAT_MESSAGE_BODY_CLASS_NAME = cn("max-w-[42rem]");

/** An addressed module mention reads as a soft accent chip inside the body line. */
export const GROUP_CHAT_MENTION_CLASS_NAME = cn(
  "inline-flex",
  "rounded-md",
  "bg-accent-soft",
  "px-1",
  "leading-4",
  "font-semibold",
  "text-accent",
);

/** Card bands inside one joined surface: action, consequence, attribution, decision row. */
export const GROUP_CHAT_CARD_BAND_CLASS_NAME = cn("flex", "items-start", "gap-3", "px-4", "py-2.5", "min-[70rem]:py-[1.125rem]");

/** Card bands after the first separate with an edge-to-edge hairline. */
export const GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME = cn(
  "flex",
  "items-start",
  "gap-3",
  "border-t",
  "border-separator",
  "px-4",
  "py-2.5",
  "min-[70rem]:py-[1.125rem]",
);

/** Status badges float above a card's joined surface, inside the entry's own inset. */
export const GROUP_CHAT_BADGE_ROW_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-2", "pb-1.5", "min-[70rem]:pb-4");

/** The waiting status line pairs the pending glyph with the muted copy. */
export const GROUP_CHAT_WAITING_LINE_CLASS_NAME = cn("inline-flex", "items-center", "gap-1.5", "text-muted-foreground");

/** The small framed glyph that leads a card band (review mark, info mark, attribution mark). */
export const GROUP_CHAT_BAND_ICON_CLASS_NAME = cn(
  "flex",
  "h-8",
  "w-8",
  "flex-none",
  "items-center",
  "justify-center",
  "rounded-lg",
  "border",
  "border-separator",
  "text-muted-foreground",
  "min-[70rem]:[&_.starci-core-icon]:size-5",
);

/** Actions sit side by side inside the card's final band; the decision keeps the wider share. */
export const GROUP_CHAT_CARD_ACTIONS_CLASS_NAME = cn("flex", "gap-3", "border-t", "border-separator", "px-4", "py-3", "min-[70rem]:py-4");

/** The affirmative decision takes the wider share of the action band. */
export const GROUP_CHAT_ACTION_PRIMARY_CLASS_NAME = cn("min-w-0", "flex-[2]", "min-[70rem]:flex-1");

/** The negative decision keeps the smaller share of the action band. */
export const GROUP_CHAT_ACTION_SECONDARY_CLASS_NAME = cn("min-w-0", "flex-1");

/** Native role choices sit on one wrapping line. */
export const GROUP_CHAT_ROLE_CHOICES_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-4");

/** One radio-like role choice keeps the native input for focus and keyboard behaviour. */
export const GROUP_CHAT_ROLE_CHOICE_CLASS_NAME = cn("inline-flex", "items-center", "gap-2");

/** The role radio reads as a quiet circle until the accent fills the checked one. */
export const GROUP_CHAT_ROLE_RADIO_CLASS_NAME = cn("h-4", "w-4", "accent-current");

/** Vertical stack shared by the invite and acceptance forms. */
export const GROUP_CHAT_FORM_STACK_CLASS_NAME = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-2", "min-[70rem]:[&>button]:mt-5");

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
);

/** Native labelled select, shared by the role and Tasks filters. */
export const GROUP_CHAT_NATIVE_FIELD_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");

/** The native select/input control keeps the app's control rhythm. */
export const GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME = cn("min-h-11", "w-full", "px-4", "py-3");

/** Composer row pinned below the conversation scroll region. */
export const GROUP_CHAT_COMPOSER_CLASS_NAME = cn(
  "flex",
  "items-end",
  "gap-2",
  "p-3",
  "min-[70rem]:relative",
  "min-[70rem]:h-[7.125rem]",
  "min-[70rem]:items-start",
  "min-[70rem]:[&_[data-slot=input]]:h-[5.25rem]",
  "min-[70rem]:[&_[data-slot=input]]:pt-3",
  "min-[70rem]:[&_[data-slot=input]]:pb-10",
  "min-[70rem]:[&>button]:absolute",
  "min-[70rem]:[&>button]:bottom-7",
  "min-[70rem]:[&>button]:right-7",
  "min-[70rem]:[&>button]:h-10",
  "min-[70rem]:[&>button]:w-20",
);

export const GROUP_CHAT_COMPOSER_DECISION_CLASS_NAME = cn(
  GROUP_CHAT_COMPOSER_CLASS_NAME,
  "min-[70rem]:h-[5.625rem]",
  "min-[70rem]:[&_[data-slot=input]]:h-16",
);

/** The compact composer keeps the same row on a shorter inset. */
export const GROUP_CHAT_COMPOSER_COMPACT_CLASS_NAME = cn("flex", "items-end", "gap-2", "p-1");

/**
 * The composer's leading glyph cluster. The accepted composite draws an
 * attachment, an emoji and a mention affordance; the surface owns no such
 * command, so the cluster is decorated and never a keyboard stop - the mention
 * itself is the typed `@module` address the thread already renders.
 */
export const GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME = cn("flex", "shrink-0", "items-center", "gap-1.5", "px-1", "text-muted-foreground", "min-[70rem]:absolute", "min-[70rem]:bottom-7", "min-[70rem]:left-8");

/** One inline glyph of the composer's decorative cluster. */
export const GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME = cn("h-5", "w-5");

/** The in-progress send keeps its draft visible and locked above the composer. */
export const GROUP_CHAT_SEND_STATE_CLASS_NAME = cn("flex", "items-center", "justify-between", "gap-3", "px-3", "py-2");

/** Tasks filter row: three labelled selects in one reading line on wide screens. */
export const GROUP_CHAT_FILTERS_CLASS_NAME = cn("grid", "grid-cols-1", "gap-3", "sm:grid-cols-3");

/** The Tasks tab column: filters, hint, then the list card inside its own scroll region. */
export const GROUP_CHAT_TASKS_COLUMN_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4", "p-4");

/** The Tasks panel owns a plain vertical scroll region inside the workbench card. */
export const GROUP_CHAT_TAB_PANEL_SCROLL_CLASS_NAME = cn("min-h-0", "flex-1", "overflow-y-auto");

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
export const GROUP_CHAT_CONVERSATION_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "py-1");

/** The compact conversation list trims the slot band's outer padding. */
export const GROUP_CHAT_CONVERSATION_LIST_COMPACT_CLASS_NAME = cn("flex", "min-w-0", "flex-col");

/** Narrow column for a notice row's follow action. */
export const GROUP_CHAT_NOTICE_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "justify-between", "gap-3", "px-4", "py-2");

/** The loading read stays centered inside the workbench card. */
export const GROUP_CHAT_LOADING_CLASS_NAME = cn("flex", "min-h-0", "flex-1", "flex-col", "items-center", "justify-center", "gap-3");

/** The composer's accessible label stays off the visual surface; the placeholder carries meaning. */
export const GROUP_CHAT_SR_ONLY_CLASS_NAME = cn("sr-only");
