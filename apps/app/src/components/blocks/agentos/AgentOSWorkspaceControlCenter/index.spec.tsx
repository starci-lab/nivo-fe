import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type * as componentModule from "./component"
import type * as hooksModule from "@/hooks"
import type { ShellSourceObservation } from "@/modules/agentos/shell-observation-store"

const mocks = vi.hoisted(() => ({
    api: {
        load: vi.fn(),
        renew: vi.fn(),
        revoke: vi.fn(),
        refresh: vi.fn(),
        installations: vi.fn(),
    },
    adopt: vi.fn(),
    select: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
    realtime: { status: "idle" } as { status: string, event?: { kind: string, fingerprint?: string } },
    message: undefined as ((event: MessageEvent) => void) | undefined,
    close: vi.fn(),
    readSelection: vi.fn(),
    retrySource: vi.fn(),
    sources: [] as ReadonlyArray<ShellSourceObservation>,
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({ dateTime: (value: Date) => value.toISOString() }),
}))
vi.mock("@/modules/api/console", () => ({
    myAgentWorkspaceControlCenter: mocks.api.load,
    myAgentosModuleInstallations: mocks.api.installations,
    renewAgentWorkspaceAppLaunch: mocks.api.renew,
    revokeAgentWorkspaceAppLaunch: mocks.api.revoke,
}))
// The SWR half stays real; only the connected shell handle is settled here, because the exact
// selection it reads is the projection's input and nothing else in this file decides it.
vi.mock("@/hooks", async (importOriginal) => ({
    ...await importOriginal<typeof hooksModule>(),
    useAgentOSShell: () => ({ session: "established", sessionStatus: "signed-in", blocked: false, sources: mocks.sources, readSelection: mocks.readSelection, retrySource: mocks.retrySource }),
    useSession: () => ({ ...mocks.session, adopt: mocks.adopt }),
    useProvisioningRealtime: () => mocks.realtime,
}))
vi.mock("@/modules/api/auth", () => ({ refreshSession: mocks.api.refresh }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => ({ ...mocks.session, adopt: mocks.adopt }) }))
vi.mock("@/modules/window/workspace-app-launch", () => ({
    workspaceAppLaunchChannelName: (workspaceId: string) => `launch:${workspaceId}`,
}))

type ProbeProps = {
    readonly state: unknown
    readonly props: {
        readonly controlCenterState: string
        readonly message?: string
        readonly launchState: string
        readonly openClawLaunchHref: string
        readonly shell: { readonly state: string, readonly installations: ReadonlyArray<{ readonly installationId: string }> }
        readonly isShellRetrying?: boolean
    }
    readonly on: {
        readonly onSelectPageState: (state: "applications") => void
        readonly onOpenAgentConsole: () => void
        readonly onRetryShell?: () => void
        readonly formatDate: (value: string) => string
    }
}

vi.mock("./component", async (importOriginal) => ({
    ...await importOriginal<typeof componentModule>(),
    AgentOSWorkspaceControlCenterBase: (contract: ProbeProps) => (
        <div>
            <output data-testid="workspace-state">{JSON.stringify({ state: contract.props.controlCenterState, message: contract.props.message, launchState: contract.props.launchState, href: contract.props.openClawLaunchHref })}</output>
            <output data-testid="shell-state">{JSON.stringify({ state: contract.props.shell.state, retrying: contract.props.isShellRetrying, installations: contract.props.shell.installations.map(installation => installation.installationId) })}</output>
            <button type="button" onClick={() => contract.on.onSelectPageState("applications")}>select</button>
            <button type="button" onClick={contract.on.onOpenAgentConsole}>open</button>
            <button type="button" onClick={contract.on.onRetryShell}>retry-shell</button>
            <button type="button" onClick={() => contract.on.formatDate("2026-08-22T10:00:00.000Z")}>format</button>
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
const shellState = () => screen.getByTestId("shell-state").textContent ?? ""
let viewerSequence = 0

describe("AgentOSWorkspaceControlCenter", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        viewerSequence += 1
        mocks.session.state = { status: "signed-in", accessToken: `token-${viewerSequence}` }
        mocks.realtime = { status: "idle" }
        mocks.message = undefined
        mocks.api.load.mockResolvedValue({ ok: true, data })
        mocks.api.installations.mockResolvedValue({ ok: true, data: [{ id: "installation-1" }, { id: "installation-2" }] })
        mocks.sources = [
            { identity: { kind: "core_registry" }, readGeneration: 1, state: "available", availability: "available", freshness: "current", completeness: "complete", observedAt: "2026-09-26T03:00:00.000Z", payload: { workspaceId: "workspace-1", instanceId: "instance-1", name: "Acme AgentOS", runtimeAvailability: "provisioned" } },
            { identity: { kind: "installation_inventory" }, readGeneration: 1, state: "available", availability: "available", freshness: "current", completeness: "complete", observedAt: "2026-09-26T03:00:00.000Z", payload: { installations: [{ installationId: "installation-1", moduleKey: "sales-copilot", displayName: "Sales Copilot", status: "installed" }, { installationId: "installation-2", moduleKey: "sales-copilot", displayName: "Sales Copilot EU", status: "installed" }] } },
            { identity: { kind: "runtime" }, readGeneration: 1, state: "available", availability: "available", freshness: "current", completeness: "complete", observedAt: "2026-09-26T03:00:00.000Z", payload: { runtimeGeneration: "gen-1", runtimeAvailability: "provisioned" } },
            { identity: { kind: "attention", installationId: "installation-1" }, readGeneration: 1, state: "unsupported", availability: null, freshness: null, completeness: null, observedAt: "2026-09-26T03:00:00.000Z", payload: null },
            { identity: { kind: "attention", installationId: "installation-2" }, readGeneration: 1, state: "unsupported", availability: null, freshness: null, completeness: null, observedAt: "2026-09-26T03:00:00.000Z", payload: null }
        ]
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

    it("projects the connected shell onto the pure page with each installation of one package apart", async () => {
        render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)

        await waitFor(() => expect(shellState()).toContain('"state":"installed-current"'))
        expect(shellState()).toContain('"installations":["installation-1","installation-2"]')
        expect(state()).toContain('"state":"ready"')
    })

    it("retries exactly the facet that did not answer with a current observation", async () => {
        mocks.sources = mocks.sources.filter((source: ShellSourceObservation) => source.identity.kind === "core_registry").concat([{ identity: { kind: "installation_inventory" }, readGeneration: 1, state: "unavailable", availability: null, freshness: null, completeness: null, observedAt: null, payload: null }])
        render(<AgentOSWorkspaceControlCenter workspaceId="workspace-1" pageState="overview" onSelectPageState={mocks.select} />)

        await waitFor(() => expect(shellState()).toContain('"state":"retrying"'))
        expect(shellState()).toContain('"retrying":true')
        fireEvent.click(screen.getByRole("button", { name: "retry-shell" }))
        expect(mocks.retrySource).toHaveBeenCalledWith({ kind: "installation_inventory" })
        expect(mocks.readSelection).not.toHaveBeenCalled()
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