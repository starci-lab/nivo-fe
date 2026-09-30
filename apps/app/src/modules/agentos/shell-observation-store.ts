/*
 * The ephemeral per-source observation store behind the AgentOS shell (CU-SHELL-STATE).
 *
 * IT HOLDS NOTHING THAT CANNOT BE REBUILT. Every field here is a projection of a read the owner can
 * repeat, so nothing is written to browser storage and nothing survives a reload as authority. The
 * store's job is narrower and much more exact than caching: it decides whether an arriving outcome
 * still belongs to the selection, the source and the session it claims, and it refuses to let an
 * outcome that does not answer that question change any protected state.
 *
 * TWO KINDS OF OUTCOME, TWO SCOPES. An observation, refusal, failure or unsupported reply is a
 * SOURCE outcome and touches exactly one source. Sign-in-required and access-cannot-be-established
 * are SESSION outcomes: they belong to the whole selection, so they clear every protected payload of
 * it at once and block further reads until a fresh session check succeeds. Collapsing the second into
 * a per-source refusal is the mistake this file exists to prevent - it would tell a signed-out owner
 * that one module is forbidden while their sibling modules stayed on screen.
 *
 * THE TRANSITIONS ARE THE PUBLISHED ONES. Each event below names the transition it performed, and an
 * event that cannot perform one returns the SAME state object with `transition: "none"`. That is what
 * makes "obsolete outcomes are ignored with zero transition" a fact a test can assert rather than a
 * claim in a comment.
 */

import type {
    ShellCompleteness,
    ShellFreshness,
    ShellSelectionSourceKind,
    ShellSourceIdentity,
    ShellWireAvailability,
} from "@/modules/api/agentos-shell"
import { compareShellSourceIdentity, formatShellSourceIdentity } from "@/modules/api/agentos-shell"

/** The exact workspace and instance every read in one store belongs to. */
export interface ShellSelection {
    readonly workspaceId: string
    readonly instanceId: string
}

/**
 * One source's local state.
 *
 * `stale` is reachable only through freshness, never as an availability: an available observation
 * whose source is known to lag is last-known content, which is a different answer from an answer
 * taken now, and neither of them is `available`.
 */
export type ShellSourceStanding =
    "unresolved" | "loading" | "available" | "partial" | "stale" | "unavailable" | "unsupported" | "refused"

/** The selection-wide session standing; only a fresh session check leaves a blocked one. */
export type ShellSessionStanding = "established" | "sign-in-required" | "access-unestablished"

/** One source's record: its latest read identity and the state that read settled into. */
export interface ShellSourceObservation {
    readonly identity: ShellSourceIdentity
    readonly readGeneration: number
    readonly state: ShellSourceStanding
    readonly availability: ShellWireAvailability | null
    readonly freshness: ShellFreshness | null
    readonly completeness: ShellCompleteness | null
    readonly observedAt: string | null
    readonly payload: Readonly<Record<string, unknown>> | null
}

/** The whole store: the selection, the session standing and one record per known source. */
export interface ShellObservationSnapshot {
    readonly selection: ShellSelection
    readonly sessionEpoch: number
    readonly session: ShellSessionStanding
    readonly sources: ReadonlyArray<ShellSourceObservation>
}

/** What one arriving read settled into, as the gateway classified it for that exact source. */
export type ShellSourceOutcome =
    | {
          readonly kind: "observation"
          readonly availability: ShellWireAvailability
          readonly freshness: ShellFreshness
          readonly completeness: ShellCompleteness
          readonly observedAt: string | null
          readonly payload: Readonly<Record<string, unknown>> | null
      }
    | { readonly kind: "refused" }
    | { readonly kind: "unavailable" }
    | { readonly kind: "unsupported" }

/** The published transition names, plus `none` for an event that could not change anything. */
type ShellObservationTransition =
    | "begin-read"
    | "apply-current"
    | "apply-limited"
    | "apply-unavailable"
    | "clear-denied"
    | "change-selection"
    | "require-sign-in"
    | "session-unestablished"
    | "session-reestablished"
    | "none"

/** Everything that can happen to the store, each carrying the identity it claims to belong to. */
export type ShellObservationEvent =
    | {
          readonly type: "begin-read"
          readonly sessionEpoch: number
          readonly selection: ShellSelection
          readonly identity: ShellSourceIdentity
          readonly readGeneration: number
      }
    | {
          readonly type: "apply-outcome"
          readonly sessionEpoch: number
          readonly selection: ShellSelection
          readonly identity: ShellSourceIdentity
          readonly readGeneration: number
          readonly outcome: ShellSourceOutcome
      }
    | { readonly type: "change-selection"; readonly selection: ShellSelection }
    | { readonly type: "require-sign-in"; readonly sessionEpoch: number }
    | { readonly type: "session-unestablished"; readonly sessionEpoch: number }
    | { readonly type: "session-reestablished"; readonly sessionEpoch: number }

