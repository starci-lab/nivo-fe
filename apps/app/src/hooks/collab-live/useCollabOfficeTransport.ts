
import { useCallback } from "react"
import { reconcileCollabRequest, type CollabReconcileCall, type CollabReconcileOutcome } from "@/modules/api/collab"
import { type Outcome } from "@nivo/api"

/**
 * The Collab Office transport seam the connected page reads directly.
 *
 * It exposes the same-intent reconciliation read a resend consults before it
 * sends anything (`contract.collab.chat`: an intent that already committed is
 * never resent). It stays behind the `@/hooks/collab-live` index so a component never imports runtime
 * values from `@/modules/api/collab`. The reader's language for refusal copy is the
 * one the session binds for every call.
 */
type CollabOfficeTransport = {
    readonly reconcileRequest: (call: CollabReconcileCall) => Promise<Outcome<CollabReconcileOutcome>>
}

/**
 * Hand back the seam a resend consults. Call it once per connected page; the returned read is the
 * same `reconcileRequest` the transport publishes, never a second implementation.
 */
export const useCollabOfficeTransport = (): CollabOfficeTransport => {
    const reconcileRequest = useCallback(
        (call: CollabReconcileCall): Promise<Outcome<CollabReconcileOutcome>> => reconcileCollabRequest(call),
        [],
    )
    return { reconcileRequest }
}
