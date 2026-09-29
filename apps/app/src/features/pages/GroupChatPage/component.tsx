import {
    ChatWorkspace,
    EmptyNotice,
    Icon,
    IconButton,
    Input,
    PageContainer,
    SectionHeader,
    SurfaceCard,
    Text,
} from "@starci/grammar/common"
import { useRef, type ReactNode } from "react"
import { IconSource } from "@nivo/ui"
import { Badge, Button, SurfaceListCard, Tabs } from "@starci/grammar/common"
import type {
    CollabApprovalCardView,
    CollabApprovalDecision,
    CollabApprovalView,
    CollabBindingView,
    CollabHumanRole,
    CollabMessageView,
    CollabOfficeParticipant,
    CollabOfficeViewer,
    CollabTaskQuestionView,
    CollabTaskStatus,
    CollabTaskView,
    CollabTurnNoticeItem,
} from "@/modules/api/collab"
import type { CollabTasksFilter } from "@/hooks"
import {
    GROUP_CHAT_ACTION_PRIMARY_CLASS_NAME,
    GROUP_CHAT_ACTION_SECONDARY_CLASS_NAME,
    GROUP_CHAT_AVATAR_PRESENCE_CLASS_NAME,
    GROUP_CHAT_AVATAR_TINT_CLASS_NAMES,
    getGroupChatAvatarClassName,
    GROUP_CHAT_BADGE_ROW_CLASS_NAME,
    GROUP_CHAT_BAND_ICON_CLASS_NAME,
    GROUP_CHAT_CARD_ACTIONS_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME,
    GROUP_CHAT_CARD_INSET_CLASS_NAME,
    getGroupChatComposerActionsClassName,
    getGroupChatComposerClassName,
    getGroupChatComposerFrameClassName,
    GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME,
    GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME,
    GROUP_CHAT_COMPOSER_INPUT_CLASS_NAME,
    GROUP_CHAT_COMPOSER_SEND_CLASS_NAME,
    getGroupChatConversationListClassName,
    GROUP_CHAT_DAY_SELECT_CLASS_NAME,
    GROUP_CHAT_ENTRY_CLASS_NAME,
    GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME,
    GROUP_CHAT_FIELD_BODY_CLASS_NAME,
    GROUP_CHAT_FILTERS_CLASS_NAME,
    GROUP_CHAT_FORM_STACK_CLASS_NAME,
    GROUP_CHAT_FORM_STACK_COMPACT_CLASS_NAME,
    GROUP_CHAT_GROW_CLASS_NAME,
    GROUP_CHAT_HEADER_ACTIONS_CLASS_NAME,
    GROUP_CHAT_HEADER_BAND_CLASS_NAME,
    GROUP_CHAT_HEADER_BAND_COMPACT_CLASS_NAME,
    GROUP_CHAT_HEADER_COMPACT_ROW_CLASS_NAME,
    GROUP_CHAT_LOADING_CLASS_NAME,
    GROUP_CHAT_MEMBER_CHIP_CHEVRON_CLASS_NAME,
    GROUP_CHAT_MEMBER_CHIP_CLASS_NAME,
    GROUP_CHAT_MEMBER_CHIP_ICON_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_ROOMY_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_TRAILING_CLASS_NAME,
    GROUP_CHAT_MENTION_CLASS_NAME,
    getGroupChatMessageBodyClassName,
    GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME,
    GROUP_CHAT_NATIVE_FIELD_CLASS_NAME,
    GROUP_CHAT_NOTICE_ROW_CLASS_NAME,
    GROUP_CHAT_PAGE_CLASS_NAME,
    GROUP_CHAT_RAIL_ASIDE_DECISION_CLASS_NAME,
    GROUP_CHAT_RAIL_ASIDE_INVITE_CLASS_NAME,
    GROUP_CHAT_RAIL_FORM_CLASS_NAME,
    GROUP_CHAT_RAIL_HEAD_ROW_CLASS_NAME,
    GROUP_CHAT_RAIL_HUMANS_BADGE_CLASS_NAME,
    GROUP_CHAT_RAIL_LABEL_CLASS_NAME,
    GROUP_CHAT_RAIL_LABEL_ICON_CLASS_NAME,
    GROUP_CHAT_RAIL_SCROLL_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_INVITE_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_INVITE_FORM_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_INVITE_MODULES_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_ROSTER_HEAD_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_ROSTER_MODULES_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_ROSTER_PEOPLE_CLASS_NAME,
    GROUP_CHAT_ROLE_CHOICE_CLASS_NAME,
    GROUP_CHAT_ROLE_CHOICES_CLASS_NAME,
    GROUP_CHAT_ROLE_RADIO_CLASS_NAME,
    GROUP_CHAT_SEND_STATE_CLASS_NAME,
    GROUP_CHAT_SHEET_BODY_CLASS_NAME,
    GROUP_CHAT_SHEET_HANDLE_CLASS_NAME,
    GROUP_CHAT_SHEET_HEAD_CLASS_NAME,
    GROUP_CHAT_SHEET_PANEL_CLASS_NAME,
    GROUP_CHAT_SHEET_ROSTER_CLASS_NAME,
    GROUP_CHAT_SHEET_SECTION_CLASS_NAME,
    GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME,
    GROUP_CHAT_SR_ONLY_CLASS_NAME,
    GROUP_CHAT_TAB_PANEL_SCROLL_CLASS_NAME,
    GROUP_CHAT_TABS_BAND_CLASS_NAME,
    GROUP_CHAT_TABS_BAND_DECISION_CLASS_NAME,
    GROUP_CHAT_TAB_STRIP_CLASS_NAME,
    GROUP_CHAT_TASK_ROW_CLASS_NAME,
    GROUP_CHAT_TASK_STATEMENT_CLASS_NAME,
    GROUP_CHAT_TASKS_COLUMN_CLASS_NAME,
    GROUP_CHAT_WAITING_LINE_CLASS_NAME,
    GROUP_CHAT_WORKBENCH_CLASS_NAME,
    GROUP_CHAT_WORKSPACE_HOST_DECISION_CLASS_NAME,
    GROUP_CHAT_WORKSPACE_HOST_INVITE_CLASS_NAME,
    GROUP_CHAT_WORKSPACE_WRAP_CLASS_NAME,
} from "./classNames"

/**
 * The pure Office/Tasks surface (`ui.collab.office`, `sds.collab.workspace-chat`,
 * `sds.collab.tasks-tab`) plus its view-model derivation. It renders only what
 * the connected layer already proved: an authorized Office snapshot, one
 * authorized conversation page and one authorized Tasks page. Every action
 * leaves through `on` and every gating decision remains a presentation hint -
 * the Collab boundary rechecks it on each call.
 */

/** Which surface tab the viewer reads. */
export type GroupChatTab = "office" | "tasks"

/**
 * The compact member-sheet presentation follows the same 48rem edge
 * ChatWorkspace's installed compact rail presentation reads (`compactRailQuery`
 * in @starci/grammar). The connected layer measures it and settles the answer
 * into `compactMembers`; below it the surface keeps the peer tabs and the
 * member chip on one chrome row and presents the member content as a bottom
 * sheet instead of the right-edge drawer.
 */

/** Roles an invitation or role change may name - the closed V1 set. */
export const GROUP_CHAT_HUMAN_ROLES: ReadonlyArray<CollabHumanRole> = ["owner", "manager", "staff"]

/**
 * Presentation hint only: the invite controls appear while the server-derived
 * viewer role is Owner or Manager (`sds.collab.workspace-chat` rev 2).
 */
export const mayPresentInvite = (viewer: CollabOfficeViewer | null): boolean =>
    viewer !== null && (viewer.role === "owner" || viewer.role === "manager")

/**
 * Presentation hint only: approval buttons activate while the server-derived
 * viewer role is Manager or Owner; Staff keeps the card readable with the
 * buttons inactive and the plain requirement statement.
 */
export const mayPresentDecision = (viewer: CollabOfficeViewer | null): boolean =>
    viewer !== null && (viewer.role === "owner" || viewer.role === "manager")

/** The roster split the member rail and Tasks filters share. */
export type ParticipantPartition = {
    readonly humans: ReadonlyArray<CollabOfficeParticipant>
    readonly modules: ReadonlyArray<CollabOfficeParticipant>
}

/** Split the authorized roster into current humans and currently hired modules. */
export const partitionParticipants = (participants: ReadonlyArray<CollabOfficeParticipant>): ParticipantPartition => ({
    humans: participants.filter((participant) => participant.kind === "human"),
    modules: participants.filter((participant) => participant.kind === "module"),
})

/**
 * One ordered conversation entry: a durable message, a task receipt card bound
 * to its source message, or a held-action/question card anchored to the exact
 * message that carries it.
 */
