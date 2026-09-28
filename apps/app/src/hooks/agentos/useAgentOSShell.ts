"use client";

/*
 * The connected AgentOS management shell (CU-SHELL-CONNECTED).
 *
 * It owns one selected workspace and instance, asks the registered Core route for exactly the
 * sources of that selection, and hands the results to the ephemeral store. Everything it can do is
 * a read or a destination resolution, so no path through this file can reach a module command, a
 * retry of one, or a reconciliation of one.
 *
 * THREE HABITS ARE LOAD-BEARING.
 *
 * 1. A SELECTION CHANGE READS FROM SCRATCH. The change is applied to the store before the new reads
 *    begin, so every payload of the former selection is gone before a new one can be shown.
 * 2. A SESSION OUTCOME IS NOT A SOURCE OUTCOME. A 401 from the registered route, or a session that
 *    is anonymous, is applied to the whole selection at once and advances the session epoch, so
 *    answers from an ended session are discarded instead of repopulating private content.
 * 3. RETURN OR REFRESH IS A FRESH START. Coming back from a module, or re-reading, allocates newer
 *    read generations and asks again; nothing is replayed and nothing is restored from the browser.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toLocale } from "@/modules/i18n/config";
import { useSession, type SessionState } from "@/modules/auth/session";
import {
    formatShellSourceIdentity,
    readAgentosShellCommandReceipt,
    readAgentosShellOverview,
    resolveAgentosShellNavigation,
    type ShellCommandReceiptAnswer,
    type ShellGatewayOutcome,
    type ShellNavigationOutcome,
    type ShellOverviewAnswer,
    type ShellRead,
    type ShellRouteKey,
    type ShellSourceEnvelope,
    type ShellSourceIdentity
} from "@/modules/api/agentos-shell";
import {
    initialShellObservationSnapshot,
    isShellReadBlocked,
    reduceShellObservation,
    shellOperationIdentities,
    shellSelectionIdentities,
    type ShellObservationEvent,
    type ShellObservationSnapshot,
    type ShellOperationIntent,
    type ShellSelection,
    type ShellSessionStanding,
    type ShellSourceObservation,
    type ShellSourceOutcome
} from "@/modules/agentos/shell-observation-store";
import { shellNavigationDecision, type ShellNavigationDecision } from "@/modules/agentos/shell-navigation";

/** Which AgentOS the shell is showing, and which installations its sources are scoped to. */
export interface AgentOSShellOptions {
    readonly workspaceId: string;
    readonly instanceId: string;
    readonly installationIds: ReadonlyArray<string>;
    /**
     * The receiver-owned operations the owner returned with: each carries the stable command
     * identity its receipt is read under. Absent identities are never guessed from another source.
     */
    readonly operations?: ReadonlyArray<ShellOperationIntent>;
}

/** Everything a view of the connected shell needs, and nothing that could change a domain. */
export interface AgentOSShellHandle {
    readonly selection: ShellSelection;
    readonly session: ShellSessionStanding;
    readonly sessionStatus: SessionState["status"];
    readonly blocked: boolean;
    readonly sources: ReadonlyArray<ShellSourceObservation>;
    readonly readSelection: () => void;
    readonly retrySource: (identity: ShellSourceIdentity) => void;
    readonly resolveEntry: (installationId: string, routeKey: ShellRouteKey, opaqueItemId: string | null) => Promise<ShellNavigationOutcome>;
    readonly navigationDecision: (outcome: ShellNavigationOutcome) => ShellNavigationDecision;
}

/**
 * A refusal Core answered for the whole request, as the outcome each source of it gets.
 *
 * The registered route refuses a read SET, not one source, so the meaning has to be recovered from
 * the status Core chose: a permission refusal hides protected content, an outage does not, and a
 * malformed request is a grammar problem. Collapsing all three into "denied" would tell an owner
 * they lost access every time Core had a bad minute.
 */
const requestRefusalOutcome = (status: number): ShellSourceOutcome => {
    if (status === 403 || status === 404) return { kind: "refused" };
    if (status >= 500) return { kind: "unavailable" };
    return { kind: "unsupported" };
};

/** One source's outcome from one answered overview envelope; a refusal never carries its payload. */
const envelopeOutcome = (envelope: ShellSourceEnvelope): ShellSourceOutcome => {
    if (envelope.availability === "refused") return { kind: "refused" };
    if (envelope.availability === "unavailable") return { kind: "unavailable" };
    if (envelope.availability === "unsupported") return { kind: "unsupported" };
    return {
        kind: "observation",
        availability: envelope.availability,
        freshness: envelope.freshness,
        completeness: envelope.completeness,
        observedAt: envelope.observedAt,
        payload: envelope.payload
    };
};

