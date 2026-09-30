"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { RouteLoadingView } from "@nivo/ui"
import { useWalletControlCenter } from "@/hooks/wallet/useWalletControlCenter"
import type { WalletPageState } from "@/modules/wallet/wallet-center/types"
import { WalletControlCenterBase } from "./component"

/** Page architecture context consumed by the connected Wallet block. */
export type WalletControlCenterProps = { readonly [key: string]: never }

const WAYPOINT_KEYS = ["orderId", "invoiceId", "returnTo"] as const

/** Read the route architecture state inside the suspense boundary required by Next. */
const WalletControlCenterConnected = () => {
    const searchParams = useSearchParams()
    const pageState: WalletPageState = WAYPOINT_KEYS.some((key) => searchParams.has(key)) ? "waypoint" : "ordinary"
    const view = useWalletControlCenter(pageState)
    return <WalletControlCenterBase {...view} />
}

/** Connect wallet state and payment actions to the address-driven page composition. */
export const WalletControlCenter = (props: WalletControlCenterProps) => {
    void props
    const t = useTranslations("boundary.loading")
    return (
        <Suspense fallback={<RouteLoadingView props={{ label: t("label") }} />}>
            <WalletControlCenterConnected />
        </Suspense>
    )
}