export type ConversationItem =
    | {
          readonly kind: "message"
          readonly message: CollabMessageView
          readonly authorName: string
          readonly authorKind: CollabOfficeParticipant["kind"] | null
          readonly addressedName: string | null
          readonly isViewer: boolean
      }
    | {
          readonly kind: "task-card"
          readonly task: CollabTaskView | null
          readonly binding: CollabBindingView
          readonly anchorMessageId: string
      }
    | {
          readonly kind: "approval-card"
          readonly approval: CollabApprovalView
          readonly task: CollabTaskView
      }
    | {
          readonly kind: "question-card"
          readonly question: CollabTaskQuestionView
          readonly task: CollabTaskView
      }

/** A settled press answer indexed by approval identity, replacing the waiting card after a decision. */
export type SettledApprovalMap = Readonly<Record<string, CollabApprovalCardView>>

const participantOf = (
    participants: ReadonlyArray<CollabOfficeParticipant>,
    memberId: string | null,
    moduleInstallationId: string | null,
): CollabOfficeParticipant | null =>
    participants.find(
        (participant): boolean =>
            (memberId !== null && participant.kind === "human" && participant.memberId === memberId) ||
            (moduleInstallationId !== null &&
                participant.kind === "module" &&
                participant.moduleInstallationId === moduleInstallationId),
    ) ?? null

type AnchoredApproval = { readonly approval: CollabApprovalView; readonly task: CollabTaskView }
type AnchoredQuestion = { readonly question: CollabTaskQuestionView; readonly task: CollabTaskView }

/** The authorized pages the conversation composer reads. */
export type ConversationBuildArgs = {
    readonly messages: ReadonlyArray<CollabMessageView>
    readonly cards: ReadonlyArray<CollabBindingView>
    readonly tasks: ReadonlyArray<CollabTaskView>
    readonly participants: ReadonlyArray<CollabOfficeParticipant>
    readonly viewerMemberId: string | null
    readonly unknownAuthor: string
}

/**
 * Compose the Office conversation: messages in committed order, each followed
 * by the cards anchored to it. A waiting approval or open question whose anchor
 * message is not on this page still renders - appended after the last entry so
 * a held action never silently disappears.
 */
export const buildConversationItems = (args: ConversationBuildArgs): ReadonlyArray<ConversationItem> => {
    const { messages, cards, tasks, participants, viewerMemberId, unknownAuthor } = args
    const bindingByMessage = new Map(cards.map((card) => [card.sourceMessageId, card]))
    const taskByBinding = new Map(
        tasks.filter((task) => task.bindingId !== null).map((task) => [task.bindingId as string, task]),
    )
    const anchoredApprovals = new Map<string, Array<AnchoredApproval>>()
    const looseApprovals: Array<AnchoredApproval> = []
    for (const task of tasks) {
        if (task.waiting?.kind !== "approval") {
            continue
        }
        const entry = { approval: task.waiting.approval, task }
        const anchor = entry.approval.cardMessageId ?? task.cardMessageId
        if (anchor !== null && messages.some((message) => message.messageId === anchor)) {
            anchoredApprovals.set(anchor, [...(anchoredApprovals.get(anchor) ?? []), entry])
        } else {
            looseApprovals.push(entry)
        }
    }
    const anchoredQuestions = new Map<string, Array<AnchoredQuestion>>()
    const looseQuestions: Array<AnchoredQuestion> = []
    for (const task of tasks) {
        if (task.waiting?.kind !== "answer") {
            continue
        }
        const entry = { question: task.waiting.question, task }
        const anchor = task.cardMessageId
        if (anchor !== null && messages.some((message) => message.messageId === anchor)) {
            anchoredQuestions.set(anchor, [...(anchoredQuestions.get(anchor) ?? []), entry])
        } else {
            looseQuestions.push(entry)
        }
    }
    const items: Array<ConversationItem> = []
    for (const message of messages) {
        const author = participantOf(participants, message.authorMemberId, message.authorModuleInstallationId)
        const addressed = participantOf(participants, null, message.addressedModuleInstallationId)
        items.push({
            kind: "message",
            message,
            authorName: author?.displayName ?? unknownAuthor,
            authorKind: author?.kind ?? null,
            /* The address token the composite prints is the module key (@sales), not the display name. */
            addressedName: message.addressedModuleKey ?? addressed?.displayName ?? null,
            isViewer: viewerMemberId !== null && message.authorMemberId === viewerMemberId,
        })
        const binding = bindingByMessage.get(message.messageId)
        if (binding !== undefined) {
            items.push({
                kind: "task-card",
                task: taskByBinding.get(binding.bindingId) ?? null,
                binding,
                anchorMessageId: message.messageId,
            })
        }
        for (const entry of anchoredApprovals.get(message.messageId) ?? []) {
            items.push({ kind: "approval-card", approval: entry.approval, task: entry.task })
        }
        for (const entry of anchoredQuestions.get(message.messageId) ?? []) {
            items.push({ kind: "question-card", question: entry.question, task: entry.task })
        }
    }
    for (const entry of looseApprovals) {
        items.push({ kind: "approval-card", approval: entry.approval, task: entry.task })
    }
    for (const entry of looseQuestions) {
        items.push({ kind: "question-card", question: entry.question, task: entry.task })
    }
    return items
}

/**
 * Parse a leading `@Name` token for the postMessage `moduleName` input. The
 * typed name stays a presentation convenience - the command boundary resolves
 * it against current hires and answers `unresolved` for a name it cannot bind.
 */
export const parseAddressedModule = (body: string): string | null => {
    const match = /^@([^\s@]+)\s/u.exec(body.trimStart())
    return match?.[1] ?? null
}

/** The deterministic short reference a task row and card share (uuid prefix, like a short sha). */
export const shortTaskRef = (taskId: string): string => `T-${taskId.replace(/-/g, "").slice(0, 4).toUpperCase()}`

/** A Tasks person or module filter is invalid when its identity left the current roster. */
export const invalidTasksFilter = (
    filter: CollabTasksFilter,
    participants: ReadonlyArray<CollabOfficeParticipant>,
): "person" | "module" | null => {
    if (
        filter.personMemberId !== undefined &&
        !participants.some(
            (participant) => participant.kind === "human" && participant.memberId === filter.personMemberId,
        )
    ) {
        return "person"
    }
    if (
        filter.moduleInstallationId !== undefined &&
        !participants.some(
            (participant) =>
                participant.kind === "module" && participant.moduleInstallationId === filter.moduleInstallationId,
        )
    ) {
        return "module"
    }
    return null
}

/** Badge tone per the one task state machine; never a client-invented state. */
export const taskStatusTone = (
    status: CollabTaskView["status"],
): "neutral" | "accent" | "success" | "warning" | "danger" => {
    switch (status) {
        case "done":
            return "success"
        case "waiting-on-answer":
        case "waiting-on-approval":
            return "warning"
        case "rejected":
        case "cancelled":
            return "danger"
        case "working":
            return "accent"
        case "created":
        default:
            return "neutral"
    }
}

/** Role choices a live invitation link may echo as a display hint; authority never reads it. */
export const parseRoleHint = (raw: string | null): CollabHumanRole | null =>
    raw !== null && GROUP_CHAT_HUMAN_ROLES.includes(raw as CollabHumanRole) ? (raw as CollabHumanRole) : null

