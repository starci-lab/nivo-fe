"use client"

import { useAccessToken, useQueryWorkspaceCheckoutStatusSwr, useSession } from "@/hooks"

/** Own the authenticated status read and the session fact that gates the loading surface. */
export const usePurchaseStatusQueries = (purchaseId: string) => {
    const session = useSession()
    const accessToken = useAccessToken()
    const statusQuery = useQueryWorkspaceCheckoutStatusSwr(purchaseId, accessToken !== null)
    return {
        ...statusQuery,
        accessToken,
        sessionRestoring: session.state.status === "restoring",
    }
}
