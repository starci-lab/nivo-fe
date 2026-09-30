import { WalletControlCenter } from "@/components/blocks/wallet/WalletControlCenter"

/** Empty route input; the wallet reads its payment return state from the address. */
export type WalletPageProps = { readonly [key: string]: never }

/** Compose the interactive wallet block below the server route. */
export const WalletPage = (props: WalletPageProps) => {
    void props
    return <WalletControlCenter />
}

export default WalletPage