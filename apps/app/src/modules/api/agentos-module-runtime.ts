/**
 * The runtime of one installed module: manifest, sessions, messages, tasks, widgets and the channel settings that reach it.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome"
import { graphql } from "./graphql"
import { parseChannelSetting, parseModuleRuntime } from "./agentos-module-runtime.guards"
import type { AgentosModuleTestContract } from "./agentos-module-tests"
import type { AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "./agentos-runtime-tree"
import type { AgentosModuleInstallation } from "./agentos-modules"

/** Closed MarkdownComponent/tree message contract accepted from the trusted backend boundary. */
export type AgentosRuntimeMessageTree = {
    readonly schemaVersion: 1
    readonly nodes: ReadonlyArray<
        | {
              readonly type: "markdown"
              readonly markdown: string
          }
        | {
              readonly type: "widget"
              readonly widget: AgentosRuntimeWidgetNode
          }
        | {
              readonly type: "attachment"
              readonly attachmentId: string
              readonly label: string
              readonly mediaType: string
          }
    >
}

/** Open, versioned kind/workbench registry manifest pinned to one installation. */
export type AgentosRuntimeManifest = {
    readonly schemaVersion: number
    readonly kind: {
        readonly key: string
        readonly version: string
    }
    readonly workbench: {
        readonly key: string
        readonly version: string
    }
    readonly test?: AgentosModuleTestContract
    readonly setup?: {
        readonly schemaVersion: 1
        readonly contract: { readonly key: string; readonly version: string }
        readonly requirements: ReadonlyArray<{
            readonly key: string
            readonly label: string
            readonly validator: { readonly key: string; readonly version: string }
            readonly dependencies: ReadonlyArray<"authority" | "source" | "retrieval">
            readonly citationPolicy: "none" | "attachment-content"
            readonly ownerConfirmation: boolean
            readonly requiredFor: ReadonlyArray<"acceptance" | "apply">
            readonly guidance?: string
            readonly valueSchema?: Readonly<Record<string, AgentosRuntimeValue>>
        }>
        readonly requiredAcceptanceScenarios: ReadonlyArray<string>
    }
    readonly operations?: {
        readonly replyContract: {
            readonly key: string
            readonly version: string
        }
        readonly taskContract: {
            readonly key: string
            readonly version: string
        }
        readonly toolSchema: {
            readonly key: string
            readonly version: string
        }
        readonly proactiveWidget: {
            readonly key: string
            readonly version: string
        }
        readonly setupFields: ReadonlyArray<string>
    }
    readonly widgets: ReadonlyArray<{
        readonly component: string
        readonly version: string
        readonly allowedProps: ReadonlyArray<string>
        readonly actions: ReadonlyArray<{
            readonly key: string
            readonly inputKeys: ReadonlyArray<string>
        }>
    }>
    readonly credentialSlots?: ReadonlyArray<{
        readonly key: string
        readonly label: string
        readonly provider: string
        readonly secret: true
    }>
    readonly config: Readonly<Record<string, AgentosRuntimeValue>>
}

/** One owner- or participant-safe persistent Module Studio projection. */
export type AgentosModuleRuntime = {
    readonly installation: AgentosModuleInstallation & {
        readonly kindKey: string
        readonly kindVersion: string
        readonly workbenchKey: string
        readonly workbenchVersion: string
        readonly runtimeManifest: AgentosRuntimeManifest
        readonly settingsVersion: number
        readonly setupAuthorityGeneration: number
        readonly setupSourceGeneration: number
        readonly setupRetrievalGeneration: number
        readonly activeContextVersionId: string | null
        readonly liveEnabled: boolean
        readonly operatingMode: "assist" | "autopilot"
        readonly channelAccountRef: string | null
        readonly primaryOpsSessionId: string | null
    }
    readonly setupSession: AgentosRuntimeSession | null
    readonly setupSessions: ReadonlyArray<AgentosRuntimeSession>
    readonly executeSessions: ReadonlyArray<AgentosRuntimeSession>
    readonly participants: ReadonlyArray<{
        readonly id: string
        readonly sessionId: string
        readonly userId: string
    }>
    readonly messages: ReadonlyArray<AgentosRuntimeMessage>
    readonly contextVersions: ReadonlyArray<AgentosRuntimeContextVersion>
    readonly widgets: ReadonlyArray<AgentosRuntimeWidget>
    readonly operationEvents: ReadonlyArray<AgentosRuntimeOperationEvent>
    readonly tasks: ReadonlyArray<AgentosRuntimeTask>
    readonly credentials: ReadonlyArray<AgentosRuntimeCredential>
    readonly settings: Readonly<Record<string, AgentosRuntimeValue>> | null
    readonly diagnostics: Readonly<Record<string, AgentosRuntimeValue>>
}

/** Masked installation credential status; the secret value is never returned. */
export type AgentosRuntimeCredential = {
    readonly id: string
    readonly installationId: string
    readonly providerKey: string
    readonly maskedHint: string
    readonly status: "configured" | "invalid"
}

