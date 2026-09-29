/**
 * The `contract.collab.chat` rev 5 read shapes the e2e GraphQL fixture publishes, plus the
 * deterministic dataset the four journeys walk. These are the served-boundary shapes only —
 * they do not import app code.
 */

export const WORKSPACE_ID = "ws-support"
export const GROUP_ID = "grp-office"
export const OFFICE_PATH = "/vi/chat?workspace=ws-support"

export interface CollabGroup {
    groupId: string
    workspaceId: string
    name: string
    isDefaultOffice: boolean
}

export interface CollabMember {
    memberId: string
    kind: string
    displayName: string
    role: string
    status: string
    moduleInstallationId: string | null
}

export interface CollabViewer {
    memberId: string
    role: string
}

export interface CollabMessage {
    messageId: string
    workspaceId: string
    groupId: string
    authorKind: string
    authorMemberId: string | null
    authorModuleInstallationId: string | null
    body: string
    intentId: string
    addressedModuleInstallationId: string | null
    addressedModuleKey: string | null
    answersQuestionId: string | null
    occurredAt: string
}

export interface CollabBinding {
    bindingId: string
    workspaceId: string
    groupId: string
    sourceMessageId: string
    intentId: string
    receiverModuleInstallationId: string | null
    receiverModuleKey: string
    commandName: string
    commandVersion: string
    askerMemberId: string
    routingRuleId: string | null
    status: string
    receipt: { disposition: string }
}

export interface CollabApproval {
    approvalId: string
    workspaceId: string
    groupId: string
    taskId: string
    action: string
    consequence: string
    heldActionKey: string
    requiredRole: string
    status: string
    decidedByMemberId: string | null
    decision: string | null
    decidedAt: string | null
    releaseIntentId: string | null
    cardMessageId: string
    decidedByDisplayName?: string
    decidedByRole?: string
    buttons?: string[]
}

export interface CollabWaiting {
    kind: string
    approval?: CollabApproval
}

export interface CollabTask {
    taskId: string
    workspaceId: string
    groupId: string
    bindingId: string | null
    cardMessageId: string | null
    intentId: string
    owningModuleInstallationId: string | null
    owningModuleKey: string
    owningModuleDisplayName: string
    askedByMemberId: string
    askedByDisplayName: string
    assignedToMemberId: string
    assignedToDisplayName: string
    routingRuleId: string | null
    status: string
    version: number
    waiting: CollabWaiting | null
    outcome: unknown
    statement: string
    createdAt: string
    updatedAt: string
}

export interface CollabPageState {
    viewer?: CollabViewer
    participants?: CollabMember[]
    messages?: CollabMessage[]
    cards?: CollabBinding[]
    tasks?: CollabTask[]
    notices?: CollabNoticeItem[]
    approval?: CollabApproval
    denied?: boolean
    revoked?: boolean
}

export interface CollabNoticeItem {
    notice: {
        noticeId: string
        workspaceId: string
        groupId: string
        recipientMemberId: string
        turnKind: string
        taskId: string
        approvalId: string
        turnIdentity: string
        status: string
        intentKey: string
        raisedAt: string
        deliveredAt: string
        resolvedAt: string | null
        retiredAt: string | null
    }
    turn: { state: string }
    target: { groupId: string; taskId: string; approvalId: string; cardMessageId: string }
}

/** The `request.input` payload of a collabGatewayRead/Command call. */
export interface CollabFixtureInput {
    personMemberId?: string
    moduleInstallationId?: string
    status?: string
    taskId?: string
    noticeId?: string
    approvalId?: string
    button?: string
    email?: string
    role?: string
    body?: string
    moduleName?: string
    intentId?: string
}

export type GatewayReply =
    | { ok: true; op: string; result: unknown }
    | { ok: false; failure: { op: string; kind: string; reason: string; retryable: boolean } }

export interface Envelope {
    data: unknown
    message: string
    success: boolean
    error: unknown
}

export const ENVELOPE = (data: unknown, message = "ok", error: unknown = null): Envelope => ({
    data,
    message,
    success: error === null,
    error,
})
export const OUTCOME = (op: string, result: unknown): GatewayReply => ({ ok: true, op, result })
export const FAILURE = (op: string, kind: string, reason: string, retryable: boolean): GatewayReply => ({
    ok: false,
    failure: { op, kind, reason, retryable },
})

export const GROUP: CollabGroup = {
    groupId: GROUP_ID,
    workspaceId: WORKSPACE_ID,
    name: "Office",
    isDefaultOffice: true,
}

