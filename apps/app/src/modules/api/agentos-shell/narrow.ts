import { failed, failureKindOfStatus, type Failure } from "../outcome"
import {
    CONFIGURATION_REQUIREMENTS,
    APPLICATION_STATES,
    isCompleteness,
    isCount,
    isFreshness,
    isRecord,
    isText,
    isUuid,
    nullableText,
    OBSERVATION_KINDS,
    QUEUE_STATES,
    REGISTERED_VIEWS,
    TEST_STATES,
    isWireAvailability,
    formatShellSourceIdentity,
} from "./identity"
import type { ShellArrivedReply } from "./types"
import { SHELL_NAVIGATION_GRAMMAR_VERSION, SHELL_RETURN_ROUTE_NAME } from "./types"
import type {
    ShellAppliedObservation,
    ShellAppliedRecord,
    ShellAuthoritySourceStatus,
    ShellAuthorityStatus,
    ShellCommandObservation,
    ShellCoreResult,
    ShellLifecycleObservation,
    ShellLocalTransportGap,
    ShellObservationProjection,
    ShellRead,
    ShellReadScope,
    ShellReceiverObservation,
    ShellRegisteredDestination,
    ShellRegisteredViewName,
    ShellReturnContext,
    ShellSourceEnvelope,
} from "./types"

/** Narrow Core's registered workspace and instance summary. */
export const authoredCoreResult = (value: unknown): ShellCoreResult | null => {
    if (!isRecord(value)) return null
    if (value.availability !== "available" && value.availability !== "unavailable" && value.availability !== "refused")
        return null
    const reason = nullableText(value.reason)
    const workspaceId = nullableText(value.workspaceId)
    const instanceId = nullableText(value.instanceId)
    const name = nullableText(value.name)
    const runtimeGeneration = nullableText(value.runtimeGeneration)
    if (
        reason === undefined ||
        workspaceId === undefined ||
        instanceId === undefined ||
        name === undefined ||
        runtimeGeneration === undefined
    )
        return null
    if (
        value.runtimeAvailability !== "provisioned" &&
        value.runtimeAvailability !== "not_provisioned" &&
        value.runtimeAvailability !== "unavailable"
    )
        return null
    if (value.inventory === null)
        return {
            availability: value.availability,
            reason,
            workspaceId,
            instanceId,
            name,
            runtimeGeneration,
            runtimeAvailability: value.runtimeAvailability,
            inventory: null,
        }
    if (!isRecord(value.inventory)) return null
    const inventory = value.inventory
    if (
        inventory.availability !== "available" &&
        inventory.availability !== "partial" &&
        inventory.availability !== "unavailable"
    )
        return null
    if (inventory.completeness !== "complete" && inventory.completeness !== "partial") return null
    if (!isText(inventory.observedAt) || !Array.isArray(inventory.installations)) return null
    return {
        availability: value.availability,
        reason,
        workspaceId,
        instanceId,
        name,
        runtimeGeneration,
        runtimeAvailability: value.runtimeAvailability,
        inventory: {
            availability: inventory.availability,
            completeness: inventory.completeness,
            observedAt: inventory.observedAt,
            installations: inventory.installations,
        },
    }
}

/** Narrow one source envelope and verify it echoes the exact requested read. */
export const authoredEnvelope = (value: unknown, expected: ShellRead): ShellSourceEnvelope | null => {
    if (!isRecord(value)) return null
    const canonical = formatShellSourceIdentity(expected.identity)
    // A reply that re-spells the identity it answers for is not this source's answer, whatever it says.
    if (value.sourceIdentity !== canonical || value.readGeneration !== expected.readGeneration) return null
    if (!isWireAvailability(value.availability) || !isFreshness(value.freshness) || !isCompleteness(value.completeness))
        return null
    const observedAt = nullableText(value.observedAt)
    if (observedAt === undefined) return null
    if (value.payload !== null && !isRecord(value.payload)) return null
    if (value.availability === "refused" && value.payload !== null) return null
    return {
        sourceIdentity: canonical,
        readGeneration: expected.readGeneration,
        availability: value.availability,
        freshness: value.freshness,
        completeness: value.completeness,
        observedAt,
        payload: value.payload === null ? null : (value.payload as Readonly<Record<string, unknown>>),
    }
}

/** Narrow the receiver-authored observations carried by a command receipt. */
export const authoredReceiverObservations = (value: unknown): ReadonlyArray<ShellReceiverObservation> | null => {
    if (!Array.isArray(value)) return null
    const entries: Array<ShellReceiverObservation> = []
    for (const entry of value) {
        if (
            !isRecord(entry) ||
            !isText(entry.observationId) ||
            !isCount(entry.observationVersion) ||
            entry.observationVersion < 1
        )
            return null
        if (typeof entry.kind !== "string" || !OBSERVATION_KINDS.has(entry.kind) || !isText(entry.schemaId)) return null
        const receiverReceiptId = nullableText(entry.receiverReceiptId)
        const payloadDigest = nullableText(entry.payloadDigest)
        const observedAt = nullableText(entry.observedAt)
        if (receiverReceiptId === undefined || payloadDigest === undefined || observedAt === undefined) return null
        entries.push({
            observationId: entry.observationId,
            observationVersion: entry.observationVersion,
            receiverReceiptId,
            kind: entry.kind as ShellReceiverObservation["kind"],
            schemaId: entry.schemaId,
            payloadDigest,
            observedAt,
        })
    }
    return entries
}

