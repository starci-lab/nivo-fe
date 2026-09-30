import type { ReactNode } from "react"
import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import type { AgentosModuleRuntime, AgentosRuntimeSession } from "../../api/agentos-module-runtime"
import type { AgentosModuleTestContract, AgentosModuleTestSurface } from "../../api/agentos-module-tests"
import type { AgentosRuntimeValue } from "../../api/agentos-runtime-tree"
import type { Formatter } from "../../i18n/formatter"
import type { ModulePageCopy } from "../module-page-copy"
import { exactTestSurfaceFor } from "./exactTestSurfaceFor"
import {
    executeMessagesFor,
    executeSessionsFor,
    setupMessagesFor,
    setupOpenFor,
    setupRevisionsFor,
} from "./messages"
import { executeSessionFor, selectedSessionTitleFor } from "./sessions"
import type {
    DiagnosticsSurfaceProps,
    OperateSurfaceProps,
    SettingsSurfaceProps,
    SetupSurfaceProps,
    TestSurfaceProps,
} from "./surface-types"
import { testContextLabelFor } from "./test-target"

/** The setup pane's connected slice: selection, flags, drafts and session commands. */
export type ModuleSetupView = {
    readonly selectedSetup: AgentosRuntimeSession | null
    readonly sendPending: boolean
    readonly applyPending: boolean
    readonly startPending: boolean
    readonly peerDisabled: boolean
    readonly sendRefused: boolean
    readonly applyRefused: boolean
    readonly startRefused: boolean
    readonly unconfirmed: boolean
    readonly draftText: string
    readonly compactPane: SetupSurfaceProps["compactPane"]
    readonly updateIndexedSourceAttachments: (
        attachments: ReadonlyArray<{ readonly attachmentId: string; readonly sha256: string }>,
    ) => void
    readonly selectRevision: (sessionId: string) => void
    readonly startRevision: () => void
    readonly sendMessage: (sessionId: string, content: string) => Promise<void>
    readonly changeDraft: (sessionId: string, content: string) => void
    readonly applyRevision: (sessionId: string) => void
    readonly createContextVersion: (sessionId: string) => void
    readonly confirmRequirement: (
        sessionId: string,
        draftDigest: string,
        requirementKey: string,
        citationPolicy: "none" | "attachment-content",
    ) => Promise<void>
    readonly selectPane: (pane: SetupSurfaceProps["compactPane"]) => void
}

/** The operate pane's connected slice: sessions, support inbox and inbox commands. */
export type ModuleOperateView = {
    readonly selectedSessionId: string | null
    readonly supportConversationId: string | null
    readonly chatbotWorkbench: OperateSurfaceProps["chatbotWorkbench"]
    readonly chatbotRefusedCode: string | null
    readonly supportPending: boolean
    readonly operationTarget: OperateSurfaceProps["operationTarget"]
    readonly isChatbot: boolean
    readonly createExecuteSession: () => Promise<string | null>
    readonly sendExecuteMessage: (sessionId: string, content: string) => Promise<void>
    readonly invokeWidgetAction: (
        widgetId: string,
        widgetAction: string,
        widgetInput: Readonly<Record<string, AgentosRuntimeValue>>,
        taskExpectedVersion?: number,
    ) => void
    readonly connectChatbotZalo: () => void
    readonly setChatbotHandoff: (conversationId: string) => void
    readonly resolveChatbotHandoff: (conversationId: string) => void
    readonly reconcileChatbotDelivery: (providerOutboxId: string, delivered: boolean) => void
    readonly selectSession: (sessionId: string) => void
    readonly selectSupportConversation: (conversationId: string) => void
    readonly selectTarget: (target: OperateSurfaceProps["operationTarget"]) => void
}

/** The test pane's connected slice: contract, scenario selection, mode and the run command. */
export type ModuleTestView = {
    readonly contract: AgentosModuleTestContract | undefined
    readonly surface: AgentosModuleTestSurface | null
    readonly selectedScenarioKey: string
    readonly mode: "exploratory" | "acceptance"
    readonly compactPane: TestSurfaceProps["compactPane"]
    readonly run: (
        target: { readonly contextVersionId?: string; readonly setupSessionId?: string },
        mode: "exploratory" | "acceptance",
        scenarioKey: string,
        scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>,
    ) => Promise<void>
    readonly selectScenario: (scenarioKey: string) => void
    readonly selectMode: (mode: "exploratory" | "acceptance") => void
    readonly selectPane: (pane: TestSurfaceProps["compactPane"]) => void
}

