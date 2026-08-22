"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { WalletPageBase, type WalletPageState } from "./component"

const WAYPOINT_KEYS = ["orderId", "invoiceId", "returnTo"] as const

/** Resolve the route-owned architecture axis inside the boundary required by Next prerendering. */
const WalletPageSearchState = () => {
    const searchParams = useSearchParams()
    const pageState: WalletPageState = WAYPOINT_KEYS.some((key) => searchParams.has(key)) ? "waypoint" : "ordinary"
    return <WalletPageBase pageState={pageState} />
}

/** Connect only the page architecture axis; WalletControlCenter owns every local block and overlay condition. */
export const WalletPage = () => (
    <Suspense fallback={null}>
        <WalletPageSearchState />
    </Suspense>
)

/** Source-level tier marker for the connected Wallet page. */
export const meta = { shape: "page", world: "connected" } as const
