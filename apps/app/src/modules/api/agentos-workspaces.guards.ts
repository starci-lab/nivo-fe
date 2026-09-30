/** Runtime parsers for the generated AgentOS workspace document payloads. */

import { isBoolean, isNullableBoolean, isNullableNumber, isNullableString, isNumber, isOneOf, isRecord, isString, parseEach } from "@nivo/api"
import type {
    IssueAgentWorkspaceAppLaunchMutation,
    ManageAgentWorkspaceMutation,
    MyAgentWorkspaceControlCenterQuery,
    MyAgentWorkspaceQuery,
    RenewAgentWorkspaceAppLaunchMutation,
    RevokeAgentWorkspaceAppLaunchMutation,
} from "./__generated__/core"

const parseAgentWorkspaceRow = (
    value: unknown,
): NonNullable<MyAgentWorkspaceQuery["myAgentWorkspace"]["data"]>[number] | null => {
    if (!isRecord(value) || !isString(value.id) || !isNullableString(value.name) || !isString(value.status)) return null
    const catalogOrder =
        value.catalogOrder === null
            ? null
            : isRecord(value.catalogOrder) && isString(value.catalogOrder.id)
              ? { id: value.catalogOrder.id }
              : null
    if (value.catalogOrder !== null && catalogOrder === null) return null
    return { id: value.id, name: value.name, status: value.status, catalogOrder }
}

/** Parse the `data` of `myAgentWorkspace` (a list despite the singular name). */
export const parseAgentWorkspaceRows = (
    input: unknown,
): ReadonlyArray<NonNullable<MyAgentWorkspaceQuery["myAgentWorkspace"]["data"]>[number]> | null =>
    parseEach(input, parseAgentWorkspaceRow)

/** Parse the `data` of `manageAgentWorkspace`, the same row shape as the list entry. */
export const parseAgentWorkspaceRowAnswer = (
    input: unknown,
): NonNullable<ManageAgentWorkspaceMutation["manageAgentWorkspace"]["data"]> | null =>
    parseAgentWorkspaceRow(input)

const parseAppCapability = (
    value: unknown,
): NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["apps"][number] | null =>
    isRecord(value) &&
    isOneOf(value.app, ["OPENCLAW", "N8N"]) &&
    isOneOf(value.accessMode, ["NIVO_CONSOLE", "EXTERNAL_LAUNCH", "UNAVAILABLE"]) &&
    isBoolean(value.available) &&
    isNullableString(value.reason) &&
    isNullableString(value.observedVersion)
        ? {
              app: value.app,
              accessMode: value.accessMode,
              available: value.available,
              reason: value.reason,
              observedVersion: value.observedVersion,
          }
        : null

const parseRuntimeComponent = (
    value: unknown,
): NonNullable<NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["runtime"]>["components"][number] | null =>
    isRecord(value) &&
    isString(value.key) &&
    isString(value.kind) &&
    isString(value.status) &&
    isNullableNumber(value.desiredReplicas) &&
    isNullableNumber(value.readyReplicas) &&
    isNullableString(value.image) &&
    isNullableString(value.pvcSize) &&
    isNullableString(value.storagePolicy) &&
    isNullableNumber(value.cpuUsageMillicores) &&
    isNullableNumber(value.cpuRequestMillicores) &&
    isNullableNumber(value.cpuLimitMillicores) &&
    isNullableNumber(value.memoryUsageBytes) &&
    isNullableNumber(value.memoryRequestBytes) &&
    isNullableNumber(value.memoryLimitBytes) &&
    isNumber(value.restartCount) &&
    isNullableString(value.lastTerminationReason) &&
    isBoolean(value.oomKilled) &&
    isNullableBoolean(value.throttled)
        ? {
              key: value.key,
              kind: value.kind,
              status: value.status,
              desiredReplicas: value.desiredReplicas,
              readyReplicas: value.readyReplicas,
              image: value.image,
              pvcSize: value.pvcSize,
              storagePolicy: value.storagePolicy,
              cpuUsageMillicores: value.cpuUsageMillicores,
              cpuRequestMillicores: value.cpuRequestMillicores,
              cpuLimitMillicores: value.cpuLimitMillicores,
              memoryUsageBytes: value.memoryUsageBytes,
              memoryRequestBytes: value.memoryRequestBytes,
              memoryLimitBytes: value.memoryLimitBytes,
              restartCount: value.restartCount,
              lastTerminationReason: value.lastTerminationReason,
              oomKilled: value.oomKilled,
              throttled: value.throttled,
          }
        : null

