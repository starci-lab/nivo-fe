import { vi } from "vitest"
export { labels } from "./labels.fixture"
import type {
    CollabApprovalView,
    CollabBindingView,
    CollabMessageView,
    CollabOfficeParticipant,
    CollabOfficeViewer,
    CollabTaskQuestionView,
    CollabTaskView,
    CollabTurnNoticeItem,
} from "../../api/collab"
import type { GroupChatPageActions, GroupChatPageView } from "./types"
import type { ConversationItem } from "./model"

/** The owner viewer fixture used for role-gated conversations. */
export const OWNER: CollabOfficeViewer = { memberId: "mem-an", role: "owner" }

/** The staff viewer fixture used for read-only actions. */
export const STAFF: CollabOfficeViewer = { memberId: "mem-huy", role: "staff" }

/** The authorized roster fixture shared by model and block specs. */
export const PARTICIPANTS: ReadonlyArray<CollabOfficeParticipant> = [
    {
        memberId: "mem-an",
        kind: "human",
        displayName: "An Nguyen",
        role: "owner",
        status: "active",
        moduleInstallationId: null,
    },
    {
        memberId: "mem-minh",
        kind: "human",
        displayName: "Minh",
        role: "manager",
        status: "active",
        moduleInstallationId: null,
    },
    {
        memberId: "mem-huy",
        kind: "human",
        displayName: "Huy",
        role: "staff",
        status: "active",
        moduleInstallationId: null,
    },
    {
        memberId: "mem-sales",
        kind: "module",
        displayName: "Sales",
        role: "module",
        status: "active",
        moduleInstallationId: "mi-sales",
    },
    {
        memberId: "mem-acc",
        kind: "module",
        displayName: "Accounting",
        role: "module",
        status: "active",
        moduleInstallationId: "mi-acc",
    },
    {
        memberId: "mem-bot",
        kind: "module",
        displayName: "Chatbot",
        role: "module",
        status: "active",
        moduleInstallationId: "mi-bot",
    },
]

/** A human message addressed to the Sales module. */
export const MESSAGE: CollabMessageView = {
    messageId: "msg-1",
    workspaceId: "ws-1",
    groupId: "grp-1",
    authorKind: "human",
    authorMemberId: "mem-an",
    authorModuleInstallationId: null,
    body: "@Sales Can you send me this month's sales report?",
    intentId: "intent-1",
    addressedModuleInstallationId: "mi-sales",
    addressedModuleKey: "sales",
    answersQuestionId: null,
    occurredAt: "2026-09-24T09:14:00Z",
}

/** A module-authored message used to anchor a decision card. */
export const MODULE_MESSAGE: CollabMessageView = {
    ...MESSAGE,
    messageId: "msg-2",
    authorKind: "module",
    authorMemberId: null,
    authorModuleInstallationId: "mi-sales",
    body: "Held an action in task T-104 that needs approval.",
    intentId: "intent-2",
    addressedModuleInstallationId: null,
    addressedModuleKey: null,
    occurredAt: "2026-09-24T10:24:00Z",
}

/** A pending task binding attached to the human message. */
export const BINDING: CollabBindingView = {
    bindingId: "bind-1",
    workspaceId: "ws-1",
    groupId: "grp-1",
    sourceMessageId: "msg-1",
    intentId: "intent-1",
    receiverModuleInstallationId: "mi-sales",
    receiverModuleKey: "sales",
    commandName: "build-sales-report",
    commandVersion: "1",
    askerMemberId: "mem-an",
    routingRuleId: null,
    status: "admitted",
    receipt: { disposition: "not-yet-reported" },
}

/** A held action awaiting a manager or owner decision. */
export const WAITING_APPROVAL: CollabApprovalView = {
    approvalId: "appr-1",
    workspaceId: "ws-1",
    groupId: "grp-1",
    taskId: "550e8400-e29b-41d4-a716-446655440000",
    action: "Send the sales report to the partner",
    consequence: "The report will leave the company. Check the recipient and content before deciding.",
    heldActionKey: "sales.send-report",
    requiredRole: "manager-or-owner",
    status: "waiting",
    decidedByMemberId: null,
    decision: null,
    decidedAt: null,
    releaseIntentId: null,
    cardMessageId: "msg-2",
}

/** An open question assigned to the Sales module. */
export const QUESTION: CollabTaskQuestionView = {
    questionId: "q-1",
    workspaceId: "ws-1",
    taskId: "task-q",
    moduleInstallationId: "mi-sales",
    body: "Do you want the report weekly or monthly?",
    status: "open",
    answerMessageId: null,
    askedAt: "2026-09-24T10:20:00Z",
    answeredAt: null,
}