/** The reducer's answer: the next state, and which published transition produced it. */
interface ShellObservationReduction {
    readonly state: ShellObservationSnapshot
    readonly transition: ShellObservationTransition
}

/** The three whole-selection sources, in the order an overview asks for them. */
const SELECTION_KINDS = ["core_registry", "installation_inventory", "runtime"] as const satisfies
    ReadonlyArray<ShellSelectionSourceKind>

/**
 * The sources one AgentOS selection reads.
 *
 * @param installationIds - Installations the caller currently knows about; each contributes its own
 *   capability, attention and configuration sources, so a sibling installation's answer can never be
 *   applied to the selected one.
 * @returns The closed source identities for a selection, in the canonical order the route accepts.
 */
export const shellSelectionIdentities = (
    installationIds: ReadonlyArray<string>,
): ReadonlyArray<ShellSourceIdentity> => {
    const identities: Array<ShellSourceIdentity> = []
    for (const kind of SELECTION_KINDS) identities.push({ kind })
    for (const installationId of installationIds) {
        for (const kind of ["capability", "attention", "configuration"] as const)
            identities.push({ kind, installationId })
    }
    return identities.sort((left, right) =>
        compareShellSourceIdentity(formatShellSourceIdentity(left), formatShellSourceIdentity(right)),
    )
}

/**
 * One receiver-owned operation the owner returned with.
 *
 * `installationId` and `intentId` name the receiver source the receipt read answers under; `commandId`
 * is the stable command identity the command-receipt route is asked for. All three come from the
 * caller's own return context - the store never derives one from another source's payload.
 */
export interface ShellOperationIntent {
    readonly installationId: string
    readonly intentId: string
    readonly commandId: string
}

/**
 * The receiver observation sources a selection reads for the operations it returned with.
 *
 * @param operations - The receiver-owned intents the caller holds a command identity for.
 * @returns One `receiver:{installationId,intentId}` identity per distinct receiver intent.
 */
export const shellOperationIdentities = (
    operations: ReadonlyArray<ShellOperationIntent>,
): ReadonlyArray<ShellSourceIdentity> => {
    const identities: Array<ShellSourceIdentity> = []
    for (const operation of operations) {
        const identity: ShellSourceIdentity = {
            kind: "receiver",
            installationId: operation.installationId,
            intentId: operation.intentId,
        }
        if (identities.every((known) => formatShellSourceIdentity(known) !== formatShellSourceIdentity(identity)))
            identities.push(identity)
    }
    return identities.sort((left, right) =>
        compareShellSourceIdentity(formatShellSourceIdentity(left), formatShellSourceIdentity(right)),
    )
}

/** The store's initial state: nothing read, the session not yet classified for this selection. */
export const initialShellObservationSnapshot = (
    selection: ShellSelection,
    sessionEpoch: number,
): ShellObservationSnapshot => ({ selection, sessionEpoch, session: "established", sources: [] })

/** The record for one source, or null when the store has never been told about it. */
export const shellSourceObservation = (
    state: ShellObservationSnapshot,
    identity: ShellSourceIdentity,
): ShellSourceObservation | null => {
    const canonical = formatShellSourceIdentity(identity)
    return state.sources.find((entry) => formatShellSourceIdentity(entry.identity) === canonical) ?? null
}

/**
 * Whether reads are blocked until a fresh session check succeeds.
 *
 * @param state - Current store state.
 * @returns True while the session is sign-in-required or access-cannot-be-established.
 */
export const isShellReadBlocked = (state: ShellObservationSnapshot): boolean => state.session !== "established"

const sameSelection = (left: ShellSelection, right: ShellSelection): boolean =>
    left.workspaceId === right.workspaceId && left.instanceId === right.instanceId

const withSource = (state: ShellObservationSnapshot, record: ShellSourceObservation): ShellObservationSnapshot => {
    const canonical = formatShellSourceIdentity(record.identity)
    const sources = state.sources.filter((entry): boolean => formatShellSourceIdentity(entry.identity) !== canonical)
    return { ...state, sources: [...sources, record] }
}

const loadingRecord = (identity: ShellSourceIdentity, readGeneration: number): ShellSourceObservation => ({
    identity,
    readGeneration,
    state: "loading",
    availability: null,
    freshness: null,
    completeness: null,
    observedAt: null,
    payload: null,
})

