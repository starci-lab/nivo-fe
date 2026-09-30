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

import { useSession } from "../auth/useSession"
import { useAccessToken } from "../auth/useAccessToken"
import { type SessionState } from "@/modules/auth/session"
import { type Outcome } from "@nivo/api"
import type { ShellRegisteredDestination, ShellRouteKey, ShellSourceIdentity } from "@/modules/api/agentos-shell"
import {
    isShellReadBlocked,
    type ShellOperationIntent,
    type ShellSelection,
    type ShellSessionStanding,
    type ShellSourceObservation,
} from "@/modules/agentos/shell-observation-store"
import { type ShellNavigationDecision } from "@/modules/agentos/shell-navigation"
import { useAgentOSShellNavigation } from "./useAgentOSShellNavigation"
import { useAgentOSShellSources } from "./useAgentOSShellSources"

/** Which AgentOS the shell is showing, and which installations its sources are scoped to. */
export interface AgentOSShellOptions {
    readonly workspaceId: string
    readonly instanceId: string
    readonly installationIds: ReadonlyArray<string>
    /**
     * The receiver-owned operations the owner returned with: each carries the stable command
     * identity its receipt is read under. Absent identities are never guessed from another source.
     */
    readonly operations?: ReadonlyArray<ShellOperationIntent>
}

/** Everything a view of the connected shell needs, and nothing that could change a domain. */
interface AgentOSShellHandle {
    readonly selection: ShellSelection
    readonly session: ShellSessionStanding
    readonly sessionStatus: SessionState["status"]
    readonly blocked: boolean
    readonly sources: ReadonlyArray<ShellSourceObservation>
    readonly readSelection: () => void
    readonly retrySource: (identity: ShellSourceIdentity) => void
    readonly resolveEntry: (
        installationId: string,
        routeKey: ShellRouteKey,
        opaqueItemId: string | null,
    ) => Promise<Outcome<ShellRegisteredDestination>>
    readonly navigationDecision: (outcome: Outcome<ShellRegisteredDestination>) => ShellNavigationDecision
}

/**
 * Own one AgentOS shell selection: its sources, its session standing and its navigation.
 *
 * @param options - The selected workspace and instance, and the installations its sources cover.
 * @returns The connected shell handle. Reads are only ever issued while a session is signed in, and
 *   every read, retry, refresh and return allocates newer read generations for the sources it asks.
 */
export const useAgentOSShell = (options: AgentOSShellOptions): AgentOSShellHandle => {
    const { workspaceId, instanceId } = options
    const installationKey = [...options.installationIds]
        .sort((left, right): number => left.localeCompare(right))
        .join("|")
    const operations = options.operations ?? []
    const operationKey = operations
        .map((operation) => `${operation.installationId} ${operation.intentId} ${operation.commandId}`)
        .sort()
        .join("|")
    const session = useSession()
    const sessionStatus = session.state.status
    const accessToken = useAccessToken()
    // The selection token is derived from the selection itself, so a different AgentOS is always a
    // different token and the same AgentOS keeps one across refreshes and returns.
    const selectionGeneration = `shell-${workspaceId}-${instanceId}`

    const { snapshot, readSelection, retrySource } = useAgentOSShellSources({
        workspaceId,
        instanceId,
        installationKey,
        operationKey,
        operations,
        selectionGeneration,
        sessionStatus,
        accessToken,
    })
    const { resolveEntry, navigationDecision } = useAgentOSShellNavigation({
        accessToken,
        workspaceId,
        instanceId,
        selectionGeneration,
    })

    return {
        selection: { workspaceId, instanceId },
        session: snapshot.session,
        sessionStatus,
        blocked: isShellReadBlocked(snapshot),
        sources: snapshot.sources,
        readSelection,
        retrySource,
        resolveEntry,
        navigationDecision,
    }
}
