"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import {
    useMutateCreateWalletTopUpPayLinkSwr,
    useMutatePayInvoiceSwr,
    usePathname,
    useQueryMyInvoicesSwr,
    useQueryMyWalletSwr,
    useQueryMyWalletTransactionsSwr,
} from "@/hooks"
import { createWalletOverlayViews } from "@/modules/wallet/wallet-center/overlay-views"
import { createWalletSectionViews } from "@/modules/wallet/wallet-center/views"
import { readStored, removeStored, TOP_UP_SESSION_KEY, writeStored } from "@/modules/browser-storage"
import { parseTopUpSession, readWalletWaypoint } from "@/modules/wallet/wallet-center/waypoint"
import { parseCheckoutFields } from "@/modules/wallet/wallet-center/waypoint.guards"
import { initialTopUpInteractionState, type InvoicePaymentState, type TopUpInteractionState } from "@/modules/wallet/wallet-center/interaction"
import type { WalletControlCenterViewProps, WalletPageState } from "@/modules/wallet/wallet-center/types"
import { BILLING_CURRENCY } from "@/modules/config"
import { DEFAULT_LOCALE } from "@/modules/i18n/config"

const subscribeTopUpSession = (onChange: () => void): (() => void) => {
    window.addEventListener("storage", onChange)
    return () => window.removeEventListener("storage", onChange)
}
const readTopUpSessionRaw = (): string | null => readStored("session", TOP_UP_SESSION_KEY)
const readTopUpSessionServer = (): string | null => null