/** Narrow local transport gaps without treating them as receiver evidence. */
export const authoredTransportGaps = (value: unknown): ReadonlyArray<ShellLocalTransportGap> | null => {
    if (!Array.isArray(value)) return null
    const entries: Array<ShellLocalTransportGap> = []
    for (const entry of value) {
        if (!isRecord(entry) || !isCount(entry.attempt) || !isText(entry.kind)) return null
        const observedAt = nullableText(entry.observedAt)
        if (observedAt === undefined) return null
        entries.push({ attempt: entry.attempt, kind: entry.kind, observedAt })
    }
    return entries
}

/** Narrow the queue and receiver evidence for one command identity. */
export const authoredCommandObservation = (value: unknown): ShellCommandObservation | null => {
    if (!isRecord(value) || !isText(value.commandId) || !isText(value.receiverInstallationId)) return null
    if (typeof value.queueState !== "string" || !QUEUE_STATES.has(value.queueState) || !isCount(value.attempt))
        return null
    const possibleStartAt = nullableText(value.possibleStartAt)
    if (possibleStartAt === undefined) return null
    const observations = authoredReceiverObservations(value.observations)
    const localTransportGaps = authoredTransportGaps(value.localTransportGaps)
    if (observations === null || localTransportGaps === null) return null
    return {
        commandId: value.commandId,
        receiverInstallationId: value.receiverInstallationId,
        queueState: value.queueState as ShellCommandObservation["queueState"],
        attempt: value.attempt,
        possibleStartAt,
        observations,
        localTransportGaps,
    }
}

/** Narrow one availability-qualified projection while preserving its refusal reason. */
export const authoredObservationProjection = <T>(
    value: unknown,
    narrow: (input: unknown) => T | null,
): ShellObservationProjection<T> | null => {
    if (!isRecord(value) || !isWireAvailability(value.availability)) return null
    if (value.availability === "available") {
        const projection = narrow(value.projection)
        if (projection === null || value.reason !== null) return null
        return { availability: "available", reason: null, projection }
    }
    if (!isText(value.reason) || value.projection !== null) return null
    return { availability: value.availability, reason: value.reason, projection: null }
}

/** Narrow one source's current standing inside Core's authority. */
export const authoredAuthoritySource = (value: unknown): ShellAuthoritySourceStatus | null => {
    if (!isRecord(value) || !isWireAvailability(value.availability)) return null
    const reason = nullableText(value.reason)
    if (reason === undefined) return null
    return { availability: value.availability, reason, current: value.current ?? null }
}

/** Narrow the four authority sources for the requested installation. */
export const authoredAuthorityStatus = (value: unknown): ShellAuthorityStatus | null => {
    if (!isRecord(value) || !isText(value.installationId)) return null
    const grant = authoredAuthoritySource(value.grant)
    const config = authoredAuthoritySource(value.config)
    const setup = authoredAuthoritySource(value.setup)
    const runtime = authoredAuthoritySource(value.runtime)
    if (grant === null || config === null || setup === null || runtime === null) return null
    return { installationId: value.installationId, grant, config, setup, runtime }
}

/** Narrow lifecycle claims while preserving desired, tested, and applied states separately. */
export const authoredLifecycleObservation = (value: unknown): ShellLifecycleObservation | null => {
    if (
        !isRecord(value) ||
        !isText(value.installationId) ||
        !isCount(value.lifecycleRevision) ||
        value.lifecycleRevision < 1
    )
        return null
    if (!isText(value.desiredCandidateGeneration)) return null
    if (
        typeof value.configurationRequirement !== "string" ||
        !CONFIGURATION_REQUIREMENTS.has(value.configurationRequirement)
    )
        return null
    if (typeof value.testState !== "string" || !TEST_STATES.has(value.testState)) return null
    if (typeof value.applicationState !== "string" || !APPLICATION_STATES.has(value.applicationState)) return null
    if (!isCount(value.runtimeFenceGeneration)) return null
    const configurationRevisionId = nullableText(value.configurationRevisionId)
    const testEvidenceId = nullableText(value.testEvidenceId)
    const appliedGeneration = nullableText(value.appliedGeneration)
    const lastObservationAt = nullableText(value.lastObservationAt)
    if (
        configurationRevisionId === undefined ||
        testEvidenceId === undefined ||
        appliedGeneration === undefined ||
        lastObservationAt === undefined
    )
        return null
    return {
        installationId: value.installationId,
        lifecycleRevision: value.lifecycleRevision,
        desiredCandidateGeneration: value.desiredCandidateGeneration,
        configurationRequirement:
            value.configurationRequirement as ShellLifecycleObservation["configurationRequirement"],
        configurationRevisionId,
        testState: value.testState as ShellLifecycleObservation["testState"],
        testEvidenceId,
        applicationState: value.applicationState as ShellLifecycleObservation["applicationState"],
        // A generation observed while the state was unknown is not evidence of what is running now.
        appliedGeneration: value.applicationState === "active" ? appliedGeneration : null,
        runtimeFenceGeneration: value.runtimeFenceGeneration,
        lastObservationAt,
    }
}

