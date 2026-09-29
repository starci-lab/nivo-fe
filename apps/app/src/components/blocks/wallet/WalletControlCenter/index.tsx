"use client"

import { useWalletControlCenter } from "@/hooks/wallet/useWalletControlCenter"
import type { WalletPageState } from "@/modules/wallet/wallet-center/types"
import { WalletControlCenterBase } from "./component"

/** Page architecture context consumed by the connected Wallet block. */
export type WalletControlCenterProps = {
    readonly pageState: WalletPageState
}

/** Connect wallet data and payment actions to its pure page composition. */
export const WalletControlCenter = (props: WalletControlCenterProps) => {
    const view = useWalletControlCenter(props.pageState)
    return <WalletControlCenterBase {...view} />
}
