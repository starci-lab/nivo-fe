import {
    formatShellSourceIdentity,
    type ShellCommandReceiptAnswer,
    type ShellOverviewAnswer,
    type ShellRead,
    type ShellSourceEnvelope,
} from "@/modules/api/agentos-shell"
import { type Failure, type Outcome } from "@nivo/api"
import type { ShellOperationIntent, ShellSourceOutcome } from "./shell-observation-store"

/** Translate one request-wide failure into each source's public state. */
export const requestFailureOutcome = (failure: Failure): ShellSourceOutcome => {
    if (failure.kind === "forbidden" || failure.kind === "not-found") return { kind: "refused" }
    if (failure.kind === "unavailable") return { kind: "unavailable" }
    return { kind: "unsupported" }
}

/** One source's outcome from one answered overview envelope; a refusal never carries its payload. */
export const envelopeOutcome = (envelope: ShellSourceEnvelope): ShellSourceOutcome => {
    if (envelope.availability === "refused") return { kind: "refused" }
    if (envelope.availability === "unavailable") return { kind: "unavailable" }
    if (envelope.availability === "unsupported") return { kind: "unsupported" }
    return {
        kind: "observation",
        availability: envelope.availability,
        freshness: envelope.freshness,
        completeness: envelope.completeness,
        observedAt: envelope.observedAt,
        payload: envelope.payload,
    }
}

/** Find one requested source in the overview result without treating an omitted source as empty. */
export const outcomeForRead = (outcome: Outcome<ShellOverviewAnswer>, read: ShellRead): ShellSourceOutcome => {
    if (outcome.ok) {
        const canonical = formatShellSourceIdentity(read.identity)
        const envelope = outcome.data.sources.find((source) => source.sourceIdentity === canonical)
        return envelope === undefined ? { kind: "unavailable" } : envelopeOutcome(envelope)
    }
    return requestFailureOutcome(outcome)
}

/** Resolve one receiver source's command receipt answer. */
export const outcomeForReceipt = (outcome: Outcome<ShellCommandReceiptAnswer>): ShellSourceOutcome => {
    if (outcome.ok) {
        const projection = outcome.data.commandObservation
        if (projection.availability === "refused") return { kind: "refused" }
        if (projection.availability === "unavailable") return { kind: "unavailable" }
        if (projection.availability === "unsupported") return { kind: "unsupported" }
        const observation = projection.projection
        if (observation === null)
            return {
                kind: "observation",
                availability: "partial",
                freshness: "current",
                completeness: "partial",
                observedAt: null,
                payload: null,
            }
        const observedAts = observation.observations
            .map((entry) => entry.observedAt)
            .filter((value): value is string => value !== null)
            .sort()
        return {
            kind: "observation",
            availability: projection.availability,
            freshness: "current",
            completeness: projection.availability === "available" ? "complete" : "partial",
            observedAt: observedAts.at(-1) ?? observation.possibleStartAt,
            payload: {
                commandId: observation.commandId,
                receiverInstallationId: observation.receiverInstallationId,
                queueState: observation.queueState,
                attempt: observation.attempt,
                possibleStartAt: observation.possibleStartAt,
                observations: [...observation.observations],
                localTransportGaps: [...observation.localTransportGaps],
            },
        }
    }
    return requestFailureOutcome(outcome)
}

/** The command identity for one receiver source, or null when no operation matches. */
export const commandIdFor = (
    operations: ReadonlyArray<ShellOperationIntent>,
    installationId: string,
    intentId: string,
): string | null => {
    for (const operation of operations) {
        if (operation.installationId === installationId && operation.intentId === intentId) return operation.commandId
    }
    return null
}