const parseRuntimeStorage = (
    value: unknown,
): NonNullable<NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["runtime"]>["storage"][number] | null =>
    isRecord(value) &&
    isString(value.key) &&
    isString(value.kind) &&
    isNullableString(value.size) &&
    isNullableString(value.policy) &&
    isString(value.status)
        ? { key: value.key, kind: value.kind, size: value.size, policy: value.policy, status: value.status }
        : null

const parseRuntimeTotals = (
    value: unknown,
): NonNullable<NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["runtime"]>["totals"] | null =>
    isRecord(value) &&
    isNullableNumber(value.cpuUsageMillicores) &&
    isNumber(value.cpuRequestMillicores) &&
    isNumber(value.cpuLimitMillicores) &&
    isNullableNumber(value.memoryUsageBytes) &&
    isNumber(value.memoryRequestBytes) &&
    isNumber(value.memoryLimitBytes) &&
    isNumber(value.restartCount) &&
    isBoolean(value.oomKilled) &&
    isNullableBoolean(value.throttled)
        ? {
              cpuUsageMillicores: value.cpuUsageMillicores,
              cpuRequestMillicores: value.cpuRequestMillicores,
              cpuLimitMillicores: value.cpuLimitMillicores,
              memoryUsageBytes: value.memoryUsageBytes,
              memoryRequestBytes: value.memoryRequestBytes,
              memoryLimitBytes: value.memoryLimitBytes,
              restartCount: value.restartCount,
              oomKilled: value.oomKilled,
              throttled: value.throttled,
          }
        : null

const parseRuntime = (
    value: unknown,
): NonNullable<NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["runtime"]> | null => {
    if (
        !isRecord(value) ||
        !isString(value.instanceId) ||
        !isString(value.appKey) ||
        !isString(value.status) ||
        !isNullableString(value.releaseName) ||
        !isNullableString(value.chartName) ||
        !isNullableString(value.chartVersion) ||
        !isOneOf(value.probeStatus, ["available", "partial", "unavailable"]) ||
        !isString(value.fingerprint) ||
        !isNullableString(value.lastError) ||
        !isString(value.observedAt) ||
        !isBoolean(value.stale)
    ) {
        return null
    }
    const components = parseEach(value.components, parseRuntimeComponent)
    const storage = parseEach(value.storage, parseRuntimeStorage)
    const totals = parseRuntimeTotals(value.totals)
    if (components === null || storage === null || totals === null) return null
    return {
        instanceId: value.instanceId,
        appKey: value.appKey,
        status: value.status,
        releaseName: value.releaseName,
        chartName: value.chartName,
        chartVersion: value.chartVersion,
        components,
        storage,
        totals,
        probeStatus: value.probeStatus,
        fingerprint: value.fingerprint,
        lastError: value.lastError,
        observedAt: value.observedAt,
        stale: value.stale,
    }
}

const parseRecovery = (
    value: unknown,
): NonNullable<NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["recovery"]> | null =>
    isRecord(value) &&
    isString(value.state) &&
    isNullableString(value.phase) &&
    isNumber(value.attemptCount) &&
    isNullableString(value.lastAttemptAt) &&
    isNullableString(value.nextAttemptAt) &&
    isNullableString(value.failureCode) &&
    isNullableString(value.targetGeneration) &&
    isNullableString(value.requiredSyncRevision) &&
    isNullableString(value.appliedSyncRevision) &&
    isNullableString(value.syncCompletedAt) &&
    isNullableString(value.observedAt) &&
    isString(value.recoverableDataScope)
        ? {
              state: value.state,
              phase: value.phase,
              attemptCount: value.attemptCount,
              lastAttemptAt: value.lastAttemptAt,
              nextAttemptAt: value.nextAttemptAt,
              failureCode: value.failureCode,
              targetGeneration: value.targetGeneration,
              requiredSyncRevision: value.requiredSyncRevision,
              appliedSyncRevision: value.appliedSyncRevision,
              syncCompletedAt: value.syncCompletedAt,
              observedAt: value.observedAt,
              recoverableDataScope: value.recoverableDataScope,
          }
        : null