const outcomeForRead = (outcome: ShellGatewayOutcome<ShellOverviewAnswer>, read: ShellRead): ShellSourceOutcome => {
    if (outcome.state === "answered") {
        const canonical = formatShellSourceIdentity(read.identity);
        const envelope = outcome.answer.sources.find((source): boolean => source.sourceIdentity === canonical);
        // The client already proved that every requested source answered; a missing one is a failure
        // of this read rather than an empty answer, and it is never presented as absence.
        return envelope === undefined ? { kind: "unavailable" } : envelopeOutcome(envelope);
    }
    if (outcome.state === "refused") return requestRefusalOutcome(outcome.status);
    if (outcome.state === "unsupported") return { kind: "unsupported" };
    return { kind: "unavailable" };
};

/**
 * One receiver source's outcome from its command-receipt answer.
 *
 * The receipt carries a queue state and receiver observations, none of which is a promise of
 * completion: the payload is preserved verbatim so the view decides pending, confirmed or uncertain
 * from the receiver's own words. A receipt that never arrives cannot become a result.
 */
const outcomeForReceipt = (outcome: ShellGatewayOutcome<ShellCommandReceiptAnswer>): ShellSourceOutcome => {
    if (outcome.state === "answered") {
        const projection = outcome.answer.commandObservation;
        if (projection.availability === "refused") return { kind: "refused" };
        if (projection.availability === "unavailable") return { kind: "unavailable" };
        if (projection.availability === "unsupported") return { kind: "unsupported" };
        const observation = projection.projection;
        // A partial projection carries no command observation at all: it is a limit, not a receipt.
        if (observation === null) return { kind: "observation", availability: "partial", freshness: "current", completeness: "partial", observedAt: null, payload: null };
        const observedAts = observation.observations.map(entry => entry.observedAt).filter((value): value is string => value !== null).sort();
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
                localTransportGaps: [...observation.localTransportGaps]
            }
        };
    }
    if (outcome.state === "refused") return requestRefusalOutcome(outcome.status);
    if (outcome.state === "unsupported") return { kind: "unsupported" };
    return { kind: "unavailable" };
};

/** The command identity an operation carries for one receiver source, or null when none matches. */
const commandIdFor = (operations: ReadonlyArray<ShellOperationIntent>, installationId: string, intentId: string): string | null => {
    for (const operation of operations) {
        if (operation.installationId === installationId && operation.intentId === intentId) return operation.commandId;
    }
    return null;
};

/**
 * Own one AgentOS shell selection: its sources, its session standing and its navigation.
 *
 * @param options - The selected workspace and instance, and the installations its sources cover.
 * @returns The connected shell handle. Reads are only ever issued while a session is signed in, and
 *   every read, retry, refresh and return allocates newer read generations for the sources it asks.
 */
