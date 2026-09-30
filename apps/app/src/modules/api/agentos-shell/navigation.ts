import { failed, type Failure, type Outcome } from "../outcome"
import { isText, isUuid } from "./identity"
import { isRecord } from "../wire"
import { sendShellRequest, shellRouteUrl, unreadableReply, unsupportedRequest } from "./transport"
import { authoredDestination, refusalFor } from "./narrow"
import { AGENTOS_SHELL_NAVIGATION_OPERATION, SHELL_RETURN_ROUTE_NAME } from "./types"
import type { ShellNavigationScope, ShellRegisteredDestination } from "./types"

/**
 * The failure a navigation reply states instead of a destination, or null when it states one.
 *
 * The three failure kinds are read from their own `kind`; none of them is ever read as a partial
 * destination.
 *
 * @param body - The arrived, record-shaped reply.
 * @param status - The status Core stated the reply under.
 * @returns The failure, or null when the reply states a destination.
 */
const navigationFailure = (body: Record<string, unknown>, status: number): Failure | null => {
    if (body.kind === "unavailable")
        return failed("unavailable", {
            status,
            code: "NAVIGATION_UNAVAILABLE",
            reason: isText(body.reason) ? body.reason : "navigation-unavailable",
        })
    if (body.kind === "unsupported")
        return failed("invalid", {
            status,
            code: "NAVIGATION_UNSUPPORTED",
            reason: isText(body.reason) ? body.reason : "navigation-unsupported",
        })
    if (body.kind === "registered_destination") return null
    return unreadableReply(status, "unreadable-navigation-answer")
}

/**
 * Resolve one registered navigation destination.
 *
 * The only request this client can make that is not a read. It resolves a destination NAME for an
 * already-authorized entry and carries no command, operation or effect field, so it cannot be
 * widened into a mutation; a caller that wants an effect calls the owning module's own operation.
 *
 * @param accessToken - Volatile Bearer token, or null when the session minted none.
 * @param scope - The exact selection, registered route key and optional opaque item identity.
 * @returns The registered destination, or the failure that says why it may not be opened. A
 *   destination resolved for a selection that is no longer displayed is `OBSOLETE_SELECTION`.
 */
export const resolveAgentosShellNavigation = async (
    accessToken: string | null,
    scope: ShellNavigationScope,
): Promise<Outcome<ShellRegisteredDestination>> => {
    if (!isUuid(scope.installationId) || scope.selectionGeneration.length === 0)
        return unsupportedRequest("invalid-navigation-intent")
    if (
        scope.routeKey !== "module_home" &&
        scope.routeKey !== "attention_item" &&
        scope.routeKey !== "result_item" &&
        scope.routeKey !== "operation_entry"
    )
        return unsupportedRequest("route-key-unsupported")
    const wantsItem = scope.routeKey === "attention_item" || scope.routeKey === "result_item"
    if (wantsItem !== (scope.opaqueItemId !== null)) return unsupportedRequest("invalid-navigation-intent")
    const intent = {
        workspaceId: scope.workspaceId,
        instanceId: scope.instanceId,
        installationId: scope.installationId,
        routeKey: scope.routeKey,
        opaqueItemId: scope.opaqueItemId,
        selectionGeneration: scope.selectionGeneration,
        returnContext: {
            routeName: SHELL_RETURN_ROUTE_NAME,
            workspaceId: scope.workspaceId,
            instanceId: scope.instanceId,
            installationId: scope.installationId,
        },
    }
    const url = shellRouteUrl(scope, `/operations/${encodeURIComponent(AGENTOS_SHELL_NAVIGATION_OPERATION)}`)
    const sent = await sendShellRequest(url, accessToken, { method: "POST", json: intent })
    if (!sent.arrived) return sent.failure
    const refusal = refusalFor(sent.reply)
    if (refusal !== null) return refusal
    const body = sent.reply.body
    if (!isRecord(body)) return unreadableReply(sent.reply.status, "unreadable-navigation-answer")
    const failure = navigationFailure(body, sent.reply.status)
    if (failure !== null) return failure
    // A destination resolved for a selection that is no longer displayed is never opened.
    if (body.selectionGeneration !== scope.selectionGeneration)
        return failed("invalid", {
            status: sent.reply.status,
            code: "OBSOLETE_SELECTION",
            reason: "obsolete-selection",
        })
    const destination = authoredDestination(body.destination, scope)
    if (destination === null) return unreadableReply(sent.reply.status, "unregistered-destination")
    if (destination.installationId !== scope.installationId)
        return unreadableReply(sent.reply.status, "unregistered-destination")
    return { ok: true, data: destination }
}