/** Parse the `data` of `myAgentWorkspaceControlCenter`. */
export const parseAgentWorkspaceControlCenter = (
    input: unknown,
): NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]> | null => {
    if (!isRecord(input)) return null
    const workspace = input.workspace
    if (
        !isRecord(workspace) ||
        !isString(workspace.id) ||
        !isNullableString(workspace.name) ||
        !isString(workspace.status) ||
        !isNullableString(workspace.externalWorkspaceRef)
    ) {
        return null
    }
    const apps = parseEach(input.apps, parseAppCapability)
    if (apps === null) return null
    const runtime = input.runtime === null ? null : parseRuntime(input.runtime)
    if (input.runtime !== null && runtime === null) return null
    let instance: NonNullable<MyAgentWorkspaceControlCenterQuery["myAgentWorkspaceControlCenter"]["data"]>["instance"] = null
    if (input.instance !== null) {
        const raw = input.instance
        if (
            !isRecord(raw) ||
            !isString(raw.id) ||
            !isString(raw.name) ||
            !isString(raw.hostname) ||
            !isString(raw.status) ||
            !isString(raw.chartVersion) ||
            !isNumber(raw.ramMb) ||
            !isNumber(raw.vcpu) ||
            !isNullableString(raw.planCode) ||
            !isNullableNumber(raw.planRamGb) ||
            !isNullableNumber(raw.planVcpu)
        ) {
            return null
        }
        instance = {
            id: raw.id,
            name: raw.name,
            hostname: raw.hostname,
            status: raw.status,
            chartVersion: raw.chartVersion,
            ramMb: raw.ramMb,
            vcpu: raw.vcpu,
            planCode: raw.planCode,
            planRamGb: raw.planRamGb,
            planVcpu: raw.planVcpu,
        }
    }
    const recovery = input.recovery === null ? null : parseRecovery(input.recovery)
    if (input.recovery !== null && recovery === null) return null
    return {
        workspace: {
            id: workspace.id,
            name: workspace.name,
            status: workspace.status,
            externalWorkspaceRef: workspace.externalWorkspaceRef,
        },
        instance,
        apps,
        runtime,
        recovery,
    }
}

/** Parse the `data` of `issueAgentWorkspaceAppLaunch`. */
export const parseAgentWorkspaceAppLaunch = (
    input: unknown,
): NonNullable<IssueAgentWorkspaceAppLaunchMutation["issueAgentWorkspaceAppLaunch"]["data"]> | null =>
    isRecord(input) && isString(input.launchId) && isString(input.redirectUrl) && isString(input.expiresAt)
        ? { launchId: input.launchId, redirectUrl: input.redirectUrl, expiresAt: input.expiresAt }
        : null

/** Parse the `data` of `renewAgentWorkspaceAppLaunch`. */
export const parseRenewedAgentWorkspaceAppLaunch = (
    input: unknown,
): NonNullable<RenewAgentWorkspaceAppLaunchMutation["renewAgentWorkspaceAppLaunch"]["data"]> | null =>
    isRecord(input) && isString(input.launchId) && isString(input.expiresAt)
        ? { launchId: input.launchId, expiresAt: input.expiresAt }
        : null

/** Parse the `data` of `revokeAgentWorkspaceAppLaunch`. */
export const parseRevokedAgentWorkspaceAppLaunch = (
    input: unknown,
): NonNullable<RevokeAgentWorkspaceAppLaunchMutation["revokeAgentWorkspaceAppLaunch"]["data"]> | null =>
    isRecord(input) && isString(input.launchId) && isBoolean(input.revoked)
        ? { launchId: input.launchId, revoked: input.revoked }
        : null