/** Copy the connected layer resolves from the locale message files. */
export type GroupChatPageLabels = {
    readonly title: string
    readonly description: string
    readonly workspace: string
    readonly today: string
    readonly tabListLabel: string
    readonly tabs: { readonly office: string; readonly tasks: string }
    readonly roles: Readonly<Record<CollabHumanRole, string>>
    readonly statuses: Readonly<Record<CollabTaskStatus, string>>
    readonly state: {
        readonly loading: string
        readonly retry: string
        readonly readFailedTitle: string
        readonly deniedTitle: string
        readonly deniedBody: string
        readonly backOverview: string
    }
    readonly members: {
        readonly title: string
        readonly humans: (count: number) => string
        readonly modules: (count: number) => string
        readonly countLabel: (count: number) => string
        readonly moduleDescriptions: Readonly<Record<string, string>>
        readonly empty: string
        readonly pending: string
        readonly noModules: string
        readonly moduleRole: string
        readonly openRail: (count: number) => string
        readonly closeRail: string
    }
    readonly invite: {
        readonly title: string
        readonly email: string
        readonly emailPlaceholder: string
        readonly role: string
        readonly hint: string
        readonly submit: string
        readonly sent: (email: string) => string
        readonly existing: string
        readonly refused: string
    }
    readonly conversation: {
        readonly label: string
        readonly empty: string
        readonly unknownAuthor: string
    }
    readonly composer: {
        readonly label: string
        readonly placeholder: string
        readonly send: string
        readonly failed: string
        readonly retry: string
        readonly denied: string
        readonly answering: (moduleName: string, excerpt: string) => string
        readonly cancelAnswer: string
    }
    readonly card: {
        readonly receiptReported: string
        readonly receiptPending: string
        readonly receiptRefused: string
        readonly reference: (ref: string, moduleName: string) => string
        readonly requestedBy: (name: string) => string
        readonly assignedTo: (name: string) => string
    }
    readonly approval: {
        readonly needed: string
        readonly waiting: string
        readonly deciderHint: string
        readonly approve: string
        readonly reject: string
        readonly decidedBy: (name: string, at: string) => string
        readonly withdrawn: string
        readonly uncertain: string
        readonly denied: string
    }
    readonly question: {
        readonly waiting: (name: string) => string
        readonly answer: string
    }
    readonly notice: {
        readonly title: string
        readonly taskAssign: () => string
        readonly approval: string
        readonly open: string
        readonly handled: string
        readonly unavailable: string
    }
    readonly tasks: {
        readonly title: string
        readonly count: (count: number) => string
        readonly filterPerson: string
        readonly filterModule: string
        readonly filterStatus: string
        readonly filterAll: string
        readonly filterHint: string
        readonly empty: string
        readonly invalidFilter: string
        readonly failed: string
        readonly denied: string
        readonly openInOffice: string
        readonly asker: (name: string) => string
        readonly assignee: (name: string) => string
        readonly module: (name: string) => string
    }
    readonly accept: {
        readonly title: string
        readonly body: string
        readonly roleLine: (role: string) => string
        readonly action: string
        readonly refused: string
        readonly invalidLink: string
    }
    readonly formatTime: (iso: string) => string
}

/** Every effect the surface can ask the connected layer to perform. */
export type GroupChatPageActions = {
    readonly changeRailOpen: (isOpen: boolean) => void
    readonly selectTab: (tab: GroupChatTab) => void
    readonly changeComposer: (value: string) => void
    readonly sendMessage: () => void
    readonly retrySend: () => void
    readonly retryOffice: () => void
    readonly retryTasks: () => void
    readonly changeInviteEmail: (value: string) => void
    readonly changeInviteRole: (role: CollabHumanRole) => void
    readonly submitInvite: () => void
    readonly acceptInvitation: () => void
    readonly pressApproval: (approvalId: string, button: CollabApprovalDecision) => void
    readonly answerQuestion: (task: CollabTaskView, question: CollabTaskQuestionView) => void
    readonly cancelAnswer: () => void
    readonly changeTasksFilter: (next: CollabTasksFilter) => void
    readonly openNotice: (noticeId: string) => void
    readonly openTaskCard: (taskId: string) => void
    readonly leaveOffice: () => void
}

/** The settled view the connected layer hands down; all fields already authorized. */
export type GroupChatPageView = {
    readonly screen: "office" | "acceptance"
    readonly officeState: "loading" | "ready" | "failed" | "denied"
    readonly tab: GroupChatTab
    readonly workspaceName: string | null
    readonly viewer: CollabOfficeViewer | null
    readonly participants: ReadonlyArray<CollabOfficeParticipant>
    readonly items: ReadonlyArray<ConversationItem>
    readonly composer: {
        readonly value: string
        readonly pending: boolean
        readonly failure: "retry" | "denied" | null
        readonly answering: {
            readonly questionId: string
            readonly moduleName: string
            readonly excerpt: string
        } | null
    }
    readonly invite: {
        readonly email: string
        readonly role: CollabHumanRole
        readonly pending: boolean
        readonly outcome: "created" | "existing" | "refused" | null
        readonly invitedEmail: string | null
    }
    readonly tasks: {
        readonly state: "loading" | "ready" | "failed" | "denied"
        readonly rows: ReadonlyArray<CollabTaskView>
        readonly filter: CollabTasksFilter
    }
    readonly notices: ReadonlyArray<CollabTurnNoticeItem>
    readonly noticeOutcomes: Readonly<Record<string, "handled" | "ended" | "unavailable">>
    readonly pressingApprovalId: string | null
    readonly settledApprovals: SettledApprovalMap
    readonly approvalNotices: Readonly<Record<string, "denied" | "uncertain">>
    readonly acceptance: {
        readonly state: "ready" | "pending" | "refused"
        readonly roleHint: CollabHumanRole | null
        readonly invalidLink: boolean
    } | null
}

/**
 * The drawn chrome the connected layer settles: the member rail flag, the compact
 * member-sheet presentation and the resolved copy pack. `labels` rides the
 * shape member because its formatter members keep it out of the pure data atom
 * (`starci-fe/base-props-atom`); every sentence still arrives resolved from
 * the connected half, never translated inside the drawing.
 */
export type GroupChatPageBaseChrome = {
    readonly isRailOpen: boolean
    /** Settled by the connected layer: the viewport is in the compact member-sheet presentation. */
    readonly isCompactMembers?: boolean
    readonly labels: GroupChatPageLabels
}

/** The settled Office/Tasks view model: plain data the connected layer already authorized. */
export type GroupChatPageBaseData = {
    readonly view: GroupChatPageView
}

/** Public API role for the pure page: `{ state, props, on }` of atoms. */
export type GroupChatPageBaseProps = {
    readonly state: GroupChatPageBaseChrome
    readonly props: GroupChatPageBaseData
    readonly on: GroupChatPageActions
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's
 * own name and demands the contract be spelled `<Unit>Props`, so this private alias
 * is the only name the rule accepts; the exported contract above stays
 * `<Unit>BaseProps`, which the code-pattern check requires the render half to own.
 * Not exported: one public contract per unit.
 */
type GroupChatPageProps = GroupChatPageBaseProps

const initialsOf = (displayName: string): string =>
    displayName
        .split(/\s+/u)
        .filter((part) => part.length > 0)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2) || "?"

/** The name hash that keeps one member on one avatar tint across roster, messages and sheet. */
const avatarTintClassName = (name: string): string => {
    let hash = 0
    for (let index = 0; index < name.length; index += 1) {
        hash = (hash * 31 + name.charCodeAt(index)) | 0
    }
    return (
        GROUP_CHAT_AVATAR_TINT_CLASS_NAMES[Math.abs(hash) % GROUP_CHAT_AVATAR_TINT_CLASS_NAMES.length] ??
        "bg-accent-soft"
    )
}

/** Props for the tinted member avatar shared by message authors and roster rows. */
type MemberAvatarProps = {
    readonly name: string
    readonly kind: CollabOfficeParticipant["kind"] | null
    readonly presence?: boolean
    /** The compact slot rows use the smaller avatar so two messages fit above the sheet. */
    readonly compact?: boolean
}

const MemberAvatar = ({ name, kind, presence = false, compact = false }: MemberAvatarProps) => (
    <span className={getGroupChatAvatarClassName(compact, avatarTintClassName(name))} aria-hidden="true">
        {kind === "module" ? <Icon source={IconSource("agentos", "leading")} usage="leading" /> : initialsOf(name)}
        {presence ? <span className={GROUP_CHAT_AVATAR_PRESENCE_CLASS_NAME} /> : null}
    </span>
)

/** Props for one roster row. */
type MemberRowProps = {
    readonly participant: CollabOfficeParticipant
    readonly labels: GroupChatPageLabels
    /** The accepted growth rail draws the richer row: presence dot, module summary and trailing affordance. */
    readonly detailed?: boolean
    /** The compact member sheet keeps its existing type scale. */
    readonly compact?: boolean
    readonly roomy?: boolean
}

const MemberRow = ({ participant, labels, detailed = false, compact = false, roomy = false }: MemberRowProps) => {
    let subtitle: string
    if (participant.kind === "module") {
        subtitle = detailed
            ? (labels.members.moduleDescriptions[participant.displayName] ?? labels.members.moduleRole)
            : labels.members.moduleRole
    } else {
        subtitle = labels.roles[participant.role as CollabHumanRole] ?? participant.role
    }
    return (
        <div
            className={roomy ? GROUP_CHAT_MEMBER_ROW_ROOMY_CLASS_NAME : GROUP_CHAT_MEMBER_ROW_CLASS_NAME}
            data-member-id={participant.memberId}
        >
            <MemberAvatar
                name={participant.displayName}
                kind={participant.kind}
                presence={detailed && participant.kind === "human" && participant.status === "active"}
            />
            <div className={GROUP_CHAT_GROW_CLASS_NAME}>
                <Text size={compact ? "sm" : "md"} weight="semibold" overflow="truncate">
                    {participant.displayName}
                </Text>
                <Text size={compact ? "xs" : "sm"} tone="muted">
                    {subtitle}
                </Text>
            </div>
            {participant.status === "invited" ? <Badge tone="warning">{labels.members.pending}</Badge> : null}
            {detailed && participant.kind === "human" ? (
                <span className={GROUP_CHAT_MEMBER_ROW_TRAILING_CLASS_NAME} aria-hidden="true">
                    ···
                </span>
            ) : null}
        </div>
    )
}