export const useAgentOSShell = (options: AgentOSShellOptions) => {
    const { workspaceId, instanceId } = options;
    const installationKey = [...options.installationIds].sort((left, right): number => left.localeCompare(right)).join("|");
    const operations = options.operations ?? [];
    const operationKey = operations.map(operation => `${operation.installationId} ${operation.intentId} ${operation.commandId}`).sort().join("|");
    const session = useSession();
    const sessionStatus = session.state.status;
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
    const locale = toLocale(useLocale());
    // The selection token is derived from the selection itself, so a different AgentOS is always a
    // different token and the same AgentOS keeps one across refreshes and returns.
    const selectionGeneration = `shell-${workspaceId}-${instanceId}`;

    const [state, setState] = useState<ShellObservationSnapshot>(() => initialShellObservationSnapshot({ workspaceId, instanceId }, 1));
    const [readTrigger, setReadTrigger] = useState(0);
    // Generations are allocated here rather than derived from the store, so the set a request is sent
    // under is fixed before anything can be applied back to it.
    const generations = useRef<Map<string, number>>(new Map());
    // The latest store standing, for the one decision that must be made before a request is sent.
    const blockedRef = useRef(false);
    blockedRef.current = isShellReadBlocked(state);
    // The operations list is rebuilt by callers each render; the reads it feeds change only with
    // `operationKey`, so the current contents live behind a ref rather than a callback identity.
    const operationsRef = useRef<ReadonlyArray<ShellOperationIntent>>(operations);
    operationsRef.current = operations;

    const dispatch = useCallback((build: (current: ShellObservationSnapshot) => ReadonlyArray<ShellObservationEvent>) => {
        setState(current => build(current).reduce((next, event) => reduceShellObservation(next, event).state, current));
    }, []);

    const runReads = useCallback((identities: ReadonlyArray<ShellSourceIdentity>) => {
        if (accessToken === null || blockedRef.current || identities.length === 0) return;
        const reads: ReadonlyArray<ShellRead> = identities.map(identity => {
            const key = formatShellSourceIdentity(identity);
            const readGeneration = (generations.current.get(key) ?? 0) + 1;
            generations.current.set(key, readGeneration);
            return { identity, readGeneration };
        });
        dispatch(current => reads.map(read => ({
            type: "begin-read",
            sessionEpoch: current.sessionEpoch,
            selection: current.selection,
            identity: read.identity,
            readGeneration: read.readGeneration
        })));
        void (async () => {
            // A receiver source is read through its own command-receipt route, never through the
            // overview: the receipt carries the queue state the overview does not know. Every other
            // identity keeps the one registered selection read.
            const overviewReads = reads.filter(read => read.identity.kind !== "receiver");
            const receiptReads = reads.filter(read => read.identity.kind === "receiver");
            const overviewOutcome = overviewReads.length === 0 ? null : await readAgentosShellOverview(accessToken, { workspaceId, instanceId }, selectionGeneration, overviewReads);
            if (overviewOutcome !== null && overviewOutcome.state === "unauthenticated") {
                // A session outcome belongs to the whole selection: it clears every protected payload
                // at once and blocks reads until a fresh session check succeeds.
                dispatch(current => [{ type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }]);
                return;
            }
            const receiptOutcomes = await Promise.all(receiptReads.map(async read => {
                if (read.identity.kind !== "receiver") return { read, outcome: { kind: "unsupported" } as ShellSourceOutcome };
                const commandId = commandIdFor(operationsRef.current, read.identity.installationId, read.identity.intentId);
                if (commandId === null || instanceId.length === 0) return { read, outcome: { kind: "unsupported" } as ShellSourceOutcome };
                const outcome = await readAgentosShellCommandReceipt(accessToken, {
                    workspaceId,
                    instanceId,
                    commandId,
                    sourceIdentity: formatShellSourceIdentity(read.identity),
                    readGeneration: read.readGeneration,
                    selectionGeneration
                });
                if (outcome.state === "unauthenticated") return { read, outcome: null };
                return { read, outcome: outcomeForReceipt(outcome) };
            }));
            if (receiptOutcomes.some(entry => entry.outcome === null)) {
                dispatch(current => [{ type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }]);
                return;
            }
            const outcomes = new Map<string, ShellSourceOutcome>();
            if (overviewOutcome !== null) for (const read of overviewReads) outcomes.set(formatShellSourceIdentity(read.identity), outcomeForRead(overviewOutcome, read));
            for (const entry of receiptOutcomes) outcomes.set(formatShellSourceIdentity(entry.read.identity), entry.outcome as ShellSourceOutcome);
            dispatch(current => reads.flatMap(read => {
                const outcome = outcomes.get(formatShellSourceIdentity(read.identity));
                return outcome === undefined ? [] : [{
                    type: "apply-outcome" as const,
                    sessionEpoch: current.sessionEpoch,
                    selection: current.selection,
                    identity: read.identity,
                    readGeneration: read.readGeneration,
                    outcome
                }];
            }));
        })();
    }, [accessToken, dispatch, instanceId, selectionGeneration, workspaceId]);

    /** A selection change discards every former payload before any new read is sent. */
    useEffect(() => {
        dispatch(() => [{ type: "change-selection", selection: { workspaceId, instanceId } }]);
    }, [dispatch, instanceId, workspaceId]);

    /**
     * Apply the session standing before any protected read is attempted.
     *
     * `restoring` is deliberately not classified: nothing is known yet, and inventing sign-in-required
     * from an unsettled session would tell a signed-in owner to sign in during a normal start-up.
     */
    useEffect(() => {
        if (sessionStatus === "restoring") return;
        dispatch(current => [sessionStatus === "anonymous"
            ? { type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }
            : { type: "session-reestablished", sessionEpoch: current.sessionEpoch + 1 }]);
    }, [dispatch, sessionStatus]);

    /** Read the whole selection: on a session, on a selection change, and on a refresh or return. */
    useEffect(() => {
        if (sessionStatus !== "signed-in") return;
        runReads([
            ...shellSelectionIdentities(installationKey.length === 0 ? [] : installationKey.split("|")),
            ...shellOperationIdentities(operationsRef.current)
        ]);
    }, [installationKey, operationKey, readTrigger, runReads, sessionStatus]);

    const readSelection = useCallback(() => setReadTrigger(current => current + 1), []);
    const retrySource = useCallback((identity: ShellSourceIdentity) => runReads([identity]), [runReads]);

    const resolveEntry = useCallback(async (installationId: string, routeKey: ShellRouteKey, opaqueItemId: string | null): Promise<ShellNavigationOutcome> => {
        if (accessToken === null) return { state: "unauthenticated" };
        return resolveAgentosShellNavigation(accessToken, { workspaceId, instanceId, installationId, routeKey, opaqueItemId, selectionGeneration });
    }, [accessToken, instanceId, selectionGeneration, workspaceId]);

    const navigationDecision = useCallback((outcome: ShellNavigationOutcome) => shellNavigationDecision(outcome, locale), [locale]);

    const handle: AgentOSShellHandle = {
        selection: { workspaceId, instanceId },
        session: state.session,
        sessionStatus,
        blocked: isShellReadBlocked(state),
        sources: state.sources,
        readSelection,
        retrySource,
        resolveEntry,
        navigationDecision
    };
    return handle;
};