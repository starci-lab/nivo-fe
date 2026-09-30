/**
 * The parsers of the module-runtime documents' payloads: the shared Module Studio projection and
 * the write-only channel setting. Each returns the value or null, which `graphql` reports as
 * `unavailable`. No credential value is ever read - statuses and masked hints only.
 */

import { isBoolean, isNullableString, isNumber, isOneOf, isRecord, isString, isStringArray, parseEach } from "@nivo/api"
import { isAgentosRuntimeRecord, isAgentosRuntimeWidgetNode } from "./agentos-runtime-tree.guards"
import type { AgentosRuntimeValue } from "./agentos-runtime-tree"
import { parseModuleTestContract } from "./agentos-module-tests.guards"
import type {
    AgentosModuleRuntime,
    AgentosRuntimeContextVersion,
    AgentosRuntimeCredential,
    AgentosRuntimeManifest,
    AgentosRuntimeMessage,
    AgentosRuntimeMessageTree,
    AgentosRuntimeOperationEvent,
    AgentosRuntimeSession,
    AgentosRuntimeTask,
    AgentosRuntimeWidget,
    AgentWorkspaceChannelSetting,
} from "./agentos-module-runtime"

const parseKeyedVersion = (value: unknown): { readonly key: string; readonly version: string } | null =>
    isRecord(value) && isString(value.key) && isString(value.version)
        ? { key: value.key, version: value.version }
        : null

type ManifestRequirement = NonNullable<AgentosRuntimeManifest["setup"]>["requirements"][number]
type ManifestWidget = AgentosRuntimeManifest["widgets"][number]
type ManifestCredentialSlot = NonNullable<AgentosRuntimeManifest["credentialSlots"]>[number]

const parseRequirement = (value: unknown): ManifestRequirement | null => {
    if (
        !isRecord(value) ||
        !isString(value.key) ||
        !isString(value.label) ||
        !isOneOf(value.citationPolicy, ["none", "attachment-content"]) ||
        !isBoolean(value.ownerConfirmation)
    ) {
        return null
    }
    const validator = parseKeyedVersion(value.validator)
    const dependencies = value.dependencies
    if (
        validator === null ||
        !Array.isArray(dependencies) ||
        !dependencies.every((d) => isOneOf(d, ["authority", "source", "retrieval"]))
    ) {
        return null
    }
    const requiredFor = value.requiredFor
    if (!Array.isArray(requiredFor) || !requiredFor.every((r) => isOneOf(r, ["acceptance", "apply"]))) return null
    const requirement: {
        key: string
        label: string
        validator: { readonly key: string; readonly version: string }
        dependencies: ReadonlyArray<"authority" | "source" | "retrieval">
        citationPolicy: "none" | "attachment-content"
        ownerConfirmation: boolean
        requiredFor: ReadonlyArray<"acceptance" | "apply">
        guidance?: string
        valueSchema?: Readonly<Record<string, AgentosRuntimeValue>>
    } = {
        key: value.key,
        label: value.label,
        validator,
        dependencies: [...dependencies],
        citationPolicy: value.citationPolicy,
        ownerConfirmation: value.ownerConfirmation,
        requiredFor: [...requiredFor],
    }
    if (value.guidance !== undefined) {
        if (!isString(value.guidance)) return null
        requirement.guidance = value.guidance
    }
    if (value.valueSchema !== undefined) {
        if (!isAgentosRuntimeRecord(value.valueSchema)) return null
        requirement.valueSchema = value.valueSchema
    }
    return requirement
}

const parseManifestSetup = (value: unknown): NonNullable<AgentosRuntimeManifest["setup"]> | null => {
    if (!isRecord(value) || value.schemaVersion !== 1 || !isStringArray(value.requiredAcceptanceScenarios)) {
        return null
    }
    const contract = parseKeyedVersion(value.contract)
    const requirements = parseEach(value.requirements, parseRequirement)
    if (contract === null || requirements === null) return null
    return { schemaVersion: 1, contract, requirements, requiredAcceptanceScenarios: value.requiredAcceptanceScenarios }
}

