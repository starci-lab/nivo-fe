import { Text } from "@starci/grammar/common"
import type { WalletFactRow as WalletFactRowData } from "@/modules/wallet/wallet-center/types"

/** Props for one wallet fact and its optional loading state. */
type WalletFactProps = {
    readonly row: WalletFactRowData
    readonly isLoading?: boolean
}

/** Render a wallet fact pair with matching skeleton treatment on both values. */
export const WalletFact = (props: WalletFactProps) => {
    const { row, isLoading = false } = props
    return (
        <div>
            <Text size="sm" isSkeleton={isLoading}>
                {row.label}
            </Text>
            <Text size="sm" isSkeleton={isLoading}>
                {row.value}
            </Text>
        </div>
    )
}
