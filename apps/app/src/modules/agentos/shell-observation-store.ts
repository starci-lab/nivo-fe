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
    ShellSourceIdentity,
    ShellWireAvailability
} from "@/modules/api/agentos-shell";
import {
    compareShellSourceIdentity,
    formatShellSourceIdentity
} from "@/modules/api/agentos-shell";

/** The exact workspace and instance every read in one store belongs to. */
export interface ShellSelection {
    readonly workspaceId: string;
    readonly instanceId: string;
}

/**
 * One source's local state.
 *
 * `stale` is reachable only through freshness, never as an availability: an available observation
 * whose source is known to lag is last-known content, which is a different answer from an answer
 * taken now, and neither of them is `available`.
 */
export type ShellSourceState = "unresolved" | "loading" | "available" | "partial" | "stale" | "unavailable" | "unsupported" | "refused";

/** The selection-wide session standing; only a fresh session check leaves a blocked one. */
export type ShellSessionState = "established" | "sign-in-required" | "access-unestablished";

/** One source's record: its latest read identity and the state that read settled into. */
export interface ShellSourceObservation {
    readonly identity: ShellSourceIdentity;
    readonly readGeneration: number;
    readonly state: ShellSourceState;
    readonly availability: ShellWireAvailability | null;
    readonly freshness: ShellFreshness | null;
    readonly completeness: ShellCompleteness | null;
    readonly observedAt: string | null;
    readonly payload: Readonly<Record<string, unknown>> | null;
}

/** The whole store: the selection, the session standing and one record per known source. */
export interface ShellObservationState {
    readonly selection: ShellSelection;
    readonly sessionEpoch: number;
    readonly session: ShellSessionState;
    readonly sources: ReadonlyArray<ShellSourceObservation>;
}

/** What one arriving read settled into, as the gateway classified it for that exact source. */
export type ShellSourceOutcome =
    | {
        readonly kind: "observation";
        readonly availability: ShellWireAvailability;
        readonly freshness: ShellFreshness;
        readonly completeness: ShellCompleteness;
        readonly observedAt: string | null;
        readonly payload: Readonly<Record<string, unknown>> | null;
    }
    | { readonly kind: "refused" }
    | { readonly kind: "unavailable" }
    | { readonly kind: "unsupported" };

/** The published transition names, plus `none` for an event that could not change anything. */
export type ShellObservationTransition = "begin-read" | "apply-current" | "apply-limited" | "apply-unavailable" | "clear-denied" | "change-selection" | "require-sign-in" | "session-unestablished" | "session-reestablished" | "none";

/** Everything that can happen to the store, each carrying the identity it claims to belong to. */
export type ShellObservationEvent =
    | {
        readonly type: "begin-read";
        readonly sessionEpoch: number;
        readonly selection: ShellSelection;
        readonly identity: ShellSourceIdentity;
        readonly readGeneration: number;
    }
    | {
        readonly type: "apply-outcome";
        readonly sessionEpoch: number;
        readonly selection: ShellSelection;
        readonly identity: ShellSourceIdentity;
        readonly readGeneration: number;
        readonly outcome: ShellSourceOutcome;
    }
    | { readonly type: "change-selection"; readonly selection: ShellSelection }
    | { readonly type: "require-sign-in"; readonly sessionEpoch: number }
    | { readonly type: "session-unestablished"; readonly sessionEpoch: number }
    | { readonly type: "session-reestablished"; readonly sessionEpoch: number };

/** The reducer's answer: the next state, and which published transition produced it. */
export interface ShellObservationReduction {
    readonly state: ShellObservationState;
    readonly transition: ShellObservationTransition;
}

/** The three whole-selection sources, in the order an overview asks for them. */
const SELECTION_KINDS: ReadonlySet<string> = new Set(["core_registry", "installation_inventory", "runtime"]);