/** Props for one durable message entry. */
type MessageEntryProps = {
    readonly item: Extract<ConversationItem, { kind: "message" }>
    readonly labels: GroupChatPageLabels
    /**
     * The accepted decision composite reads messages on restrained bubbles while
     * the growth composite keeps them as plain lines on the card surface.
     */
    readonly decision: boolean
    /** The compact slot band reads the tighter row and smaller message body. */
    readonly compact?: boolean
}

/** The bubble body without the leading `@Name` the wire already marks as the address token. */
const displayMessageBody = (message: CollabMessageView): string => {
    if (message.addressedModuleInstallationId === null) {
        return message.body
    }
    const rest = message.body.replace(/^\s*@[^\s@]+\s*/u, "")
    return rest === "" ? message.body : rest
}

const MessageEntry = ({ item, labels, decision, compact = false }: MessageEntryProps) => {
    const { message, authorName, authorKind, addressedName, isViewer } = item
    const body = displayMessageBody(message)
    const bodyContent = (
        <>
            {addressedName !== null ? (
                <span className={GROUP_CHAT_MENTION_CLASS_NAME}>{`@${addressedName}`}</span>
            ) : null}
            {addressedName !== null ? " " : null}
            <Text as="span" size={compact ? "xs" : "md"}>
                {body}
            </Text>
        </>
    )
    return (
        <article
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={`collab-msg-${message.messageId}`}
        >
            <MemberAvatar name={authorName} kind={authorKind} compact={compact} />
            <div className={GROUP_CHAT_GROW_CLASS_NAME}>
                <Text size={compact ? "xs" : "md"} weight="semibold">
                    {authorName}{" "}
                    <Text as="span" size="xs" tone="muted">
                        {labels.formatTime(message.occurredAt)}
                    </Text>
                </Text>
                <div className={getGroupChatMessageBodyClassName(decision, isViewer)}>{bodyContent}</div>
            </div>
        </article>
    )
}

/** Props for one task receipt card bound to its source message. */
type TaskReceiptCardProps = {
    readonly item: Extract<ConversationItem, { kind: "task-card" }>
    readonly labels: GroupChatPageLabels
    readonly compact?: boolean
}

const TaskReceiptCard = ({ item, labels, compact = false }: TaskReceiptCardProps) => {
    const { binding, task } = item
    const status = task?.status ?? null
    const receipt = binding.receipt
    const receiptLabel =
        receipt.disposition === "reported"
            ? labels.card.receiptReported
            : receipt.disposition === "refused"
              ? labels.card.receiptRefused
              : labels.card.receiptPending
    const moduleName = task?.owningModuleDisplayName ?? binding.receiverModuleKey
    const ref = task === null ? binding.commandName : shortTaskRef(task.taskId)
    return (
        <div
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={task === null ? undefined : `collab-task-${task.taskId}`}
        >
            <div className={GROUP_CHAT_CARD_INSET_CLASS_NAME}>
                <SurfaceCard composition="joined" depth="nested" ariaLabel={task?.statement ?? binding.commandName}>
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <Text size={compact ? "sm" : "md"} weight="semibold">
                            {task?.statement ?? binding.commandName}
                        </Text>
                        {status !== null ? (
                            <Badge tone={taskStatusTone(status)}>{labels.statuses[status]}</Badge>
                        ) : null}
                        <Badge
                            tone={
                                receipt.disposition === "refused"
                                    ? "danger"
                                    : receipt.disposition === "reported"
                                      ? "success"
                                      : "neutral"
                            }
                        >
                            {receiptLabel}
                        </Badge>
                    </div>
                    <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                        <Text size="xs" tone="muted">
                            {labels.card.reference(ref, moduleName)}
                            {task?.askedByDisplayName ? ` • ${labels.card.requestedBy(task.askedByDisplayName)}` : ""}
                            {task?.assignedToDisplayName
                                ? ` • ${labels.card.assignedTo(task.assignedToDisplayName)}`
                                : ""}
                        </Text>
                    </div>
                </SurfaceCard>
            </div>
        </div>
    )
}

/** Props for one held-action card with its decision row. */
type ApprovalCardProps = {
    readonly item: Extract<ConversationItem, { kind: "approval-card" }>
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    readonly compact?: boolean
}

