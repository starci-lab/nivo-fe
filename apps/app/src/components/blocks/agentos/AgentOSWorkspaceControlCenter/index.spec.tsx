import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: {
        load: vi.fn(),
        renew: vi.fn(),
        revoke: vi.fn(),
        refresh: vi.fn(),
    },
    adopt: vi.fn(),
    select: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
    realtime: { status: "idle" } as { status: string, event?: { kind: string, fingerprint?: string } },
    message: undefined as ((event: MessageEvent) => void) | undefined,
    close: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({ dateTime: (value: Date) => value.toISOString() }),
}))
vi.mock("@/modules/api/console", () => ({
    myAgentWorkspaceControlCenter: mocks.api.load,
    renewAgentWorkspaceAppLaunch: mocks.api.renew,
    revokeAgentWorkspaceAppLaunch: mocks.api.revoke,
}))
vi.mock("@/modules/api/auth", () => ({ refreshSession: mocks.api.refresh }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => ({ ...mocks.session, adopt: mocks.adopt }) }))
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))
vi.mock("@/modules/window/workspace-app-launch", () => ({
    workspaceAppLaunchChannelName: (workspaceId: string) => `launch:${workspaceId}`,
}))

type ProbeProps = {
    readonly controlCenterState: string
    readonly message?: string
    readonly launchState: string
    readonly openClawLaunchHref: string
    readonly onSelectPageState: (state: "applications") => void
    readonly onOpenAgentConsole: () => void
    readonly formatDate: (value: string) => string
}

vi.mock("./component", () => ({
    AgentOSWorkspaceControlCenterBase: (props: ProbeProps) => (
        <div>
            <output data-testid="workspace-state">{JSON.stringify({ state: props.controlCenterState, message: props.message, launchState: props.launchState, href: props.openClawLaunchHref })}</output>
            <button type="button" onClick={() => props.onSelectPageState("applications")}>select</button>
            <button type="button" onClick={props.onOpenAgentConsole}>open</button>
            <button type="button" onClick={() => props.formatDate("2026-08-22T10:00:00.000Z")}>format</button>
        </div>
    ),
}))

import { AgentOSWorkspaceControlCenter } from "."

const data = {
    workspace: { id: "workspace-1", name: "Workspace" },
    instance: { id: "instance-1" },
    apps: [],
    runtime: { fingerprint: "runtime-1" },
}

const state = () => screen.getByTestId("workspace-state").textContent ?? ""

describe("AgentOSWorkspaceControlCenter connected owner", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime = { status: "idle" }
        mocks.message = undefined
        mocks.api.load.mockResolvedValue({ ok: true, data })
        mocks.api.renew.mockResolvedValue({ ok: true })
        mocks.api.refresh.mockResolvedValue({ ok: true, data: { accessToken: "fresh", requiresTwoFactor: false } })
        vi.stubGlobal("BroadcastChannel", class {
            addEventListener(_type: string, listener: (event: MessageEvent) => void) { mocks.message = listener }
            close() { mocks.close() }
        })
    })

    afterEach(() => {
        cleanup()
        vi.useRealTimers()
        vi.unstubAllGlobals()
    })

    it("waits for a signed-in session before loading the exact workspace", async () => {
        mocks.session.state = { status: "restoring", accessToken: "" }
        render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)

        await waitFor(() => expect(state()).toContain('"state":"loading"'))
        expect(mocks.api.load).not.toHaveBeenCalled()
    })

    it("settles a workspace and exposes only page-owned interactions", async () => {
        render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)

        await waitFor(() => expect(state()).toContain('"state":"ready"'))
        expect(mocks.api.load).toHaveBeenCalledWith("workspace-1")
        expect(state()).toContain("/en/launch/agentos/workspace-1/openclaw")

        fireEvent.click(screen.getByRole("button", { name: "select" }))
        fireEvent.click(screen.getByRole("button", { name: "format" }))
        fireEvent.click(screen.getByRole("button", { name: "open" }))

        expect(mocks.select).toHaveBeenCalledWith("applications")
        expect(state()).toContain('"launchState":"opening"')
    })

    it("keeps launch broadcasts correlated and revokes the superseded launch", async () => {
        render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="applications" onSelectPageState={mocks.select} />)
        await waitFor(() => expect(mocks.message).toBeTypeOf("function"))

        act(() => mocks.message?.({ data: { status: "failed", workspaceId: "other" } } as MessageEvent))
        expect(state()).toContain('"launchState":"idle"')
        act(() => mocks.message?.({ data: { status: "failed", workspaceId: "workspace-1" } } as MessageEvent))
        expect(state()).toContain('"launchState":"blocked"')
        act(() => mocks.message?.({ data: { status: "issued", workspaceId: "workspace-1", launchId: "launch-1" } } as MessageEvent))
        act(() => mocks.message?.({ data: { status: "issued", workspaceId: "workspace-1", launchId: "launch-2" } } as MessageEvent))

        expect(state()).toContain('"launchState":"connected"')
        expect(mocks.api.revoke).toHaveBeenCalledWith("launch-1")
    })

    it("reloads only on a relevant changed realtime event", async () => {
        const view = render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)
        await waitFor(() => expect(mocks.api.load).toHaveBeenCalledTimes(1))

        mocks.realtime = { status: "event", event: { kind: "workspace-runtime", fingerprint: "runtime-1" } }
        view.rerender(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)
        expect(mocks.api.load).toHaveBeenCalledTimes(1)

        mocks.realtime = { status: "event", event: { kind: "workspace", fingerprint: "runtime-2" } }
        view.rerender(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)
        await waitFor(() => expect(mocks.api.load).toHaveBeenCalledTimes(2))
    })

    it("expires a connected launch when session renewal can no longer authorize it", async () => {
        vi.useFakeTimers()
        mocks.api.refresh.mockResolvedValue({ ok: false, code: "SESSION_EXPIRED" })
        render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="applications" onSelectPageState={mocks.select} />)
        await act(async () => Promise.resolve())
        act(() => mocks.message?.({ data: { status: "issued", workspaceId: "workspace-1", launchId: "launch-1" } } as MessageEvent))

        await act(async () => { await vi.advanceTimersByTimeAsync(20_000) })

        expect(state()).toContain('"launchState":"expired"')
    })
})
