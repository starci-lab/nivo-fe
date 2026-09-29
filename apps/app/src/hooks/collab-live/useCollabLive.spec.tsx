import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

type Handler = (...args: Array<unknown>) => void
const sockets: Array<{
    handlers: Map<string, Handler>
    emit: ReturnType<typeof vi.fn>
    disconnect: ReturnType<typeof vi.fn>
    removeAllListeners: ReturnType<typeof vi.fn>
}> = []
vi.mock("socket.io-client", () => ({
    io: vi.fn(() => {
        const socket = {
            handlers: new Map<string, Handler>(),
            emit: vi.fn(),
            disconnect: vi.fn(),
            removeAllListeners: vi.fn(),
        }
        sockets.push(socket)
        return {
            on: (event: string, handler: Handler) => {
                socket.handlers.set(event, handler)
            },
            removeAllListeners: socket.removeAllListeners,
            disconnect: socket.disconnect,
            emit: socket.emit,
        }
    }),
}))

const { useSession, mutate } = vi.hoisted(() => ({
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "tok" } })),
    mutate: vi.fn(async () => undefined),
}))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate }) }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession }))

import { useCollabLive, type CollabLiveState } from "./useCollabLive"

type ProbeProps = { readonly workspaceId: string | null }

const Probe = ({ workspaceId }: ProbeProps) => {
    const state = useCollabLive(workspaceId)
    return <output data-testid="state">{JSON.stringify(state)}</output>
}

const subscribeAck = (socket: (typeof sockets)[number], ack: unknown) => {
    const call = socket.emit.mock.calls.find((args) => args[0] === "collab.subscribe")
    expect(call).toBeDefined()
    act(() => {
        ;(call?.[2] as (reply: unknown) => void)(ack)
    })
}

describe("collab live subscription", () => {
    beforeAll(() => {
        ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    })
    afterAll(() => {
        delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
    })
    let root: Root | undefined
    let host: HTMLDivElement
    afterEach(() => {
        act(() => root?.unmount())
        host.remove()
        sockets.length = 0
        vi.clearAllMocks()
        useSession.mockImplementation(() => ({ state: { status: "signed-in", accessToken: "tok" } }) as never)
    })
    const mount = (workspaceId: string | null) => {
        host = document.createElement("div")
        document.body.append(host)
        act(() => {
            root = createRoot(host)
            root.render(<Probe workspaceId={workspaceId} />)
        })
    }
    const state = () => JSON.parse(host.querySelector("output")?.textContent ?? "{}") as CollabLiveState
    const lastMutateFilter = () =>
        (mutate.mock.calls as ReadonlyArray<ReadonlyArray<unknown>>).at(-1)?.[0] as (key: unknown) => boolean

    it("mounts no socket while signed out or without a workspace", () => {
        useSession.mockImplementation(() => ({ state: { status: "signed-out" } }) as never)
        mount("ws-1")
        expect(state().status).toBe("idle")
        expect(sockets).toHaveLength(0)
    })

    it("mounts no socket without a workspace identity", () => {
        mount(null)
        expect(state()).toMatchObject({ status: "idle", reason: "no-workspace" })
        expect(sockets).toHaveLength(0)
    })

    it("connects to the collab namespace and subscribes to the exact workspace", () => {
        mount("ws-1")
        expect(sockets).toHaveLength(1)
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        expect(socket.emit).toHaveBeenCalledWith("collab.subscribe", { workspaceId: "ws-1" }, expect.any(Function))
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        expect(state()).toMatchObject({ status: "subscribed", reason: null })
    })

    it("re-reads every collab domain of the workspace after subscribing", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        const filter = lastMutateFilter()
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notices", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-2", null])).toBe(false)
        expect(filter("opaque-string-key")).toBe(false)
    })

    it("answers a message hint by revalidating the conversation pages only", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        mutate.mockClear()
        act(() => {
            socket.handlers.get("collab.changed")?.({ workspaceId: "ws-1", kind: "message", cursor: "c-2" })
        })
        expect(state()).toMatchObject({
            status: "subscribed",
            lastHint: { workspaceId: "ws-1", kind: "message", cursor: "c-2" },
        })
        const filter = lastMutateFilter()
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", "c-2"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(false)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-1", null, null, null, null, null])).toBe(false)
    })

    it("answers task and card hints by revalidating the task and conversation projections", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        act(() => {
            socket.handlers.get("collab.changed")?.({ workspaceId: "ws-1", kind: "task", cursor: null })
        })
        const filter = lastMutateFilter()
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-1", null, null, null, null, null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "task", "ws-1", "t-1"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notices", "ws-1", null])).toBe(false)
    })

    it("answers membership and notice hints on their own domains", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        act(() => {
            socket.handlers.get("collab.changed")?.({ workspaceId: "ws-1", kind: "membership", cursor: null })
        })
        let filter = lastMutateFilter()
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(false)
        act(() => {
            socket.handlers.get("collab.changed")?.({ workspaceId: "ws-1", kind: "notice", cursor: null })
        })
        filter = lastMutateFilter()
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notices", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notice", "ws-1", "n-1"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(false)
    })

    it("ignores hints for another workspace and malformed payloads", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        mutate.mockClear()
        act(() => {
            socket.handlers.get("collab.changed")?.({ workspaceId: "ws-2", kind: "message", cursor: null })
            socket.handlers.get("collab.changed")?.({ workspaceId: "ws-1", kind: "smuggled", cursor: null })
            socket.handlers.get("collab.changed")?.("not-a-hint")
            socket.handlers.get("collab.changed")?.(null)
        })
        expect(mutate).not.toHaveBeenCalled()
        expect(state().lastHint).toBeNull()
    })

    it("treats a denied subscribe as connection state, never a business fact", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: false, reason: "denied" })
        expect(state()).toMatchObject({ status: "disconnected", reason: "denied" })
    })

    it("surfaces disconnects and handshake errors", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("disconnect")?.("transport close")
        })
        expect(state()).toMatchObject({ status: "disconnected", reason: "transport close" })
        act(() => {
            socket.handlers.get("connect_error")?.(new Error("bad bearer"))
        })
        expect(state()).toMatchObject({ status: "disconnected", reason: "bad bearer" })
    })

    it("re-subscribes and re-reads everything after a reconnect", () => {
        mount("ws-1")
        const socket = sockets[0]
        act(() => {
            socket.handlers.get("connect")?.()
        })
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        mutate.mockClear()
        act(() => {
            socket.handlers.get("connect")?.()
        })
        expect(socket.emit.mock.calls.filter((args) => args[0] === "collab.subscribe")).toHaveLength(2)
        subscribeAck(socket, { ok: true, workspaceId: "ws-1" })
        expect(mutate).toHaveBeenCalled()
        const filter = lastMutateFilter()
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(true)
    })

    it("disconnects the socket when the workspace changes or the hook unmounts", () => {
        mount("ws-1")
        const first = sockets[0]
        act(() => {
            root?.render(<Probe workspaceId="ws-2" />)
        })
        expect(first.removeAllListeners).toHaveBeenCalled()
        expect(first.disconnect).toHaveBeenCalled()
        expect(sockets).toHaveLength(2)
        act(() => root?.unmount())
        expect(sockets[1].disconnect).toHaveBeenCalled()
    })
})
