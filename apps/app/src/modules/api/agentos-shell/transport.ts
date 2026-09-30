import { CORE_API_URL } from "@/modules/config"
import { failed, send, type Failure } from "@nivo/api"
import { OPERATION_ROUTE_PREFIX } from "../operation-route"
import type { ShellArrivedReply, ShellReadScope } from "./types"

/** Build the one registered route address for the selected workspace and instance. */
export const shellRouteUrl = (scope: ShellReadScope, suffix = ""): URL =>
    new URL(
        `${OPERATION_ROUTE_PREFIX}/${encodeURIComponent(scope.workspaceId)}/instances/${encodeURIComponent(scope.instanceId)}${suffix}`,
        CORE_API_URL,
    )

/** Preserve the registered key order while assembling one encoded source query. */
export const keyedQuery = (entries: ReadonlyArray<readonly [string, string]>): string =>
    entries.map(([name, value]) => `${name}=${value}`).join("&")

/** A reply that arrived, and the status Core stated it under. */
type ShellRequest = { readonly method: "GET" | "POST"; readonly json?: unknown }

/** What one registered request settled as: a reply that arrived, or the failure that stopped it. */
type ShellExchange =
    | { readonly arrived: true; readonly reply: ShellArrivedReply }
    | { readonly arrived: false; readonly failure: Failure }

/** A request this client refuses to send: the scope or the intent is outside the registered grammar. */
export const unsupportedRequest = (reason: string): Failure => failed("invalid", { code: "UNSUPPORTED", reason })

/** A reply the registered grammar cannot express; a refusal of this client's own making, not a Core decision. */
export const unreadableReply = (status: number, reason = "unreadable-reply"): Failure =>
    failed("unavailable", { status, code: "UNSUPPORTED_REPLY", reason })

/**
 * Send one registered request and classify what came back.
 *
 * `credentials: "omit"` is load-bearing: the refresh cookie is renewal input for the Core session
 * boundary and is never authorization for this route. A body-carrying request keeps its content type.
 * The route states an unauthenticated request as a 401, which is a session outcome; every other
 * status that still carries a JSON body is a reply the caller reads, because the route names its
 * own refusals in the body.
 *
 * @param url - Fully built registered URL; the access token is never part of it.
 * @param accessToken - The volatile Bearer token, or null when the session minted none.
 * @param request - Method and, for a mutation, the JSON body.
 * @returns Whether an envelope arrived, or the closed reason none did. No request is ever repeated.
 */
export const sendShellRequest = async (
    url: URL,
    accessToken: string | null,
    request: ShellRequest,
): Promise<ShellExchange> => {
    if (accessToken === null || accessToken.length === 0) {
        return {
            arrived: false,
            failure: failed("refused", {
                code: "UNAUTHENTICATED",
                reason: "UNAUTHENTICATED",
            }),
        }
    }
    const sent = await send({
        url: url.toString(),
        method: request.method,
        credentials: "omit",
        accessToken,
        json: request.json,
    })
    if (sent.ok) return { arrived: true, reply: { status: sent.data.status, body: sent.data.body } }
    if (sent.kind === "refused")
        return {
            arrived: false,
            failure: failed("refused", {
                status: sent.status,
                code: "UNAUTHENTICATED",
                reason: "UNAUTHENTICATED",
            }),
        }
    if (sent.status !== null && sent.body !== null)
        return { arrived: true, reply: { status: sent.status, body: sent.body } }
    return { arrived: false, failure: sent }
}