const parseManifestOperations = (
    value: unknown,
): NonNullable<AgentosRuntimeManifest["operations"]> | null => {
    if (!isRecord(value) || !isStringArray(value.setupFields)) return null
    const replyContract = parseKeyedVersion(value.replyContract)
    const taskContract = parseKeyedVersion(value.taskContract)
    const toolSchema = parseKeyedVersion(value.toolSchema)
    const proactiveWidget = parseKeyedVersion(value.proactiveWidget)
    if (replyContract === null || taskContract === null || toolSchema === null || proactiveWidget === null) {
        return null
    }
    return { replyContract, taskContract, toolSchema, proactiveWidget, setupFields: value.setupFields }
}

const parseManifestWidget = (value: unknown): ManifestWidget | null => {
    if (
        !isRecord(value) ||
        !isString(value.component) ||
        !isString(value.version) ||
        !isStringArray(value.allowedProps)
    ) {
        return null
    }
    const actions = parseEach(value.actions, (entry) =>
        isRecord(entry) && isString(entry.key) && isStringArray(entry.inputKeys)
            ? { key: entry.key, inputKeys: entry.inputKeys }
            : null,
    )
    if (actions === null) return null
    return { component: value.component, version: value.version, allowedProps: value.allowedProps, actions }
}

const parseCredentialSlot = (value: unknown): ManifestCredentialSlot | null =>
    isRecord(value) &&
    isString(value.key) &&
    isString(value.label) &&
    isString(value.provider) &&
    value.secret === true
        ? { key: value.key, label: value.label, provider: value.provider, secret: true }
        : null

const parseRuntimeManifest = (value: unknown): AgentosRuntimeManifest | null => {
    if (!isRecord(value) || !isNumber(value.schemaVersion) || !isAgentosRuntimeRecord(value.config)) return null
    const kind = parseKeyedVersion(value.kind)
    const workbench = parseKeyedVersion(value.workbench)
    const widgets = parseEach(value.widgets, parseManifestWidget)
    if (kind === null || workbench === null || widgets === null) return null
    const manifest: {
        schemaVersion: number
        kind: { readonly key: string; readonly version: string }
        workbench: { readonly key: string; readonly version: string }
        widgets: ReadonlyArray<ManifestWidget>
        config: AgentosRuntimeManifest["config"]
        test?: AgentosRuntimeManifest["test"]
        setup?: AgentosRuntimeManifest["setup"]
        operations?: AgentosRuntimeManifest["operations"]
        credentialSlots?: AgentosRuntimeManifest["credentialSlots"]
    } = { schemaVersion: value.schemaVersion, kind, workbench, widgets, config: value.config }
    if (value.test !== undefined) {
        const test = parseModuleTestContract(value.test)
        if (test === null) return null
        manifest.test = test
    }
    if (value.setup !== undefined) {
        const setup = parseManifestSetup(value.setup)
        if (setup === null) return null
        manifest.setup = setup
    }
    if (value.operations !== undefined) {
        const operations = parseManifestOperations(value.operations)
        if (operations === null) return null
        manifest.operations = operations
    }
    if (value.credentialSlots !== undefined) {
        const credentialSlots = parseEach(value.credentialSlots, parseCredentialSlot)
        if (credentialSlots === null) return null
        manifest.credentialSlots = credentialSlots
    }
    return manifest
}

type RuntimeInstallation = AgentosModuleRuntime["installation"]

