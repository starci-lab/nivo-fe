import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"

type Handler = (...args: Array<unknown>) => void
const sockets: Array<{ handlers: Map<string, Handler>; emit: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = []
vi.mock("socket.io-client", () => ({ io: vi.fn(() => {
    const socket = { handlers: new Map<string, Handler>(), emit: vi.fn(), disconnect: vi.fn() }
    sockets.push(socket)
    return { on: (event: string, handler: Handler) => { socket.handlers.set(event, handler) }, removeAllListeners: vi.fn(), disconnect: socket.disconnect, emit: socket.emit }
}) }))

import useProvisioningRealtime from "./provisioning"

type ProbeProps = { readonly token: string | null; readonly target: Parameters<typeof useProvisioningRealtime>[0]["target"] }

const Probe = ({ token, target }: ProbeProps) => {
    const state = useProvisioningRealtime({ accessToken: token, target })
    return <output data-testid="state">{JSON.stringify(state)}</output>
}

describe("provisioning realtime boundaries", () => {
    beforeAll(() => {
        ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    })
    afterAll(() => {
        delete (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT
    })
    let root: Root | undefined
    let host: HTMLDivElement
    afterEach(() => { act(() => root?.unmount()); sockets.length = 0 })
    const mount = (token: string | null, target: Parameters<typeof useProvisioningRealtime>[0]["target"]) => {
        host = document.createElement("div")
        document.body.append(host)
        act(() => { root = createRoot(host); root.render(<Probe token={token} target={target} />) })
    }
    const state = () => JSON.parse(host.querySelector("output")?.textContent ?? "{}") as Record<string, unknown>

    it("stays anonymous without opening a socket", () => {
        mount(null, { kind: "workspace", id: "w-1" })
        expect(state()).toEqual({ status: "disconnected", reason: "anonymous" })
        expect(sockets).toHaveLength(0)
    })
    it("stays disconnected when no target identity exists", () => {
        mount("token", null)
        expect(state()).toEqual({ status: "disconnected", reason: null })
        expect(sockets).toHaveLength(0)
    })
    it("connects and accepts only the matching workspace event", () => {
        mount("token", { kind: "workspace", id: "w-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("connect")?.() })
        expect(state()).toEqual({ status: "connected", reason: null })
        act(() => { socket.handlers.get("workspace.status")?.({ workspaceId: "other", status: "ready", reason: null, updatedAt: "2" }) })
        expect(state().status).toBe("connected")
        act(() => { socket.handlers.get("workspace.status")?.({ workspaceId: "w-1", status: "ready", reason: null, updatedAt: "2" }) })
        expect(state()).toMatchObject({ status: "event", event: { kind: "workspace", id: "w-1", status: "ready" } })
    })
    it("rejects out-of-order sequenced workspace events", () => {
        mount("token", { kind: "workspace", id: "w-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("workspace.status")?.({ workspaceId: "w-1", status: "ready", reason: null, updatedAt: "2", sequence: 4 }) })
        act(() => { socket.handlers.get("workspace.status")?.({ workspaceId: "w-1", status: "failed", reason: "late", updatedAt: "3", sequence: 3 }) })
        expect(state()).toMatchObject({ event: { status: "ready" } })
    })
    it("maps terminal saga statuses and envelopes", () => {
        mount("token", { kind: "module-installation", id: "m-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("provisioning.saga.status")?.({ success: true, data: { eventId: "e", sequence: 1, sagaId: "s", resourceKind: "agentos_module_installation", resourceId: "m-1", status: "completed", direction: "forward", stepKey: null, reason: null, updatedAt: "now" } }) })
        expect(state()).toMatchObject({ status: "event", event: { kind: "module-installation", id: "m-1", status: "ready" } })
    })
    it("handles deployment events only for the selected deployment", () => {
        mount("token", { kind: "deployment", id: "d-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("deployment.status")?.({ deploymentId: "d-2", status: "running", reason: null, updatedAt: "1" }) })
        expect(state().status).toBe("connecting")
        act(() => { socket.handlers.get("deployment.status")?.({ deploymentId: "d-1", status: "running", reason: null, updatedAt: "1" }) })
        expect(state()).toMatchObject({ event: { kind: "deployment", id: "d-1", status: "running" } })
    })
    it("maps order fulfillment without requiring sequencing", () => {
        mount("token", { kind: "order", id: "o-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("order.fulfilling")?.({ success: true, data: { orderId: "o-1", status: "completed" } }) })
        expect(state()).toMatchObject({ event: { kind: "order", id: "o-1", status: "completed" } })
    })
    it("surfaces disconnect and connection errors", () => {
        mount("token", { kind: "workspace", id: "w-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("disconnect")?.("transport close") })
        expect(state()).toEqual({ status: "disconnected", reason: "transport close" })
        act(() => { socket.handlers.get("connect_error")?.(new Error("offline")) })
        expect(state()).toEqual({ status: "disconnected", reason: "offline" })
    })
    it("maps workspace runtime probes to runtime events", () => {
        mount("token", { kind: "workspace", id: "w-1" })
        const socket = sockets[0]
        act(() => { socket.handlers.get("workspace.runtime")?.({ workspaceId: "w-1", instanceId: "i-1", fingerprint: "fp", probeStatus: "partial", observedAt: "now", sequence: 2 }) })
        expect(state()).toMatchObject({ event: { kind: "workspace-runtime", id: "w-1", instanceId: "i-1", probeStatus: "partial" } })
    })
    it("cleans up the socket when the target is removed", () => {
        mount("token", { kind: "workspace", id: "w-1" })
        const socket = sockets[0]
        act(() => { root?.render(<Probe token="token" target={null} />) })
        expect(socket.disconnect).toHaveBeenCalled()
    })
})