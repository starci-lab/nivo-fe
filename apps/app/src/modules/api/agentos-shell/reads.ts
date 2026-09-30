import { isRecord, type Outcome } from "@nivo/api"
import { canonicalShellReads, formatShellRead, isCount, isUuid } from "./identity"
import { keyedQuery, sendShellRequest, shellRouteUrl, unreadableReply, unsupportedRequest } from "./transport"
import {
    authoredAppliedObservation,
    authoredAuthorityStatus,
    authoredCommandObservation,
    authoredCoreResult,
    authoredEnvelope,
    authoredLifecycleObservation,
    authoredObservationProjection,
    refusalFor,
} from "./narrow"
import type {
    ShellAuthorityStatusAnswer,
    ShellCommandReceiptAnswer,
    ShellCommandReceiptScope,
    ShellInstallationScope,
    ShellLifecycleObservationAnswer,
    ShellOverviewAnswer,
    ShellRead,
    ShellReadScope,
    ShellSourceEnvelope,
} from "./types"

/**
 * Read one overview: the requested source envelopes, each self-qualified.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact workspace and instance the reads are for.
 * @param selectionGeneration - The selection token the answer must echo.
 * @param reads - The requested sources and their generations.
 * @returns The closed overview answer, or the closed non-answer.
 */
export const readAgentosShellOverview = async (
    accessToken: string | null,
    scope: ShellReadScope,
    selectionGeneration: string,
    reads: ReadonlyArray<ShellRead>,
): Promise<Outcome<ShellOverviewAnswer>> => {
    const ordered = canonicalShellReads(reads)
    if (ordered === null || selectionGeneration.length === 0) return unsupportedRequest("invalid-read-scope")
    const query = keyedQuery([
        ...ordered.map((read) => ["read", formatShellRead(read.identity, read.readGeneration)] as const),
        ["selectionGeneration", encodeURIComponent(selectionGeneration)],
    ])
    const sent = await sendShellRequest(new URL(`${shellRouteUrl(scope).toString()}?${query}`), accessToken, {
        method: "GET",
    })
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (
        !isRecord(sent.reply.body) ||
        sent.reply.body.kind !== "overview" ||
        sent.reply.body.selectionGeneration !== selectionGeneration
    )
        return unreadableReply(sent.reply.status)
    if (sent.reply.body.core !== null && !isRecord(sent.reply.body.core)) return unreadableReply(sent.reply.status)
    const core = sent.reply.body.core === null ? null : authoredCoreResult(sent.reply.body.core)
    if (sent.reply.body.core !== null && core === null) return unreadableReply(sent.reply.status)
    if (!Array.isArray(sent.reply.body.sources) || sent.reply.body.sources.length !== ordered.length)
        return unreadableReply(sent.reply.status)
    const sources: Array<ShellSourceEnvelope> = []
    for (let index = 0; index < ordered.length; index += 1) {
        const read = ordered[index]
        if (read === undefined) return unreadableReply(sent.reply.status)
        const envelope = authoredEnvelope(sent.reply.body.sources[index], read)
        if (envelope === null) return unreadableReply(sent.reply.status)
        sources.push(envelope)
    }
    return { ok: true, data: { kind: "overview", selectionGeneration, core, sources } }
}

/**
 * Read one receiver's command observation.
 *
 * A status read: it never dispatches, reconciles, cancels or retries the command it reports on, and
 * it preserves every queue meaning rather than reading `settled` as completion.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The command, receiver source identity, generations and selection.
 * @returns The closed command-receipt answer, or the closed non-answer.
 */
