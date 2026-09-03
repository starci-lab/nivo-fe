/** @vitest-environment jsdom */

import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    pageProps: null as null | { readonly screen: { readonly view: string; readonly contentProps?: Record<string, unknown> } },
    push: vi.fn(),
    runtimeMutate: vi.fn(),
    runtimeTrigger: vi.fn(),
    testTrigger: vi.fn(),
    channelTrigger: vi.fn(),
    supportTrigger: vi.fn(),
}))

let runtime = {
    installation: {
        id: "installation-1", agentWorkspaceId: "workspace-1", moduleKey: "support-desk", moduleVersion: "1.0",
        displayName: "Support Desk", kindKey: "customer-support", kindVersion: "1.0", workbenchKey: "support-queue", workbenchVersion: "1.0",
        runtimeManifest: {
            schemaVersion: 1,
            kind: { key: "customer-support", version: "1.0" },
            workbench: { key: "support-queue", version: "1.0" },
            widgets: [], credentialSlots: [], config: {},
            operations: { setupFields: ["businessIdentity"] },
            test: { scenarios: [{ key: "triage", title: "Triage", inputSchema: {} }] },
        },
        settingsVersion: 1, activeContextVersionId: "context-1", primaryOpsSessionId: "execute-1",
        channelAccountRef: "TELEGRAM:12345", operatingMode: "assist", liveEnabled: true,
        status: "ready", failureCode: null, createdAt: "2026-08-25T00:00:00.000Z", updatedAt: "2026-08-25T00:00:00.000Z",
    },
    setupSession: {
        id: "setup-1", setupRevision: 1, setupStatus: "completed", draftDigest: "a".repeat(64),
        draftSnapshot: { summary: "A support desk", facts: ["24/7"] },
        gateEvidence: { gates: [{ key: "businessIdentity", passed: true }] },
    },
    setupSessions: [{
        id: "setup-1", setupRevision: 1, setupStatus: "completed", draftDigest: "a".repeat(64),
        draftSnapshot: { summary: "A support desk", facts: ["24/7"] },
        gateEvidence: { gates: [{ key: "businessIdentity", passed: true }] },
    }],
    executeSessions: [{ id: "execute-1", title: "New Execute session", isArchived: false, updatedAt: "2026-08-25T00:00:00.000Z" }],
    participants: [],
    messages: [
        { id: "setup-message", sessionId: "setup-1", role: "assistant", content: "Tell me about the business", contextVersionId: null, taskId: null, messageTree: null },
        { id: "execute-message", sessionId: "execute-1", role: "assistant", content: "Queue ready", contextVersionId: "context-1", taskId: null, messageTree: null },
    ],
    contextVersions: [{ id: "context-1", sourceSetupSessionId: "setup-1", version: 1, snapshot: { summary: "A support desk" } }],
    widgets: [], credentials: [{ providerKey: "telegram-bot-token", status: "configured" }],
    settings: { displayName: "Support Desk", modelProfile: "nivo-default", requireConfirmation: true },
    diagnostics: { available: true, controllerHealthy: true, controllerStatus: "ready" },
    tasks: [], operationEvents: [],
}

const initialRuntime = structuredClone(runtime)

const testSurface = {
    contract: runtime.installation.runtimeManifest.test,
    runs: [{ id: "run-1", status: "passed", setupSessionId: "setup-1", draftDigest: "a".repeat(64) }],
    assertions: [],
}

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks", () => ({
    useQueryMyAgentosModuleRuntimeSwr: () => ({ data: { ok: true, data: runtime }, mutate: mocks.runtimeMutate }),
    useQueryMyAgentosModuleTestSurfaceSwr: () => ({ data: { ok: true, data: testSurface }, mutate: vi.fn() }),
    useQueryMyAgentWorkspaceControlCenterSwr: () => ({ data: { ok: true, data: { workspace: { id: "workspace-1" }, instance: { hostname: "controller.example.test" } } } }),
    useQuerySupportCustomerConversationsSwr: () => ({ data: { ok: true, data: { nodes: [], nextCursor: null } }, isLoading: false }),
    useQuerySupportCustomerMessagesSwr: () => ({ data: { ok: true, data: { nodes: [], nextCursor: null } }, isLoading: false }),
    useQuerySupportImportantFactsSwr: () => ({ data: { ok: true, data: { nodes: [], nextCursor: null } }, isLoading: false }),
    useQuerySupportTicketsSwr: () => ({ data: { ok: true, data: { nodes: [], nextCursor: null } }, isLoading: false }),
    useMutateManageAgentosModuleRuntimeSwr: () => ({ trigger: mocks.runtimeTrigger }),
    useMutateRunAgentosModuleTestSwr: () => ({ trigger: mocks.testTrigger }),
    useMutateConfigureAgentWorkspaceChannelSwr: () => ({ trigger: mocks.channelTrigger }),
    useMutateApproveSupportReplySwr: () => ({ trigger: mocks.supportTrigger }),
    useMutateSetSupportTakeoverSwr: () => ({ trigger: mocks.supportTrigger }),
    useMutateReconcileSupportDeliverySwr: () => ({ trigger: mocks.supportTrigger }),
    useReadMyAgentosModuleTestRun: () => vi.fn(),
}))
vi.mock("./component", () => ({
    exactTestSurfaceFor: (surface: unknown) => surface,
    AgentOSSolutionModuleState: () => <div>module-state</div>,
    AgentOSSolutionModulePageBase: (props: typeof mocks.pageProps) => {
        mocks.pageProps = props
        return <div>{props?.screen.view}</div>
    },
}))