/** The settings pane's connected slice: current and edited values plus the form handlers. */
export type ModuleSettingsView = {
    readonly values: {
        readonly displayName: string
        readonly modelProfile: string
        readonly requireConfirmation: boolean
        readonly operatingMode: "assist" | "autopilot"
        readonly channelAccountRef: string
        readonly credentialValues: Readonly<Record<string, string>>
    }
    readonly currentDisplayName: string
    readonly currentModelProfile: string
    readonly currentConfirmation: boolean
    readonly currentOperatingMode: "assist" | "autopilot"
    readonly currentChannelAccountRef: string | null
    readonly canEnableLive: boolean
    readonly handlers: SettingsSurfaceProps["on"]
}

/** The diagnostics pane's connected slice: filters and the selected evidence lane. */
export type ModuleDiagnosticsView = {
    readonly compactPane: DiagnosticsSurfaceProps["compactPane"]
    readonly signal: DiagnosticsSurfaceProps["selectedSignal"]
    readonly selectPane: (pane: DiagnosticsSurfaceProps["compactPane"]) => void
    readonly selectSignal: (signal: DiagnosticsSurfaceProps["selectedSignal"]) => void
}

/** The connected facts setupContentPropsFor combines. */
export type SetupContentInput = {
    readonly runtime: AgentosModuleRuntime
    readonly activeVersion: number | null
    readonly draft: ContextDraft | null
    readonly pending: boolean
    readonly refused: boolean
    readonly sourceAttachmentPanel: ReactNode | undefined
    readonly setup: ModuleSetupView
}

/** The setup surface's settled content props for one runtime, draft and selection. */
export const setupContentPropsFor = (input: SetupContentInput): SetupSurfaceProps => {
    const { runtime, draft, setup } = input
    return {
        messages: setupMessagesFor(runtime, setup.selectedSetup),
        revisions: setupRevisionsFor(runtime),
        selectedRevisionId: setup.selectedSetup?.id ?? "",
        canSend:
            setup.selectedSetup?.setupStatus === "open" || setup.selectedSetup?.setupStatus === "ready",
        canStartRevision: !setupOpenFor(runtime),
        activeVersion: input.activeVersion,
        draft,
        pending: input.pending,
        setupSendPending: setup.sendPending,
        setupApplyPending: setup.applyPending,
        setupStartPending: setup.startPending,
        setupPeerDisabled: setup.peerDisabled,
        refused: input.refused,
        setupSendRefused: setup.sendRefused,
        setupApplyRefused: setup.applyRefused,
        setupStartRefused: setup.startRefused,
        setupUnconfirmed: setup.unconfirmed,
        draftText: setup.draftText,
        compactPane: setup.compactPane,
        sourceAttachmentPanel: input.sourceAttachmentPanel,
        onSelectRevision: setup.selectRevision,
        onStartRevision: setup.startRevision,
        onSend: (content) =>
            setup.selectedSetup !== null && void setup.sendMessage(setup.selectedSetup.id, content),
        onDraft: (content) =>
            setup.selectedSetup !== null && setup.changeDraft(setup.selectedSetup.id, content),
        onApply: () => draft !== null && setup.applyRevision(draft.setupSessionId),
        onCreateVersion: () => draft !== null && setup.createContextVersion(draft.setupSessionId),
        onConfirmRequirement: (gate) =>
            draft?.digest !== null &&
            draft?.digest !== undefined &&
            void setup.confirmRequirement(draft.setupSessionId, draft.digest, gate.key, gate.citationPolicy),
        onSelectPane: setup.selectPane,
    }
}

/** The connected facts operateContentPropsFor combines. */
export type OperateContentInput = {
    readonly runtime: AgentosModuleRuntime
    readonly copy: ModulePageCopy
    readonly pending: boolean
    readonly refused: boolean
    readonly format: Formatter
    readonly operate: ModuleOperateView
}

