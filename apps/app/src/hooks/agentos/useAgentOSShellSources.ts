"use client"

/*
 * The AgentOS shell's source-reading half (CU-SHELL-CONNECTED).
 *
 * Everything the store is told arrives as an event through `dispatch`: selection changes, session
 * standings, and the begin/settle pair of every read. The store is external state, so those writes
 * belong in the effects and continuations that cause them - they are never setState mirroring.
 *
 * The operations list is rebuilt by callers each render; the reads it feeds change only with
 * `operationKey`, so the current contents live behind a ref that an effect declared before the
 * read effects keeps current.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { type SessionState } from "@/modules/auth/session"
import { formatShellSourceIdentity, type ShellRead, type ShellSourceIdentity } from "@/modules/api/agentos-shell"
import {
    isShellReadBlocked,
    shellOperationIdentities,
    shellSelectionIdentities,
    type ShellObservationSnapshot,
    type ShellOperationIntent,
} from "@/modules/agentos/shell-observation-store"
import { createShellObservationStore, runShellReads } from "./agentos.shared"

/** The identity-level inputs the source reader consumes; none of them is transport detail. */
interface AgentOSShellSourceOptions {
    readonly workspaceId: string
    readonly instanceId: string
    /** Canonical sorted join of `installationIds`; the read set changes only when this does. */
    readonly installationKey: string
    /** Canonical join of the operations' identities; likewise. */
    readonly operationKey: string
    readonly operations: ReadonlyArray<ShellOperationIntent>
    readonly selectionGeneration: string
    readonly sessionStatus: SessionState["status"]
    readonly accessToken: string | null
}

/** The snapshot plus the two read intents a view may raise. */
interface AgentOSShellSources {
    readonly snapshot: ShellObservationSnapshot
    readonly readSelection: () => void
    readonly retrySource: (identity: ShellSourceIdentity) => void
}

/**
 * Own the selection's observation store and its read pipeline.
 *
 * @param options - The selection, its sources' identities and the session standing they run under.
 * @returns The subscribed snapshot and the controls that start reads. A selection change discards
 *   every former payload before any new read is sent; a session outcome applies to the whole
 *   selection at once.
 */
export const useAgentOSShellSources = (options: AgentOSShellSourceOptions): AgentOSShellSources => {
    const {
        workspaceId,
        instanceId,
        installationKey,
        operationKey,
        operations,
        selectionGeneration,
        sessionStatus,
        accessToken,
    } = options
    const [store] = useState(() => createShellObservationStore({ workspaceId, instanceId }))
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
    const [readTrigger, setReadTrigger] = useState(0)
    // The operations list is rebuilt by callers each render; the reads it feeds change only with
    // `operationKey`, so the current contents live behind a ref rather than a callback identity.
    const operationsRef = useRef<ReadonlyArray<ShellOperationIntent>>(operations)

    const runReads = useCallback(
        (identities: ReadonlyArray<ShellSourceIdentity>) => {
            if (accessToken === null || isShellReadBlocked(store.getSnapshot()) || identities.length === 0) return
            const reads: ReadonlyArray<ShellRead> = identities.map((identity) => {
                const key = formatShellSourceIdentity(identity)
                const readGeneration = (store.generations.get(key) ?? 0) + 1
                store.generations.set(key, readGeneration)
                return { identity, readGeneration }
            })
            store.dispatch((current) =>
                reads.map((read) => ({
                    type: "begin-read" as const,
                    sessionEpoch: current.sessionEpoch,
                    selection: current.selection,
                    identity: read.identity,
                    readGeneration: read.readGeneration,
                })),
            )
            void runShellReads(
                {
                    accessToken,
                    workspaceId,
                    instanceId,
                    selectionGeneration,
                    operations: operationsRef,
                    dispatch: store.dispatch,
                },
                reads,
            )
        },
        [accessToken, instanceId, selectionGeneration, store, workspaceId],
    )

    /** Keep the pipeline's operation intents current before any effect below may read them. */
    useEffect(() => {
        operationsRef.current = operations
    })

    /** A selection change discards every former payload before any new read is sent. */
    useEffect(() => {
        store.dispatch(() => [{ type: "change-selection", selection: { workspaceId, instanceId } }])
    }, [store, instanceId, workspaceId])

    /**
     * Apply the session standing before any protected read is attempted.
     *
     * `restoring` is deliberately not classified: nothing is known yet, and inventing sign-in-required
     * from an unsettled session would tell a signed-in owner to sign in during a normal start-up.
     */
    useEffect(() => {
        if (sessionStatus === "restoring") return
        store.dispatch((current) => [
            sessionStatus === "anonymous"
                ? { type: "require-sign-in", sessionEpoch: current.sessionEpoch + 1 }
                : { type: "session-reestablished", sessionEpoch: current.sessionEpoch + 1 },
        ])
    }, [store, sessionStatus])

    /** Read the whole selection: on a session, on a selection change, and on a refresh or return. */
    useEffect(() => {
        if (sessionStatus !== "signed-in") return
        runReads([
            ...shellSelectionIdentities(installationKey.length === 0 ? [] : installationKey.split("|")),
            ...shellOperationIdentities(operationsRef.current),
        ])
    }, [store, installationKey, operationKey, readTrigger, runReads, sessionStatus])

    const readSelection = useCallback(() => setReadTrigger((current) => current + 1), [])
    const retrySource = useCallback((identity: ShellSourceIdentity) => runReads([identity]), [runReads])

    return { snapshot, readSelection, retrySource }
}
