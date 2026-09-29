import { describe, expect, it } from "vitest"
import type { CollabApprovalCardView } from "../../api/collab"
import {
    COLLAB_TASK_STATUSES,
    isCollabApprovalCardView,
    isCollabHumanRole,
    isCollabTaskStatus,
    readCollabInviteOutcome,
    readCollabOpenNotice,
    readCollabPressCard,
} from "./model.guards"

const CARD: CollabApprovalCardView = {
    approvalId: "ap-1",
    workspaceId: "ws-1",
    groupId: "grp-1",
    taskId: "task-1",
    action: "Send the sales report",
    consequence: null,
    heldActionKey: "sales.send-report",
    requiredRole: "manager-or-owner",
    status: "approved",
    decidedByMemberId: "mem-an",
    decision: "approve",
    decidedAt: "2026-09-24T10:30:00Z",
    releaseIntentId: null,
    cardMessageId: "msg-2",
    buttons: ["approve", "reject"],
    decidedByDisplayName: "An",
    decidedByRole: "owner",
}

describe("collab group-chat guards", () => {
    it("accepts only the closed V1 human roles", () => {
        expect(isCollabHumanRole("owner")).toBe(true)
        expect(isCollabHumanRole("manager")).toBe(true)
        expect(isCollabHumanRole("staff")).toBe(true)
        expect(isCollabHumanRole("module")).toBe(false)
        expect(isCollabHumanRole("auditor")).toBe(false)
        expect(isCollabHumanRole(null)).toBe(false)
        expect(isCollabHumanRole(3)).toBe(false)
    })

    it("lists the task lifecycle once and guards filter values against it", () => {
        expect(COLLAB_TASK_STATUSES).toEqual([
            "created",
            "working",
            "waiting-on-answer",
            "waiting-on-approval",
            "done",
            "rejected",
            "cancelled",
        ])
        expect(isCollabTaskStatus("waiting-on-approval")).toBe(true)
        expect(isCollabTaskStatus("")).toBe(false)
        expect(isCollabTaskStatus("archived")).toBe(false)
        expect(isCollabTaskStatus(undefined)).toBe(false)
    })

    it("reads only the settled invite outcomes", () => {
        expect(readCollabInviteOutcome({ outcome: "created" })).toBe("created")
        expect(readCollabInviteOutcome({ outcome: "existing", member: {} })).toBe("existing")
        expect(readCollabInviteOutcome({ outcome: "queued" })).toBeNull()
        expect(readCollabInviteOutcome(undefined)).toBeNull()
        expect(readCollabInviteOutcome(null)).toBeNull()
        expect(readCollabInviteOutcome("created")).toBeNull()
    })

    it("accepts a full approval card and refuses partial or malformed ones", () => {
        expect(isCollabApprovalCardView(CARD)).toBe(true)
        expect(isCollabApprovalCardView({ ...CARD, status: "unknown" })).toBe(false)
        expect(isCollabApprovalCardView({ ...CARD, buttons: ["approve", "postpone"] })).toBe(false)
        expect(isCollabApprovalCardView({ approvalId: "ap-1", state: "approved" })).toBe(false)
        expect(isCollabApprovalCardView("card")).toBe(false)
    })

    it("returns the press card when present and nothing otherwise", () => {
        expect(readCollabPressCard({ card: CARD })).toEqual(CARD)
        expect(readCollabPressCard({ outcome: "decided" })).toBeNull()
        expect(readCollabPressCard({ card: { approvalId: "ap-1" } })).toBeNull()
        expect(readCollabPressCard(null)).toBeNull()
    })

    it("reads the open-notice outcome and keeps only a well-formed target", () => {
        expect(
            readCollabOpenNotice({
                outcome: "open",
                target: { approvalId: "ap-1", taskId: null, cardMessageId: null },
            }),
        ).toEqual({ outcome: "open", target: { approvalId: "ap-1", taskId: null, cardMessageId: null } })
        expect(readCollabOpenNotice({ outcome: "handled" })).toEqual({ outcome: "handled" })
        expect(readCollabOpenNotice({ outcome: "open", target: {} })).toEqual({ outcome: "open" })
        expect(readCollabOpenNotice({ outcome: "queued" })).toBeNull()
        expect(readCollabOpenNotice(undefined)).toBeNull()
    })
})
