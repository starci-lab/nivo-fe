/*
 * The shared machinery behind the AgentOS shell hooks (CU-SHELL-CONNECTED).
 *
 * THE STORE IS EXTERNAL STATE, NOT COMPONENT STATE. The observation snapshot is an event-sourced
 * projection that socket-free reads and session transitions rewrite on their own schedule, so it
 * lives in a store the component subscribes to rather than in a `useState` an effect would have to
 * keep pushing into. Dispatching an event is therefore legal inside an effect or a fetch
 * continuation: it is a write to the external system, not a mirrored `setState`.
 *
 * The generation map and the current operation intents ride on the same object for the same
 * reason: they are read at send time by the read pipeline, never during render.
 */

import {
    formatShellSourceIdentity,
    readAgentosShellCommandReceipt,
    readAgentosShellOverview,
    type ShellCommandReceiptAnswer,
    type ShellOverviewAnswer,
    type ShellRead,
    type ShellSourceEnvelope,
} from "@/modules/api/agentos-shell"
import type { Failure, Outcome } from "@/modules/api/outcome"
import {
    initialShellObservationSnapshot,
    reduceShellObservation,
    type ShellObservationEvent,
    type ShellObservationSnapshot,
    type ShellOperationIntent,
    type ShellSelection,
    type ShellSourceOutcome,
} from "@/modules/agentos/shell-observation-store"

/**
 * A refusal Core answered for the whole request, as the outcome each source of it gets.
 *
 * The registered route refuses a read SET, not one source, so the meaning has to be recovered from
 * the status Core chose: a permission refusal hides protected content, an outage does not, and a
 * malformed request is a grammar problem. Collapsing all three into "denied" would tell an owner
 * they lost access every time Core had a bad minute.
 */
const requestFailureOutcome = (failure: Failure): ShellSourceOutcome => {
    if (failure.kind === "forbidden" || failure.kind === "not-found") return { kind: "refused" }
    if (failure.kind === "unavailable") return { kind: "unavailable" }
    return { kind: "unsupported" }
}

