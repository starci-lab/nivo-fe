import type {
    CollabApprovalCardView,
    CollabApprovalView,
    CollabBindingView,
    CollabHumanRole,
    CollabMessageView,
    CollabOfficeParticipant,
    CollabOfficeViewer,
    CollabTaskQuestionView,
    CollabTaskView,
} from "@/modules/api/collab"
import type { CollabTasksFilter } from "@/hooks"

const GROUP_CHAT_AVATAR_TINT_CLASS_NAMES = [
    "bg-accent-soft",
    "bg-surface-tertiary",
    "bg-success-soft",
    "bg-warning-soft",
] as const

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

/** Derive the two initials shown when a member has no avatar image. */
export const initialsOf = (displayName: string): string =>
    displayName
        .split(/\s+/u)
        .filter((part) => part.length > 0)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2) || "?"

/** The name hash that keeps one member on one avatar tint across roster, messages and sheet. */
export const avatarTintClassName = (name: string): string => {
    let hash = 0
    for (let index = 0; index < name.length; index += 1) {
        hash = (hash * 31 + name.charCodeAt(index)) | 0
    }
    return (
        GROUP_CHAT_AVATAR_TINT_CLASS_NAMES[Math.abs(hash) % GROUP_CHAT_AVATAR_TINT_CLASS_NAMES.length] ??
        "bg-accent-soft"
    )
}

/** The bubble body without the leading `@Name` the wire already marks as the address token. */
export const displayMessageBody = (message: CollabMessageView): string => {
    if (message.addressedModuleInstallationId === null) {
        return message.body
    }
    const rest = message.body.replace(/^\s*@[^\s@]+\s*/u, "")
    return rest === "" ? message.body : rest
}
