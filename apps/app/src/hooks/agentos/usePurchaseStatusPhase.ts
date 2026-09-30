import type { WorkspaceCheckoutPurchaseStatusFieldsFragment } from "@/modules/api/__generated__/core"

import { useCallback } from "react"
import useProvisioningRealtime from "../realtime/useProvisioningRealtime"
import { type ProvisioningTarget } from "../realtime/realtime.shared"
import { useEventRevalidationSwr } from "../swr/useEventRevalidationSwr"
import type { WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"
import { settle, type Outcome } from "@nivo/api"
import {
    HOLD_PHASES,
    phaseOf,
    POLLING_PHASES,
    PROVISIONING_PHASES,
    type PurchasePhase,
} from "@/modules/agentos/purchase-status/phase"
import { purchaseOf } from "@/modules/agentos/purchase-source"

type UsePurchaseStatusPhaseInput = {
    readonly purchaseId: string
    readonly surface?: "provisioning"
    readonly answer: Outcome<WorkspaceCheckoutAnswer> | undefined
    readonly error: Error | undefined
    readonly sessionRestoring: boolean
    readonly accessToken: string | null
    readonly purchaseOverride: WorkspaceCheckoutPurchaseStatusFieldsFragment | null
    readonly refreshStatus: () => Promise<unknown>
    readonly statusValidating: boolean
    readonly recovering: boolean

}

/** Resolve the confirmed phase and own its realtime, polling and reconnect lifecycle. */
export const usePurchaseStatusPhase = ({
    purchaseId,
    surface,
    answer,
    error,
    sessionRestoring,
    accessToken,
    purchaseOverride,
    refreshStatus,
    statusValidating,
    recovering,
}: UsePurchaseStatusPhaseInput) => {
    const statusPurchase = answer !== undefined && answer.ok ? purchaseOf(answer.data) : null
    const purchase = purchaseOverride ?? statusPurchase
    const readyWorkspaceId =
        purchase !== null && purchase.readiness.state === "ready" && purchase.readiness.reference !== null
            ? purchase.readiness.reference
            : null
    const basePhase: PurchasePhase =
        sessionRestoring || (answer === undefined && error === undefined)
            ? "loading"
            : purchase === null || purchase.purchaseId !== purchaseId
              ? "denied"
              : phaseOf(purchase)
    const pinnedPhase = basePhase === "paid" && surface === "provisioning" ? "queued" : basePhase
    const phase: PurchasePhase =
        purchase !== null && purchase.serviceEligibility?.state === "held" && HOLD_PHASES.has(pinnedPhase)
            ? "service-eligibility-hold"
            : pinnedPhase
    const target: ProvisioningTarget | null =
        readyWorkspaceId !== null
            ? { kind: "workspace", id: readyWorkspaceId }
            : POLLING_PHASES.has(phase)
              ? { kind: "order", id: purchaseId }
              : null
    const realtime = useProvisioningRealtime({ accessToken, target })
    const reconcile = useCallback(async (): Promise<void> => {
        // A failed re-read keeps the last confirmed purchase truth on screen, so its outcome is not read.
        await settle(refreshStatus)
    }, [refreshStatus])
    const event = realtime.status === "event" ? realtime.event : undefined
    const eventKey =
        event === undefined
            ? undefined
            : "updatedAt" in event
              ? `${event.kind}:${event.id}:${event.updatedAt}`
              : `${event.kind}:${event.id}:${event.status}`
    const relevantEvent =
        eventKey !== undefined &&
        ((event?.kind === "order" && event.id === purchaseId) ||
            (event?.kind === "workspace" && readyWorkspaceId !== null && event.id === readyWorkspaceId))

    const refreshSignal = relevantEvent
        ? ["purchase-status", purchaseId, "event", eventKey ?? ""]
        : realtime.status === "connected" && phase !== "loading" && phase !== "denied"
          ? ["purchase-status", purchaseId, "connected", phase]
          : null
    useEventRevalidationSwr(refreshSignal, reconcile)

    return {
        purchase,
        readyWorkspaceId,
        phase,
        onProvisioningSurface: PROVISIONING_PHASES.has(phase),
        reconciling: statusValidating || recovering,
        reconcile,
    }
}
