import { describe, expect, it } from "vitest"

import {
    isCollabFailureKind,
    parseCollabAnswerBinding,
    parseCollabAvailableCommandsOutcome,
    parseCollabGroupRead,
    parseCollabMembershipResult,
    parseCollabOfficeView,
    parseCollabOpenTurnNoticeOutcome,
    parseCollabOperation,
    parseCollabPressApprovalButtonOutcome,
    parseCollabReadTaskOutcome,
    parseCollabReconcileOutcome,
    parseCollabRouteOutcome,
    parseCollabTaskList,
    parseCollabTurnNoticePage,
} from "./payload.guards"

const group = { groupId: "g-1", workspaceId: "w-1", name: "Office", isDefaultOffice: true }

const message = {
    messageId: "m-1",
    workspaceId: "w-1",
    groupId: "g-1",
    authorKind: "human",
    authorMemberId: "mem-1",
    authorModuleInstallationId: null,
    body: "hi",
    intentId: "i-1",
    addressedModuleInstallationId: null,
    addressedModuleKey: null,
    answersQuestionId: null,
    occurredAt: "t",
}

const binding = {
    bindingId: "b-1",
    workspaceId: "w-1",
    groupId: "g-1",
    sourceMessageId: "m-1",
    intentId: "i-1",
    receiverModuleInstallationId: "mi-1",
    receiverModuleKey: "mod",
    commandName: "do",
    commandVersion: "1",
    askerMemberId: "mem-1",
    routingRuleId: null,
    status: "recorded",
    receipt: { disposition: "not-yet-reported" },
}

const task = {
    taskId: "t-1",
    workspaceId: "w-1",
    groupId: "g-1",
    bindingId: null,
    cardMessageId: null,
    intentId: "i-1",
    statement: "s",
    owningModuleInstallationId: "mi-1",
    owningModuleKey: "mod",
    owningModuleDisplayName: null,
    askedByMemberId: "mem-1",
    askedByDisplayName: null,
    assignedToMemberId: null,
    assignedToDisplayName: null,
    routingRuleId: null,
    status: "created",
    version: 1,
    waiting: null,
    outcome: null,
    createdAt: "t",
    updatedAt: "t",
}

describe("parseCollabOperation / isCollabFailureKind", () => {
    it("refuse a wire string the closed vocabularies do not name", () => {
        expect(parseCollabOperation("postMessage")).toBe("postMessage")
        expect(parseCollabOperation("deleteOffice")).toBeNull()
        expect(isCollabFailureKind("conflict")).toBe(true)
        expect(isCollabFailureKind("on-fire")).toBe(false)
    })
})

describe("parseCollabOfficeView", () => {
    it("refuses a malformed office: bad participant kind or missing viewer", () => {
        const office = {
            group,
            participants: [
                {
                    memberId: "mem-1",
                    kind: "human",
                    displayName: "A",
                    role: "owner",
                    status: "active",
                    moduleInstallationId: null,
                },
            ],
            viewer: { memberId: "mem-1", role: "owner" },
        }
        expect(parseCollabOfficeView(office)).not.toBeNull()
        expect(
            parseCollabOfficeView({ ...office, participants: [{ ...office.participants[0], kind: "robot" }] }),
        ).toBeNull()
        expect(parseCollabOfficeView({ ...office, viewer: { memberId: "m", role: "guest" } })).toBeNull()
    })
})

describe("parseCollabGroupRead", () => {
    it("refuses a page with a malformed card or a non-string cursor", () => {
        const page = { group, messages: [message], cards: [binding] }
        expect(parseCollabGroupRead(page)).not.toBeNull()
        expect(parseCollabGroupRead({ ...page, cards: [{ ...binding, receipt: { disposition: "lost" } }] })).toBeNull()
        expect(parseCollabGroupRead({ ...page, nextCursor: 5 })).toBeNull()
    })
})

describe("parseCollabAvailableCommandsOutcome", () => {
    it("refuses a status outside the union and a malformed resolved member", () => {
        const member = {
            memberId: "m",
            workspaceId: "w",
            displayName: "d",
            moduleInstallationId: "mi",
            moduleKey: "mod",
            status: "active",
        }
        expect(
            parseCollabAvailableCommandsOutcome({ status: "resolved", member, commands: [{ name: "c", version: "1" }] }),
        ).not.toBeNull()
        expect(parseCollabAvailableCommandsOutcome({ status: "unresolved", availableModules: ["mod"] })).not.toBeNull()
        expect(parseCollabAvailableCommandsOutcome({ status: "half-resolved" })).toBeNull()
        expect(parseCollabAvailableCommandsOutcome({ status: "resolved", member: {}, commands: [] })).toBeNull()
    })
})

