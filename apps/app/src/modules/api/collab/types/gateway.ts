import type { CollabOperation } from './operation'

/** Failure categories returned by the Collab gateway boundary. */
export type CollabFailureKind = "unauthenticated" | "denied" | "invalid" | "conflict" | "unavailable" | "unknown"

/** One typed refusal inside the boundary; `retryable` separates transient from final. */
type CollabFailure = {
    /** The operation that failed, when one resolved before the failure. */
    readonly op: CollabOperation | null
    readonly kind: CollabFailureKind
    readonly reason: string
    readonly retryable: boolean
}

/** The tagged member request the ingress resolves against one verified member identity. */
export type CollabGatewayRequest = {
    readonly workspaceId: string
    readonly op: CollabOperation
    readonly input: Readonly<Record<string, unknown>>
}

/**
 * The tagged reply the gateway returns. `op` echoes the operation answered so a
 * caller can never mistake which request a page belongs to.
 */
export type CollabGatewayReply =
    | {
          readonly ok: true
          readonly op: CollabOperation
          readonly result: Record<string, unknown>
      }
    | {
          readonly ok: false
          readonly failure: CollabFailure
      }

/* ------------------------------------------------------------------ */
/* Wire projections - mirror impl.collab.nivo-backend.*, read-only FE.  */
/* ------------------------------------------------------------------ */

/** Public projection of the workspace's one Office group. */
