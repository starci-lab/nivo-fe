import { useAccessToken } from "../auth/useAccessToken"
import { useSession } from "../auth/useSession"
import { readWorkspaceCheckoutStatus, type WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"
import { HOLD_PHASES, phaseOf, POLLING_PHASES } from "@/modules/agentos/purchase-status/phase"
import { purchaseOf } from "@/modules/agentos/purchase-source"
import { useNivoQuery } from "@/hooks/swr/useNivoQuery"
import { workspaceCheckoutStatusQueryKey } from "@/hooks/swr/queries/queries.shared"
import type { Outcome } from "@nivo/api"

const refreshIntervalFor = (answer: Outcome<WorkspaceCheckoutAnswer> | undefined, purchaseId: string): number => {
    if (answer === undefined || !answer.ok) return 0
    const purchase = purchaseOf(answer.data)
    if (purchase === null || purchase.purchaseId !== purchaseId) return 0
    const basePhase = phaseOf(purchase)
    const phase =
        purchase.serviceEligibility?.state === "held" && HOLD_PHASES.has(basePhase)
            ? "service-eligibility-hold"
            : basePhase
    return POLLING_PHASES.has(phase) ? 4000 : 0
}

/** Own the authenticated status read and the session fact that gates the loading surface. */
export const usePurchaseStatusQueries = (purchaseId: string) => {
    const session = useSession()
    const accessToken = useAccessToken()
    const statusQuery = useNivoQuery(
        accessToken === null ? null : workspaceCheckoutStatusQueryKey(purchaseId),
        () => readWorkspaceCheckoutStatus(purchaseId),
        { refreshInterval: (answer) => refreshIntervalFor(answer, purchaseId) },
    )
    return {
        ...statusQuery,
        accessToken,
        sessionRestoring: session.state.status === "restoring",
    }
}
