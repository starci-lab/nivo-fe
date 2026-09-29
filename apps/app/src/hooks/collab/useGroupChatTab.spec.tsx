import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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

const world = vi.hoisted(() => ({
    search: "",
    session: { status: "signed-in" } as { status: string },
}))
const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }))
const mocks = vi.hoisted(() => ({ workspaces: vi.fn(), accept: vi.fn() }))

vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(world.search),
}))
vi.mock("@/hooks", () => ({
    useMutateCollabAcceptInvitationSwr: mocks.accept,
    usePathname: () => "/chat",
    useQueryMyAgentWorkspacesSwr: mocks.workspaces,
    useRouter: () => router,
    useSession: () => ({ state: world.session }),
}))

import { useGroupChatTab } from "./useGroupChatTab"

const ok = (data: unknown): Answer => ({ ok: true, data })
const fail = (kind: string | null, retryable = false): Answer => ({
    ok: false,
    code: "E",
    reason: "r",
    kind,
    retryable,
})
const query = (data?: Answer): Query => ({ data, error: undefined, mutate: vi.fn() })
const mutation = (answer: Answer = ok({})): Mutation => ({
    trigger: vi.fn().mockResolvedValue(answer),
    isMutating: false,
})

let workspaces: Query = query()
let accept: Mutation = mutation()

beforeEach(() => {
    world.search = ""
    world.session = { status: "signed-in" }
    workspaces = query(ok([{ id: "ws-1", name: "Công ty An" }]))
    accept = mutation()
    mocks.workspaces.mockImplementation((enabled: boolean) => (enabled ? workspaces : query()))
    mocks.accept.mockImplementation(() => accept)
})

afterEach(() => {
    vi.clearAllMocks()
})

describe("useGroupChatTab", () => {
    describe("tab and route", () => {
        it("reads Office by default and Tasks from the route", () => {
            const { result, rerender } = renderHook(() => useGroupChatTab())
            expect(result.current.tab).toBe("office")
            world.search = "view=tasks"
            rerender()
            expect(result.current.tab).toBe("tasks")
        })

        it("writes the tab into the route and drops it again for Office", () => {
            world.search = "workspace=ws-1"
            const { result } = renderHook(() => useGroupChatTab())
            act(() => result.current.selectTab("tasks"))
            expect(router.replace).toHaveBeenLastCalledWith("/chat?workspace=ws-1&view=tasks")
            act(() => result.current.selectTab("office"))
            expect(router.replace).toHaveBeenLastCalledWith("/chat?workspace=ws-1")
        })

        it("returns to the bare path when Office is the only query", () => {
            world.search = "view=tasks"
            const { result } = renderHook(() => useGroupChatTab())
            act(() => result.current.selectTab("office"))
            expect(router.replace).toHaveBeenLastCalledWith("/chat")
        })
    })

    describe("workspace resolution", () => {
        it("opens the first owned workspace when the route names none", () => {
            const { result } = renderHook(() => useGroupChatTab())
            expect(result.current.workspaceId).toBe("ws-1")
            expect(result.current.workspaceListed).toBe("Công ty An")
            expect(mocks.workspaces).toHaveBeenLastCalledWith(true)
        })

        it("prefers the workspace named by the route", () => {
            world.search = "workspace=ws-9"
            const { result } = renderHook(() => useGroupChatTab())
            expect(result.current.workspaceId).toBe("ws-9")
            expect(result.current.workspaceListed).toBeNull()
        })

        it("withholds the workspace list while an invitation is open", () => {
            world.search = "invitation=inv-1&workspace=ws-1"
            const { result } = renderHook(() => useGroupChatTab())
            expect(mocks.workspaces).toHaveBeenLastCalledWith(false)
            expect(result.current.workspaceId).toBe("ws-1")
            expect(result.current.acceptanceMode).toBe(true)
        })

        it("withholds the workspace list while signed out", () => {
            world.session = { status: "signed-out" }
            renderHook(() => useGroupChatTab())
            expect(mocks.workspaces).toHaveBeenLastCalledWith(false)
        })

        it("reports the list unanswered until it resolves and answers no workspace when empty", () => {
            workspaces = query()
            const { result, rerender } = renderHook(() => useGroupChatTab())
            expect(result.current.workspacesAnswered).toBe(false)
            expect(result.current.workspaceId).toBeNull()
            workspaces = query(ok([]))
            rerender()
            expect(result.current.workspacesAnswered).toBe(true)
            expect(result.current.workspaceId).toBeNull()
        })
    })

    describe("invitation acceptance", () => {
        it("presents the acceptance view with the role hint", () => {
            world.search = "invitation=inv-1&workspace=ws-1&role=manager"
            const { result } = renderHook(() => useGroupChatTab())
            expect(result.current.acceptance).toEqual({
                state: "ready",
                roleHint: "manager",
                invalidLink: false,
            })
        })

        it("marks a link without a workspace invalid and never accepts it", async () => {
            world.search = "invitation=inv-1"
            const { result } = renderHook(() => useGroupChatTab())
            expect(result.current.acceptance?.invalidLink).toBe(true)
            await act(async () => {
                await result.current.acceptInvite()
            })
            expect(accept.trigger).not.toHaveBeenCalled()
        })

        it("re-opens Office on the workspace after acceptance", async () => {
            world.search = "invitation=inv-1&workspace=ws-1&role=staff"
            const { result } = renderHook(() => useGroupChatTab())
            await act(async () => {
                await result.current.acceptInvite()
            })
            expect(accept.trigger).toHaveBeenCalledWith({ invitationId: "inv-1" })
            expect(router.replace).toHaveBeenCalledWith("/chat?workspace=ws-1")
            expect(result.current.acceptance?.state).toBe("ready")
        })

        it("shows a refused acceptance", async () => {
            world.search = "invitation=inv-1&workspace=ws-1"
            accept = mutation(fail("forbidden"))
            const { result } = renderHook(() => useGroupChatTab())
            await act(async () => {
                await result.current.acceptInvite()
            })
            expect(result.current.acceptance?.state).toBe("refused")
            expect(router.replace).not.toHaveBeenCalled()
        })
    })
})
