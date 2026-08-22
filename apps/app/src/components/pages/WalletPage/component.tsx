import { WalletControlCenter } from "@/components/blocks/wallet/WalletControlCenter"

/** Architectural states of the Wallet route. */
export type WalletPageState = "ordinary" | "waypoint"

/** Page-owned input; child payment, ledger, balance, and overlay data stay inside WalletControlCenter. */
export type WalletPageViewProps = { readonly pageState: WalletPageState }

/** Compose the connected Wallet block without proxying any block state or request data through PageProps. */
export const WalletPageBase = ({ pageState }: WalletPageViewProps) => (
    <WalletControlCenter pageState={pageState} />
)

/** Source-level tier marker for the pure Wallet page compositor. */
export const meta = { shape: "page", world: "pure" } as const