describe("parseCollabRouteOutcome", () => {
    it("refuses an outcome kind the route grammar does not name", () => {
        expect(parseCollabRouteOutcome({ kind: "admitted", message, binding })).not.toBeNull()
        expect(parseCollabRouteOutcome({ kind: "unresolved", message })).not.toBeNull()
        expect(parseCollabRouteOutcome({ kind: "vanished", message })).toBeNull()
        expect(parseCollabRouteOutcome({ kind: "clarified", reason: "unmatched", message, clarification: "x", commands: [] })).toBeNull()
    })
})

describe("parseCollabTaskList", () => {
    it("refuses a page whose rows hold a malformed task", () => {
        expect(parseCollabTaskList({ tasks: [task] })).not.toBeNull()
        expect(parseCollabTaskList({ tasks: [{ ...task, status: "half-done" }] })).toBeNull()
        expect(parseCollabTaskList({ tasks: [{ ...task, waiting: { kind: "daydream" } }] })).toBeNull()
    })
})

describe("parseCollabReadTaskOutcome", () => {
    it("refuses an outcome outside the closed pair and a malformed optional task", () => {
        expect(parseCollabReadTaskOutcome({ outcome: "found", task })).not.toBeNull()
        expect(parseCollabReadTaskOutcome({ outcome: "unavailable" })).not.toBeNull()
        expect(parseCollabReadTaskOutcome({ outcome: "vanished" })).toBeNull()
        expect(parseCollabReadTaskOutcome({ outcome: "found", task: {} })).toBeNull()
    })
})

describe("parseCollabPressApprovalButtonOutcome", () => {
    it("refuses an outcome the union does not name and a malformed answer record", () => {
        expect(parseCollabPressApprovalButtonOutcome({ outcome: "decided" })).not.toBeNull()
        expect(parseCollabPressApprovalButtonOutcome({ outcome: "timed-out" })).toBeNull()
        expect(parseCollabPressApprovalButtonOutcome({ outcome: "decided", answer: {} })).toBeNull()
    })
})

describe("parseCollabReconcileOutcome", () => {
    it("refuses a malformed binding inside a matched outcome", () => {
        expect(parseCollabReconcileOutcome({ outcome: "matched", binding })).not.toBeNull()
        expect(parseCollabReconcileOutcome({ outcome: "none" })).not.toBeNull()
        expect(parseCollabReconcileOutcome({ outcome: "matched", binding: {} })).toBeNull()
    })
})

describe("parseCollabAnswerBinding", () => {
    it("refuses an outcome outside the closed set and a non-boolean retryable flag", () => {
        expect(parseCollabAnswerBinding({ outcome: "answered", task })).not.toBeNull()
        expect(parseCollabAnswerBinding({ outcome: "ignored" })).toBeNull()
        expect(parseCollabAnswerBinding({ outcome: "stale", retryable: "yes" })).toBeNull()
    })
})

describe("parseCollabTurnNoticePage", () => {
    it("refuses a notice item with an unknown turn kind or notice status", () => {
        const notice = {
            notice: {
                noticeId: "n-1",
                workspaceId: "w-1",
                groupId: "g-1",
                recipientMemberId: "mem-1",
                turnKind: "task-assign",
                taskId: null,
                approvalId: null,
                turnIdentity: "ti",
                status: "raised",
                intentKey: "k",
                raisedAt: "t",
                deliveredAt: null,
                resolvedAt: null,
                retiredAt: null,
            },
            turn: { state: "open", handledByMemberId: null, decision: null, handledAt: null },
            target: { groupId: "g-1", taskId: null, approvalId: null, cardMessageId: null },
        }
        expect(parseCollabTurnNoticePage({ notices: [notice] })).not.toBeNull()
        expect(
            parseCollabTurnNoticePage({ notices: [{ ...notice, notice: { ...notice.notice, turnKind: "shout" } }] }),
        ).toBeNull()
        expect(
            parseCollabTurnNoticePage({ notices: [{ ...notice, turn: { state: "halfway", handledByMemberId: null, decision: null, handledAt: null } }] }),
        ).toBeNull()
    })
})

describe("parseCollabOpenTurnNoticeOutcome", () => {
    it("refuses an outcome outside the closed set", () => {
        expect(parseCollabOpenTurnNoticeOutcome({ outcome: "open" })).not.toBeNull()
        expect(parseCollabOpenTurnNoticeOutcome({ outcome: "reopened" })).toBeNull()
    })
})

describe("parseCollabMembershipResult", () => {
    it("refuses an outcome the union does not name and a malformed member row", () => {
        const member = {
            memberId: "m",
            workspaceId: "w",
            kind: "human",
            displayName: "A",
            role: "staff",
            status: "active",
        }
        expect(parseCollabMembershipResult({ outcome: "created", member })).not.toBeNull()
        expect(parseCollabMembershipResult({ outcome: "banished" })).toBeNull()
        expect(parseCollabMembershipResult({ outcome: "created", member: { ...member, kind: "robot" } })).toBeNull()
    })
})
