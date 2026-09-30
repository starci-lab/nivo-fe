import { isRecord, type Outcome } from "@nivo/api"
import { graphqlFields } from "../graphql"
import { collabGatewayDocument } from "./documents"
import { collabFailure, collabOutcomeOfReply, readReply } from "./payload"
import { parseCollabMembershipResult } from "./payload.guards"
import type { CollabMembershipResult, CollabOperation, CollabServed, CollabTransport } from "./types"
/**
 * The default binding: one tagged-request document to the shared core GraphQL endpoint,
 * collabGatewayRead for reads and collabGatewayCommand for writes - the door
 * CollabGatewayResolver serves (sds.collab.chat-gateway rev 4). The request argument
 * is exactly {workspaceId, op, input}; the field's GraphQLJSON payload is the typed
 * outcome itself, read bare rather than through the shared envelope unwrap.
 */
export const collabGatewayTransport: CollabTransport = async ({ accessToken, request }) => {
    const { field, document } = collabGatewayDocument(request.op)
    const answered = await graphqlFields(document, { request }, { accessToken })
    if (!answered.ok) {
        return answered
    }
    const reply = readReply(answered.data[field])
    if (reply === null) {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed", true)
    }
    return collabOutcomeOfReply(reply)
}
let transport: CollabTransport = collabGatewayTransport

/**
 * Bind the transport every Collab call travels on.
 *
 * THE MODULE-SIDE DOOR, beside {@link setCollabLocaleReader}: a component binds through the
 * `useCollabTransportFrom` hook (`@/hooks`), while a `modules/` owner calls this setter
 * directly.
 *
 * @param next - The transport in force from here on.
 */
export const setCollabTransport = (next: CollabTransport) => {
    transport = next
}

/** Send one tagged member request and preserve the boundary's own failure vocabulary. */
export const collabRequest = async <T>(
    accessToken: string,
    workspaceId: string,
    op: CollabOperation,
    input: Readonly<Record<string, unknown>>,
    pick: (result: Record<string, unknown>) => T | null,
): Promise<Outcome<T>> => {
    if (accessToken === "") {
        return collabFailure("unauthenticated", "COLLAB_UNAUTHENTICATED", "sign-in required", false)
    }
    if (workspaceId === "") {
        return collabFailure("invalid", "COLLAB_INVALID", "workspaceId required", false)
    }
    let served: Outcome<CollabServed>
    try {
        served = await transport({ accessToken, request: { workspaceId, op, input } })
    } catch {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "transport threw", true)
    }
    if (!served.ok) {
        return served
    }
    try {
        const data = pick(served.data.result)
        // An ok outcome whose result record is not the op's own shape is
        // untrusted wire data, not a crash: a retryable unknown, never success.
        if (data === null) {
            return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed result", true)
        }
        return { ok: true, data }
    } catch {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed result", true)
    }
}

/** One named field of an ok result record, or a thrown malformed marker. */
export const readResultField = (result: Record<string, unknown>, field: string): Record<string, unknown> => {
    const value = result[field]
    if (!isRecord(value)) {
        throw new Error(`${field} result missing`)
    }
    return value
}

/** The `membership` result record of a member command, or null when malformed. */
export const readMembershipResult = (result: Record<string, unknown>): CollabMembershipResult | null =>
    parseCollabMembershipResult(result.membership)

/* ------------------------------------------------------------------ */
/* Operation helpers - the exported vocabulary, one fn per named op.  */
/* Every call carries the same scope pair plus its own named input.   */
/* ------------------------------------------------------------------ */