/**
 * The sources one AgentOS selection reads.
 *
 * @param installationIds - Installations the caller currently knows about; each contributes its own
 *   capability, attention and configuration sources, so a sibling installation's answer can never be
 *   applied to the selected one.
 * @returns The closed source identities for a selection, in the canonical order the route accepts.
 */
export const shellSelectionIdentities = (installationIds: ReadonlyArray<string>): ReadonlyArray<ShellSourceIdentity> => {
    const identities: Array<ShellSourceIdentity> = [];
    for (const kind of SELECTION_KINDS) identities.push({ kind: kind as "core_registry" | "installation_inventory" | "runtime" });
    for (const installationId of installationIds) {
        for (const kind of ["capability", "attention", "configuration"] as const) identities.push({ kind, installationId });
    }
    return identities.sort((left, right) => compareShellSourceIdentity(formatShellSourceIdentity(left), formatShellSourceIdentity(right)));
};

/** The store's initial state: nothing read, the session not yet classified for this selection. */
export const initialShellObservationState = (selection: ShellSelection, sessionEpoch: number): ShellObservationState => ({ selection, sessionEpoch, session: "established", sources: [] });

/** The record for one source, or null when the store has never been told about it. */
export const shellSourceObservation = (state: ShellObservationState, identity: ShellSourceIdentity): ShellSourceObservation | null => {
    const canonical = formatShellSourceIdentity(identity);
    return state.sources.find(entry => formatShellSourceIdentity(entry.identity) === canonical) ?? null;
};

/**
 * Whether reads are blocked until a fresh session check succeeds.
 *
 * @param state - Current store state.
 * @returns True while the session is sign-in-required or access-cannot-be-established.
 */
export const isShellReadBlocked = (state: ShellObservationState): boolean => state.session !== "established";

/**
 * The next read generation for one source.
 *
 * Monotonic per source, so an outcome that arrives late can be compared against the generation the
 * store is actually waiting for rather than against whatever arrived last.
 *
 * @param state - Current store state.
 * @param identity - The source about to be read.
 * @returns One more than the highest generation this source has ever been read under.
 */
export const nextShellReadGeneration = (state: ShellObservationState, identity: ShellSourceIdentity): number => (shellSourceObservation(state, identity)?.readGeneration ?? 0) + 1;

const sameSelection = (left: ShellSelection, right: ShellSelection): boolean => left.workspaceId === right.workspaceId && left.instanceId === right.instanceId;

const withSource = (state: ShellObservationState, record: ShellSourceObservation): ShellObservationState => {
    const canonical = formatShellSourceIdentity(record.identity);
    const sources = state.sources.filter(entry => formatShellSourceIdentity(entry.identity) !== canonical);
    return { ...state, sources: [...sources, record] };
};

const loadingRecord = (identity: ShellSourceIdentity, readGeneration: number): ShellSourceObservation => ({
    identity, readGeneration, state: "loading", availability: null, freshness: null, completeness: null, observedAt: null, payload: null
});

const settledRecord = (identity: ShellSourceIdentity, readGeneration: number, outcome: ShellSourceOutcome): ShellSourceObservation => {
    if (outcome.kind === "refused") return { identity, readGeneration, state: "refused", availability: "refused", freshness: "unknown", completeness: "unknown", observedAt: null, payload: null };
    if (outcome.kind === "unavailable") return { identity, readGeneration, state: "unavailable", availability: "unavailable", freshness: "unknown", completeness: "unknown", observedAt: null, payload: null };
    if (outcome.kind === "unsupported") return { identity, readGeneration, state: "unsupported", availability: "unsupported", freshness: "unknown", completeness: "unknown", observedAt: null, payload: null };
    // Staleness is a state of its own: an available observation whose source is known to lag is
    // last-known content, and it is never rendered as an answer taken now.
    const settled: ShellSourceState = outcome.availability === "available" && outcome.freshness === "stale" ? "stale" : outcome.availability;
    return {
        identity, readGeneration, state: settled, availability: outcome.availability, freshness: outcome.freshness,
        completeness: outcome.completeness, observedAt: outcome.observedAt,
        // A refusal discloses nothing. Nothing else may carry a payload it did not observe.
        payload: outcome.availability === "available" || outcome.availability === "partial" ? outcome.payload : null
    };
};

