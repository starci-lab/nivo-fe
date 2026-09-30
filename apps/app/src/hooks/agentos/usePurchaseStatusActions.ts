import type { WorkspaceCheckoutPurchaseStatusFieldsFragment, WorkspacePurchaseEntryInput } from "@/modules/api/__generated__/core"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useMutateRecoverWorkspacePurchaseSwr } from "../swr/mutations/useMutateRecoverWorkspacePurchaseSwr"
import { useQueryWorkspaceCheckoutEntrySwr } from "../swr/queries/useQueryWorkspaceCheckoutEntrySwr"
import { useRouter } from "../i18n/useRouter"
import type { WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"
import { settle, type Outcome } from "@nivo/api"
import type { PurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"
import { entryPathOf, observedIdentitiesOf, purchaseOf } from "@/modules/agentos/purchase-source"
import { newWorkspace, newWorkspaceCheckout, purchaseProvisioning, workspaces } from "@/modules/routes"

type UsePurchaseStatusActionsInput = {
    readonly purchaseId: string
    readonly surface?: "provisioning"
    readonly statusAnswer: Outcome<WorkspaceCheckoutAnswer> | undefined
    readonly statusPurchase: WorkspaceCheckoutPurchaseStatusFieldsFragment | null
    readonly copy: PurchaseStatusCopy
    readonly refreshStatus: () => Promise<unknown>

}

type EntryTarget = {
    readonly purchaseId: string
    readonly workspaceId: string
    readonly answer: Outcome<WorkspaceCheckoutAnswer> | undefined
}

type ActionFeedback = {
    readonly answer: Outcome<WorkspaceCheckoutAnswer> | undefined
    readonly purchaseOverride?: WorkspaceCheckoutPurchaseStatusFieldsFragment
    readonly recoverRefusal?: string
}

/** Own entry resolution, recovery and the purchase-status surface's user actions. */
export const usePurchaseStatusActions = ({
    purchaseId,
    surface,
    statusAnswer,
    statusPurchase,
    copy,
    refreshStatus,
}: UsePurchaseStatusActionsInput) => {
    const router = useRouter()
    const recoverPurchase = useMutateRecoverWorkspacePurchaseSwr()
    const [entryTarget, setEntryTarget] = useState<EntryTarget | null>(null)
    const [feedback, setFeedback] = useState<ActionFeedback | null>(null)
    const [pinnedSurface, setPinnedSurface] = useState<{ readonly purchaseId: string; readonly surface: "provisioning" } | null>(null)
    const feedbackForAnswer = feedback?.answer === statusAnswer ? feedback : null
    const entryPurchaseOverride = feedbackForAnswer?.purchaseOverride
    const preliminaryPurchase = entryPurchaseOverride ?? statusPurchase
    const readyWorkspaceId =
        preliminaryPurchase !== null &&
        preliminaryPurchase.readiness.state === "ready" &&
        preliminaryPurchase.readiness.reference !== null
            ? preliminaryPurchase.readiness.reference
            : null
    const entryRequest = useMemo<WorkspacePurchaseEntryInput>(
        () => ({
            purchaseId,
            workspaceId: readyWorkspaceId ?? "",
            returnContext: { name: "workspace-dashboard", version: "1" },
        }),
        [purchaseId, readyWorkspaceId],
    )
    const entryEnabled =
        entryTarget !== null &&
        entryTarget.purchaseId === purchaseId &&
        entryTarget.workspaceId === readyWorkspaceId &&
        entryTarget.answer === statusAnswer &&
        readyWorkspaceId !== null
    const entryQuery = useQueryWorkspaceCheckoutEntrySwr(entryRequest, entryEnabled)
    const settledEntryAnswer = entryEnabled && !entryQuery.isValidating ? entryQuery.data : undefined
    const entryResult = settledEntryAnswer?.ok ? settledEntryAnswer.data : null
    const entryPath =
        entryResult?.status === "entry" &&
        entryResult.workspaceId === readyWorkspaceId &&
        entryResult.destination.workspaceId === readyWorkspaceId
            ? entryPathOf(entryResult.destination)
            : null

    useEffect(() => {
        if (entryPath !== null) router.push(entryPath)
    }, [entryPath, router])

    let entryRefusal: string | null = null
    if (settledEntryAnswer !== undefined) {
        if (!settledEntryAnswer.ok) entryRefusal = settledEntryAnswer.reason
        else if (entryResult?.status === "entry" && entryPath === null) entryRefusal = copy.entryConflictNotice
        else if (entryResult?.status === "not-ready") entryRefusal = copy.entryNotReadyNotice
        else if (entryResult?.status === "refused" || entryResult?.status === "unavailable")
            entryRefusal = copy.entryRefusalLabel(entryResult.code)
        else if (entryResult?.status !== "entry") entryRefusal = copy.entryConflictNotice
    }
    const purchaseOverride =
        feedbackForAnswer?.purchaseOverride ??
        (entryResult?.status === "not-ready" ? entryResult.purchase : null)
    const purchase = purchaseOverride ?? statusPurchase
    const recoverRefusal = feedbackForAnswer?.recoverRefusal ?? null
    const surfacePinned = pinnedSurface?.purchaseId === purchaseId ? pinnedSurface.surface : surface
    const entryPending = entryEnabled && (entryQuery.isValidating || entryQuery.data === undefined)

    const reconcile = useCallback(async (): Promise<void> => {
        // The last confirmed purchase remains the view's source of truth, so the outcome is not read.
        await settle(refreshStatus)
    }, [refreshStatus])
    const recover = useCallback(async (): Promise<void> => {
        if (purchase === null || recoverPurchase.isMutating) return
        setEntryTarget(null)
        setFeedback({ answer: statusAnswer })
        const response = await recoverPurchase.trigger({ purchaseId, lastObserved: observedIdentitiesOf(purchase) })
        if (!response.ok) {
            setFeedback({ answer: statusAnswer, recoverRefusal: response.reason })
            return
        }
        const recovered = purchaseOf(response.data)
        if (recovered !== null) {
            setFeedback({ answer: statusAnswer, purchaseOverride: recovered })
            return
        }
        const refused = response.data
        if (
            refused.status === "conflict" ||
            (refused.status === "refused" &&
                (refused.code === "observed-identity-mismatch" || refused.code === "retry-identity-conflict"))
        ) {
            setFeedback({ answer: statusAnswer, recoverRefusal: copy.entryConflictNotice })
            return
        }
        if (refused.status === "refused") {
            const label = copy.entryRefusalLabel(refused.code)
            setFeedback({ answer: statusAnswer, recoverRefusal: label === refused.code ? copy.unavailableNotice : label })
            return
        }
        setFeedback({ answer: statusAnswer, recoverRefusal: copy.unavailableNotice })
    }, [copy, purchase, purchaseId, recoverPurchase, statusAnswer])

    const returnToList = useCallback(() => router.push(workspaces()), [router])
    const changeOffer = useCallback(() => router.push(newWorkspace()), [router])
    const viewProvisioning = useCallback(() => {
        setPinnedSurface({ purchaseId, surface: "provisioning" })
        router.push(purchaseProvisioning(purchaseId))
    }, [purchaseId, router])
    const enterWorkspace = useCallback(() => {
        if (readyWorkspaceId === null || entryPending) return
        const sameRequest =
            entryTarget?.purchaseId === purchaseId &&
            entryTarget.workspaceId === readyWorkspaceId &&
            entryTarget.answer === statusAnswer
        if (sameRequest) {
            void entryQuery.mutate()
            return
        }
        setEntryTarget({ purchaseId, workspaceId: readyWorkspaceId, answer: statusAnswer })
    }, [entryPending, entryQuery, entryTarget, purchaseId, readyWorkspaceId, statusAnswer])
    const renewEntitlement = useCallback(() => {
        const eligibility = purchase?.serviceEligibility
        const renewal = eligibility?.renewalAction
        if (renewal === null || renewal === undefined) return
        const query = new URLSearchParams({ offer: renewal.offerId, offerVersion: renewal.offerVersion })
        if (eligibility?.reference !== null && eligibility?.reference !== undefined)
            query.set("entitlement", eligibility.reference)
        router.push(newWorkspaceCheckout(query))
    }, [purchase, router])

    return {
        purchase,
        purchaseOverride,
        readyWorkspaceId,
        surfacePinned,
        entryPending,
        entryRefusal,
        recoverRefusal,
        recovering: recoverPurchase.isMutating,
        actions: { reconcile, recover, returnToList, changeOffer, viewProvisioning, enterWorkspace, renewEntitlement },
    }
}
