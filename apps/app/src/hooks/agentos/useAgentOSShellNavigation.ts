/*
 * The AgentOS shell's navigation half (CU-SHELL-CONNECTED).
 *
 * Resolving an entry is a destination read against the registered Core route; deciding what a
 * destination means is the pure navigator's job. Neither touches the observation store, so they
 * live beside it rather than inside it.
 */

import { useCallback } from "react"
import { useLocale } from "next-intl"
import { toLocale } from "@/modules/i18n"
import {
    resolveAgentosShellNavigation,
    type ShellRegisteredDestination,
    type ShellRouteKey,
} from "@/modules/api/agentos-shell"
import { failed, type Outcome } from "@nivo/api"
import { shellNavigationDecision, type ShellNavigationDecision } from "@/modules/agentos/shell-navigation"

/** What the navigation half needs: where the selection lives and who is asking. */
interface AgentOSShellNavigationOptions {
    readonly accessToken: string | null
    readonly workspaceId: string
    readonly instanceId: string
    readonly selectionGeneration: string
}

/** The two navigation verbs the connected shell publishes. */
interface AgentOSShellNavigation {
    readonly resolveEntry: (
        installationId: string,
        routeKey: ShellRouteKey,
        opaqueItemId: string | null,
    ) => Promise<Outcome<ShellRegisteredDestination>>
    readonly navigationDecision: (outcome: Outcome<ShellRegisteredDestination>) => ShellNavigationDecision
}

/**
 * Own entry resolution and the decision over its outcome.
 *
 * @param options - The selection identity and the session's token.
 * @returns `resolveEntry` asks the registered route; `navigationDecision` reads the answer in the
 *   reader's language. Neither replays, guesses or restores anything.
 */
export const useAgentOSShellNavigation = (options: AgentOSShellNavigationOptions): AgentOSShellNavigation => {
    const { accessToken, workspaceId, instanceId, selectionGeneration } = options
    const locale = toLocale(useLocale())

    const resolveEntry = useCallback(
        async (
            installationId: string,
            routeKey: ShellRouteKey,
            opaqueItemId: string | null,
        ): Promise<Outcome<ShellRegisteredDestination>> => {
            if (accessToken === null)
                return failed("refused", {
                    code: "UNAUTHENTICATED",
                    reason: "UNAUTHENTICATED",
                })
            return resolveAgentosShellNavigation(accessToken, {
                workspaceId,
                instanceId,
                installationId,
                routeKey,
                opaqueItemId,
                selectionGeneration,
            })
        },
        [accessToken, instanceId, selectionGeneration, workspaceId],
    )

    const navigationDecision = useCallback(
        (outcome: Outcome<ShellRegisteredDestination>) => shellNavigationDecision(outcome, locale),
        [locale],
    )

    return { resolveEntry, navigationDecision }
}
