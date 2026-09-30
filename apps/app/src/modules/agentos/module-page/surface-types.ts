import type { ChatbotWorkbenchFieldsFragment } from "../../api/__generated__/agentos-controlplane"
import type { MyAgentosModuleRuntimeQuery } from "@/modules/api/__generated__/core"

import type { AgentosModuleTestSurfaceView } from "@/modules/api/agentos-module-tests"
import type { AgentosModuleTestContractView } from "@/modules/api/agentos-module-tests"



import type { ReactNode } from "react"
import type { ContextDraft } from "../../../components/blocks/agentos/ContextVersionBlock"
import type { ExecuteMessage, TrustedWidgetComponentProps } from "../../../components/blocks/agentos/ExecuteChatBlock"
import type { ExecuteSession } from "../../../components/blocks/agentos/ExecuteSessionRailBlock"
import type { AgentOSModuleView } from "../../../components/blocks/agentos/ModuleRouteShellBlock"
import type { SetupMessage, SetupRevision } from "../../../components/blocks/agentos/PrivateSetupChatBlock"

import type { AgentosRuntimeValue } from "../../api/agentos-runtime-tree"

/** Settled inputs and actions for the controlled Setup panel. */
export type SetupSurfaceProps = {
    readonly messages: ReadonlyArray<SetupMessage>
    readonly revisions: ReadonlyArray<SetupRevision>
    readonly selectedRevisionId: string
    readonly canSend: boolean
    readonly canStartRevision: boolean
    readonly activeVersion: number | null
    readonly draft: ContextDraft | null
    readonly pending: boolean
    readonly draftText: string
    readonly setupSendPending?: boolean
    readonly setupApplyPending?: boolean
    readonly setupStartPending?: boolean
    readonly setupPeerDisabled?: boolean
    readonly refused: boolean
    readonly setupSendRefused?: boolean
    readonly setupApplyRefused?: boolean
    readonly setupStartRefused?: boolean
    readonly setupUnconfirmed?: boolean
    readonly compactPane: "versions" | "conversation" | "context"
    readonly sourceAttachmentPanel?: ReactNode
    readonly onSelectRevision: (sessionId: string) => void
    readonly onStartRevision: () => void
    readonly onSend: (content: string) => void
    readonly onDraft: (content: string) => void
    readonly onApply: () => void
    readonly onCreateVersion: () => void
    readonly onConfirmRequirement: (gate: ContextDraft["gates"][number]) => void
    readonly onSelectPane: (pane: "versions" | "conversation" | "context") => void
}

/** Settled inputs and actions for module scenario testing. */
export type TestSurfaceProps = {
    readonly contract: AgentosModuleTestContractView
    readonly targetReady: boolean
    readonly contextLabel: string
    readonly testSurface: AgentosModuleTestSurfaceView | null
    readonly pending: boolean
    readonly selectedScenarioKey: string
    readonly mode: "exploratory" | "acceptance"
    readonly compactPane: "scenarios" | "conversation" | "evidence"
    readonly onSelectScenario: (scenarioKey: string) => void
    readonly onSelectMode: (mode: "exploratory" | "acceptance") => void
    readonly onSelectPane: (pane: "scenarios" | "conversation" | "evidence") => void
    readonly onRun: (
        mode: "exploratory" | "acceptance",
        scenarioKey: string,
        scenarioInput: Readonly<Record<string, AgentosRuntimeValue>>,
    ) => void
}

type AgentOSSolutionModuleSupportInbox = {
    readonly selectedConversationId: string | null
    readonly pending: boolean
}

/** Settled inputs and actions for module operation surfaces. */
export type OperateSurfaceProps = {
    readonly installationId: string
    readonly kindKey: string
    readonly workbenchKey: string
    readonly workbenchVersion: string
    readonly sessions: ReadonlyArray<ExecuteSession>
    readonly selectedSessionId: string | null
    readonly selectedSessionTitle: string
    readonly messages: ReadonlyArray<ExecuteMessage>
    readonly tasks: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["tasks"]
    readonly events: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["operationEvents"]
    readonly operationTarget: "customer-chat" | "customer-workbench" | "internal-chat" | "internal-workbench"
    readonly isChatbot: boolean
    readonly chatbotWorkbench: ChatbotWorkbenchFieldsFragment | null
    readonly chatbotRefusedCode: string | null
    readonly supportInbox: AgentOSSolutionModuleSupportInbox
    readonly pending: boolean
    readonly refused: boolean
    readonly onSelectSession: (sessionId: string) => void
    readonly onSelectTarget: (target: OperateSurfaceProps["operationTarget"]) => void
    readonly onCreateSession: () => void
    readonly onSend: (content: string) => void
    readonly onWidgetAction: NonNullable<TrustedWidgetComponentProps["onAction"]>
    readonly onSelectSupportConversation: (conversationId: string) => void
    readonly onConnectChatbotZalo: () => void
    readonly onSetChatbotHandoff: (conversationId: string) => void
    readonly onResolveChatbotHandoff: (conversationId: string) => void
    readonly onReconcileChatbotDelivery: (outboxId: string, delivered: boolean) => void
}

