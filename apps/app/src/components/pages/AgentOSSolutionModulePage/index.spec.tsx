/** @vitest-environment jsdom */

import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    pageProps: null as null | { readonly screen: { readonly view: string; readonly contentProps?: Record<string, unknown> } },
    push: vi.fn(),
    runtimeMutate: vi.fn(),
    runtimeTrigger: vi.fn(),
    testTrigger: vi.fn(),
    channelTrigger: vi.fn(),
    supportTrigger: vi.fn(),
}))

const runtime = {
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

describe("AgentOSSolutionModulePage projections", () => {
    beforeEach(() => {
        mocks.pageProps = null
        mocks.push.mockReset()
        mocks.runtimeMutate.mockReset().mockResolvedValue({ ok: true, data: runtime })
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