const settledRecord = (
    identity: ShellSourceIdentity,
    readGeneration: number,
    outcome: ShellSourceOutcome,
): ShellSourceObservation => {
    if (outcome.kind === "refused")
        return {
            identity,
            readGeneration,
            state: "refused",
            availability: "refused",
            freshness: "unknown",
            completeness: "unknown",
            observedAt: null,
            payload: null,
        }
    if (outcome.kind === "unavailable")
        return {
            identity,
            readGeneration,
            state: "unavailable",
            availability: "unavailable",
            freshness: "unknown",
            completeness: "unknown",
            observedAt: null,
            payload: null,
        }
    if (outcome.kind === "unsupported")
        return {
            identity,
            readGeneration,
            state: "unsupported",
            availability: "unsupported",
            freshness: "unknown",
            completeness: "unknown",
            observedAt: null,
            payload: null,
        }
    // Staleness is a state of its own: an available observation whose source is known to lag is
    // last-known content, and it is never rendered as an answer taken now.
    const settled: ShellSourceStanding =
        outcome.availability === "available" && outcome.freshness === "stale" ? "stale" : outcome.availability
    return {
        identity,
        readGeneration,
        state: settled,
        availability: outcome.availability,
        freshness: outcome.freshness,
        completeness: outcome.completeness,
        observedAt: outcome.observedAt,
        // A refusal discloses nothing. Nothing else may carry a payload it did not observe.
        payload: outcome.availability === "available" || outcome.availability === "partial" ? outcome.payload : null,
    }
}

const transitionFor = (outcome: ShellSourceOutcome): ShellObservationTransition => {
    if (outcome.kind === "refused") return "clear-denied"
    if (outcome.kind !== "observation") return "apply-unavailable"
    if (outcome.availability === "partial") return "apply-limited"
    return outcome.availability === "available" ? "apply-current" : "apply-unavailable"
}

/** The scope an arriving outcome claims: which session and which selection it belongs to. */
interface ShellReadOrigin {
    readonly sessionEpoch: number
    readonly selection: ShellSelection
}

/** Whether a read event still belongs to the selection and session the store is currently holding. */
const answersCurrentScope = (state: ShellObservationSnapshot, event: ShellReadOrigin): boolean =>
    event.sessionEpoch === state.sessionEpoch && sameSelection(event.selection, state.selection)

/** One source begins a read, or the event is obsolete and changes nothing. */
const beginRead = (
    state: ShellObservationSnapshot,
    event: Extract<ShellObservationEvent, { readonly type: "begin-read" }>,
): ShellObservationReduction => {
    if (isShellReadBlocked(state) || !answersCurrentScope(state, event)) return { state, transition: "none" }
    // Only a newer read may leave a recorded generation behind; a replay is not a new read.
    if (event.readGeneration <= (shellSourceObservation(state, event.identity)?.readGeneration ?? 0))
        return { state, transition: "none" }
    return { state: withSource(state, loadingRecord(event.identity, event.readGeneration)), transition: "begin-read" }
}

/** One source's read settles, or the outcome answers a generation this store is not waiting for. */
const applyOutcome = (
    state: ShellObservationSnapshot,
    event: Extract<ShellObservationEvent, { readonly type: "apply-outcome" }>,
): ShellObservationReduction => {
    if (isShellReadBlocked(state) || !answersCurrentScope(state, event)) return { state, transition: "none" }
    if (shellSourceObservation(state, event.identity)?.readGeneration !== event.readGeneration)
        return { state, transition: "none" }
    return {
        state: withSource(state, settledRecord(event.identity, event.readGeneration, event.outcome)),
        transition: transitionFor(event.outcome),
    }
}

/** The selection is replaced, or the change is ignored while the whole selection is session-blocked. */
const changeSelection = (state: ShellObservationSnapshot, selection: ShellSelection): ShellObservationReduction => {
    if (isShellReadBlocked(state)) return { state, transition: "none" }
    return {
        state: { selection, sessionEpoch: state.sessionEpoch, session: "established", sources: [] },
        transition: "change-selection",
    }
}

/**
 * The session standing is replaced for the whole selection.
 *
 * A session event advances the epoch, so one that does not move it forward is not a new session
 * result and changes nothing. Every protected payload of the selection goes at once: a session
 * outcome is never applied to one source, and a fresh establishment restores no prior payload.
 */
const sessionStanding = (
    state: ShellObservationSnapshot,
    sessionEpoch: number,
    session: ShellSessionStanding,
    transition: ShellObservationTransition,
): ShellObservationReduction => {
    if (sessionEpoch <= state.sessionEpoch) return { state, transition: "none" }
    return { state: { selection: state.selection, sessionEpoch, session, sources: [] }, transition }
}

/**
 * Apply one event to the store.
 *
 * @param state - Current store state.
 * @param event - The event, carrying the selection, session epoch and read generation it claims.
 * @returns The next state and the published transition performed, or the same state and `none` when
 *   the event is obsolete: an older read generation, a former selection, or an older session epoch.
 */
export const reduceShellObservation = (
    state: ShellObservationSnapshot,
    event: ShellObservationEvent,
): ShellObservationReduction => {
    switch (event.type) {
        case "begin-read":
            return beginRead(state, event)
        case "apply-outcome":
            return applyOutcome(state, event)
        case "change-selection":
            return changeSelection(state, event.selection)
        case "require-sign-in":
            return sessionStanding(state, event.sessionEpoch, "sign-in-required", "require-sign-in")
        case "session-unestablished":
            return sessionStanding(state, event.sessionEpoch, "access-unestablished", "session-unestablished")
        case "session-reestablished":
            return sessionStanding(state, event.sessionEpoch, "established", "session-reestablished")
    }
}
