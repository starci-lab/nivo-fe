import { cleanup, render } from "@testing-library/react"
import { matchMediaFixture } from "../../../test-support/mock-result"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as HooksModule from "../../../hooks"
import type * as ComponentModule from "./component"
import type { GroupChatPageActions, GroupChatPageLabels, GroupChatPageView } from "./component"

/*
 * The connected page is proven through the props it hands the presentational
 * base: the base itself is covered by component.spec.tsx, and each collab hook
 * is covered by its own spec under hooks/collab, so here it is a probe that
 * records the last view, labels and actions while the page settles the derived
 * office state and assembles the view.
 */
type ProbeProps = {
    readonly state: {
        readonly isRailOpen: boolean
        readonly isCompactMembers?: boolean
        readonly labels: GroupChatPageLabels
    }
    readonly props: { readonly view: GroupChatPageView }
    readonly on: GroupChatPageActions
}

type Answer =
    | { readonly ok: true; readonly data: unknown }
    | {
          readonly ok: false
          readonly code: string
          readonly reason: string
          readonly kind: string | null
          readonly retryable: boolean
      }

type Query = { data: Answer | undefined; error: unknown; mutate: ReturnType<typeof vi.fn> }
type Mutation = { trigger: ReturnType<typeof vi.fn>; isMutating: boolean }

const probe = vi.hoisted(() => ({ last: null as unknown }))
const world = vi.hoisted(() => ({
    search: "",
    session: { status: "signed-in", accessToken: "token-1" } as { status: string; accessToken?: string },
    compact: false,
}))
const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }))
const hooks = vi.hoisted(() => ({
    workspaces: vi.fn(),
    office: vi.fn(),
    group: vi.fn(),
    tasks: vi.fn(),
    notices: vi.fn(),
    notice: vi.fn(),
    live: vi.fn(),
    post: vi.fn(),
    press: vi.fn(),
    invite: vi.fn(),
    accept: vi.fn(),
    reconcile: vi.fn(),
}))

vi.mock("./component", async () => {
    const actual = await vi.importActual<typeof ComponentModule>("./component")
    return {
        ...actual,
        GroupChatPageBase: (props: ProbeProps) => {
            probe.last = props
            return <div data-testid="group-chat-probe">{props.props.view.officeState}</div>
        },
    }
})

vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(world.search),
}))

/*
 * The real collab hooks stay mounted (importActual) so the composition under
 * test is the true wiring; only the data door is replaced.
 */
vi.mock("@/hooks", async () => {
    const actual = await vi.importActual<typeof HooksModule>("@/hooks")
    return {
        ...actual,
        useCollabLive: hooks.live,
        useSession: () => ({ state: world.session }),
        useAccessToken: () => world.session.accessToken ?? null,
        useCollabOfficeTransport: () => ({ reconcileRequest: hooks.reconcile }),
        useMutateCollabAcceptInvitationSwr: hooks.accept,
        useMutateCollabInviteByEmailSwr: hooks.invite,
        useMutateCollabPostMessageSwr: hooks.post,
        useMutateCollabPressApprovalSwr: hooks.press,
        usePathname: () => "/chat",
        useQueryCollabGroupSwr: hooks.group,
        useQueryCollabNoticeSwr: hooks.notice,
        useQueryCollabNoticesSwr: hooks.notices,
        useQueryCollabOfficeSwr: hooks.office,
        useQueryCollabTasksSwr: hooks.tasks,
        useQueryMyAgentWorkspacesSwr: hooks.workspaces,
        useRouter: () => router,
    }
})

import { GroupChatPage } from "."

const ok = (data: unknown): Answer => ({ ok: true, data })
const fail = (kind: string | null, retryable = false): Answer => ({
    ok: false,
    code: "E",
    reason: "r",
    kind,
    retryable,
})
const query = (data?: Answer, error?: unknown): Query => ({ data, error, mutate: vi.fn() })
const mutation = (answer: Answer = ok({})): Mutation => ({
    trigger: vi.fn().mockResolvedValue(answer),
    isMutating: false,
})