export const readAgentosShellCommandReceipt = async (
    accessToken: string | null,
    scope: ShellCommandReceiptScope,
): Promise<Outcome<ShellCommandReceiptAnswer>> => {
    if (
        !isUuid(scope.commandId) ||
        scope.selectionGeneration.length === 0 ||
        !isCount(scope.readGeneration) ||
        scope.readGeneration < 1
    )
        return unsupportedRequest("invalid-read-scope")
    const query = keyedQuery([
        ["sourceIdentity", encodeURIComponent(scope.sourceIdentity)],
        ["readGeneration", String(scope.readGeneration)],
        ["selectionGeneration", encodeURIComponent(scope.selectionGeneration)],
    ])
    const sent = await sendShellRequest(
        shellRouteUrl(scope, `/command-receipts/${encodeURIComponent(scope.commandId)}?${query}`),
        accessToken,
        { method: "GET" },
    )
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (!isRecord(sent.reply.body) || sent.reply.body.kind !== "command_observation")
        return unreadableReply(sent.reply.status)
    // The read identity is echoed in full; a disagreement means this is another read's answer.
    if (
        sent.reply.body.selectionGeneration !== scope.selectionGeneration ||
        sent.reply.body.sourceIdentity !== scope.sourceIdentity ||
        sent.reply.body.readGeneration !== scope.readGeneration
    )
        return unreadableReply(sent.reply.status)
    const core = authoredCoreResult(sent.reply.body.core)
    const commandObservation = authoredObservationProjection(
        sent.reply.body.commandObservation,
        authoredCommandObservation,
    )
    if (core === null || commandObservation === null) return unreadableReply(sent.reply.status)
    return {
        ok: true,
        data: {
            kind: "command_observation",
            selectionGeneration: scope.selectionGeneration,
            sourceIdentity: scope.sourceIdentity,
            readGeneration: scope.readGeneration,
            core,
            commandObservation,
        },
    }
}

/**
 * Read Core's current authority status for one installation.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact installation inside the selected workspace and instance.
 * @returns The closed authority-status answer, or the closed non-answer.
 */
export const readAgentosShellAuthorityStatus = async (
    accessToken: string | null,
    scope: ShellInstallationScope,
): Promise<Outcome<ShellAuthorityStatusAnswer>> => {
    if (!isUuid(scope.installationId)) return unsupportedRequest("invalid-read-scope")
    const sent = await sendShellRequest(
        shellRouteUrl(
            scope,
            `/authority-status?${keyedQuery([["installationId", encodeURIComponent(scope.installationId)]])}`,
        ),
        accessToken,
        { method: "GET" },
    )
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (!isRecord(sent.reply.body) || sent.reply.body.kind !== "authority_status")
        return unreadableReply(sent.reply.status)
    const core = authoredCoreResult(sent.reply.body.core)
    const authorityStatus = authoredAuthorityStatus(sent.reply.body.authorityStatus)
    if (core === null || authorityStatus === null) return unreadableReply(sent.reply.status)
    if (authorityStatus.installationId !== scope.installationId) return unreadableReply(sent.reply.status)
    return { ok: true, data: { kind: "authority_status", core, authorityStatus } }
}

/**
 * Read one installation's actual lifecycle observation.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact installation inside the selected workspace and instance.
 * @returns The closed lifecycle answer, or the closed non-answer. Applied truth is reported apart
 *   from the lifecycle the instance claims, so a recorder that refuses is never read as absence.
 */
export const readAgentosShellLifecycleObservation = async (
    accessToken: string | null,
    scope: ShellInstallationScope,
): Promise<Outcome<ShellLifecycleObservationAnswer>> => {
    if (!isUuid(scope.installationId)) return unsupportedRequest("invalid-read-scope")
    const sent = await sendShellRequest(
        shellRouteUrl(scope, `/lifecycle-observations/${encodeURIComponent(scope.installationId)}`),
        accessToken,
        { method: "GET" },
    )
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    if (!isRecord(sent.reply.body) || sent.reply.body.kind !== "lifecycle_observation")
        return unreadableReply(sent.reply.status)
    const core = authoredCoreResult(sent.reply.body.core)
    const lifecycleObservation = authoredObservationProjection(
        sent.reply.body.lifecycleObservation,
        authoredLifecycleObservation,
    )
    const appliedObservation = authoredAppliedObservation(sent.reply.body.appliedObservation)
    if (core === null || lifecycleObservation === null || appliedObservation === null)
        return unreadableReply(sent.reply.status)
    return { ok: true, data: { kind: "lifecycle_observation", core, lifecycleObservation, appliedObservation } }
}