/** One source's outcome from one answered overview envelope; a refusal never carries its payload. */
const envelopeOutcome = (envelope: ShellSourceEnvelope): ShellSourceOutcome => {
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

const outcomeForRead = (outcome: Outcome<ShellOverviewAnswer>, read: ShellRead): ShellSourceOutcome => {
    if (outcome.ok) {
        const canonical = formatShellSourceIdentity(read.identity)
        const envelope = outcome.data.sources.find((source): boolean => source.sourceIdentity === canonical)
        // The client already proved that every requested source answered; a missing one is a failure
        // of this read rather than an empty answer, and it is never presented as absence.
        return envelope === undefined ? { kind: "unavailable" } : envelopeOutcome(envelope)
    }
    return requestFailureOutcome(outcome)
}

/**
 * One receiver source's outcome from its command-receipt answer.
 *
 * The receipt carries a queue state and receiver observations, none of which is a promise of
 * completion: the payload is preserved verbatim so the view decides pending, confirmed or uncertain
 * from the receiver's own words. A receipt that never arrives cannot become a result.
 */
const outcomeForReceipt = (outcome: Outcome<ShellCommandReceiptAnswer>): ShellSourceOutcome => {
    if (outcome.ok) {
        const projection = outcome.data.commandObservation
        if (projection.availability === "refused") return { kind: "refused" }
        if (projection.availability === "unavailable") return { kind: "unavailable" }
        if (projection.availability === "unsupported") return { kind: "unsupported" }
        const observation = projection.projection
        // A partial projection carries no command observation at all: it is a limit, not a receipt.
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

/** The command identity an operation carries for one receiver source, or null when none matches. */
const commandIdFor = (
    operations: ReadonlyArray<ShellOperationIntent>,
    installationId: string,
    intentId: string,
): string | null => {
    for (const operation of operations) {
        if (operation.installationId === installationId && operation.intentId === intentId) return operation.commandId
    }
    return null
}

/**
 * The observation store one shell selection lives behind.
 *
 * `dispatch` applies each event the builder returns through the published reducer and notifies
 * subscribers only when the snapshot actually moved. `generations` is a call-time side-channel
 * for the read pipeline: a request's generation is fixed before anything can be applied back to
 * it.
 */
export interface ShellObservationStore {
    readonly getSnapshot: () => ShellObservationSnapshot
    readonly subscribe: (listener: () => void) => () => void
    readonly dispatch: (build: (current: ShellObservationSnapshot) => ReadonlyArray<ShellObservationEvent>) => void
    /** Latest read generation per canonical source identity, allocated as reads are sent. */
    readonly generations: Map<string, number>
}

/**
 * Create the ephemeral store for one hook instance.
 *
 * @param selection - The workspace and instance the first snapshot belongs to.
 * @returns The store; its initial snapshot is deterministic, so it answers the same on the server.
 */
export const createShellObservationStore = (selection: ShellSelection): ShellObservationStore => {
    let snapshot = initialShellObservationSnapshot(selection, 1)
    const listeners = new Set<() => void>()
    return {
        generations: new Map(),
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
        dispatch: (build) => {
            const next = build(snapshot).reduce((state, event) => reduceShellObservation(state, event).state, snapshot)
            if (next === snapshot) return
            snapshot = next
            for (const listener of listeners) listener()
        },
    }
}

/** Everything the read pipeline needs that a caller or the store owns. */
export interface ShellReadEnvironment {
    readonly accessToken: string
    readonly workspaceId: string
    readonly instanceId: string
    readonly selectionGeneration: string
    /**
     * The receiver-owned intents as a live slot: receipt reads consult it when they are sent, so an
     * operation that arrived between the overview answer and the receipt read is the one consulted.
     */
    readonly operations: { readonly current: ReadonlyArray<ShellOperationIntent> }
    readonly dispatch: ShellObservationStore["dispatch"]
}

/**
 * Send one allocated read set and apply each answer under the generation it was sent with.
 *
 * A receiver source is read through its own command-receipt route, never through the overview: the
 * receipt carries the queue state the overview does not know. Every other identity keeps the one
 * registered selection read. A refusal answered for the request itself belongs to the whole
 * selection: it clears every protected payload at once and blocks reads until a fresh session
 * check succeeds.
 */
export const runShellReads = async (
    environment: ShellReadEnvironment,
    reads: ReadonlyArray<ShellRead>,
): Promise<void> => {
    const { accessToken, workspaceId, instanceId, selectionGeneration, operations, dispatch } = environment
    const overviewReads = reads.filter((read) => read.identity.kind !== "receiver")
    const receiptReads = reads.filter((read) => read.identity.kind === "receiver")
    const overviewOutcome =
        overviewReads.length === 0
            ? null
            : await readAgentosShellOverview(
                  accessToken,
                  { workspaceId, instanceId },
                  selectionGeneration,
                  overviewReads,
              )
    if (overviewOutcome !== null && !overviewOutcome.ok && overviewOutcome.kind === "refused") {
        dispatch((current) => [{ type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }])
        return
    }
    const receiptOutcomes = await Promise.all(
        receiptReads.map(async (read) => {
            if (read.identity.kind !== "receiver")
                return { read, outcome: { kind: "unsupported" } as ShellSourceOutcome }
            const commandId = commandIdFor(operations.current, read.identity.installationId, read.identity.intentId)
            if (commandId === null || instanceId.length === 0)
                return { read, outcome: { kind: "unsupported" } as ShellSourceOutcome }
            const outcome = await readAgentosShellCommandReceipt(accessToken, {
                workspaceId,
                instanceId,
                commandId,
                sourceIdentity: formatShellSourceIdentity(read.identity),
                readGeneration: read.readGeneration,
                selectionGeneration,
            })
            if (!outcome.ok && outcome.kind === "refused") return { read, outcome: null }
            return { read, outcome: outcomeForReceipt(outcome) }
        }),
    )
    if (receiptOutcomes.some((entry) => entry.outcome === null)) {
        dispatch((current) => [{ type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }])
        return
    }
    const outcomes = new Map<string, ShellSourceOutcome>()
    if (overviewOutcome !== null)
        for (const read of overviewReads)
            outcomes.set(formatShellSourceIdentity(read.identity), outcomeForRead(overviewOutcome, read))
    for (const entry of receiptOutcomes)
        outcomes.set(formatShellSourceIdentity(entry.read.identity), entry.outcome as ShellSourceOutcome)
    dispatch((current) =>
        reads.flatMap((read) => {
            const outcome = outcomes.get(formatShellSourceIdentity(read.identity))
            return outcome === undefined
                ? []
                : [
                      {
                          type: "apply-outcome" as const,
                          sessionEpoch: current.sessionEpoch,
                          selection: current.selection,
                          identity: read.identity,
                          readGeneration: read.readGeneration,
                          outcome,
                      },
                  ]
        }),
    )
}
