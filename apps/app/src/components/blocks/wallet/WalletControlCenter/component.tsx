import { Breadcrumbs } from "@nivo/ui"
import { Heading } from "@starci/grammar/common"
import { WalletBalance } from "@/components/blocks/wallet/WalletBalance"
import { WalletTopUp } from "@/components/blocks/wallet/WalletTopUp"
import { WalletTransactionList } from "@/components/blocks/wallet/WalletTransactionList"
import type { WalletControlCenterViewProps } from "@/modules/wallet/wallet-center/types"

export type { WalletControlCenterViewProps } from "@/modules/wallet/wallet-center/types"
/** Complete pure view model consumed by the wallet page composition. */
export type WalletControlCenterProps = WalletControlCenterViewProps

const sectionLabel = (label: string) => (
    <div>
        <Heading level={3}>{label}</Heading>
    </div>
)

/** Compose balance, ledger and payment blocks for the selected wallet page architecture. */
export const WalletControlCenterBase = (props: WalletControlCenterProps) => {
    const { title, balance, transactions, invoices, topUp, result, on } = props
    const breadcrumb = props.state === "waypoint" ? props.breadcrumb : undefined
    const linkedInvoice = props.state === "waypoint" ? props.linkedInvoice : undefined
    const path =
        breadcrumb === undefined ? undefined : (
            <Breadcrumbs
                props={{
                    mode: "back",
                    label: breadcrumb.label,
                    backLabel: breadcrumb.backLabel,
                }}
                on={{
                    back: on?.openOrder,
                }}
            />
        )
    return (
        <>
            <div>
                {path}
                {sectionLabel(title)}
                <WalletBalance balance={balance} on={on} />
                <WalletTransactionList
                    transactions={transactions}
                    invoices={invoices}
                    linkedInvoice={linkedInvoice}
                    closeLabel={topUp.closeLabel}
                    on={on}
                />
            </div>
            <WalletTopUp topUp={topUp} result={result} on={on} />
        </>
    )
}
