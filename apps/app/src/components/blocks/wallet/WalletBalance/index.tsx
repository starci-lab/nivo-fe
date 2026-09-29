import { Button, SurfaceCard, Text } from "@starci/grammar/common"
import type { BalanceSectionView, WalletControlCenterActions, WalletFactRow } from "@/modules/wallet/wallet-center/types"

const RESTING_FACTS: ReadonlyArray<WalletFactRow> = [
    { id: "resting-1", label: "", value: "" },
    { id: "resting-2", label: "", value: "" },
]

const factRow = (row: WalletFactRow, isLoading: boolean) => (
    <div key={row.id}>
        <Text size="sm" isSkeleton={isLoading}>
            {row.label}
        </Text>
        <Text size="sm" isSkeleton={isLoading}>
            {row.value}
        </Text>
    </div>
)

type WalletBalanceProps = {
    readonly balance: BalanceSectionView
    readonly on?: WalletControlCenterActions
}

/** Draw balance evidence and its top-up action. */
export const WalletBalance = (props: WalletBalanceProps) => {
    const { balance, on } = props
    if (balance.phase === "refused")
        return (
            <SurfaceCard label={balance.label}>
                <div>
                    <Text size="sm" tone="muted">
                        {balance.note}
                    </Text>
                </div>
            </SurfaceCard>
        )
    const loading = balance.phase === "resting"
    const facts = loading ? RESTING_FACTS : balance.facts
    return (
        <SurfaceCard label={balance.label}>
            <div>
                <div>{facts.map((row) => factRow(row, loading))}</div>
                {
                    <div>
                        {[
                            <Button key="item-0" variant="primary" isSkeleton={loading} onPress={on?.topUp}>
                                {balance.actionLabel}
                            </Button>,
                        ]}
                    </div>
                }
            </div>
        </SurfaceCard>
    )
}
