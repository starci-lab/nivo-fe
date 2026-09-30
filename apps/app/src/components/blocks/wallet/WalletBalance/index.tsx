import { Button, SurfaceCard, Text } from "@starci/grammar/common"
import type { BalanceSectionView, WalletControlCenterActions, WalletFactRow } from "@/modules/wallet/wallet-center/types"
import { WalletFact } from "../WalletFact"

const RESTING_FACTS: ReadonlyArray<WalletFactRow> = [
    { id: "resting-1", label: "", value: "" },
    { id: "resting-2", label: "", value: "" },
]

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
                <div>
                    {facts.map((row) => (
                        <WalletFact key={row.id} row={row} isLoading={loading} />
                    ))}
                </div>
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
