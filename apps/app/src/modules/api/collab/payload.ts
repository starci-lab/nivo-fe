import { failed, isRecord, type FailureKind, type Outcome } from "@nivo/api"
import { isCollabFailureKind, parseCollabOperation } from "./payload.guards"
import type { CollabFailureKind, CollabGatewayReply, CollabServed } from "./types"

const COLLAB_FAILURE_KIND_MAP: Readonly<Record<CollabFailureKind, FailureKind>> = {
    unauthenticated: "refused",
    denied: "forbidden",
    invalid: "invalid",
    conflict: "invalid",
    unavailable: "unavailable",
    unknown: "unavailable",
}

/** Maps the boundary failure vocabulary into the shared app outcome. */
export const collabFailure = (kind: CollabFailureKind, code: string, reason: string, retryable: boolean) =>
    failed(COLLAB_FAILURE_KIND_MAP[kind], { code, reason, retryable })

/** Checks untrusted GraphQL JSON against the Collab gateway reply shape. */
export const readReply = (value: unknown): CollabGatewayReply | null => {
    if (!isRecord(value) || typeof value.ok !== "boolean") {
        return null
    }
    if (value.ok === true) {
        const op = parseCollabOperation(value.op)
        return op !== null && isRecord(value.result) ? { ok: true, op, result: value.result } : null
    }
    const failure = value.failure
    if (
        isRecord(failure) &&
        isCollabFailureKind(failure.kind) &&
        typeof failure.reason === "string" &&
        typeof failure.retryable === "boolean"
    ) {
        return {
            ok: false,
            failure: {
                op: parseCollabOperation(failure.op),
                kind: failure.kind,
                reason: failure.reason,
                retryable: failure.retryable,
            },
        }
    }
    return null
}

/**
 * What one reply of the gateway says, as the shared outcome: the served operation and its result
 * record, or the failure kind the gateway stated under its own `COLLAB_<KIND>` code.
 */
export const collabOutcomeOfReply = (reply: CollabGatewayReply): Outcome<CollabServed> => {
    if (reply.ok) {
        return { ok: true, data: { op: reply.op, result: reply.result } }
    }
    return collabFailure(
        reply.failure.kind,
        `COLLAB_${reply.failure.kind.toUpperCase()}`,
        reply.failure.reason,
        reply.failure.retryable,
    )
}

/**
 * The default binding: one tagged-request document to the shared core GraphQL endpoint,
 * `collabGatewayRead` for reads and `collabGatewayCommand` for writes - the door
 * `CollabGatewayResolver` serves (`sds.collab.chat-gateway` rev 4). The request argument
 * is exactly `{workspaceId, op, input}`; the field's GraphQLJSON payload is the typed
 * outcome itself, read bare rather than through the shared envelope unwrap.
 */
