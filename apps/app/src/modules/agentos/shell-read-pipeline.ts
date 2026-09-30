import {
    formatShellSourceIdentity,
    readAgentosShellCommandReceipt,
    readAgentosShellOverview,
    type ShellRead,
} from "@/modules/api/agentos-shell"
import {
    initialShellObservationSnapshot,
    reduceShellObservation,
    type ShellObservationEvent,
    type ShellObservationSnapshot,
    type ShellOperationIntent,
    type ShellSelection,
    type ShellSourceOutcome,
} from "./shell-observation-store"
import { commandIdFor, outcomeForRead, outcomeForReceipt } from "./shell-observation-outcome"

/** The observation store one shell selection lives behind. */
interface ShellObservationStore {
    readonly getSnapshot: () => ShellObservationSnapshot
    readonly subscribe: (listener: () => void) => () => void
    readonly dispatch: (build: (current: ShellObservationSnapshot) => ReadonlyArray<ShellObservationEvent>) => void
    readonly generations: Map<string, number>
}

/** Create the ephemeral store for one hook instance. */
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

/** Everything a shell read pipeline needs from its owning hook. */
interface ShellReadEnvironment {
    readonly accessToken: string
    readonly workspaceId: string
    readonly instanceId: string
    readonly selectionGeneration: string
    readonly operations: { readonly current: ReadonlyArray<ShellOperationIntent> }
    readonly dispatch: ShellObservationStore["dispatch"]
}

/** Send one allocated read set and apply each answer under the generation it was sent with. */
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
                return { read, outcome: { kind: "unsupported" } satisfies ShellSourceOutcome }
            const commandId = commandIdFor(operations.current, read.identity.installationId, read.identity.intentId)
            if (commandId === null || instanceId.length === 0)
                return { read, outcome: { kind: "unsupported" } satisfies ShellSourceOutcome }
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
    const settledReceipts = receiptOutcomes.flatMap((entry) =>
        entry.outcome === null ? [] : [{ read: entry.read, outcome: entry.outcome }],
    )
    if (settledReceipts.length !== receiptOutcomes.length) {
        dispatch((current) => [{ type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }])
        return
    }
    const outcomes = new Map<string, ShellSourceOutcome>()
    if (overviewOutcome !== null)
        for (const read of overviewReads)
            outcomes.set(formatShellSourceIdentity(read.identity), outcomeForRead(overviewOutcome, read))
    for (const entry of settledReceipts) outcomes.set(formatShellSourceIdentity(entry.read.identity), entry.outcome)
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
