import type { BadgeTone } from "@starci/grammar/common"
import type { NivoQueryFailure } from "@/modules/query"

/** One already-formatted label and value used by wallet evidence surfaces. */
export type WalletControlCenterProps = WalletControlCenterViewProps
/** Public API role for WalletFactRow. */
export type WalletFactRow = {
    readonly id: string
    readonly label: string
    readonly value: string
}
/** Settled presentation state of the balance surface. */
export type BalanceSectionView =
    | {
          readonly phase: "resting"
          readonly label: string
          readonly actionLabel: string
      }
    | {
          readonly phase: "answered" | "empty"
          readonly label: string
          readonly actionLabel: string
          readonly facts: ReadonlyArray<WalletFactRow>
      }
    | {
          readonly phase: "failed"
          readonly label: string
          readonly failure: NivoQueryFailure
      }
/** One movement or invoice row with the complete evidence its detail drawer reveals. */
export type WalletLedgerRow = {
    readonly id: string
    readonly title: string
    readonly caption: string
    readonly amount: string
    readonly state: string
    readonly tone: BadgeTone
    readonly detailLabel: string
    readonly detailFacts: ReadonlyArray<WalletFactRow>
    readonly note?: string
}
/** Settled presentation state of one joined wallet ledger. */
export type LedgerSectionView =
    | {
          readonly phase: "resting"
          readonly label: string
      }
    | {
          readonly phase: "empty"
          readonly label: string
          readonly note: string
      }
    | {
          readonly phase: "failed"
          readonly label: string
          readonly failure: NivoQueryFailure
          readonly source: "transactions" | "invoices"
      }
    | {
          readonly phase: "answered"
          readonly label: string
          readonly rows: ReadonlyArray<WalletLedgerRow>
          readonly actionLabel?: string
      }
/** Exact AgentOS invoice singled out from the ordinary Wallet ledger. */
export type LinkedInvoiceSectionView =
    | {
          readonly phase: "resting"
          readonly label: string
          readonly orderLabel: string
      }
    | {
          readonly phase: "refused"
          readonly label: string
          readonly note: string
      }
    | {
          readonly phase: "failed"
          readonly label: string
          readonly orderLabel: string
          readonly failure: NivoQueryFailure
          readonly source: "wallet" | "invoices"
      }
    | {
          readonly phase: "answered"
          readonly label: string
          readonly orderLabel: string
          readonly row: WalletLedgerRow
          readonly actionLabel: string
          readonly actionKind: "pay" | "return"
          readonly actionDisabled: boolean
          readonly consequence: string
      }
/** Path context shown only while Wallet is the waypoint of one exact AgentOS order. */
type WalletBreadcrumbView = {
    readonly label: string
    readonly backLabel: string
}
/** Controlled state and copy for the top-up modal. */
export type TopUpView = {
    readonly overlayState: "closed" | "open"
    readonly title: string
    readonly closeLabel: string
    readonly amountLabel: string
    readonly amountPlaceholder: string
    readonly hint: string
    readonly submitLabel: string
    readonly amount: string
    readonly pending: boolean
    readonly refusal?: string
    readonly checkout?: {
        readonly reference: string
        readonly amount: string
        readonly note: string
    }
}
/** Honest provider-return state shown after balance reconciliation. */
export type PaymentResultView = {
    readonly overlayState: "closed" | "open"
    readonly title: string
    readonly closeLabel: string
    readonly state: string
    readonly tone: BadgeTone
    readonly amount: string
    readonly reference?: string
    readonly note: string
    readonly actionLabel: string
}
/** User outcomes reported from the pure wallet drawing. */
export type WalletControlCenterActions = {
    readonly retryWallet?: () => void
    readonly retryInvoices?: () => void
    readonly retryTransactions?: () => void
    readonly topUp?: () => void
    readonly closeTopUp?: () => void
    readonly changeTopUpAmount?: (value: string) => void
    readonly submitTopUp?: () => void
    readonly closeResult?: () => void
    readonly payInvoice?: () => void
    readonly openOrder?: () => void
    readonly returnToOrder?: () => void
}
type WalletPageSharedViewProps = {
    readonly title: string
    readonly balance: BalanceSectionView
    readonly transactions: LedgerSectionView
    readonly invoices: LedgerSectionView
    readonly topUp: TopUpView
    readonly result: PaymentResultView
    readonly on?: WalletControlCenterActions
}
/** Architectural state of the complete Wallet page. */
export type WalletPageState = "ordinary" | "waypoint"
/** Complete pure input for the accepted wallet/payment flow. */
export type WalletControlCenterViewProps =
    | (WalletPageSharedViewProps & {
          readonly state: "ordinary"
          readonly breadcrumb?: never
          readonly linkedInvoice?: never
      })
    | (WalletPageSharedViewProps & {
          readonly state: "waypoint"
          readonly breadcrumb?: WalletBreadcrumbView
          readonly linkedInvoice: LinkedInvoiceSectionView
      })