const parseRuntimeInstallation = (value: unknown): RuntimeInstallation | null => {
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isString(value.agentWorkspaceId) ||
        !isString(value.moduleKey) ||
        !isString(value.moduleVersion) ||
        !isString(value.displayName) ||
        !isString(value.kindKey) ||
        !isString(value.kindVersion) ||
        !isString(value.workbenchKey) ||
        !isString(value.workbenchVersion) ||
        !isNumber(value.settingsVersion) ||
        !isNumber(value.setupAuthorityGeneration) ||
        !isNumber(value.setupSourceGeneration) ||
        !isNumber(value.setupRetrievalGeneration) ||
        !isNullableString(value.activeContextVersionId) ||
        !isBoolean(value.liveEnabled) ||
        !isOneOf(value.operatingMode, ["assist", "autopilot"]) ||
        !isNullableString(value.channelAccountRef) ||
        !isNullableString(value.primaryOpsSessionId) ||
        !isString(value.status) ||
        !isNullableString(value.failureCode) ||
        !isString(value.createdAt) ||
        !isString(value.updatedAt)
    ) {
        return null
    }
    const runtimeManifest = parseRuntimeManifest(value.runtimeManifest)
    if (runtimeManifest === null) return null
    return {
        id: value.id,
        agentWorkspaceId: value.agentWorkspaceId,
        moduleKey: value.moduleKey,
        moduleVersion: value.moduleVersion,
        displayName: value.displayName,
        kindKey: value.kindKey,
        kindVersion: value.kindVersion,
        workbenchKey: value.workbenchKey,
        workbenchVersion: value.workbenchVersion,
        runtimeManifest,
        settingsVersion: value.settingsVersion,
        setupAuthorityGeneration: value.setupAuthorityGeneration,
        setupSourceGeneration: value.setupSourceGeneration,
        setupRetrievalGeneration: value.setupRetrievalGeneration,
        activeContextVersionId: value.activeContextVersionId,
        liveEnabled: value.liveEnabled,
        operatingMode: value.operatingMode,
        channelAccountRef: value.channelAccountRef,
        primaryOpsSessionId: value.primaryOpsSessionId,
        status: value.status,
        failureCode: value.failureCode,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
    }
}

const parseRuntimeSession = (value: unknown): AgentosRuntimeSession | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.createdByUserId) &&
    isOneOf(value.mode, ["setup", "execute"]) &&
    isString(value.title) &&
    isBoolean(value.isArchived) &&
    (value.setupRevision === null || isNumber(value.setupRevision)) &&
    (value.setupStatus === null || isOneOf(value.setupStatus, ["open", "ready", "completed", "superseded"])) &&
    (value.draftSnapshot === null || isAgentosRuntimeRecord(value.draftSnapshot)) &&
    isNullableString(value.draftDigest) &&
    (value.gateEvidence === null || isAgentosRuntimeRecord(value.gateEvidence)) &&
    isNullableString(value.basedOnContextVersionId) &&
    isNullableString(value.completedAt) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
        ? {
              id: value.id,
              installationId: value.installationId,
              createdByUserId: value.createdByUserId,
              mode: value.mode,
              title: value.title,
              isArchived: value.isArchived,
              setupRevision: value.setupRevision,
              setupStatus: value.setupStatus,
              draftSnapshot: value.draftSnapshot,
              draftDigest: value.draftDigest,
              gateEvidence: value.gateEvidence,
              basedOnContextVersionId: value.basedOnContextVersionId,
              completedAt: value.completedAt,
              createdAt: value.createdAt,
              updatedAt: value.updatedAt,
          }
        : null

const parseParticipant = (value: unknown): AgentosModuleRuntime["participants"][number] | null =>
    isRecord(value) && isString(value.id) && isString(value.sessionId) && isString(value.userId)
        ? { id: value.id, sessionId: value.sessionId, userId: value.userId }
        : null

const parseMessageTree = (value: unknown): AgentosRuntimeMessageTree | null => {
    if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.nodes)) return null
    const nodes: Array<AgentosRuntimeMessageTree["nodes"][number]> = []
    for (const node of value.nodes) {
        if (!isRecord(node)) return null
        if (node.type === "markdown" && isString(node.markdown)) {
            nodes.push({ type: "markdown", markdown: node.markdown })
        } else if (node.type === "widget" && isAgentosRuntimeWidgetNode(node.widget)) {
            nodes.push({ type: "widget", widget: node.widget })
        } else if (
            node.type === "attachment" &&
            isString(node.attachmentId) &&
            isString(node.label) &&
            isString(node.mediaType)
        ) {
            nodes.push({ type: "attachment", attachmentId: node.attachmentId, label: node.label, mediaType: node.mediaType })
        } else {
            return null
        }
    }
    return { schemaVersion: 1, nodes }
}