const ApprovalCard = ({ item, view, on, labels, compact = false }: ApprovalCardProps) => {
    const { approval, task } = item
    const settled = view.settledApprovals[approval.approvalId]
    const effective: CollabApprovalView = settled ?? approval
    const isWaiting = effective.status === "waiting"
    const eligible = mayPresentDecision(view.viewer)
    const pending = view.pressingApprovalId === approval.approvalId
    const pressNotice = view.approvalNotices[approval.approvalId]
    const moduleName = task.owningModuleDisplayName ?? task.owningModuleKey
    const decisionTone =
        effective.status === "approved"
            ? "success"
            : effective.status === "rejected"
              ? "danger"
              : effective.status === "withdrawn"
                ? "neutral"
                : "warning"
    return (
        <div
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={`collab-approval-${approval.approvalId}`}
        >
            <div className={GROUP_CHAT_CARD_INSET_CLASS_NAME}>
                <div className={GROUP_CHAT_BADGE_ROW_CLASS_NAME}>
                    {isWaiting ? (
                        <>
                            <Badge tone="danger">{labels.approval.needed}</Badge>
                            <span className={GROUP_CHAT_WAITING_LINE_CLASS_NAME}>
                                <Icon source={IconSource("pending", "chip")} usage="chip" />
                                <Text as="span" size="sm" tone="muted">
                                    {labels.approval.waiting}
                                </Text>
                            </span>
                        </>
                    ) : (
                        <Badge tone={decisionTone}>
                            {
                                labels.statuses[
                                    effective.status === "approved"
                                        ? "done"
                                        : effective.status === "rejected"
                                          ? "rejected"
                                          : "cancelled"
                                ]
                            }
                        </Badge>
                    )}
                </div>
                <SurfaceCard composition="joined" depth="nested" ariaLabel={effective.action}>
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <span className={GROUP_CHAT_BAND_ICON_CLASS_NAME} aria-hidden="true">
                            <Icon source={IconSource("review", "leading")} usage="leading" />
                        </span>
                        <Text size={compact ? "sm" : "md"} weight="semibold">
                            {effective.action}
                        </Text>
                    </div>
                    {effective.consequence === null ? null : (
                        <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                            <span className={GROUP_CHAT_BAND_ICON_CLASS_NAME} aria-hidden="true">
                                i
                            </span>
                            <Text size={compact ? "sm" : "md"}>{effective.consequence}</Text>
                        </div>
                    )}
                    <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                        <span className={GROUP_CHAT_BAND_ICON_CLASS_NAME} aria-hidden="true">
                            <Icon source={IconSource("account", "leading")} usage="leading" />
                        </span>
                        <div className={GROUP_CHAT_FIELD_BODY_CLASS_NAME}>
                            <Text size={compact ? "sm" : "md"} weight="medium">
                                {labels.card.reference(shortTaskRef(task.taskId), moduleName)}
                                {task.askedByDisplayName
                                    ? ` · ${labels.card.requestedBy(task.askedByDisplayName)}`
                                    : ""}
                            </Text>
                            <Text size="xs" tone="muted">
                                {settled !== undefined &&
                                settled.decidedByDisplayName !== null &&
                                effective.decidedAt !== null
                                    ? labels.approval.decidedBy(
                                          settled.decidedByDisplayName,
                                          labels.formatTime(effective.decidedAt),
                                      )
                                    : effective.status === "withdrawn"
                                      ? labels.approval.withdrawn
                                      : labels.approval.deciderHint}
                            </Text>
                            {pressNotice === "denied" ? (
                                <Text size="xs" live="assertive">
                                    {labels.approval.denied}
                                </Text>
                            ) : pressNotice === "uncertain" ? (
                                <Text size="xs" live="assertive">
                                    {labels.approval.uncertain}
                                </Text>
                            ) : null}
                        </div>
                    </div>
                    {isWaiting ? (
                        <div className={GROUP_CHAT_CARD_ACTIONS_CLASS_NAME}>
                            <div className={GROUP_CHAT_ACTION_PRIMARY_CLASS_NAME}>
                                <Button
                                    variant="primary"
                                    width="fill"
                                    isDisabled={!eligible || pending}
                                    isPending={pending}
                                    onPress={() => on.pressApproval(approval.approvalId, "approve")}
                                >
                                    {labels.approval.approve}
                                </Button>
                            </div>
                            <div className={GROUP_CHAT_ACTION_SECONDARY_CLASS_NAME}>
                                <Button
                                    variant="outline"
                                    width="fill"
                                    isDisabled={!eligible || pending}
                                    isPending={pending}
                                    onPress={() => on.pressApproval(approval.approvalId, "reject")}
                                >
                                    {labels.approval.reject}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </SurfaceCard>
            </div>
        </div>
    )
}

/** Props for one module question card with the assignee's answer affordance. */
type QuestionCardProps = {
    readonly item: Extract<ConversationItem, { kind: "question-card" }>
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    readonly compact?: boolean
}

const QuestionCard = ({ item, view, on, labels, compact = false }: QuestionCardProps) => {
    const { question, task } = item
    const moduleName = task.owningModuleDisplayName ?? task.owningModuleKey
    const waitingOn = task.assignedToDisplayName ?? ""
    const mayAnswer = view.viewer !== null && task.assignedToMemberId === view.viewer.memberId
    const isAnswering = view.composer.answering?.questionId === question.questionId
    return (
        <div
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={`collab-question-${question.questionId}`}
        >
            <div className={GROUP_CHAT_CARD_INSET_CLASS_NAME}>
                <SurfaceCard composition="joined" depth="nested" ariaLabel={question.body}>
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <div className={GROUP_CHAT_GROW_CLASS_NAME}>
                            <Text size="xs" weight="medium" tone="muted">
                                {labels.card.reference(shortTaskRef(task.taskId), moduleName)}
                            </Text>
                            <Text size="sm">{question.body}</Text>
                        </div>
                        <Badge tone="warning">{labels.question.waiting(waitingOn)}</Badge>
                    </div>
                    {mayAnswer ? (
                        <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                            <Button
                                variant="secondary"
                                size="sm"
                                isDisabled={isAnswering}
                                onPress={() => on.answerQuestion(task, question)}
                            >
                                {labels.question.answer}
                            </Button>
                        </div>
                    ) : null}
                </SurfaceCard>
            </div>
        </div>
    )
}

/** Props for the role-gated invitation form shared by the member rail and the compact sheet. */
type InviteFormProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /** The docked compact sheet keeps the email label off the surface - its a11y name stays. */
    readonly compact?: boolean
}

const InviteForm = ({ view, on, labels, compact = false }: InviteFormProps) => (
    <form
        className={compact ? GROUP_CHAT_FORM_STACK_COMPACT_CLASS_NAME : GROUP_CHAT_FORM_STACK_CLASS_NAME}
        onSubmit={(event) => {
            event.preventDefault()
            on.submitInvite()
        }}
    >
        <Input
            id="collab-invite-email"
            name="invite-email"
            kind="email"
            label={labels.invite.email}
            placeholder={labels.invite.emailPlaceholder}
            value={view.invite.email}
            isDisabled={view.invite.pending}
            isRequired
            onValueChange={on.changeInviteEmail}
        />
        <fieldset className={GROUP_CHAT_FIELD_BODY_CLASS_NAME}>
            <Text as="span" size="sm" weight="semibold">
                {labels.invite.role}
            </Text>
            <div className={GROUP_CHAT_ROLE_CHOICES_CLASS_NAME} role="radiogroup" aria-label={labels.invite.role}>
                {GROUP_CHAT_HUMAN_ROLES.map((role) => (
                    <label key={role} className={GROUP_CHAT_ROLE_CHOICE_CLASS_NAME}>
                        <input
                            type="radio"
                            name="invite-role"
                            value={role}
                            className={GROUP_CHAT_ROLE_RADIO_CLASS_NAME}
                            checked={view.invite.role === role}
                            disabled={view.invite.pending}
                            onChange={() => on.changeInviteRole(role)}
                        />
                        <Text as="span" size="sm">
                            {labels.roles[role]}
                        </Text>
                    </label>
                ))}
            </div>
        </fieldset>
        <Text size="xs" tone="muted">
            {labels.invite.hint}
        </Text>
        {view.invite.outcome === "created" && view.invite.invitedEmail !== null ? (
            <Text size="sm" tone="accent" live="polite">
                {labels.invite.sent(view.invite.invitedEmail)}
            </Text>
        ) : null}
        {view.invite.outcome === "existing" ? (
            <Text size="sm" tone="muted" live="polite">
                {labels.invite.existing}
            </Text>
        ) : null}
        {view.invite.outcome === "refused" ? (
            <Text size="sm" live="assertive">
                {labels.invite.refused}
            </Text>
        ) : null}
        <Button
            type="submit"
            variant="primary"
            width="fill"
            isPending={view.invite.pending}
            isDisabled={view.invite.email.trim().length === 0}
        >
            {labels.invite.submit}
        </Button>
    </form>
)

/**
 * Props for the member rail: one joined card carrying the human roster, the
 * hired modules and the invite section the accepted direction draws as a
 * single right rail - separate member cards pushed the invite control past the
 * 1440x900 fold, so the sections share one surface with hairline dividers.
 */
type MembersRailProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

const MembersRail = ({ view, on, labels }: MembersRailProps) => {
    const { humans, modules } = partitionParticipants(view.participants)
    const mayInvite = mayPresentInvite(view.viewer)
    const focusInviteEmail = () => {
        document.getElementById("collab-invite-email")?.focus()
    }
    return (
        <SurfaceCard composition="joined" depth="nested" ariaLabel={labels.members.title}>
            <div className={GROUP_CHAT_RAIL_SECTION_INVITE_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_HEAD_ROW_CLASS_NAME}>
                    <span className={GROUP_CHAT_RAIL_LABEL_ICON_CLASS_NAME}>
                        <Icon source={IconSource("community", "leading")} usage="leading" />
                        <Text as="span" size="md" weight="semibold">
                            {labels.members.countLabel(humans.length)}
                        </Text>
                    </span>
                    {mayInvite ? (
                        <IconButton
                            source={IconSource("signUp", "leading")}
                            label={labels.invite.title}
                            onPress={focusInviteEmail}
                        />
                    ) : null}
                </div>
                {humans.length === 0 ? (
                    <EmptyNotice message={labels.members.empty} />
                ) : (
                    <>
                        <span className={GROUP_CHAT_RAIL_HUMANS_BADGE_CLASS_NAME}>
                            <Text size="xs" weight="semibold" tone="muted">
                                {labels.members.humans(humans.length)}
                            </Text>
                        </span>
                        {humans.map((participant) => (
                            <MemberRow key={participant.memberId} participant={participant} labels={labels} detailed />
                        ))}
                    </>
                )}
            </div>
            <div className={GROUP_CHAT_RAIL_SECTION_INVITE_MODULES_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Icon source={IconSource("agentos", "leading")} usage="leading" />
                    <Text size="md" weight="semibold">
                        {labels.members.modules(modules.length)}
                    </Text>
                </div>
                {modules.length === 0 ? (
                    <div className={GROUP_CHAT_MEMBER_ROW_CLASS_NAME}>
                        <Text size="sm" tone="muted">
                            {labels.members.noModules}
                        </Text>
                    </div>
                ) : (
                    modules.map((participant) => (
                        <MemberRow
                            key={participant.moduleInstallationId ?? participant.memberId}
                            participant={participant}
                            labels={labels}
                            detailed
                        />
                    ))
                )}
            </div>
            {mayInvite ? (
                <div className={GROUP_CHAT_RAIL_SECTION_INVITE_FORM_CLASS_NAME}>
                    <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                        <Icon source={IconSource("signUp", "leading")} usage="leading" />
                        <Text size="md" weight="semibold">
                            {labels.invite.title}
                        </Text>
                    </div>
                    <div className={GROUP_CHAT_RAIL_FORM_CLASS_NAME}>
                        <InviteForm view={view} on={on} labels={labels} />
                    </div>
                </div>
            ) : null}
        </SurfaceCard>
    )
}

/**
 * The roster-only rail the accepted decision composite draws while an approval
 * is held: members grouped by person or module, no invite section, no
 * presence dots or row menus.
 */
type RosterRailProps = { readonly view: GroupChatPageView; readonly labels: GroupChatPageLabels }

const RosterRail = ({ view, labels }: RosterRailProps) => {
    const { humans, modules } = partitionParticipants(view.participants)
    return (
        <SurfaceCard composition="joined" depth="nested" ariaLabel={labels.members.title}>
            <div className={GROUP_CHAT_RAIL_SECTION_ROSTER_HEAD_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Text size="md" weight="semibold">
                        {labels.members.title}
                    </Text>
                </div>
            </div>
            <div className={GROUP_CHAT_RAIL_SECTION_ROSTER_PEOPLE_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Text size="md" weight="semibold">
                        {labels.members.humans(humans.length)}
                    </Text>
                </div>
                {humans.length === 0 ? (
                    <EmptyNotice message={labels.members.empty} />
                ) : (
                    humans.map((participant) => (
                        <MemberRow key={participant.memberId} participant={participant} labels={labels} roomy />
                    ))
                )}
            </div>
            <div className={GROUP_CHAT_RAIL_SECTION_ROSTER_MODULES_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Text size="md" weight="semibold">
                        {`${labels.members.moduleRole} (${modules.length})`}
                    </Text>
                </div>
                {modules.length === 0 ? (
                    <div className={GROUP_CHAT_MEMBER_ROW_CLASS_NAME}>
                        <Text size="sm" tone="muted">
                            {labels.members.noModules}
                        </Text>
                    </div>
                ) : (
                    modules.map((participant) => (
                        <MemberRow
                            key={participant.moduleInstallationId ?? participant.memberId}
                            participant={participant}
                            labels={labels}
                            roomy
                        />
                    ))
                )}
            </div>
        </SurfaceCard>
    )
}

/** Props for the roster the compact member sheet shows a viewer who may not invite. */
type MemberSheetRosterProps = { readonly view: GroupChatPageView; readonly labels: GroupChatPageLabels }

const MemberSheetRoster = ({ view, labels }: MemberSheetRosterProps) => {
    const { humans, modules } = partitionParticipants(view.participants)
    return (
        <div className={GROUP_CHAT_SHEET_ROSTER_CLASS_NAME}>
            <div className={GROUP_CHAT_SHEET_SECTION_CLASS_NAME}>
                <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                    <Text size="xs" weight="semibold" tone="muted">
                        {labels.members.humans(humans.length)}
                    </Text>
                </div>
                {humans.length === 0 ? (
                    <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                        <Text size="sm" tone="muted">
                            {labels.members.empty}
                        </Text>
                    </div>
                ) : (
                    humans.map((participant) => (
                        <MemberRow key={participant.memberId} participant={participant} labels={labels} compact />
                    ))
                )}
            </div>
            <div className={GROUP_CHAT_SHEET_SECTION_CLASS_NAME}>
                <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                    <Text size="xs" weight="semibold" tone="muted">
                        {labels.members.modules(modules.length)}
                    </Text>
                </div>
                {modules.length === 0 ? (
                    <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                        <Text size="sm" tone="muted">
                            {labels.members.noModules}
                        </Text>
                    </div>
                ) : (
                    modules.map((participant) => (
                        <MemberRow
                            key={participant.moduleInstallationId ?? participant.memberId}
                            participant={participant}
                            labels={labels}
                            compact
                        />
                    ))
                )}
            </div>
        </div>
    )
}

/** Props for the compact member bottom sheet docked inside the workbench card. */
type MemberSheetProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /** The invitation form docks while no decision is pending; otherwise the sheet carries the plain roster. */
    readonly showInvite: boolean
}

/**
 * The compact member sheet the accepted direction draws as a docked lower band
 * of the workbench card: handle bar, title row with a close control, then the
 * invitation form for a viewer who may invite or the plain roster otherwise.
 * It lives in normal flow below the pinned composer, so the conversation keeps
 * a readable remainder instead of collapsing under an overlay.
 */
const MemberSheet = ({ view, on, labels, showInvite }: MemberSheetProps) => (
    <div
        className={GROUP_CHAT_SHEET_PANEL_CLASS_NAME}
        role="region"
        aria-label={showInvite ? labels.invite.title : labels.members.title}
        data-grammar-member-sheet="open"
    >
        <span className={GROUP_CHAT_SHEET_HANDLE_CLASS_NAME} aria-hidden="true" />
        <div className={GROUP_CHAT_SHEET_HEAD_CLASS_NAME}>
            <Text size="md" weight="semibold">
                {showInvite ? labels.invite.title : labels.members.title}
            </Text>
            <IconButton
                source={IconSource("close", "leading")}
                label={labels.members.closeRail}
                onPress={() => on.changeRailOpen(false)}
            />
        </div>
        <div className={GROUP_CHAT_SHEET_BODY_CLASS_NAME}>
            {showInvite ? (
                <InviteForm view={view} on={on} labels={labels} compact />
            ) : (
                <MemberSheetRoster view={view} labels={labels} />
            )}
        </div>
    </div>
)

/** Props for the outstanding turn-notice band above the conversation. */
type NoticesBandProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

const NoticesBand = ({ view, on, labels }: NoticesBandProps) => {
    if (view.notices.length === 0) {
        return null
    }
    return (
        <SurfaceCard label={labels.notice.title} composition="joined" depth="nested">
            {view.notices.map((item) => {
                const outcome = view.noticeOutcomes[item.notice.noticeId]
                const text = item.notice.turnKind === "approval" ? labels.notice.approval : labels.notice.taskAssign()
                return (
                    <div key={item.notice.noticeId} className={GROUP_CHAT_NOTICE_ROW_CLASS_NAME}>
                        <Text size="sm" isSuperseded={outcome === "handled" || outcome === "ended"}>
                            {text}
                        </Text>
                        {outcome === undefined ? (
                            <Button size="sm" variant="secondary" onPress={() => on.openNotice(item.notice.noticeId)}>
                                {labels.notice.open}
                            </Button>
                        ) : (
                            <Text size="xs" tone="muted">
                                {outcome === "unavailable" ? labels.notice.unavailable : labels.notice.handled}
                            </Text>
                        )}
                    </div>
                )
            })}
        </SurfaceCard>
    )
}

/** Props for the pinned composer: draft, send state and the answering banner. */
type ComposerProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /** The decision composite draws a glyph-only send control; the growth composite keeps the labelled one. */
    readonly decision: boolean
    /** The compact composer keeps the same row on a shorter inset. */
    readonly compact?: boolean
}

const Composer = ({ view, on, labels, decision, compact = false }: ComposerProps) => (
    <div className={GROUP_CHAT_FIELD_BODY_CLASS_NAME}>
        {view.composer.answering !== null ? (
            <div className={GROUP_CHAT_SEND_STATE_CLASS_NAME}>
                <Text size="xs" tone="accent">
                    {labels.composer.answering(view.composer.answering.moduleName, view.composer.answering.excerpt)}
                </Text>
                <Button size="sm" variant="ghost" onPress={on.cancelAnswer}>
                    {labels.composer.cancelAnswer}
                </Button>
            </div>
        ) : null}
        {view.composer.failure === "retry" ? (
            <div className={GROUP_CHAT_SEND_STATE_CLASS_NAME}>
                <Text size="xs" live="assertive">
                    {labels.composer.failed}
                </Text>
                <Button size="sm" variant="secondary" onPress={on.retrySend}>
                    {labels.composer.retry}
                </Button>
            </div>
        ) : null}
        {view.composer.failure === "denied" ? (
            <div className={GROUP_CHAT_SEND_STATE_CLASS_NAME}>
                <Text size="xs" live="assertive">
                    {labels.composer.denied}
                </Text>
            </div>
        ) : null}
        <form
            className={getGroupChatComposerClassName(compact, decision)}
            onSubmit={(event) => {
                event.preventDefault()
                on.sendMessage()
            }}
        >
            <div className={getGroupChatComposerFrameClassName(decision)}>
                <div className={GROUP_CHAT_COMPOSER_INPUT_CLASS_NAME}>
                    <Input
                        id="collab-composer"
                        name="message"
                        label={<span className={GROUP_CHAT_SR_ONLY_CLASS_NAME}>{labels.composer.label}</span>}
                        placeholder={labels.composer.placeholder}
                        value={view.composer.value}
                        isDisabled={view.composer.pending}
                        onValueChange={on.changeComposer}
                    />
                </div>
                <div className={getGroupChatComposerActionsClassName(decision)}>
                    <span className={GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME} aria-hidden="true">
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}
                        >
                            <path
                                d="M13.6 6.3 7.2 12.7a1.7 1.7 0 0 0 2.4 2.4l6.6-6.6a3.3 3.3 0 0 0-4.7-4.7L4.6 10.7a4.9 4.9 0 0 0 6.9 6.9l5.3-5.3"
                                stroke="currentColor"
                                strokeWidth={1.4}
                                strokeLinecap="round"
                            />
                        </svg>
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}
                        >
                            <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth={1.4} />
                            <path
                                d="M7.2 12c.7.9 1.6 1.4 2.8 1.4s2.1-.5 2.8-1.4"
                                stroke="currentColor"
                                strokeWidth={1.4}
                                strokeLinecap="round"
                            />
                            <circle cx="7.7" cy="8.3" r=".9" fill="currentColor" />
                            <circle cx="12.3" cy="8.3" r=".9" fill="currentColor" />
                        </svg>
                        <span className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}>
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}
                            >
                                <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth={1.4} />
                                <path
                                    d="M12.6 11.6a2.9 2.9 0 1 1 .1-2.4v3.6a1.3 1.3 0 0 1-2.6 0V8.9"
                                    stroke="currentColor"
                                    strokeWidth={1.4}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    </span>
                    {decision ? (
                        <IconButton
                            source={IconSource("send", "leading")}
                            label={labels.composer.send}
                            isDisabled={view.composer.value.trim().length === 0 || view.composer.pending}
                            onPress={on.sendMessage}
                        />
                    ) : (
                        <Button
                            type="submit"
                            variant="primary"
                            isPending={view.composer.pending}
                            isDisabled={view.composer.value.trim().length === 0}
                        >
                            <span className={GROUP_CHAT_COMPOSER_SEND_CLASS_NAME}>
                                <Icon source={IconSource("send", "chip")} usage="chip" /> {labels.composer.send}
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </form>
    </div>
)

/** Props for the ordered conversation region. */
type ConversationProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /**
     * Compact presentation pins the region to the latest entry whenever the item
     * count changes; the callback ref fires on every commit, so the pinned count
     * keeps user scrolls intact between arrivals.
     */
    readonly compact?: boolean
    /** The decision composite's restrained bubble treatment replaces plain lines. */
    readonly decision: boolean
}