const transitionFor = (outcome: ShellSourceOutcome): ShellObservationTransition => {
    if (outcome.kind === "refused") return "clear-denied";
    if (outcome.kind === "unavailable" || outcome.kind === "unsupported") return "apply-unavailable";
    return outcome.availability === "partial" ? "apply-limited" : outcome.availability === "available" ? "apply-current" : "apply-unavailable";
};

/** The scope an arriving outcome claims: which session and which selection it belongs to. */
export interface ShellReadOrigin {
    readonly sessionEpoch: number;
    readonly selection: ShellSelection;
}

/** Whether a read event still belongs to the selection and session the store is currently holding. */
const answersCurrentScope = (state: ShellObservationState, event: ShellReadOrigin): boolean => event.sessionEpoch === state.sessionEpoch && sameSelection(event.selection, state.selection);

/**
 * Apply one event to the store.
 *
 * @param state - Current store state.
 * @param event - The event, carrying the selection, session epoch and read generation it claims.
 * @returns The next state and the published transition performed, or the same state and `none` when
 *   the event is obsolete: an older read generation, a former selection, or an older session epoch.
 *   A selection change while the session is blocked is also ignored, because the block is
 *   selection-wide and only a fresh session check clears it.
 */
export const reduceShellObservation = (state: ShellObservationState, event: ShellObservationEvent): ShellObservationReduction => {
    switch (event.type) {
        case "begin-read": {
            if (isShellReadBlocked(state) || !answersCurrentScope(state, event)) return { state, transition: "none" };
            const current = shellSourceObservation(state, event.identity);
            // Only a newer read may leave a recorded generation behind; a replay is not a new read.
            if (current !== null && event.readGeneration <= current.readGeneration) return { state, transition: "none" };
            return { state: withSource(state, loadingRecord(event.identity, event.readGeneration)), transition: "begin-read" };
        }
        case "apply-outcome": {
            if (isShellReadBlocked(state) || !answersCurrentScope(state, event)) return { state, transition: "none" };
            const current = shellSourceObservation(state, event.identity);
            // An outcome for a generation this store is not waiting for is ignored, not applied.
            if (current === null || current.readGeneration !== event.readGeneration) return { state, transition: "none" };
            return { state: withSource(state, settledRecord(event.identity, event.readGeneration, event.outcome)), transition: transitionFor(event.outcome) };
        }
        case "change-selection": {
            if (isShellReadBlocked(state)) return { state, transition: "none" };
            return { state: { selection: event.selection, sessionEpoch: state.sessionEpoch, session: "established", sources: [] }, transition: "change-selection" };
        }
        case "require-sign-in": {
            // A session event advances the epoch; one that does not move it forward is not a new
            // session result and changes nothing.
            if (event.sessionEpoch <= state.sessionEpoch) return { state, transition: "none" };
            // A session outcome is selection-wide: every protected payload of the selection goes at once.
            return { state: { selection: state.selection, sessionEpoch: event.sessionEpoch, session: "sign-in-required", sources: [] }, transition: "require-sign-in" };
        }
        case "session-unestablished": {
            if (event.sessionEpoch <= state.sessionEpoch) return { state, transition: "none" };
            return { state: { selection: state.selection, sessionEpoch: event.sessionEpoch, session: "access-unestablished", sources: [] }, transition: "session-unestablished" };
        }
        case "session-reestablished": {
            if (event.sessionEpoch <= state.sessionEpoch) return { state, transition: "none" };
            // A fresh session check establishes new source identities; no prior payload is restored.
            return { state: { selection: state.selection, sessionEpoch: event.sessionEpoch, session: "established", sources: [] }, transition: "session-reestablished" };
        }
    }
};