export const HUMAN_AN: CollabMember = {
    memberId: "mem-an",
    kind: "human",
    displayName: "An Nguyen",
    role: "owner",
    status: "active",
    moduleInstallationId: null,
}
export const HUMAN_MINH: CollabMember = {
    memberId: "mem-minh",
    kind: "human",
    displayName: "Minh",
    role: "manager",
    status: "active",
    moduleInstallationId: null,
}
export const HUMAN_HUY: CollabMember = {
    memberId: "mem-huy",
    kind: "human",
    displayName: "Huy",
    role: "staff",
    status: "active",
    moduleInstallationId: null,
}
export const MODULE_SALES: CollabMember = {
    memberId: "mem-sales",
    kind: "module",
    displayName: "Sales",
    role: "module",
    status: "active",
    moduleInstallationId: "mi-sales",
}
export const MODULE_ACC: CollabMember = {
    memberId: "mem-acc",
    kind: "module",
    displayName: "Accounting",
    role: "module",
    status: "active",
    moduleInstallationId: "mi-acc",
}
export const MODULE_BOT: CollabMember = {
    memberId: "mem-bot",
    kind: "module",
    displayName: "Chatbot",
    role: "module",
    status: "active",
    moduleInstallationId: "mi-bot",
}
export const ROSTER: CollabMember[] = [HUMAN_AN, HUMAN_MINH, HUMAN_HUY, MODULE_SALES, MODULE_ACC, MODULE_BOT]

export const VIEWER_OWNER: CollabViewer = { memberId: HUMAN_AN.memberId, role: "owner" }
export const VIEWER_STAFF: CollabViewer = { memberId: HUMAN_HUY.memberId, role: "staff" }

export const TASK_WAIT_ID = "550e8400-e29b-41d4-a716-446655440000"
export const TASK_DONE_ID = "6f29a1c3-8b74-4d21-9e02-1c7f5a3b8d24"
export const TASK_WORK_ID = "71c4de90-2a53-4b88-8f61-0d9e7c4a51f3"

export const ASK_MESSAGE: CollabMessage = {
    messageId: "msg-1",
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    authorKind: "human",
    authorMemberId: HUMAN_AN.memberId,
    authorModuleInstallationId: null,
    body: "@Sales Bạn có thể gửi giúp mình báo cáo doanh số tháng này không?",
    intentId: "intent-1",
    addressedModuleInstallationId: MODULE_SALES.moduleInstallationId,
    addressedModuleKey: "sales",
    answersQuestionId: null,
    occurredAt: "2026-09-24T09:14:00Z",
}
export const ACK_MESSAGE: CollabMessage = {
    ...ASK_MESSAGE,
    messageId: "msg-2",
    authorKind: "module",
    authorMemberId: null,
    authorModuleInstallationId: MODULE_SALES.moduleInstallationId,
    body: "Vâng, mình sẽ chuẩn bị báo cáo doanh số tháng này.",
    intentId: "intent-2",
    addressedModuleInstallationId: null,
    addressedModuleKey: null,
    occurredAt: "2026-09-24T09:16:00Z",
}
export const HELD_MESSAGE: CollabMessage = {
    ...ACK_MESSAGE,
    messageId: "msg-3",
    body: `Đã giữ một hành động trong nhiệm vụ T-${TASK_WAIT_ID.slice(0, 4).toUpperCase()} và cần phê duyệt.`,
    occurredAt: "2026-09-24T10:24:00Z",
}

export const BINDING: CollabBinding = {
    bindingId: "bind-1",
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    sourceMessageId: ASK_MESSAGE.messageId,
    intentId: ASK_MESSAGE.intentId,
    receiverModuleInstallationId: MODULE_SALES.moduleInstallationId,
    receiverModuleKey: "sales",
    commandName: "build-sales-report",
    commandVersion: "1",
    askerMemberId: HUMAN_AN.memberId,
    routingRuleId: null,
    status: "admitted",
    receipt: { disposition: "not-yet-reported" },
}

export const APPROVAL: CollabApproval = {
    approvalId: "appr-1",
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    taskId: TASK_WAIT_ID,
    action: "Gửi báo cáo doanh số cho đối tác",
    consequence: "Báo cáo sẽ rời khỏi công ty. Kiểm tra người nhận và nội dung trước khi quyết định.",
    heldActionKey: "sales.send-report",
    requiredRole: "manager-or-owner",
    status: "waiting",
    decidedByMemberId: null,
    decision: null,
    decidedAt: null,
    releaseIntentId: null,
    cardMessageId: HELD_MESSAGE.messageId,
}