const OFFICE = {
    group: { name: "Văn phòng An" },
    viewer: { memberId: "mem-an", role: "owner" },
    participants: [
        {
            memberId: "mem-an",
            kind: "human",
            displayName: "An Nguyen",
            role: "owner",
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
    ],
}
const MESSAGE = {
    messageId: "msg-1",
    workspaceId: "ws-1",
    groupId: "grp-1",
    authorKind: "human",
    authorMemberId: "mem-an",
    authorModuleInstallationId: null,
    body: "@Sales Gửi giúp mình báo cáo tháng này",
    intentId: "intent-1",
    addressedModuleInstallationId: "mi-sales",
    addressedModuleKey: "sales",
    answersQuestionId: null,
    occurredAt: "2026-09-24T09:14:00Z",
}

let state: {
    workspaces: Query
    office: Query
    group: Query
    tasks: Query
    notices: Query
    notice: Query
    post: Mutation
    press: Mutation
    invite: Mutation
    accept: Mutation
    live: { readonly status: string; readonly reason: string | null; readonly lastHint: null }
}

const last = () => {
    const props = probe.last as ProbeProps
    return {
        view: props.props.view,
        labels: props.state.labels,
        isRailOpen: props.state.isRailOpen,
        isCompactMembers: props.state.isCompactMembers === true,
        on: props.on,
    }
}

beforeEach(() => {
    world.search = ""
    world.session = { status: "signed-in", accessToken: "token-1" }
    world.compact = false
    probe.last = null
    state = {
        workspaces: query(ok([{ id: "ws-1", name: "Công ty An" }])),
        office: query(ok(OFFICE)),
        group: query(ok({ messages: [MESSAGE], cards: [] })),
        tasks: query(ok({ tasks: [] })),
        notices: query(
            ok({
                notices: [
                    { notice: { noticeId: "n-open" }, turn: { state: "open" }, target: {} },
                    { notice: { noticeId: "n-done" }, turn: { state: "resolved" }, target: {} },
                ],
            }),
        ),
        notice: query(),
        post: mutation(),
        press: mutation(),
        invite: mutation(ok({ outcome: "created" })),
        accept: mutation(),
        live: { status: "subscribed", reason: null, lastHint: null },
    }
    hooks.live.mockImplementation(() => state.live)
    hooks.workspaces.mockImplementation((enabled: boolean) => (enabled ? state.workspaces : query()))
    hooks.office.mockImplementation(() => state.office)
    hooks.group.mockImplementation(() => state.group)
    hooks.tasks.mockImplementation(() => state.tasks)
    hooks.notices.mockImplementation(() => state.notices)
    hooks.notice.mockImplementation(() => state.notice)
    hooks.post.mockImplementation(() => state.post)
    hooks.press.mockImplementation(() => state.press)
    hooks.invite.mockImplementation(() => state.invite)
    hooks.accept.mockImplementation(() => state.accept)
    hooks.reconcile.mockResolvedValue(ok({ outcome: "unmatched" }))
    window.matchMedia = matchMediaFixture(() => world.compact)
})

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.useRealTimers()
})