/** A task fixture with a waiting approval card. */
export const TASK_WAITING_APPROVAL: CollabTaskView = {
    taskId: "550e8400-e29b-41d4-a716-446655440000",
    workspaceId: "ws-1",
    groupId: "grp-1",
    bindingId: "bind-1",
    cardMessageId: "msg-2",
    intentId: "intent-1",
    statement: "Summarise this week's sales",
    owningModuleInstallationId: "mi-sales",
    owningModuleKey: "sales",
    owningModuleDisplayName: "Sales",
    askedByMemberId: "mem-an",
    askedByDisplayName: "An Nguyen",
    assignedToMemberId: "mem-minh",
    assignedToDisplayName: "Minh",
    routingRuleId: null,
    status: "waiting-on-approval",
    version: 3,
    waiting: { kind: "approval", approval: WAITING_APPROVAL },
    outcome: null,
    createdAt: "2026-09-24T09:15:00Z",
    updatedAt: "2026-09-24T10:24:00Z",
}

/** A task fixture with a pending answer card. */
export const TASK_WAITING_ANSWER: CollabTaskView = {
    ...TASK_WAITING_APPROVAL,
    taskId: "task-q",
    cardMessageId: "msg-1",
    status: "waiting-on-answer",
    waiting: { kind: "answer", question: QUESTION },
}

/** An outstanding approval notice that points to the sample task. */
export const NOTICE: CollabTurnNoticeItem = {
    notice: {
        noticeId: "ntc-1",
        workspaceId: "ws-1",
        groupId: "grp-1",
        recipientMemberId: "mem-an",
        turnKind: "approval",
        taskId: TASK_WAITING_APPROVAL.taskId,
        approvalId: "appr-1",
        turnIdentity: "turn-1",
        status: "delivered",
        intentKey: "key-1",
        raisedAt: "2026-09-24T10:24:00Z",
        deliveredAt: "2026-09-24T10:24:30Z",
        resolvedAt: null,
        retiredAt: null,
    },
    turn: { state: "open", handledByMemberId: null, decision: null, handledAt: null },
    target: { groupId: "grp-1", taskId: TASK_WAITING_APPROVAL.taskId, approvalId: "appr-1", cardMessageId: "msg-2" },
}

/** Build the default ready Office view with an optional state patch. */
export const baseView = (patch: Partial<GroupChatPageView> = {}): GroupChatPageView => ({
    screen: "office",
    officeState: "ready",
    tab: "office",
    workspaceName: "Workspace Support",
    viewer: OWNER,
    participants: PARTICIPANTS,
    items: [],
    composer: { value: "", pending: false, failure: null, answering: null },
    invite: { email: "", role: "staff", pending: false, outcome: null, invitedEmail: null },
    tasks: { state: "ready", rows: [], filter: {} },
    notices: [],
    noticeOutcomes: {},
    pressingApprovalId: null,
    settledApprovals: {},
    approvalNotices: {},
    acceptance: null,
    ...patch,
})

/** Return the full typed action surface with callable spies. */
export const actions = (): GroupChatPageActions & Record<keyof GroupChatPageActions, ReturnType<typeof vi.fn>> => {
    const calls = {
        changeRailOpen: vi.fn(),
        selectTab: vi.fn(),
        changeComposer: vi.fn(),
        sendMessage: vi.fn(),
        retrySend: vi.fn(),
        retryOffice: vi.fn(),
        retryTasks: vi.fn(),
        changeInviteEmail: vi.fn(),
        changeInviteRole: vi.fn(),
        submitInvite: vi.fn(),
        acceptInvitation: vi.fn(),
        pressApproval: vi.fn(),
        answerQuestion: vi.fn(),
        cancelAnswer: vi.fn(),
        changeTasksFilter: vi.fn(),
        openNotice: vi.fn(),
        openTaskCard: vi.fn(),
        leaveOffice: vi.fn(),
    }
    return calls
}

/** A receipt binding already reported by its module. */
export const REPORTED_BINDING: CollabBindingView = {
    ...BINDING,
    bindingId: "bind-2",
    sourceMessageId: "msg-3",
    receipt: { disposition: "reported", receiptId: "rcpt-2" },
}

/** A receipt binding refused by its module. */
export const REFUSED_BINDING: CollabBindingView = {
    ...BINDING,
    bindingId: "bind-3",
    sourceMessageId: "msg-4",
    receipt: { disposition: "refused", reason: "unsupported-version" },
}

/** A working task bound to the reported receipt. */
export const WORKING_TASK: CollabTaskView = {
    ...TASK_WAITING_APPROVAL,
    taskId: "task-w",
    bindingId: "bind-2",
    cardMessageId: "msg-3",
    status: "working",
    waiting: null,
    askedByDisplayName: null,
    assignedToDisplayName: null,
    owningModuleDisplayName: null,
}

/** Build a human message with a chosen identity and partial overrides. */
export const messageAt = (messageId: string, patch: Partial<CollabMessageView> = {}): CollabMessageView => ({
    ...MESSAGE,
    messageId,
    addressedModuleInstallationId: null,
    addressedModuleKey: null,
    body: `Tin ${messageId}`,
    ...patch,
})

/** Return the entries of one closed conversation kind for a focused block spec. */
export const conversationItemsOfKind = <Kind extends ConversationItem["kind"]>(
    view: GroupChatPageView,
    kind: Kind,
): ReadonlyArray<Extract<ConversationItem, { kind: Kind }>> =>
    view.items.filter((item): item is Extract<ConversationItem, { kind: Kind }> => item.kind === kind)