/** Own wallet data, view projection and payment actions for the connected Wallet block. */
export const useWalletControlCenter = (pageState: WalletPageState): WalletControlCenterViewProps => {
    const t = useTranslations("console")
    const format = useFormatter()
    const locale = useLocale()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const storedTopUp = useSyncExternalStore(subscribeTopUpSession, readTopUpSessionRaw, readTopUpSessionServer)
    const route = (path: string) => (locale === DEFAULT_LOCALE ? path : `/${locale}${path}`)
    const waypoint = readWalletWaypoint(searchParams.toString(), locale)
    const wallet = useQueryMyWalletSwr()
    const invoices = useQueryMyInvoicesSwr()
    const transactions = useQueryMyWalletTransactionsSwr()
    const payInvoiceMutation = useMutatePayInvoiceSwr()
    const topUpMutation = useMutateCreateWalletTopUpPayLinkSwr()
    const walletAnswer = wallet.data
    const invoicesAnswer = invoices.data
    const movements = transactions.data
    const [invoicePayment, setInvoicePayment] = useState<InvoicePaymentState>({ pending: false, error: null })
    const [topUp, setTopUp] = useState<TopUpInteractionState>(() => initialTopUpInteractionState(pathname))
    const refresh = useCallback(async () => {
        await Promise.all([wallet.mutate(), invoices.mutate(), transactions.mutate()])
    }, [invoices.mutate, transactions.mutate, wallet.mutate])
    const amount = (amountVnd: number) =>
        format.number(amountVnd, {
            style: "currency",
            currency: BILLING_CURRENCY,
            maximumFractionDigits: 0,
        })
    const day = (iso: string) =>
        format.dateTime(new Date(iso), {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    const sections = createWalletSectionViews({
        walletAnswer,
        invoicesAnswer,
        movements,
        waypoint,
        payingInvoice: invoicePayment.pending,
        paymentError: invoicePayment.error,
        t,
        amount,
        day,
    })
    const payInvoice = async () => {
        if (invoicePayment.pending || invoicesAnswer?.ok !== true) return
        const invoice =
            waypoint === null
                ? undefined
                : invoicesAnswer.data.find(
                      (row) =>
                          row.status === "unpaid" &&
                          (waypoint === undefined ||
                              (row.id === waypoint.invoiceId && row.catalogOrder?.id === waypoint.orderId)),
                  )
        if (invoice === undefined) return
        setInvoicePayment({ pending: true, error: null })
        const paid = await payInvoiceMutation.trigger(invoice.id)
        if (!paid.ok) setInvoicePayment({ pending: true, error: paid.reason })
        else {
            await refresh()
            if (waypoint !== undefined && waypoint !== null) window.location.assign(waypoint.returnTo)
        }
        setInvoicePayment((current) => ({ ...current, pending: false }))
    }
    const submitTopUp = async () => {
        const amountVnd = Number(topUp.amount.replace(/\D/g, ""))
        if (!Number.isSafeInteger(amountVnd) || amountVnd < 10_000) {
            setTopUp((current) => ({ ...current, error: t("wallet.topUpInvalid") }))
            return
        }
        if (walletAnswer?.ok !== true) {
            setTopUp((current) => ({ ...current, error: t("wallet.topUpUnavailable") }))
            return
        }
        setTopUp((current) => ({ ...current, pending: true, error: undefined }))
        const origin = window.location.origin
        const returnUrl = `${origin}${route("/wallet/top-up/return")}`
        const answer = await topUpMutation.trigger({
            amountVnd,
            returnUrl,
            cancelUrl: `${returnUrl}?status=cancelled`,
        })
        if (!answer.ok) {
            setTopUp((current) => ({ ...current, error: answer.reason, pending: false }))
            return
        }
        setTopUp((current) => ({ ...current, checkout: answer.data }))
        writeStored(
            "session",
            TOP_UP_SESSION_KEY,
            JSON.stringify({
                amountVnd,
                startingBalanceVnd: walletAnswer.data.balanceVnd,
                referenceId: answer.data.referenceId,
            }),
        )
        const form = document.createElement("form")
        form.method = "POST"
        form.action = answer.data.checkoutUrl
        const fields = parseCheckoutFields(answer.data.checkoutFields)
        if (fields === null) {
            setTopUp((current) => ({ ...current, error: t("wallet.checkoutInvalid"), pending: false }))
            return
        }
        Object.entries(fields).forEach(([name, value]) => {
            const input = document.createElement("input")
            input.type = "hidden"
            input.name = name
            input.value = value
            form.append(input)
        })
        document.body.append(form)
        form.submit()
    }
    const stored = parseTopUpSession(storedTopUp)
    const overlays = createWalletOverlayViews({
        t,
        isReturn: pathname.endsWith("/wallet/top-up/return"),
        isCancelled: searchParams.get("status") === "cancelled",
        stored,
        walletAnswer,
        amount,
        topUpOpen: topUp.open,
        topUpAmount: topUp.amount,
        topUpPending: topUp.pending,
        topUpError: topUp.error,
        checkout: topUp.checkout,
    })
    const on = {
        topUp: () => setTopUp((current) => ({ ...current, open: true })),
        closeTopUp: () => setTopUp((current) => ({ ...current, open: false })),
        changeTopUpAmount: (value: string) => setTopUp((current) => ({ ...current, amount: value })),
        submitTopUp: () => void submitTopUp(),
        closeResult: () => {
            removeStored("session", TOP_UP_SESSION_KEY)
            window.location.assign(route("/wallet"))
        },
        payInvoice: () => void payInvoice(),
        openOrder:
            waypoint === undefined || waypoint === null ? undefined : () => window.location.assign(waypoint.returnTo),
        returnToOrder:
            waypoint === undefined || waypoint === null ? undefined : () => window.location.assign(waypoint.returnTo),
    }
    const shared = {
        title: t("wallet.title"),
        balance: sections.balance,
        transactions: sections.transactions,
        invoices: sections.invoices,
        topUp: overlays.topUp,
        result: overlays.result,
        on,
    }
    if (pageState === "ordinary" || waypoint === undefined) return { state: "ordinary", ...shared }
    const linkedInvoice = sections.linkedInvoice
    if (linkedInvoice === undefined) return { state: "ordinary", ...shared }
    const breadcrumb =
        waypoint === null
            ? undefined
            : {
                  label: t("wallet.pathLabel"),
                  backLabel: t("wallet.returnToOrder"),
              }
    const waypointView: WalletControlCenterViewProps = {
        state: "waypoint",
        ...(breadcrumb === undefined ? {} : { breadcrumb }),
        linkedInvoice,
        ...shared,
    }
    return waypointView
}