describe("GroupChatPage", () => {
    describe("view assembly", () => {
        it("assembles the office view the base draws", () => {
            render(<GroupChatPage />)
            const { view } = last()
            expect(view.screen).toBe("office")
            expect(view.officeState).toBe("ready")
            expect(view.workspaceName).toBe("Công ty An")
            expect(view.viewer).toEqual({ memberId: "mem-an", role: "owner" })
            expect(view.participants.length).toBe(2)
            expect(view.items.length).toBeGreaterThan(0)
            expect(view.notices.map((item) => item.notice.noticeId)).toEqual(["n-open"])
            expect(view.composer).toEqual({ value: "", pending: false, failure: null, answering: null })
            expect(view.acceptance).toBeNull()
        })

        it("prefers the workspace named by the route and falls back to the group name", () => {
            world.search = "workspace=ws-9"
            render(<GroupChatPage />)
            expect(hooks.office).toHaveBeenLastCalledWith("ws-9")
            expect(last().view.workspaceName).toBe("Văn phòng An")
        })

        it("presents an invitation as the acceptance screen", () => {
            world.search = "invitation=inv-1&workspace=ws-1&role=manager"
            render(<GroupChatPage />)
            const { view } = last()
            expect(view.screen).toBe("acceptance")
            expect(view.officeState).toBe("ready")
            expect(view.acceptance).toEqual({ state: "ready", roleHint: "manager", invalidLink: false })
            expect(hooks.office).toHaveBeenLastCalledWith(null)
        })

        it.each([
            ["restoring", "loading"],
            ["signed-out", "denied"],
        ])("presents a %s session as %s without reading Office", (status, expected) => {
            world.session = { status }
            state.workspaces = query()
            render(<GroupChatPage />)
            expect(last().view.officeState).toBe(expected)
            expect(hooks.workspaces).toHaveBeenLastCalledWith(false)
        })

        it("waits for the workspace list and denies a viewer who owns none", () => {
            state.workspaces = query()
            const { rerender } = render(<GroupChatPage />)
            expect(last().view.officeState).toBe("loading")
            state.workspaces = query(ok([]))
            rerender(<GroupChatPage />)
            expect(last().view.officeState).toBe("denied")
            expect(hooks.office).toHaveBeenLastCalledWith(null)
        })

        it.each([
            [
                "an Office denial",
                "denied",
                () => {
                    state.office = query(fail("forbidden"))
                },
            ],
            [
                "a group denial",
                "denied",
                () => {
                    state.group = query(fail("forbidden"))
                },
            ],
            [
                "a tasks denial",
                "denied",
                () => {
                    state.tasks = query(fail("forbidden"))
                },
            ],
            [
                "a transport error",
                "failed",
                () => {
                    state.office = query(undefined, new Error("offline"))
                },
            ],
            [
                "a refused Office read",
                "failed",
                () => {
                    state.office = query(fail("unavailable", true))
                },
            ],
            [
                "a stale error beside data",
                "failed",
                () => {
                    state.office = query(ok(OFFICE), new Error("stale"))
                },
            ],
        ])("maps %s to the %s Office state", (_label, expected, arrange) => {
            arrange()
            render(<GroupChatPage />)
            expect(last().view.officeState).toBe(expected)
        })

        it("wires retries and navigation to the reads and the router", () => {
            render(<GroupChatPage />)
            last().on.retryOffice()
            last().on.retryTasks()
            expect(state.office.mutate).toHaveBeenCalledTimes(1)
            expect(state.tasks.mutate).toHaveBeenCalledTimes(1)
            last().on.leaveOffice()
            expect(router.push).toHaveBeenCalledWith("/overview")
        })
    })

    describe("labels", () => {
        it("resolves every catalog entry, passing its values", () => {
            render(<GroupChatPage />)
            const { labels } = last()
            expect(labels.title).toBe("Office")
            expect(labels.workspace).toBe("Workspace")
            expect(labels.statuses["waiting-on-answer"]).toBe("Waiting for answer")
            expect(labels.members.humans(2)).toBe("People (2)")
            expect(labels.members.modules(3)).toBe("Hired modules (3)")
            expect(labels.members.countLabel(5)).toBe("Members (5)")
            expect(labels.members.openRail(5)).toBe("5 members")
            expect(labels.invite.sent("a@b.vn")).toBe("Invitation recorded for a@b.vn.")
            expect(labels.composer.answering("Sales", "Tháng nào?")).toBe("Answering Sales: Tháng nào?")
            expect(labels.card.reference("T-1", "Sales")).toBe("T-1 • Sales")
            expect(labels.card.requestedBy("An")).toBe("Asked by An")
            expect(labels.card.assignedTo("Huy")).toBe("Assigned to Huy")
            expect(labels.approval.decidedBy("Minh", "09:14")).toBe("Minh decided at 09:14")
            expect(labels.question.waiting("Sales")).toBe("Waiting for Sales to answer")
            expect(labels.notice.taskAssign()).toBe("A new task is assigned to you")
            expect(labels.tasks.count(4)).toBe("4 tasks")
            expect(labels.tasks.asker("An")).toBe("Asked by An")
            expect(labels.tasks.assignee("Huy")).toBe("Assigned to Huy")
            expect(labels.tasks.module("Sales")).toBe("Module: Sales")
            expect(labels.accept.roleLine("Quản lý")).toBe("Invited role: Quản lý")
        })

        it("formats times in the page locale (en) and passes an unreadable instant through", () => {
            render(<GroupChatPage />)
            const { formatTime } = last().labels
            expect(formatTime("not-a-time")).toBe("not-a-time")
            const at = "2026-09-24T09:14:00Z"
            expect(formatTime(at)).toBe(
                new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(at)),
            )
        })
    })
})
