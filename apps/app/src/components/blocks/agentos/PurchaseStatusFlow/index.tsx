"use client"

import { useMemo } from "react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { getPathname } from "@/modules/i18n"
import { purchaserClaimsOf, purchaserDetailOf, purchaserNameOf } from "@/modules/agentos/purchase-status"
import { purchaseOf } from "@/modules/agentos/purchase-source"
import { createPurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"
import { purchaseStatusViewOf } from "@/modules/agentos/purchase-status/view"
import { usePurchaseStatusActions, usePurchaseStatusPhase, usePurchaseStatusQueries } from "@/hooks"
import { PurchaseStatusFlowBase } from "./component"

/** Route identity owned by the purchase-status block: one stable purchase identity. */
export type PurchaseStatusFlowProps = {
    readonly purchaseId: string
    /** The declared provisioning route pins the provisioning surface directly. */
    readonly surface?: "provisioning"
}

/** Connected purchase → payment → workspace status surface bound to one stable purchase identity. */
const PurchaseStatusFlow = ({ purchaseId, surface }: PurchaseStatusFlowProps) => {
    const format = useFormatter()
    const locale = useLocale()
    const t = useTranslations("console.agentos.purchaseStatus")
    const queries = usePurchaseStatusQueries(purchaseId)
    const answer = queries.data
    const statusOutcome = answer !== undefined && answer.ok ? answer.data : null
    const statusPurchase = purchaseOf(statusOutcome)
    const copy = useMemo(() => createPurchaseStatusCopy(t), [t])
    const links = useMemo(
        () => ({
            workspaces: getPathname({ locale, href: "/agentos/workspaces" }),
            offerSelection: getPathname({ locale, href: "/agentos/workspaces/new" }),
        }),
        [locale],
    )
    const actions = usePurchaseStatusActions({
        purchaseId,
        surface,
        statusAnswer: answer,
        statusPurchase,
        copy,
        refreshStatus: queries.mutate,
    })
    const phase = usePurchaseStatusPhase({
        purchaseId,
        surface: actions.surfacePinned,
        answer,
        error: queries.error,
        sessionRestoring: queries.sessionRestoring,
        accessToken: queries.accessToken,
        purchaseOverride: actions.purchaseOverride,
        refreshStatus: queries.mutate,
        statusValidating: queries.isValidating,
        recovering: actions.recovering,
    })
    const claims = useMemo(
        () => (queries.accessToken === null ? {} : purchaserClaimsOf(queries.accessToken)),
        [queries.accessToken],
    )
    const purchaserName = purchaserNameOf(claims)
    const purchaserDetail = purchaserDetailOf(claims, purchaserName)
    const purchaserFact =
        purchaserName === null
            ? null
            : purchaserDetail === null
              ? purchaserName
              : `${purchaserName} · ${purchaserDetail}`
    const timeOf = (iso: string) => format.dateTime(new Date(iso), { hour: "2-digit", minute: "2-digit" })
    const stampOf = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" })
    const dayOf = (iso: string): string => format.dateTime(new Date(iso), { dateStyle: "medium" })
    const amountOf = (amount: string, currency: string): string => {
        const value = Number(amount)
        return Number.isFinite(value)
            ? format.number(value, { style: "currency", currency, maximumFractionDigits: 0 })
            : `${amount} ${currency}`
    }
    const elapsedOf = (iso: string, now: string): string =>
        `${Math.max(1, Math.round((Date.parse(now) - Date.parse(iso)) / 60000))}m`
    const view = purchaseStatusViewOf({
        purchaseId,
        surfacePinned: actions.surfacePinned,
        phase: phase.phase,
        answer,
        outcome: statusOutcome,
        purchase: phase.purchase,
        readyWorkspaceId: phase.readyWorkspaceId,
        purchaserFact,
        copy,
        links,
        format: { timeOf, stampOf, dayOf, amountOf, elapsedOf },
        entryRefusal: actions.entryRefusal,
        recoverRefusal: actions.recoverRefusal,
        entryPending: actions.entryPending,
        recovering: actions.recovering,
        reconciling: phase.reconciling,
        actions: actions.actions,
    })

    return <PurchaseStatusFlowBase {...view} />
}

export { PurchaseStatusFlow }
export default PurchaseStatusFlow
