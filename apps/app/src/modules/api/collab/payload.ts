import { failed, isRecord, type FailureKind, type Outcome } from "@nivo/api"
import { isCollabFailureKind, parseCollabOperation } from "./payload.guards"
import type { CollabFailureKind, CollabOperation, CollabServed } from "./types"

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

/**
 * Narrow one generated GraphQL operation result and preserve the boundary's failure vocabulary.
 */
export const collabOutcomeOfReply = (value: unknown, expected: CollabOperation): Outcome<CollabServed> => {
    if (!isRecord(value) || typeof value.ok !== "boolean") {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed", true)
    }
    if (value.ok) {
        const op = parseCollabOperation(value.op)
        return op === expected && isRecord(value.result)
            ? { ok: true, data: { op, result: value.result } }
            : collabFailure("unknown", "COLLAB_UNKNOWN", "malformed", true)
    }
    const failure = value.failure
    if (
        !isRecord(failure) ||
        !isCollabFailureKind(failure.kind) ||
        typeof failure.reason !== "string" ||
        typeof failure.retryable !== "boolean"
    ) {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed", true)
    }
    const failureOperation = failure.op === null ? null : parseCollabOperation(failure.op)
    if (failure.op !== null && (failureOperation === null || failureOperation !== expected)) {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed", true)
    }
    return collabFailure(
        failure.kind,
        `COLLAB_${failure.kind.toUpperCase()}`,
        failure.reason,
        failure.retryable,
    )
}