export const collabTask = (overrides: Partial<CollabTask> & Pick<CollabTask, "taskId" | "statement">): CollabTask => ({
    workspaceId: WORKSPACE_ID,
    groupId: GROUP_ID,
    bindingId: null,
    cardMessageId: null,
    intentId: "intent-1",
    owningModuleInstallationId: MODULE_SALES.moduleInstallationId,
    owningModuleKey: "sales",
    owningModuleDisplayName: "Sales",
    askedByMemberId: HUMAN_AN.memberId,
    askedByDisplayName: "An Nguyen",
    assignedToMemberId: HUMAN_MINH.memberId,
    assignedToDisplayName: "Minh",
    routingRuleId: null,
    status: "working",
    version: 1,
    waiting: null,
    outcome: null,
    createdAt: "2026-09-24T09:15:00Z",
    updatedAt: "2026-09-24T09:16:00Z",
    ...overrides,
})

export const TASK_WAITING_APPROVAL: CollabTask = collabTask({
    taskId: TASK_WAIT_ID,
    bindingId: BINDING.bindingId,
    cardMessageId: HELD_MESSAGE.messageId,
    statement: "Tổng hợp doanh số tuần này",
    status: "waiting-on-approval",
    version: 3,
    waiting: { kind: "approval", approval: APPROVAL },
    updatedAt: "2026-09-24T10:24:00Z",
})
export const TASK_DONE: CollabTask = collabTask({
    taskId: TASK_DONE_ID,
    statement: "Đối soát hoá đơn tháng 8",
    owningModuleInstallationId: MODULE_ACC.moduleInstallationId,
    owningModuleKey: "accounting",
    owningModuleDisplayName: "Accounting",
    assignedToMemberId: HUMAN_HUY.memberId,
    assignedToDisplayName: "Huy",
    status: "done",
    version: 4,
})
export const TASK_WORKING: CollabTask = collabTask({
    taskId: TASK_WORK_ID,
    statement: "Soạn bản nháp thông báo nội bộ",
    owningModuleInstallationId: MODULE_BOT.moduleInstallationId,
    owningModuleKey: "chatbot",
    owningModuleDisplayName: "Chatbot",
    status: "working",
    version: 2,
})

export const notice = (recipientMemberId: string): CollabNoticeItem => ({
    notice: {
        noticeId: "ntc-1",
        workspaceId: WORKSPACE_ID,
        groupId: GROUP_ID,
        recipientMemberId,
        turnKind: "approval",
        taskId: TASK_WAIT_ID,
        approvalId: APPROVAL.approvalId,
        turnIdentity: "turn-approval-appr-1",
        status: "delivered",
        intentKey: "notice-approval-appr-1",
        raisedAt: "2026-09-24T10:24:00Z",
        deliveredAt: "2026-09-24T10:24:01Z",
        resolvedAt: null,
        retiredAt: null,
    },
    turn: { state: "open" },
    target: {
        groupId: GROUP_ID,
        taskId: TASK_WAIT_ID,
        approvalId: APPROVAL.approvalId,
        cardMessageId: HELD_MESSAGE.messageId,
    },
})

/** The module key a hired module answers to: the lowercased display name ("Sales" -> "sales"). */
export const moduleKeyOf = (member: CollabMember): string => member.displayName.toLowerCase()

/** One served page per journey state; `denied`/`revoked` are reads the boundary refuses. */
export const fixturePageForMode = (mode: string): CollabPageState => {
    switch (mode) {
        case "no-module":
            return { viewer: VIEWER_OWNER, participants: [HUMAN_AN, HUMAN_MINH, HUMAN_HUY], messages: [ASK_MESSAGE] }
        case "office-staff":
            return { viewer: VIEWER_STAFF, participants: ROSTER, messages: [ASK_MESSAGE, ACK_MESSAGE] }
        case "accept":
        case "office":
            return { viewer: VIEWER_OWNER, participants: ROSTER, messages: [ASK_MESSAGE, ACK_MESSAGE] }
        case "approval":
            return {
                viewer: VIEWER_OWNER,
                participants: ROSTER,
                messages: [ASK_MESSAGE, HELD_MESSAGE],
                cards: [BINDING],
                tasks: [TASK_WAITING_APPROVAL],
                notices: [notice(HUMAN_AN.memberId)],
            }
        case "approval-staff":
            return {
                viewer: VIEWER_STAFF,
                participants: ROSTER,
                messages: [ASK_MESSAGE, HELD_MESSAGE],
                cards: [BINDING],
                tasks: [TASK_WAITING_APPROVAL],
                notices: [notice(HUMAN_HUY.memberId)],
            }
        case "tasks":
            return {
                viewer: VIEWER_OWNER,
                participants: ROSTER,
                messages: [ASK_MESSAGE, ACK_MESSAGE],
                tasks: [TASK_WAITING_APPROVAL, TASK_DONE, TASK_WORKING],
            }
        case "denied":
            return { denied: true }
        case "revoked":
            return { revoked: true }
        default:
            throw new Error(`unknown fixture mode ${mode}`)
    }
}