const parseRuntimeMessage = (value: unknown): AgentosRuntimeMessage | null => {
    if (
        !isRecord(value) ||
        !isString(value.id) ||
        !isString(value.sessionId) ||
        !isNullableString(value.actorUserId) ||
        !isNullableString(value.contextVersionId) ||
        !isOneOf(value.role, ["user", "assistant", "system"]) ||
        !isString(value.content) ||
        !isNullableString(value.operationEventId) ||
        !isNullableString(value.taskId) ||
        !isNumber(value.sequence) ||
        !isString(value.createdAt)
    ) {
        return null
    }
    const messageTree =
        value.messageTree === null || value.messageTree === undefined ? null : parseMessageTree(value.messageTree)
    if (value.messageTree !== null && value.messageTree !== undefined && messageTree === null) return null
    return {
        id: value.id,
        sessionId: value.sessionId,
        actorUserId: value.actorUserId,
        contextVersionId: value.contextVersionId,
        role: value.role,
        content: value.content,
        messageTree,
        operationEventId: value.operationEventId,
        taskId: value.taskId,
        sequence: value.sequence,
        createdAt: value.createdAt,
    }
}

const parseContextVersion = (value: unknown): AgentosRuntimeContextVersion | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.createdByUserId) &&
    isNumber(value.version) &&
    isAgentosRuntimeRecord(value.snapshot) &&
    isString(value.digest) &&
    isString(value.definitionDigest) &&
    isNumber(value.authorityGeneration) &&
    isNumber(value.sourceGeneration) &&
    isNumber(value.retrievalGeneration) &&
    isNullableString(value.sourceSetupSessionId) &&
    isString(value.createdAt)
        ? {
              id: value.id,
              installationId: value.installationId,
              createdByUserId: value.createdByUserId,
              version: value.version,
              snapshot: value.snapshot,
              digest: value.digest,
              definitionDigest: value.definitionDigest,
              authorityGeneration: value.authorityGeneration,
              sourceGeneration: value.sourceGeneration,
              retrievalGeneration: value.retrievalGeneration,
              sourceSetupSessionId: value.sourceSetupSessionId,
              createdAt: value.createdAt,
          }
        : null

const parseOperationEvent = (value: unknown): AgentosRuntimeOperationEvent | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.contextVersionId) &&
    isString(value.source) &&
    isString(value.externalEventId) &&
    isString(value.eventType) &&
    isString(value.observedAt) &&
    isString(value.kindKey) &&
    isString(value.kindVersion) &&
    isString(value.replyContractKey) &&
    isString(value.replyContractVersion) &&
    isString(value.toolSchemaDigest) &&
    isAgentosRuntimeRecord(value.payload) &&
    isAgentosRuntimeRecord(value.evidence) &&
    isString(value.createdAt)
        ? {
              id: value.id,
              installationId: value.installationId,
              contextVersionId: value.contextVersionId,
              source: value.source,
              externalEventId: value.externalEventId,
              eventType: value.eventType,
              observedAt: value.observedAt,
              kindKey: value.kindKey,
              kindVersion: value.kindVersion,
              replyContractKey: value.replyContractKey,
              replyContractVersion: value.replyContractVersion,
              toolSchemaDigest: value.toolSchemaDigest,
              payload: value.payload,
              evidence: value.evidence,
              createdAt: value.createdAt,
          }
        : null

const parseRuntimeTask = (value: unknown): AgentosRuntimeTask | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.sourceEventId) &&
    isString(value.contextVersionId) &&
    isString(value.title) &&
    isString(value.summary) &&
    isOneOf(value.priority, ["low", "normal", "high", "urgent"]) &&
    isOneOf(value.status, ["open", "in_progress", "completed", "refused", "failed"]) &&
    isNumber(value.expectedVersion) &&
    isString(value.workbenchKey) &&
    isString(value.workbenchVersion) &&
    isString(value.workbenchRef) &&
    isAgentosRuntimeRecord(value.evidence) &&
    isNullableString(value.dueAt) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
        ? {
              id: value.id,
              installationId: value.installationId,
              sourceEventId: value.sourceEventId,
              contextVersionId: value.contextVersionId,
              title: value.title,
              summary: value.summary,
              priority: value.priority,
              status: value.status,
              expectedVersion: value.expectedVersion,
              workbenchKey: value.workbenchKey,
              workbenchVersion: value.workbenchVersion,
              workbenchRef: value.workbenchRef,
              evidence: value.evidence,
              dueAt: value.dueAt,
              createdAt: value.createdAt,
              updatedAt: value.updatedAt,
          }
        : null