const Conversation = ({ view, on, labels, compact = false, decision }: ConversationProps) => {
    const itemCount = view.items.length
    const pinnedCountRef = useRef(-1)
    const pinToLatest = (el: HTMLDivElement | null) => {
        if (!compact || el === null || pinnedCountRef.current === itemCount) {
            return
        }
        pinnedCountRef.current = itemCount
        const owner = el.closest("[data-grammar-chat-workspace-scroll-owner='conversation']")
        if (owner instanceof HTMLElement) {
            owner.scrollTop = owner.scrollHeight
        }
    }
    return (
        <div ref={pinToLatest} className={getGroupChatConversationListClassName(compact, decision)}>
            <NoticesBand view={view} on={on} labels={labels} />
            {view.items.length === 0 ? (
                <EmptyNotice message={labels.conversation.empty} />
            ) : (
                view.items.map((item, index) => {
                    switch (item.kind) {
                        case "message":
                            return (
                                <MessageEntry
                                    key={item.message.messageId}
                                    item={item}
                                    labels={labels}
                                    decision={decision}
                                    compact={compact}
                                />
                            )
                        case "task-card":
                            return (
                                <TaskReceiptCard
                                    key={`${item.binding.bindingId}-${index}`}
                                    item={item}
                                    labels={labels}
                                    compact={compact}
                                />
                            )
                        case "approval-card":
                            return (
                                <ApprovalCard
                                    key={item.approval.approvalId}
                                    item={item}
                                    view={view}
                                    on={on}
                                    labels={labels}
                                    compact={compact}
                                />
                            )
                        case "question-card":
                            return (
                                <QuestionCard
                                    key={item.question.questionId}
                                    item={item}
                                    view={view}
                                    on={on}
                                    labels={labels}
                                    compact={compact}
                                />
                            )
                        default:
                            return null
                    }
                })
            )}
        </div>
    )
}