/** The operate surface's settled content props for one runtime and session selection. */
export const operateContentPropsFor = (input: OperateContentInput): OperateSurfaceProps => {
    const { runtime, copy, format, operate } = input
    const selectedSession = executeSessionFor(runtime, operate.selectedSessionId)
    return {
        installationId: runtime.installation.id,
        kindKey: runtime.installation.kindKey,
        workbenchKey: runtime.installation.workbenchKey,
        workbenchVersion: runtime.installation.workbenchVersion,
        sessions: executeSessionsFor(runtime, copy, format),
        selectedSessionId: operate.selectedSessionId,
        selectedSessionTitle: selectedSessionTitleFor(selectedSession, runtime, copy),
        messages: executeMessagesFor(runtime, selectedSession, copy),
        tasks: runtime.tasks,
        events: runtime.operationEvents,
        operationTarget: operate.operationTarget,
        isChatbot: operate.isChatbot,
        chatbotWorkbench: operate.chatbotWorkbench,
        chatbotRefusedCode: operate.chatbotRefusedCode,
        supportInbox: {
            selectedConversationId: operate.supportConversationId,
            pending: operate.supportPending,
        },
        pending: input.pending,
        refused: input.refused,
        onSelectSession: operate.selectSession,
        onSelectTarget: operate.selectTarget,
        onCreateSession: () => {
            void operate.createExecuteSession().then((sessionId) => {
                if (sessionId !== null) operate.selectSession(sessionId)
            })
        },
        onSend: (content) =>
            operate.selectedSessionId !== null &&
            void operate.sendExecuteMessage(operate.selectedSessionId, content),
        onWidgetAction: (widgetId, actionKey, widgetInput, taskExpectedVersion) => {
            operate.invokeWidgetAction(widgetId, actionKey, widgetInput, taskExpectedVersion)
            if (actionKey === "open-task") operate.selectTarget("internal-workbench")
        },
        onSelectSupportConversation: operate.selectSupportConversation,
        onConnectChatbotZalo: operate.connectChatbotZalo,
        onSetChatbotHandoff: operate.setChatbotHandoff,
        onResolveChatbotHandoff: operate.resolveChatbotHandoff,
        onReconcileChatbotDelivery: operate.reconcileChatbotDelivery,
    }
}

/** The connected facts testContentPropsFor combines. */
export type TestContentInput = {
    readonly copy: ModulePageCopy
    readonly draft: ContextDraft | null
    readonly pending: boolean
    readonly test: ModuleTestView
}

/** The test surface's settled content props, or none while the module publishes no contract. */
export const testContentPropsFor = (input: TestContentInput): TestSurfaceProps | undefined => {
    const { copy, draft, test } = input
    if (test.contract === undefined) return undefined
    return {
        contract: test.contract,
        targetReady: draft !== null && draft.digest !== null,
        contextLabel: testContextLabelFor(draft, copy),
        testSurface: exactTestSurfaceFor(test.surface, draft),
        pending: input.pending,
        selectedScenarioKey: test.selectedScenarioKey,
        mode: test.mode,
        compactPane: test.compactPane,
        onSelectScenario: test.selectScenario,
        onSelectMode: test.selectMode,
        onSelectPane: test.selectPane,
        onRun: (mode, scenarioKey, scenarioInput) => {
            if (draft !== null && draft.digest !== null) {
                void test.run(
                    {
                        setupSessionId: draft.setupSessionId,
                    },
                    mode,
                    scenarioKey,
                    scenarioInput,
                )
            }
        },
    }
}

/** The connected facts settingsContentPropsFor combines. */
export type SettingsContentInput = {
    readonly runtime: AgentosModuleRuntime
    readonly activeVersion: number | null
    readonly pending: boolean
    readonly refused: boolean
    readonly settings: ModuleSettingsView
}

/** The settings surface's settled content props for one runtime and form state. */
export const settingsContentPropsFor = (input: SettingsContentInput): SettingsSurfaceProps => {
    const { runtime, settings } = input
    return {
        currentDisplayName: settings.currentDisplayName,
        currentModelProfile: settings.currentModelProfile,
        currentConfirmation: settings.currentConfirmation,
        currentOperatingMode: settings.currentOperatingMode,
        currentChannelAccountRef: settings.currentChannelAccountRef ?? "",
        displayName: settings.values.displayName,
        modelProfile: settings.values.modelProfile,
        requireConfirmation: settings.values.requireConfirmation,
        operatingMode: settings.values.operatingMode,
        channelAccountRef: settings.values.channelAccountRef,
        credentialValues: settings.values.credentialValues,
        liveEnabled: runtime.installation.liveEnabled,
        canEnableLive: settings.canEnableLive,
        credentialSlots: runtime.installation.runtimeManifest.credentialSlots ?? [],
        credentialStatuses: runtime.credentials,
        activeVersion: input.activeVersion,
        pending: input.pending,
        refused: input.refused,
        on: settings.handlers,
    }
}

/** The connected facts diagnosticsContentPropsFor combines. */
export type DiagnosticsContentInput = {
    readonly runtime: AgentosModuleRuntime
    readonly diagnostics: ModuleDiagnosticsView
}

/** The diagnostics surface's settled content props for one runtime and signal selection. */
export const diagnosticsContentPropsFor = (input: DiagnosticsContentInput): DiagnosticsSurfaceProps => {
    const { runtime, diagnostics } = input
    return {
        installationId: runtime.installation.id,
        kindKey: runtime.installation.kindKey,
        workbenchKey: runtime.installation.workbenchKey,
        diagnostics: runtime.diagnostics,
        events: runtime.operationEvents,
        selectedSignal: diagnostics.signal,
        compactPane: diagnostics.compactPane,
        onSelectSignal: diagnostics.selectSignal,
        onSelectPane: diagnostics.selectPane,
    }
}
