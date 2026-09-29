/**
 * Shared helpers the collab hooks use. Pure module: no React, no state, no
 * transport. Everything here is called from an event handler or an effect,
 * never to produce render output.
 */

/**
 * One idempotency identity per composed message (`contract.collab.chat`). A
 * retried send reuses the intent; a committed one allocates the next. Called
 * from state initializers and event handlers - never during render of a view.
 */
export const newIntentId = (): string =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `intent-${Date.now()}-${Math.random().toString(36).slice(2)}`

/** Bring a rendered card or task into view; a missing node is a no-op. */
export const scrollToElement = (id: string) => {
    if (typeof document === "undefined") {
        return
    }
    const node = document.getElementById(id)
    node?.scrollIntoView({ block: "center" })
}

/** The card identity an open notice carries; at most one member names a target. */
export type CollabNoticeTarget = {
    readonly approvalId: string | null
    readonly taskId: string | null
    readonly cardMessageId: string | null
}

/**
 * The conversation element an open notice's target resolves to: the held
 * approval card first, then the task card, then the source message.
 */
export const noticeTargetElementId = (target: CollabNoticeTarget): string | null =>
    target.approvalId !== null
        ? `collab-approval-${target.approvalId}`
        : target.taskId !== null
          ? `collab-task-${target.taskId}`
          : target.cardMessageId !== null
            ? `collab-msg-${target.cardMessageId}`
            : null