type SettingsFormActions = {
    readonly save: (
        settings: Readonly<Record<string, AgentosRuntimeValue>>,
        operatingMode: "assist" | "autopilot",
        channelAccountRef: string,
    ) => void
    readonly setLiveEnabled: (enabled: boolean) => void
    readonly saveCredential: (credentialKey: string, credentialValue: string) => void
    readonly removeCredential: (credentialKey: string) => void
    readonly changeDisplayName: (value: string) => void
    readonly changeModelProfile: (value: string) => void
    readonly changeConfirmation: (value: boolean) => void
    readonly changeOperatingMode: (value: "assist" | "autopilot") => void
    readonly changeChannelAccountRef: (value: string) => void
    readonly changeCredential: (credentialKey: string, value: string) => void
}

/** Current values and user actions for the module settings form. */
export type SettingsFormContentProps = {
    readonly currentDisplayName: string
    readonly currentModelProfile: string
    readonly currentConfirmation: boolean
    readonly currentOperatingMode: "assist" | "autopilot"
    readonly currentChannelAccountRef: string
    readonly displayName: string
    readonly modelProfile: string
    readonly requireConfirmation: boolean
    readonly operatingMode: "assist" | "autopilot"
    readonly channelAccountRef: string
    readonly credentialValues: Readonly<Record<string, string>>
    readonly liveEnabled: boolean
    readonly canEnableLive: boolean
    readonly pending: boolean
    readonly refused: boolean
    readonly credentialSlots: ReadonlyArray<{
        readonly key: string
        readonly label: string
        readonly provider: string
    }>
    readonly credentialStatuses: ReadonlyArray<{
        readonly providerKey: string
        readonly maskedHint: string
        readonly status: string
    }>
    readonly on: SettingsFormActions
}

/** Complete settled inputs for the module settings surface. */
export type SettingsSurfaceProps = SettingsFormContentProps & {
    readonly activeVersion: number | null
}

/** Settled diagnostics, event evidence and filter actions. */
export type DiagnosticsSurfaceProps = {
    readonly installationId: string
    readonly kindKey: string
    readonly workbenchKey: string
    readonly diagnostics: Readonly<Record<string, AgentosRuntimeValue>>
    readonly events: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["operationEvents"]
    readonly selectedSignal: "all" | "channel" | "ai"
    readonly compactPane: "signals" | "readiness" | "evidence"
    readonly onSelectSignal: (signal: "all" | "channel" | "ai") => void
    readonly onSelectPane: (pane: "signals" | "readiness" | "evidence") => void
}

/** Closed pure screen states produced by the connected Module Studio page. */
export type AgentOSSolutionModuleScreen =
    | {
          readonly view: "setup"
          readonly contentProps: SetupSurfaceProps
      }
    | {
          readonly view: "test"
          readonly contentProps: TestSurfaceProps
      }
    | {
          readonly view: "test-unavailable"
      }
    | {
          readonly view: "operate"
          readonly contentProps: OperateSurfaceProps
      }
    | {
          readonly view: "settings"
          readonly contentProps: SettingsSurfaceProps
      }
    | {
          readonly view: "diagnostics"
          readonly contentProps: DiagnosticsSurfaceProps
      }

/** Shell data drawn alongside the selected module screen. */
export type AgentOSSolutionModuleShellData = {
    readonly workspaceLabel: string
    readonly moduleName: string
    readonly moduleKind: string
    readonly lifecycleLabel: string
    readonly contextVersion: string
    readonly channelLabel: string
    readonly controllerLabel: string
    readonly activeView: AgentOSModuleView
}