import { AgentOSSolutionModulePage } from "./index"
import type { AgentOSSolutionModuleScreen } from "./component"

type RuntimeAnswer = { readonly ok: boolean; readonly data: typeof runtime }
type SetupProps = Extract<AgentOSSolutionModuleScreen, { view: "setup" }>["contentProps"]
const setupProps = () => mocks.pageProps!.screen.contentProps as unknown as SetupProps
describe("AgentOSSolutionModulePage projections", () => {
    afterEach(() => vi.useRealTimers())
    it("retains historical selection and revision drafts across Setup tabs", () => {
        const historical = { ...runtime.setupSession, id: "history", setupRevision: 0 }
        runtime.setupSessions.unshift(historical)
        const view = render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        act(() => { setupProps().onSelectRevision("history") })
        act(() => { setupProps().onDraft("Historical note"); setupProps().onSelectPane("versions") })
        view.rerender(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        expect(setupProps().selectedRevisionId).toBe("history")
        act(() => { setupProps().onSelectPane("conversation") })
        expect(setupProps().draftText).toBe("Historical note")
        runtime.setupSessions.shift()
    })
    it("retains a refused append draft and reports only send refusal", async () => {
        mocks.runtimeTrigger.mockResolvedValue({ ok: false })
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        act(() => setupProps().onDraft("Keep policy"))
        await act(async () => { setupProps().onSend("Keep policy") })
        expect(setupProps().draftText).toBe("Keep policy")
        expect(setupProps().setupSendRefused).toBe(true)
        expect(setupProps().setupApplyRefused).toBe(false)
        expect(setupProps().setupStartRefused).toBe(false)
    })
    it("guards same-tick submissions and keeps accepted polling timeout unconfirmed", async () => {
        vi.useFakeTimers()
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        act(() => setupProps().onDraft("Accepted policy"))
        // An unchanged open revision never satisfies the existing settlement predicate.
        mocks.runtimeMutate.mockResolvedValue({ ok: true, data: { ...runtime, setupSessions: runtime.setupSessions.map(s => ({ ...s, setupStatus: "open" })) } })
        const send = setupProps().onSend
        await act(async () => { send("Accepted policy"); send("Accepted policy") })
        expect(mocks.runtimeTrigger).toHaveBeenCalledTimes(1)
        expect(setupProps().draftText).toBe("")
        expect(setupProps().setupSendPending).toBe(true)
        expect(setupProps().setupApplyPending).toBe(false)
        await act(async () => { await vi.advanceTimersByTimeAsync(90000) })
        expect(setupProps().setupSendPending).toBe(false)
        expect(setupProps().setupUnconfirmed).toBe(true)
        expect(setupProps().setupSendRefused).toBe(false)
        expect(mocks.runtimeTrigger).toHaveBeenCalledTimes(1)
    })

    it("selects the returned new Setup revision and retains historical selection on refresh", async () => {
        const revision = { ...runtime.setupSession, id: "setup-2", setupRevision: 2, setupStatus: "open" }
        mocks.runtimeTrigger.mockResolvedValue({ ok: true, data: { ...runtime, setupSession: revision, setupSessions: [...runtime.setupSessions, revision] } })
        const view = render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        await act(async () => { setupProps().onStartRevision() })
        expect(setupProps().selectedRevisionId).toBe("setup-2")
        expect(setupProps().revisions.map(item => item.id)).toEqual(["setup-1", "setup-2"])
        expect(setupProps().setupSendRefused).toBe(false)
        expect(setupProps().setupUnconfirmed).toBe(false)
        act(() => { setupProps().onSelectRevision("setup-1") })
        runtime = structuredClone(runtime)
        view.rerender(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        expect(setupProps().selectedRevisionId).toBe("setup-1")
    })
    it("keeps the selected revision when START is refused or returns an unlisted session", async () => {
        mocks.runtimeTrigger.mockResolvedValueOnce({ ok: false })
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        await act(async () => { setupProps().onStartRevision() })
        expect(setupProps().selectedRevisionId).toBe("setup-1")
        expect(setupProps().setupStartRefused).toBe(true)
        mocks.runtimeTrigger.mockResolvedValueOnce({ ok: true, data: { ...runtime, setupSession: { ...runtime.setupSession, id: "unlisted" } } })
        await act(async () => { setupProps().onStartRevision() })
        expect(setupProps().selectedRevisionId).toBe("setup-1")
    })
    it.each(["send", "apply"] as const)("keeps late %s refusal and pending on its captured revision", async kind => {
        runtime.setupSessions.push({ ...runtime.setupSession, id: "setup-2", setupRevision: 2 })
        let finish: (value: { ok: false }) => void = () => { throw new Error("Operation did not start") }
        mocks.runtimeTrigger.mockImplementation(() => new Promise(resolve => { finish = resolve }))
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        act(() => { setupProps().onDraft("Keep A"); if (kind === "send") setupProps().onSend("Keep A"); else setupProps().onApply() })
        expect(kind === "send" ? setupProps().setupSendPending : setupProps().setupApplyPending).toBe(true)
        act(() => { setupProps().onSelectRevision("setup-2") })
        expect(setupProps().setupSendPending).toBe(false)
        expect(setupProps().setupApplyPending).toBe(false)
        expect(setupProps().setupPeerDisabled).toBe(true)
        act(() => { setupProps().onSend("Blocked peer") })
        expect(mocks.runtimeTrigger).toHaveBeenCalledTimes(1)
        await act(async () => { finish({ ok: false }) })
        expect(setupProps().setupSendRefused).toBe(false)
        expect(setupProps().setupApplyRefused).toBe(false)
        expect(setupProps().refused).toBe(false)
        expect(setupProps().setupPeerDisabled).toBe(false)
        act(() => { setupProps().onSelectRevision("setup-1") })
        expect(kind === "send" ? setupProps().setupSendRefused : setupProps().setupApplyRefused).toBe(true)
        expect(setupProps().draftText).toBe("Keep A")
    })
    it("keeps accepted timeout on A while preserving the draft and idle controls of B", async () => {
        vi.useFakeTimers()
        runtime.setupSession.setupStatus = "open"
        runtime.setupSessions[0].setupStatus = "open"
        runtime.setupSessions.push({ ...runtime.setupSession, id: "setup-2", setupRevision: 2 })
        let finish: (value: { ok: true; data: typeof runtime }) => void = () => { throw new Error("Operation did not start") }
        mocks.runtimeTrigger.mockImplementation(() => new Promise(resolve => { finish = resolve }))
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        act(() => { setupProps().onDraft("Accepted A"); setupProps().onSend("Accepted A") })
        act(() => { setupProps().onSelectRevision("setup-2") })
        act(() => { setupProps().onDraft("Keep B") })
        await act(async () => { finish({ ok: true, data: runtime }) })
        expect(setupProps().draftText).toBe("Keep B")
        expect(setupProps().setupSendPending).toBe(false)
        expect(setupProps().setupPeerDisabled).toBe(true)
        act(() => { setupProps().onSelectRevision("setup-1") })
        expect(setupProps().draftText).toBe("")
        expect(setupProps().setupSendPending).toBe(true)
        act(() => { setupProps().onSelectRevision("setup-2") })
        await act(async () => { await vi.advanceTimersByTimeAsync(90000) })
        expect(setupProps().setupUnconfirmed).toBe(false)
        expect(setupProps().setupSendRefused).toBe(false)
        expect(setupProps().setupPeerDisabled).toBe(false)
        expect(setupProps().draftText).toBe("Keep B")
        act(() => { setupProps().onSelectRevision("setup-1") })
        expect(setupProps().setupUnconfirmed).toBe(true)
        expect(setupProps().setupSendRefused).toBe(false)
    })
    beforeEach(() => {
        runtime = structuredClone(initialRuntime)
        mocks.pageProps = null
        mocks.push.mockReset()
        mocks.runtimeMutate.mockReset().mockImplementation(async (answer?: RuntimeAnswer) => {
            if (answer?.ok) runtime = answer.data
            return { ok: true, data: runtime }
        })
        mocks.runtimeTrigger.mockReset().mockResolvedValue({ ok: true, data: runtime })
        mocks.testTrigger.mockReset().mockResolvedValue({ ok: true, data: { ...testSurface, run: { status: "passed" } } })
        mocks.channelTrigger.mockReset().mockResolvedValue({ ok: true, data: { state: "APPLIED" } })
        mocks.supportTrigger.mockReset().mockResolvedValue({ ok: true })
    })

    it.each(["setup", "test", "operate", "settings", "diagnostics"] as const)("projects the %s cockpit surface", async (view) => {
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" view={view} />)
        expect(await screen.findByText(view)).toBeInTheDocument()
        expect(mocks.pageProps?.screen.view).toBe(view)
    })

    it("dispatches settings, live, credential, widget and support actions through their owners", async () => {
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" view="settings" />)
        const settings = mocks.pageProps?.screen.contentProps as {
            readonly onSave: (value: { readonly displayName: string }, mode: string, channelRef: string) => unknown
            readonly onSetLiveEnabled: (enabled: boolean) => unknown
            readonly onRemoveCredential: (providerKey: string) => unknown
            readonly onSaveCredential: (providerKey: string, secret: string) => Promise<unknown>
        }
        await act(async () => {
            settings.onSave({ displayName: "Desk" }, "assist", "TELEGRAM:12345")
            settings.onSetLiveEnabled(false)
            settings.onRemoveCredential("telegram-bot-token")
            await settings.onSaveCredential("provider-key", "secret")
        })
        expect(mocks.runtimeTrigger).toHaveBeenCalled()
    })
})