/** Write-only workspace channel configuration delivered to that workspace's controller. */
export type ConfigureAgentWorkspaceChannelInput = {
    readonly agentWorkspaceId: string
    readonly provider: "Telegram"
    readonly accountId: string
    readonly displayName?: string
    readonly credentials: ReadonlyArray<{
        readonly key: "TELEGRAM_BOT_TOKEN"
        readonly value: string
    }>
}

/** Safe delivery status returned without ever returning the submitted secret. */
export type AgentWorkspaceChannelSetting = {
    readonly provider: string
    readonly accountId: string
    readonly state: "NOT_CONFIGURED" | "PENDING" | "APPLIED" | "ERROR"
    readonly displayName: string | null
    readonly credentials: ReadonlyArray<{
        readonly key: string
        readonly required: boolean
        readonly configured: boolean
        readonly hint: string | null
        readonly syncedAt: string | null
    }>
}

/** Persistent private Setup or collaborative Execute conversation identity. */
export type AgentosRuntimeSession = {
    readonly id: string
    readonly installationId: string
    readonly createdByUserId: string
    readonly mode: "setup" | "execute"
    readonly title: string
    readonly isArchived: boolean
    readonly setupRevision: number | null
    readonly setupStatus: "open" | "ready" | "completed" | "superseded" | null
    readonly draftSnapshot: Readonly<Record<string, AgentosRuntimeValue>> | null
    readonly draftDigest: string | null
    readonly gateEvidence: Readonly<Record<string, AgentosRuntimeValue>> | null
    readonly basedOnContextVersionId: string | null
    readonly completedAt: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** Immutable business-context snapshot created by Setup. */
export type AgentosRuntimeContextVersion = {
    readonly id: string
    readonly installationId: string
    readonly createdByUserId: string
    readonly version: number
    readonly snapshot: Readonly<Record<string, AgentosRuntimeValue>>
    readonly digest: string
    readonly definitionDigest: string
    readonly authorityGeneration: number
    readonly sourceGeneration: number
    readonly retrievalGeneration: number
    readonly sourceSetupSessionId: string | null
    readonly createdAt: string
}

/** Append-only message bound to the context that was active when it was accepted. */
export type AgentosRuntimeMessage = {
    readonly id: string
    readonly sessionId: string
    readonly actorUserId: string | null
    readonly contextVersionId: string | null
    readonly role: "user" | "assistant" | "system"
    readonly content: string
    readonly messageTree: AgentosRuntimeMessageTree | null
    readonly operationEventId: string | null
    readonly taskId: string | null
    readonly sequence: number
    readonly createdAt: string
}

/** Append-only authenticated event accepted by one workspace-owned controller boundary. */
export type AgentosRuntimeOperationEvent = {
    readonly id: string
    readonly installationId: string
    readonly contextVersionId: string
    readonly source: string
    readonly externalEventId: string
    readonly eventType: string
    readonly observedAt: string
    readonly kindKey: string
    readonly kindVersion: string
    readonly replyContractKey: string
    readonly replyContractVersion: string
    readonly toolSchemaDigest: string
    readonly payload: Readonly<Record<string, AgentosRuntimeValue>>
    readonly evidence: Readonly<Record<string, AgentosRuntimeValue>>
    readonly createdAt: string
}

/** Durable work item projected from exactly one accepted operation event. */
export type AgentosRuntimeTask = {
    readonly id: string
    readonly installationId: string
    readonly sourceEventId: string
    readonly contextVersionId: string
    readonly title: string
    readonly summary: string
    readonly priority: "low" | "normal" | "high" | "urgent"
    readonly status: "open" | "in_progress" | "completed" | "refused" | "failed"
    readonly expectedVersion: number
    readonly workbenchKey: string
    readonly workbenchVersion: string
    readonly workbenchRef: string
    readonly evidence: Readonly<Record<string, AgentosRuntimeValue>>
    readonly dueAt: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** Trusted widget tree attached to exactly one immutable Execute message. */
export type AgentosRuntimeWidget = {
    readonly id: string
    readonly messageId: string
    readonly rootComponent: string
    readonly rootVersion: string
    readonly tree: AgentosRuntimeWidgetNode
}

/** Closed commands accepted by the shared Module Studio mutation. */
export type AgentosModuleRuntimeAction =
    | "START_SETUP_REVISION"
    | "APPEND_SETUP_MESSAGE"
    | "UPDATE_SETUP_DRAFT"
    | "REVISE_CONTEXT"
    | "CONFIRM_SETUP_REQUIREMENT"
    | "APPLY_SETUP_REVISION"
    | "APPLY_CONTEXT_VERSION"
    | "ENABLE_LIVE"
    | "DISABLE_LIVE"
    | "CREATE_EXECUTE_SESSION"
    | "RENAME_EXECUTE_SESSION"
    | "ARCHIVE_EXECUTE_SESSION"
    | "SET_EXECUTE_PARTICIPANTS"
    | "APPEND_EXECUTE_MESSAGE"
    | "INVOKE_WIDGET_ACTION"
    | "UPDATE_SETTINGS"
    | "SAVE_MODULE_CREDENTIAL"
    | "REMOVE_MODULE_CREDENTIAL"

/** Exact mutation envelope; optional fields are validated again by the backend action boundary. */
export type ManageAgentosModuleRuntimeInput = {
    readonly action: AgentosModuleRuntimeAction
    readonly installationId: string
    readonly idempotencyKey: string
    readonly sessionId?: string
    readonly contextVersion?: number
    readonly content?: string
    readonly title?: string
    readonly participantUserIds?: ReadonlyArray<string>
    readonly contextSnapshot?: Readonly<Record<string, AgentosRuntimeValue>>
    readonly requirementKey?: string
    readonly expectedDraftDigest?: string
    readonly evidenceDigest?: string
    readonly citations?: ReadonlyArray<{
        readonly attachmentId: string
        readonly sha256: string
        readonly locator?: string
    }>
    readonly widgetTree?: AgentosRuntimeWidgetNode
    readonly widgetId?: string
    readonly widgetAction?: string
    readonly widgetInput?: Readonly<Record<string, AgentosRuntimeValue>>
    readonly taskExpectedVersion?: number
    readonly settings?: Readonly<Record<string, AgentosRuntimeValue>>
    readonly credentialKey?: string
    readonly credentialValue?: string
    readonly operatingMode?: "assist" | "autopilot"
    readonly channelAccountRef?: string
}

const MODULE_RUNTIME_FIELDS = `
    installation {
        id agentWorkspaceId moduleKey moduleVersion displayName kindKey kindVersion workbenchKey workbenchVersion
        runtimeManifest settingsVersion setupAuthorityGeneration setupSourceGeneration setupRetrievalGeneration activeContextVersionId liveEnabled operatingMode channelAccountRef primaryOpsSessionId
        status failureCode createdAt updatedAt
    }
    setupSession {
        id installationId createdByUserId mode title isArchived setupRevision setupStatus draftSnapshot draftDigest
        gateEvidence basedOnContextVersionId completedAt createdAt updatedAt
    }
    setupSessions {
        id installationId createdByUserId mode title isArchived setupRevision setupStatus draftSnapshot draftDigest
        gateEvidence basedOnContextVersionId completedAt createdAt updatedAt
    }
    executeSessions {
        id installationId createdByUserId mode title isArchived setupRevision setupStatus draftSnapshot draftDigest
        gateEvidence basedOnContextVersionId completedAt createdAt updatedAt
    }
    participants { id sessionId userId }
    messages { id sessionId actorUserId contextVersionId role content messageTree operationEventId taskId sequence createdAt }
    contextVersions { id installationId createdByUserId version snapshot digest definitionDigest authorityGeneration sourceGeneration retrievalGeneration sourceSetupSessionId createdAt }
    widgets { id messageId rootComponent rootVersion tree }
    operationEvents {
        id installationId contextVersionId source externalEventId eventType observedAt kindKey kindVersion
        replyContractKey replyContractVersion toolSchemaDigest payload evidence createdAt
    }
    tasks {
        id installationId sourceEventId contextVersionId title summary priority status expectedVersion
        workbenchKey workbenchVersion workbenchRef evidence dueAt createdAt updatedAt
    }
    credentials { id installationId providerKey maskedHint status }
    settings diagnostics
`

/** Read one shared Module Studio runtime with progressive diagnostics disclosure. */
export const myAgentosModuleRuntime = (
    installationId: string,
    includeDiagnostics = false,
): Promise<Outcome<AgentosModuleRuntime>> =>
    graphql(
        `query MyAgentosModuleRuntime($request: MyAgentosModuleRuntimeRequest!) {
            myAgentosModuleRuntime(request: $request) {
                data { ${MODULE_RUNTIME_FIELDS} }
                message success error
            }
        }`,
        parseModuleRuntime,
        {
            request: { installationId, includeDiagnostics },
        },
    )

/** Apply one explicit Setup, Execute, widget, or settings command and return the settled runtime. */
export const manageAgentosModuleRuntime = (
    input: ManageAgentosModuleRuntimeInput,
): Promise<Outcome<AgentosModuleRuntime>> =>
    graphql(
        `mutation ManageAgentosModuleRuntime($input: ManageAgentosModuleRuntimeInput!) {
            manageAgentosModuleRuntime(request: $input) {
                data { ${MODULE_RUNTIME_FIELDS} }
                message success error
            }
        }`,
        parseModuleRuntime,
        {
            input,
        },
    )

/** Deliver one write-only Telegram credential set to the owning Agent Workspace controller. */
export const configureAgentWorkspaceChannel = (
    input: ConfigureAgentWorkspaceChannelInput,
): Promise<Outcome<AgentWorkspaceChannelSetting>> =>
    graphql(
        `
            mutation ConfigureAgentWorkspaceChannel($input: ConfigureAgentWorkspaceChannelInput!) {
                configureAgentWorkspaceChannel(request: $input) {
                    data {
                        provider
                        accountId
                        state
                        displayName
                        credentials {
                            key
                            required
                            configured
                            hint
                            syncedAt
                        }
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseChannelSetting,
        {
            input,
        },
    )