/** Props for the Tasks tab: roster-keyed filters and Office-bound rows. */
type TasksPanelProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

const TasksPanel = ({ view, on, labels }: TasksPanelProps) => {
    const { humans, modules } = partitionParticipants(view.participants)
    const invalid = invalidTasksFilter(view.tasks.filter, view.participants)
    const selectFilter = (patch: Partial<CollabTasksFilter>) => on.changeTasksFilter({ ...view.tasks.filter, ...patch })
    return (
        <div className={GROUP_CHAT_TASKS_COLUMN_CLASS_NAME}>
            <div className={GROUP_CHAT_FILTERS_CLASS_NAME}>
                <label className={GROUP_CHAT_NATIVE_FIELD_CLASS_NAME} htmlFor="collab-filter-person">
                    <Text size="sm" weight="semibold">
                        {labels.tasks.filterPerson}
                    </Text>
                    <select
                        className={GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME}
                        id="collab-filter-person"
                        name="filter-person"
                        value={view.tasks.filter.personMemberId ?? ""}
                        onChange={(event) =>
                            selectFilter({
                                personMemberId:
                                    event.currentTarget.value === "" ? undefined : event.currentTarget.value,
                            })
                        }
                    >
                        <option value="">{labels.tasks.filterAll}</option>
                        {humans.map((human) => (
                            <option key={human.memberId} value={human.memberId}>
                                {human.displayName}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={GROUP_CHAT_NATIVE_FIELD_CLASS_NAME} htmlFor="collab-filter-module">
                    <Text size="sm" weight="semibold">
                        {labels.tasks.filterModule}
                    </Text>
                    <select
                        className={GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME}
                        id="collab-filter-module"
                        name="filter-module"
                        value={view.tasks.filter.moduleInstallationId ?? ""}
                        onChange={(event) =>
                            selectFilter({
                                moduleInstallationId:
                                    event.currentTarget.value === "" ? undefined : event.currentTarget.value,
                            })
                        }
                    >
                        <option value="">{labels.tasks.filterAll}</option>
                        {modules.map((module) => (
                            <option
                                key={module.moduleInstallationId ?? module.memberId}
                                value={module.moduleInstallationId ?? ""}
                            >
                                {module.displayName}
                            </option>
                        ))}
                    </select>
                </label>
                <label className={GROUP_CHAT_NATIVE_FIELD_CLASS_NAME} htmlFor="collab-filter-status">
                    <Text size="sm" weight="semibold">
                        {labels.tasks.filterStatus}
                    </Text>
                    <select
                        className={GROUP_CHAT_NATIVE_CONTROL_CLASS_NAME}
                        id="collab-filter-status"
                        name="filter-status"
                        value={view.tasks.filter.status ?? ""}
                        onChange={(event) =>
                            selectFilter({
                                status:
                                    event.currentTarget.value === ""
                                        ? undefined
                                        : (event.currentTarget.value as CollabTaskStatus),
                            })
                        }
                    >
                        <option value="">{labels.tasks.filterAll}</option>
                        {Object.keys(labels.statuses).map((status) => (
                            <option key={status} value={status}>
                                {labels.statuses[status as CollabTaskStatus]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <Text size="xs" tone="muted">
                {labels.tasks.filterHint}
            </Text>
            <SurfaceListCard
                label={labels.tasks.title}
                fact={view.tasks.state === "ready" ? labels.tasks.count(view.tasks.rows.length) : undefined}
            >
                {invalid !== null ? (
                    <EmptyNotice message={labels.tasks.invalidFilter} />
                ) : view.tasks.state === "loading" ? (
                    <Text size="sm" tone="muted" isSkeleton>
                        {labels.state.loading}
                    </Text>
                ) : view.tasks.state === "failed" ? (
                    <EmptyNotice
                        message={labels.tasks.failed}
                        actionLabel={labels.state.retry}
                        onAction={on.retryTasks}
                    />
                ) : view.tasks.state === "denied" ? (
                    <EmptyNotice message={labels.tasks.denied} />
                ) : view.tasks.rows.length === 0 ? (
                    <EmptyNotice message={labels.tasks.empty} />
                ) : (
                    view.tasks.rows.map((task) => (
                        <div
                            key={task.taskId}
                            className={GROUP_CHAT_TASK_ROW_CLASS_NAME}
                            id={`collab-task-${task.taskId}`}
                        >
                            <Text size="sm" weight="semibold">
                                {shortTaskRef(task.taskId)}
                            </Text>
                            <div className={GROUP_CHAT_TASK_STATEMENT_CLASS_NAME}>
                                <Text size="sm" overflow="truncate">
                                    {task.statement}
                                </Text>
                            </div>
                            <Badge tone={taskStatusTone(task.status)}>{labels.statuses[task.status]}</Badge>
                            <Text size="xs" tone="muted">
                                {labels.tasks.module(task.owningModuleDisplayName ?? task.owningModuleKey)}
                                {task.askedByDisplayName ? ` • ${labels.tasks.asker(task.askedByDisplayName)}` : ""}
                                {task.assignedToDisplayName
                                    ? ` • ${labels.tasks.assignee(task.assignedToDisplayName)}`
                                    : ""}
                            </Text>
                            <Button size="sm" variant="ghost" onPress={() => on.openTaskCard(task.taskId)}>
                                {labels.tasks.openInOffice}
                            </Button>
                        </div>
                    ))
                )}
            </SurfaceListCard>
        </div>
    )
}

/** Props for the acceptance-only screen; no Office fact may render here. */
type AcceptanceSurfaceProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

const AcceptanceSurface = ({ view, on, labels }: AcceptanceSurfaceProps) => {
    const acceptance = view.acceptance
    if (acceptance === null) {
        return null
    }
    return (
        <SurfaceCard label={labels.accept.title} composition="joined">
            <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                <div className={GROUP_CHAT_FORM_STACK_CLASS_NAME}>
                    {acceptance.invalidLink ? (
                        <Text size="sm" live="assertive">
                            {labels.accept.invalidLink}
                        </Text>
                    ) : (
                        <>
                            <Text size="sm">{labels.accept.body}</Text>
                            {acceptance.roleHint !== null ? (
                                <Badge tone="accent">{labels.accept.roleLine(labels.roles[acceptance.roleHint])}</Badge>
                            ) : null}
                            {acceptance.state === "refused" ? (
                                <Text size="sm" live="assertive">
                                    {labels.accept.refused}
                                </Text>
                            ) : null}
                            <Button
                                variant="primary"
                                width="fill"
                                isPending={acceptance.state === "pending"}
                                isDisabled={acceptance.state === "refused"}
                                onPress={on.acceptInvitation}
                            >
                                {labels.accept.action}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </SurfaceCard>
    )
}

/** Render the connected Office/Tasks surface for the current workspace. */
export const GroupChatPageBase = (props: GroupChatPageProps) => {
    const { state, props: data, on }: GroupChatPageBaseProps = props
    const { isRailOpen, labels } = state
    const { view } = data
    const isCompact = state.isCompactMembers === true
    if (view.screen === "acceptance") {
        return (
            <PageContainer measure="reading">
                <SectionHeader level={1} title={labels.title} description={labels.description} />
                <AcceptanceSurface view={view} on={on} labels={labels} />
            </PageContainer>
        )
    }
    if (view.officeState === "denied") {
        return (
            <PageContainer measure="reading">
                <SectionHeader level={1} title={labels.title} description={labels.description} />
                <SurfaceCard label={labels.state.deniedTitle} composition="joined" depth="nested">
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <div className={GROUP_CHAT_FORM_STACK_CLASS_NAME}>
                            <Text size="sm">{labels.state.deniedBody}</Text>
                            <div>
                                <Button variant="secondary" onPress={on.leaveOffice}>
                                    {labels.state.backOverview}
                                </Button>
                            </div>
                        </div>
                    </div>
                </SurfaceCard>
            </PageContainer>
        )
    }
    if (view.officeState === "failed") {
        return (
            <PageContainer measure="reading">
                <SectionHeader level={1} title={labels.title} description={labels.description} />
                <EmptyNotice
                    message={labels.state.readFailedTitle}
                    actionLabel={labels.state.retry}
                    onAction={on.retryOffice}
                />
            </PageContainer>
        )
    }
    /*
     * The accepted composites draw two workbench modes: the growth composite
     * (workspace header, plain message lines, tinted roster rail with the invite
     * form) and the decision composite (no header, restrained bubbles, a roster
     * rail and the glyph-only send control) while an approval card is held. The
     * flag is a presentation reading of the authorized items, never an authority.
     */
    const decisionPending = view.items.some((item): boolean => item.kind === "approval-card")
    const participantCount = view.participants.length
    const railOpenLabel = labels.members.openRail(participantCount)
    const showInviteSurface = mayPresentInvite(view.viewer) && !decisionPending

    const memberChip =
        isCompact && view.officeState === "ready" ? (
            <button
                type="button"
                className={GROUP_CHAT_MEMBER_CHIP_CLASS_NAME}
                data-grammar-member-chip="true"
                aria-expanded={isRailOpen}
                onClick={() => on.changeRailOpen(!isRailOpen)}
            >
                <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={GROUP_CHAT_MEMBER_CHIP_ICON_CLASS_NAME}
                    aria-hidden="true"
                >
                    <circle cx="6" cy="5" r="2.25" stroke="currentColor" strokeWidth={1.4} />
                    <path
                        d="M2.5 13c.5-2 1.9-3 3.5-3s3 1 3.5 3"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                    />
                    <path
                        d="M10.2 3.4a2.25 2.25 0 1 1 .1 4.1M11.5 10.2c1 .4 1.7 1.3 2 2.8"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                    />
                </svg>
                {railOpenLabel}
                <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={GROUP_CHAT_MEMBER_CHIP_CHEVRON_CLASS_NAME}
                    aria-hidden="true"
                >
                    <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        ) : null

    const showHeaderBand = !decisionPending && view.officeState === "ready" && view.workspaceName !== null
    let headerBand: ReactNode = null
    if (showHeaderBand && isCompact) {
        /* The compact header keeps both accepted messages above the docked member sheet. */
        headerBand = (
            <div className={GROUP_CHAT_HEADER_BAND_COMPACT_CLASS_NAME}>
                <div className={GROUP_CHAT_HEADER_COMPACT_ROW_CLASS_NAME}>
                    <Text size="sm" weight="semibold" overflow="truncate">
                        <span>{labels.workspace}</span> <span>{view.workspaceName}</span>
                    </Text>
                    {memberChip}
                </div>
            </div>
        )
    } else if (showHeaderBand) {
        headerBand = (
            <SectionHeader
                level={2}
                title={
                    <>
                        <span>{labels.workspace}</span> <span>{view.workspaceName}</span>
                    </>
                }
                description={labels.description}
                className={GROUP_CHAT_HEADER_BAND_CLASS_NAME}
                action={
                    <div className={GROUP_CHAT_HEADER_ACTIONS_CLASS_NAME}>
                        <select
                            className={GROUP_CHAT_DAY_SELECT_CLASS_NAME}
                            aria-label={labels.today}
                            defaultValue="today"
                        >
                            <option value="today">{labels.today}</option>
                        </select>
                    </div>
                }
            />
        )
    }

    const body =
        view.officeState === "loading" ? (
            <div className={GROUP_CHAT_LOADING_CLASS_NAME} aria-busy="true">
                <Text size="sm" tone="muted" live="polite">
                    {labels.state.loading}
                </Text>
            </div>
        ) : view.tab === "tasks" ? (
            <div className={GROUP_CHAT_TAB_PANEL_SCROLL_CLASS_NAME}>
                <TasksPanel view={view} on={on} labels={labels} />
            </div>
        ) : (
            <>
                <div className={GROUP_CHAT_WORKSPACE_WRAP_CLASS_NAME}>
                    <ChatWorkspace
                        label={labels.title}
                        conversationLabel={labels.conversation.label}
                        conversation={
                            <Conversation
                                view={view}
                                on={on}
                                labels={labels}
                                compact={isCompact}
                                decision={decisionPending}
                            />
                        }
                        composer={
                            <Composer
                                view={view}
                                on={on}
                                labels={labels}
                                decision={decisionPending}
                                compact={isCompact}
                            />
                        }
                    />
                </div>
                {isCompact && isRailOpen ? (
                    <MemberSheet view={view} on={on} labels={labels} showInvite={showInviteSurface} />
                ) : null}
            </>
        )

    return (
        <PageContainer measure="full">
            <div className={GROUP_CHAT_PAGE_CLASS_NAME}>
                <div
                    className={
                        decisionPending
                            ? GROUP_CHAT_WORKSPACE_HOST_DECISION_CLASS_NAME
                            : GROUP_CHAT_WORKSPACE_HOST_INVITE_CLASS_NAME
                    }
                >
                    <div className={GROUP_CHAT_WORKBENCH_CLASS_NAME}>
                        <div
                            className={
                                decisionPending
                                    ? GROUP_CHAT_TABS_BAND_DECISION_CLASS_NAME
                                    : GROUP_CHAT_TABS_BAND_CLASS_NAME
                            }
                        >
                            <div className={GROUP_CHAT_TAB_STRIP_CLASS_NAME}>
                                <Tabs
                                    label={labels.tabListLabel}
                                    selectedKey={view.tab}
                                    items={[
                                        { id: "office", label: labels.tabs.office },
                                        { id: "tasks", label: labels.tabs.tasks },
                                    ]}
                                    onSelect={(key) => on.selectTab(key === "tasks" ? "tasks" : "office")}
                                    inset="none"
                                    labelVisibility="always"
                                />
                            </div>
                            {!showHeaderBand ? memberChip : null}
                        </div>
                        {headerBand}
                        {body}
                    </div>
                    {!isCompact ? (
                        <aside
                            className={
                                decisionPending
                                    ? GROUP_CHAT_RAIL_ASIDE_DECISION_CLASS_NAME
                                    : GROUP_CHAT_RAIL_ASIDE_INVITE_CLASS_NAME
                            }
                            aria-label={labels.members.title}
                        >
                            <div className={GROUP_CHAT_RAIL_SCROLL_CLASS_NAME}>
                                {decisionPending ? (
                                    <RosterRail view={view} labels={labels} />
                                ) : (
                                    <MembersRail view={view} on={on} labels={labels} />
                                )}
                            </div>
                        </aside>
                    ) : null}
                </div>
            </div>
        </PageContainer>
    )
}