/** Narrow recorder evidence about the candidate actually observed for an installation. */
export const authoredAppliedRecord = (value: unknown): ShellAppliedRecord | null => {
    if (
        !isRecord(value) ||
        !isText(value.installationId) ||
        !isText(value.currentCandidate) ||
        !isCount(value.runtimeFenceGeneration)
    )
        return null
    const appliedGeneration = nullableText(value.appliedGeneration)
    const observedAt = nullableText(value.observedAt)
    if (appliedGeneration === undefined || observedAt === undefined) return null
    return {
        installationId: value.installationId,
        currentCandidate: value.currentCandidate,
        appliedGeneration,
        runtimeFenceGeneration: value.runtimeFenceGeneration,
        observedAt,
        configurationIdentity: value.configurationIdentity ?? null,
    }
}

/** Narrow applied truth, mismatch, or refusal without inferring absence. */
export const authoredAppliedObservation = (value: unknown): ShellAppliedObservation | null => {
    if (!isRecord(value)) return null
    if (value.status === "refused") return isText(value.reason) ? { status: "refused", reason: value.reason } : null
    if (value.status !== "applied" && value.status !== "held") return null
    const record = authoredAppliedRecord(value.record)
    if (record === null) return null
    if (value.status === "applied")
        return value.mismatch === null ? { status: "applied", record, mismatch: null } : null
    if (!isRecord(value.mismatch) || !isText(value.mismatch.currentCandidate)) return null
    if (
        value.mismatch.reason !== "not-applied" &&
        value.mismatch.reason !== "candidate-drift" &&
        value.mismatch.reason !== "configuration-drift"
    )
        return null
    const appliedGeneration = nullableText(value.mismatch.appliedGeneration)
    if (appliedGeneration === undefined) return null
    return {
        status: "held",
        record,
        mismatch: {
            currentCandidate: value.mismatch.currentCandidate,
            appliedGeneration,
            reason: value.mismatch.reason,
        },
    }
}

/** Narrow the registered return context and bind it to the selected workspace and instance. */
export const authoredReturnContext = (value: unknown, scope: ShellReadScope): ShellReturnContext | null => {
    if (!isRecord(value) || value.routeName !== SHELL_RETURN_ROUTE_NAME) return null
    if (value.workspaceId !== scope.workspaceId || value.instanceId !== scope.instanceId) return null
    const installationId = nullableText(value.installationId)
    if (installationId === undefined) return null
    return {
        routeName: SHELL_RETURN_ROUTE_NAME,
        workspaceId: scope.workspaceId,
        instanceId: scope.instanceId,
        installationId,
    }
}

/** Narrow a Core destination to the registered route name and current selection. */
export const authoredDestination = (value: unknown, scope: ShellReadScope): ShellRegisteredDestination | null => {
    if (!isRecord(value) || value.grammarVersion !== SHELL_NAVIGATION_GRAMMAR_VERSION) return null
    if (typeof value.routeName !== "string" || !REGISTERED_VIEWS.has(value.routeName)) return null
    if (!isUuid(value.workspaceId) || !isUuid(value.instanceId) || !isUuid(value.installationId)) return null
    if (value.workspaceId !== scope.workspaceId || value.instanceId !== scope.instanceId) return null
    const opaqueItemId = nullableText(value.opaqueItemId)
    if (opaqueItemId === undefined) return null
    const returnContext = authoredReturnContext(value.returnContext, scope)
    if (returnContext === null) return null
    return {
        grammarVersion: SHELL_NAVIGATION_GRAMMAR_VERSION,
        routeName: value.routeName as ShellRegisteredViewName,
        workspaceId: scope.workspaceId,
        instanceId: scope.instanceId,
        installationId: value.installationId,
        opaqueItemId,
        returnContext,
    }
}

const authoredRefusal = (value: unknown): string | null =>
    isRecord(value) && value.kind === "refused" && isText(value.reason) ? value.reason : null

/** A request-level refusal, carrying the status Core chose beside the contract's reason token. */
export const refusalFor = (sent: ShellArrivedReply): Failure | null => {
    const reason = authoredRefusal(sent.body)
    return reason === null
        ? null
        : failed(sent.status >= 400 ? failureKindOfStatus(sent.status) : "forbidden", {
              status: sent.status,
              code: reason,
              reason,
          })
}
