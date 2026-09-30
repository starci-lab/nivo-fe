import { createFormatter, createTranslator } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../messages/en.json"
import { TIME_ZONE } from "../../i18n/config"
import {
    moduleRuntimeFixture,
    runtimeSessionFixture,
} from "../../../test-support/mock-result"
import { buildModulePageCopy } from "../module-page-copy"
import type {
    ModuleDiagnosticsView,
    ModuleOperateView,
    ModuleSettingsView,
    ModuleSetupView,
    ModuleTestView,
} from "./content-props"
import { moduleScreenFor, moduleShellPropsFor, type ModuleScreenSource } from "./screens"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
    }),
)

const setupView: ModuleSetupView = {
    selectedSetup: null,
    sendPending: false,
    applyPending: false,
    startPending: false,
    peerDisabled: false,
    sendRefused: false,
    applyRefused: false,
    startRefused: false,
    unconfirmed: false,
    draftText: "",
    compactPane: "conversation",
    updateIndexedSourceAttachments: vi.fn(),
    selectRevision: vi.fn(),
    startRevision: vi.fn(),
    sendMessage: vi.fn(async () => undefined),
    changeDraft: vi.fn(),
    applyRevision: vi.fn(),
    createContextVersion: vi.fn(),
    confirmRequirement: vi.fn(async () => undefined),
    selectPane: vi.fn(),
}

const operateView: ModuleOperateView = {
    selectedSessionId: null,
    supportConversationId: null,
    chatbotWorkbench: null,
    chatbotRefusedCode: null,
    supportPending: false,
    operationTarget: "internal-chat",
    isChatbot: false,
    createExecuteSession: vi.fn(async () => null),
    sendExecuteMessage: vi.fn(async () => undefined),
    invokeWidgetAction: vi.fn(),
    connectChatbotZalo: vi.fn(),
    setChatbotHandoff: vi.fn(),
    resolveChatbotHandoff: vi.fn(),
    reconcileChatbotDelivery: vi.fn(),
    selectSession: vi.fn(),
    selectSupportConversation: vi.fn(),
    selectTarget: vi.fn(),
}

const testView: ModuleTestView = {
    contract: undefined,
    surface: null,
    selectedScenarioKey: "",
    mode: "exploratory",
    compactPane: "conversation",
    run: vi.fn(async () => undefined),
    selectScenario: vi.fn(),
    selectMode: vi.fn(),
    selectPane: vi.fn(),
}

const settingsView: ModuleSettingsView = {
    values: {
        displayName: "",
        modelProfile: "",
        requireConfirmation: true,
        operatingMode: "assist",
        channelAccountRef: "",
        credentialValues: {},
    },
    currentDisplayName: "Desk",
    currentModelProfile: "nivo-default",
    currentConfirmation: true,
    currentOperatingMode: "assist",
    currentChannelAccountRef: null,
    canEnableLive: false,
    handlers: {
        save: vi.fn(),
        setLiveEnabled: vi.fn(),
        saveCredential: vi.fn(),
        removeCredential: vi.fn(),
        changeDisplayName: vi.fn(),
        changeModelProfile: vi.fn(),
        changeConfirmation: vi.fn(),
        changeOperatingMode: vi.fn(),
        changeChannelAccountRef: vi.fn(),
        changeCredential: vi.fn(),
    },
}

const diagnosticsView: ModuleDiagnosticsView = {
    compactPane: "readiness",
    signal: "all",
    selectPane: vi.fn(),
    selectSignal: vi.fn(),
}

const source = (
    overrides: Partial<ModuleScreenSource> = {},
): ModuleScreenSource => {
    const { runtime: overrideRuntime, ...rest } = overrides
    return {
        runtime: overrideRuntime ?? moduleRuntimeFixture(),
        copy,
        format: createFormatter({ locale: "en" }),
        view: "setup",
        pending: false,
        refused: false,
        activeVersion: null,
        draft: null,
        sourceAttachmentPanel: undefined,
        setup: setupView,
        operate: operateView,
        test: testView,
        settings: settingsView,
        diagnostics: diagnosticsView,
        ...rest,
    }
}

describe("moduleShellPropsFor", () => {
    it("composes the shell strip from the runtime's settled facts", () => {
        const runtime = moduleRuntimeFixture({
            installation: { liveEnabled: true, kindKey: "chat-kind" },
        })
        const shell = moduleShellPropsFor({
            workspaceId: "workspace-1234-rest",
            copy,
            displayName: "Desk Agent",
            runtime,
            lifecycleLabels: {},
            activeVersion: 3,
            channelAccountRef: "telegram:1",
            view: "operate",
        })
        expect(shell.moduleName).toBe("Desk Agent")
        expect(shell.moduleKind).toBe("chat-kind")
        expect(shell.lifecycleLabel).toBe(copy.shell.live)
        expect(shell.contextVersion).toBe("v3")
        expect(shell.channelLabel).toBe(copy.shell.telegramConnected)
        expect(shell.activeView).toBe("operate")
    })
})

describe("moduleScreenFor", () => {
    it("routes each view to its content props", () => {
        expect(moduleScreenFor(source()).view).toBe("setup")
        expect(moduleScreenFor(source({ view: "operate" as const })).view).toBe("operate")
        expect(moduleScreenFor(source({ view: "settings" as const })).view).toBe("settings")
        expect(moduleScreenFor(source({ view: "diagnostics" as const })).view).toBe("diagnostics")
    })

    it("shows the unavailable screen while the module publishes no test contract", () => {
        expect(moduleScreenFor(source({ view: "test" as const })).view).toBe("test-unavailable")
        const withContract = moduleScreenFor(
            source({
                view: "test" as const,
                test: {
                    ...testView,
                    contract: {
                        workbench: { key: "w", version: "1" },
                        contract: { key: "c", version: "1" },
                        sandboxAdapter: { key: "s", version: "1" },
                        evidenceWidget: { key: "e", version: "1" },
                        scenarios: [],
                    },
                },
            }),
        )
        expect(withContract.view).toBe("test")
    })

    it("locks the setup send while no revision is selected", () => {
        const session = runtimeSessionFixture({ id: "s-1", mode: "setup", setupRevision: 1, setupStatus: "open" })
        const runtime = moduleRuntimeFixture({ setupSessions: [session] })
        const screen = moduleScreenFor(
            source({ runtime, setup: { ...setupView, selectedSetup: session } }),
        )
        if (screen.view !== "setup") throw new Error("expected the setup screen")
        expect(screen.contentProps.canSend).toBe(true)
        expect(screen.contentProps.canStartRevision).toBe(false)
        expect(screen.contentProps.selectedRevisionId).toBe("s-1")
    })
})
