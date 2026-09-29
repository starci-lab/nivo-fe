import type { useTranslations } from "next-intl"
import type { Outcome } from "@/modules/api/outcome"
import type { WalletRow, WalletTopUpPayLink } from "@/modules/api/commerce"
import type { PaymentResultView, TopUpView } from "./types"
import { paymentResultCopy, type TopUpSession } from "./waypoint"

type WalletTranslator = ReturnType<typeof useTranslations<"console">>

type WalletOverlayInput = {
    readonly t: WalletTranslator
    readonly isReturn: boolean
    readonly isCancelled: boolean
    readonly stored: TopUpSession | null
    readonly walletAnswer: Outcome<WalletRow> | undefined
    readonly amount: (amountVnd: number) => string
    readonly topUpOpen: boolean
    readonly topUpAmount: string
    readonly topUpPending: boolean
    readonly topUpError: string | undefined
    readonly checkout: WalletTopUpPayLink | undefined
}

/** Derive top-up and provider-return overlay presentation from observed payment evidence. */
export const createWalletOverlayViews = (input: WalletOverlayInput) => {
    const { t, isReturn, isCancelled, stored, walletAnswer, amount, topUpOpen, topUpAmount, topUpPending, topUpError, checkout } = input
    const confirmed =
        stored !== null &&
        walletAnswer?.ok === true &&
        walletAnswer.data.balanceVnd >= stored.startingBalanceVnd + stored.amountVnd
    const resultCopy = paymentResultCopy(isCancelled, confirmed, {
        cancelled: t("wallet.resultCancelled"),
        confirmed: t("wallet.resultConfirmed"),
        pending: t("wallet.resultPending"),
        cancelledNote: t("wallet.resultCancelledNote"),
        confirmedNote: t("wallet.resultConfirmedNote"),
        pendingNote: t("wallet.resultPendingNote"),
    })
    const result: PaymentResultView = {
        overlayState: isReturn ? "open" : "closed",
        title: t("wallet.resultTitle"),
        closeLabel: t("wallet.close"),
        state: resultCopy.state,
        tone: resultCopy.tone,
        amount: stored === null ? t("wallet.amountUnknown") : amount(stored.amountVnd),
        reference: stored?.referenceId,
        note: resultCopy.note,
        actionLabel: t("wallet.backToWallet"),
    }
    const topUp: TopUpView = {
        overlayState: topUpOpen ? "open" : "closed",
        title: t("wallet.topUpTitle"),
        closeLabel: t("wallet.close"),
        amountLabel: t("wallet.amountLabel"),
        amountPlaceholder: t("wallet.amountPlaceholder"),
        hint: t("wallet.topUpHint"),
        submitLabel: t("wallet.continueSePay"),
        amount: topUpAmount,
        pending: topUpPending,
        refusal: topUpError,
        checkout:
            checkout === undefined
                ? undefined
                : {
                      reference: t("wallet.reference", {
                          reference: checkout.referenceId,
                      }),
                      amount: amount(checkout.chargedAmountVnd),
                      note: t("wallet.redirecting"),
                  },
    }
    return { result, topUp }
}
