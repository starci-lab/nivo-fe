/** Closed task lifecycle states returned by Collab task reads. */
export type CollabTaskStatus =
    "created" | "working" | "waiting-on-answer" | "waiting-on-approval" | "done" | "rejected" | "cancelled"

/** The button decisions a waiting approval card accepts. */
export type CollabApprovalDecision = "approve" | "reject"

/** Public projection of the one attributable question a waiting task holds. */
export type CollabTaskQuestionView = {
    readonly questionId: string
    readonly workspaceId: string
    readonly taskId: string
    readonly moduleInstallationId: string
    readonly body: string
    readonly status: "open" | "answered" | "superseded"
    readonly answerMessageId: string | null
    readonly askedAt: string
    readonly answeredAt: string | null
}

/** Public projection of one task-linked approval card and its decision. */
export type CollabApprovalView = {
    readonly approvalId: string
    readonly workspaceId: string
    readonly groupId: string
    readonly taskId: string
    readonly action: string
    readonly consequence: string | null
    readonly heldActionKey: string
    readonly requiredRole: "manager-or-owner"
    readonly status: "waiting" | "approved" | "rejected" | "withdrawn"
    readonly decidedByMemberId: string | null
    readonly decision: CollabApprovalDecision | null
    readonly decidedAt: string | null
    readonly releaseIntentId: string | null
    readonly cardMessageId: string | null
}

/** The card as Office shows it: the approval projection plus its exact two buttons. */
export type CollabApprovalCardView = CollabApprovalView & {
    readonly buttons: ReadonlyArray<CollabApprovalDecision>
    readonly decidedByDisplayName: string | null
    readonly decidedByRole: string | null
}

/** The recorded press returned as the held action's answer. */
export type CollabApprovalAnswer = {
    readonly taskId: string
    readonly groupId: string
    readonly approvalId: string
    readonly heldActionKey: string
    readonly decision: CollabApprovalDecision
    readonly releaseIntentId: string | null
    readonly decidedByMemberId: string
    readonly decidedByDisplayName: string | null
    readonly decidedByRole: string | null
    readonly decidedAt: string
}

/** What the task currently waits on: an attributable answer or an exact card. */
export type CollabTaskWaiting =
    | { readonly kind: "answer"; readonly question: CollabTaskQuestionView }
    | { readonly kind: "approval"; readonly approval: CollabApprovalView }

/** The one authoritative task projection both Office card and Tasks row read. */
export type CollabTaskView = {
    readonly taskId: string
    readonly workspaceId: string
    readonly groupId: string
    readonly bindingId: string | null
    readonly cardMessageId: string | null
    readonly intentId: string
    readonly statement: string
    readonly owningModuleInstallationId: string
    readonly owningModuleKey: string
    readonly owningModuleDisplayName: string | null
    readonly askedByMemberId: string
    readonly askedByDisplayName: string | null
    readonly assignedToMemberId: string | null
    readonly assignedToDisplayName: string | null
    readonly routingRuleId: string | null
    readonly status: CollabTaskStatus
    readonly version: number
    readonly waiting: CollabTaskWaiting | null
    readonly outcome: Record<string, unknown> | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** One page of the authorized Tasks read; filters are presentation, never authority. */
export type CollabTaskList = {
    readonly tasks: ReadonlyArray<CollabTaskView>
    readonly nextCursor?: string
}

/** The exact group card target a Tasks row opens. */
export type CollabTaskCardTarget = {
    readonly groupId: string
    readonly cardMessageId: string | null
    readonly bindingId: string | null
}

/** Outcome of `readTask`; `unavailable` is scope-neutral and discloses nothing. */
export type CollabReadTaskOutcome = {
    readonly outcome: "found" | "unavailable"
    readonly task?: CollabTaskView
    readonly card?: CollabTaskCardTarget
}

/** Outcome of `pressApprovalButton`; a competing press is a conflict, not an overwrite. */
export type CollabPressApprovalButtonOutcome = {
    readonly outcome: "decided" | "existing" | "unavailable"
    readonly card?: CollabApprovalCardView
    readonly task?: CollabTaskView
    readonly answer?: CollabApprovalAnswer
}

/** The two turn reasons a notice may carry. */