const parseRuntimeWidget = (value: unknown): AgentosRuntimeWidget | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.messageId) &&
    isString(value.rootComponent) &&
    isString(value.rootVersion) &&
    isAgentosRuntimeWidgetNode(value.tree)
        ? {
              id: value.id,
              messageId: value.messageId,
              rootComponent: value.rootComponent,
              rootVersion: value.rootVersion,
              tree: value.tree,
          }
        : null

const parseRuntimeCredential = (value: unknown): AgentosRuntimeCredential | null =>
    isRecord(value) &&
    isString(value.id) &&
    isString(value.installationId) &&
    isString(value.providerKey) &&
    isString(value.maskedHint) &&
    isOneOf(value.status, ["configured", "invalid"])
        ? {
              id: value.id,
              installationId: value.installationId,
              providerKey: value.providerKey,
              maskedHint: value.maskedHint,
              status: value.status,
          }
        : null

/** Parse the `data` of `myAgentosModuleRuntime`/`manageAgentosModuleRuntime`: the whole projection. */
export const parseModuleRuntime = (input: unknown): AgentosModuleRuntime | null => {
    if (!isRecord(input)) return null
    const installation = parseRuntimeInstallation(input.installation)
    const setupSession =
        input.setupSession === null || input.setupSession === undefined
            ? null
            : parseRuntimeSession(input.setupSession)
    const setupSessions = parseEach(input.setupSessions, parseRuntimeSession)
    const executeSessions = parseEach(input.executeSessions, parseRuntimeSession)
    const participants = parseEach(input.participants, parseParticipant)
    const messages = parseEach(input.messages, parseRuntimeMessage)
    const contextVersions = parseEach(input.contextVersions, parseContextVersion)
    const widgets = parseEach(input.widgets, parseRuntimeWidget)
    const operationEvents = parseEach(input.operationEvents, parseOperationEvent)
    const tasks = parseEach(input.tasks, parseRuntimeTask)
    const credentials = parseEach(input.credentials, parseRuntimeCredential)
    if (
        installation === null ||
        (input.setupSession !== null && input.setupSession !== undefined && setupSession === null) ||
        setupSessions === null ||
        executeSessions === null ||
        participants === null ||
        messages === null ||
        contextVersions === null ||
        widgets === null ||
        operationEvents === null ||
        tasks === null ||
        credentials === null ||
        !(input.settings === null || isAgentosRuntimeRecord(input.settings)) ||
        !isAgentosRuntimeRecord(input.diagnostics)
    ) {
        return null
    }
    return {
        installation,
        setupSession,
        setupSessions,
        executeSessions,
        participants,
        messages,
        contextVersions,
        widgets,
        operationEvents,
        tasks,
        credentials,
        settings: input.settings,
        diagnostics: input.diagnostics,
    }
}

/** Parse the `data` of `configureAgentWorkspaceChannel`: statuses only, never the secret. */
export const parseChannelSetting = (input: unknown): AgentWorkspaceChannelSetting | null => {
    if (
        !isRecord(input) ||
        !isString(input.provider) ||
        !isString(input.accountId) ||
        !isOneOf(input.state, ["NOT_CONFIGURED", "PENDING", "APPLIED", "ERROR"]) ||
        !isNullableString(input.displayName)
    ) {
        return null
    }
    const credentials = parseEach(input.credentials, (entry) =>
        isRecord(entry) &&
        isString(entry.key) &&
        isBoolean(entry.required) &&
        isBoolean(entry.configured) &&
        isNullableString(entry.hint) &&
        isNullableString(entry.syncedAt)
            ? {
                  key: entry.key,
                  required: entry.required,
                  configured: entry.configured,
                  hint: entry.hint,
                  syncedAt: entry.syncedAt,
              }
            : null,
    )
    if (credentials === null) return null
    return {
        provider: input.provider,
        accountId: input.accountId,
        state: input.state,
        displayName: input.displayName,
        credentials,
    }
}
