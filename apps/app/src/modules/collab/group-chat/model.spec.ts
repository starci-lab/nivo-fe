import { describe, expect, it } from "vitest"
import type { CollabTaskView } from "../../api/collab"
import {
    buildConversationItems,
    invalidTasksFilter,
    mayPresentDecision,
    mayPresentInvite,
    parseAddressedModule,
    parseRoleHint,
    shortTaskRef,
    taskStatusTone,
} from "./model"
import {
    OWNER,
    STAFF,
    PARTICIPANTS,
    MESSAGE,
    MODULE_MESSAGE,
    BINDING,
    WAITING_APPROVAL,
    TASK_WAITING_APPROVAL,
    TASK_WAITING_ANSWER,
    labels,
    REPORTED_BINDING,
    WORKING_TASK,
    messageAt,
} from "./test-fixtures.fixture"

describe("group chat conversation model", () => {
    it("accepts only the closed invitation role hints", () => {
        expect(parseRoleHint("manager")).toBe("manager")
        expect(parseRoleHint("staff")).toBe("staff")
        expect(parseRoleHint("auditor")).toBeNull()
        expect(parseRoleHint(null)).toBeNull()
    })
    it("parses a leading @address for routing without touching the body", () => {
        expect(parseAddressedModule("@Sales gửi báo cáo")).toBe("Sales")
        expect(parseAddressedModule("  @Accounting xong chưa")).toBe("Accounting")
        expect(parseAddressedModule("Chào cả nhóm")).toBeNull()
        expect(parseAddressedModule("")).toBeNull()
    })
    it("gates invite and decision on the server-derived role only", () => {
        expect(mayPresentInvite(OWNER)).toBe(true)
        expect(mayPresentInvite({ memberId: "m", role: "manager" })).toBe(true)
        expect(mayPresentInvite(STAFF)).toBe(false)
        expect(mayPresentInvite(null)).toBe(false)
        expect(mayPresentDecision(OWNER)).toBe(true)
        expect(mayPresentDecision(STAFF)).toBe(false)
        expect(mayPresentDecision(null)).toBe(false)
    })
    it("keeps the task's deterministic short ref identical between card and row", () => {
        expect(shortTaskRef("550e8400-e29b-41d4-a716-446655440000")).toBe("T-550E")
    })
    it("anchors a waiting approval to its card message and appends loose ones last", () => {
        const loose = { ...WAITING_APPROVAL, approvalId: "appr-loose", cardMessageId: "msg-absent" }
        const items = buildConversationItems({
            messages: [MESSAGE, MODULE_MESSAGE],
            cards: [BINDING],
            tasks: [
                TASK_WAITING_APPROVAL,
                { ...TASK_WAITING_APPROVAL, taskId: "task-loose", waiting: { kind: "approval", approval: loose } },
            ],
            participants: PARTICIPANTS,
            viewerMemberId: null,
            unknownAuthor: "?",
        })
        const kinds = items.map((item) => item.kind)
        expect(kinds).toEqual(["message", "task-card", "message", "approval-card", "approval-card"])
        const last = items[items.length - 1]
        expect(last!.kind === "approval-card" && last!.approval.approvalId === "appr-loose").toBe(true)
    })
    it("flags only filters whose identity left the current roster", () => {
        expect(invalidTasksFilter({}, PARTICIPANTS)).toBeNull()
        expect(invalidTasksFilter({ personMemberId: "mem-minh" }, PARTICIPANTS)).toBeNull()
        expect(invalidTasksFilter({ personMemberId: "mem-gone" }, PARTICIPANTS)).toBe("person")
        expect(invalidTasksFilter({ moduleInstallationId: "mi-sales" }, PARTICIPANTS)).toBeNull()
        expect(invalidTasksFilter({ moduleInstallationId: "mi-gone" }, PARTICIPANTS)).toBe("module")
    })
    it("maps every task state to one badge tone", () => {
        expect(taskStatusTone("done")).toBe("success")
        expect(taskStatusTone("waiting-on-answer")).toBe("warning")
        expect(taskStatusTone("waiting-on-approval")).toBe("warning")
        expect(taskStatusTone("rejected")).toBe("danger")
        expect(taskStatusTone("cancelled")).toBe("danger")
        expect(taskStatusTone("working")).toBe("accent")
        expect(taskStatusTone("created")).toBe("neutral")
    })
    it("assembles unknown authors, unbound cards and loose questions without dropping any", () => {
        const loose: CollabTaskView = {
            ...TASK_WAITING_ANSWER,
            taskId: "task-loose",
            cardMessageId: null,
            bindingId: null,
        }
        const items = buildConversationItems({
            messages: [
                messageAt("msg-9", { authorMemberId: "mem-gone" }),
                messageAt("msg-3", { addressedModuleInstallationId: "mi-sales" }),
            ],
            cards: [{ ...BINDING, bindingId: "bind-x", sourceMessageId: "msg-9" }, REPORTED_BINDING],
            tasks: [WORKING_TASK, loose],
            participants: PARTICIPANTS,
            viewerMemberId: null,
            unknownAuthor: labels.conversation.unknownAuthor,
        })
        expect(items.map((item) => item.kind)).toEqual([
            "message",
            "task-card",
            "message",
            "task-card",
            "question-card",
        ])
        const [first, unbound, second, bound] = items
        expect(
            first!.kind === "message" &&
                first!.authorName === "Thành viên" &&
                first!.authorKind === null &&
                !first!.isViewer,
        ).toBe(true)
        expect(unbound!.kind === "task-card" && unbound!.task === null).toBe(true)
        expect(second!.kind === "message" && second!.addressedName === "Sales").toBe(true)
        expect(bound!.kind === "task-card" && bound!.task?.taskId === "task-w").toBe(true)
    })
})
