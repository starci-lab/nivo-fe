import { IconSource } from "@nivo/ui"
import { provisioningOrderRefOf, type PurchasePhase } from "./phase"
import { provisioningOperationOf } from "./derive-checks"
import type { PurchaseStatusPresentationContext } from "./presentation.types"
import type { PurchaseStatusPrimary, PurchaseStatusTimelineRow } from "./view-model"

const paymentTimelineOf = (context: PurchaseStatusPresentationContext): ReadonlyArray<PurchaseStatusTimelineRow> => {
    const { purchase, copy, format } = context
    if (purchase === null) return []
    const rows: Array<PurchaseStatusTimelineRow> = []
    const recorded = IconSource("complete")
    rows.push({
        id: "purchase",
        title: copy.purchaseRow,
        detail: copy.purchaseStateLabel(purchase.state),
        mark: recorded,
    })
    if (purchase.payment.reference !== null || purchase.payment.observedAt !== null) {
        rows.push({
            id: "payment",
            title: copy.paymentAttempt,
            detail: purchase.payment.state,
            at: purchase.payment.observedAt === null ? undefined : format.timeOf(purchase.payment.observedAt),
            mark: recorded,
        })
    }
    for (const entry of purchase.ledger?.entries ?? []) {
        rows.push({
            id: entry.entryId,
            title: copy.ledgerEntryKindLabel(entry.kind),
            detail: `${entry.amount} ${entry.currency}`,
            at: format.timeOf(entry.postedAt),
            mark: recorded,
        })
    }
    rows.push({
        id: "read",
        title: copy.timelineRead,
        detail: copy.timelineReadDetail,
        at: format.timeOf(purchase.lastConfirmedAt),
        mark: recorded,
    })
    return rows
}

/** Derive the purchase facts and settlement timeline shown beside payment checks. */
export const paymentPrimaryOf = (context: PurchaseStatusPresentationContext): PurchaseStatusPrimary => {
    const { purchase, purchaseId, copy, format } = context
    const offer = purchase?.offer ?? null
    const offerName = offer?.displayName ?? null
    const amountText = offer === null ? null : format.amountOf(offer.amount, offer.currency)
    const billingSettled = purchase?.billing.state === "paid"
    const paymentAttempt = purchase !== null && purchase.payment.reference !== null ? purchase.payment.reference : null
    return {
        label: copy.purchaseFactsLabel,
        fact: purchaseId,
        banner:
            offerName === null
                ? undefined
                : [
                      offerName,
                      ...(amountText === null ? [] : [amountText]),
                      ...(offer === null ? [] : [offer.offerVersion]),
                  ],
        facts: [
            { label: copy.offer, value: offerName ?? "—" },
            { label: copy.offerPlan, value: offer?.offerVersion ?? "—" },
            { label: copy.purchaseRef, value: purchaseId },
            { label: copy.paymentAttempt, value: paymentAttempt ?? "—" },
            { label: copy.amountLabel, value: amountText ?? "—" },
            {
                label: copy.paymentStatusLabel,
                value: purchase === null ? "—" : copy.purchaseStateLabel(purchase.state),
            },
            {
                label: copy.lastObservation,
                value: purchase === null ? "—" : format.stampOf(purchase.lastConfirmedAt),
            },
            {
                label: copy.invoicePaidAt,
                value:
                    billingSettled === true &&
                    purchase?.billing.observedAt !== null &&
                    purchase?.billing.observedAt !== undefined
                        ? format.stampOf(purchase.billing.observedAt)
                        : "—",
            },
        ],
        timeline: paymentTimelineOf(context),
    }
}

/** Derive the published provisioning-order facts, cadence and operation band. */
export const provisioningPrimaryOf = (
    context: PurchaseStatusPresentationContext,
    phase: PurchasePhase,
): PurchaseStatusPrimary => {
    const { purchase, purchaseId, copy, readyWorkspaceId, format, reconciling } = context
    const offer = purchase?.offer ?? null
    const offerName = offer?.displayName ?? null
    const amountText = offer === null ? null : format.amountOf(offer.amount, offer.currency)
    const billingSettled = purchase?.billing.state === "paid"
    const cadenceText =
        offer === null
            ? "—"
            : offer.billingCadence === "monthly"
              ? copy.cadenceRecurring
              : offer.billingCadence === "one-time" ||
                  offer.billingCadence === "one_time" ||
                  offer.billingCadence === "once"
                ? copy.cadenceOneTime
                : offer.billingCadence.includes("setup")
                  ? copy.cadenceSetupRecurring
                  : offer.billingCadence
    const renewalText =
        offer === null
            ? "—"
            : offer.renewalMode === "automatic" || offer.renewalMode === "auto"
              ? copy.renewalAuto
              : offer.renewalMode === "explicit" || offer.renewalMode === "manual"
                ? copy.renewalManual
                : offer.renewalMode === "none" || offer.renewalMode === "never"
                  ? copy.renewalNone
                  : offer.renewalMode
    return {
        label: copy.provisioningOrderLabel,
        fact: purchase === null ? undefined : (provisioningOrderRefOf(purchase) ?? undefined),
        facts: [
            { label: copy.offer, value: offerName ?? "—" },
            { label: copy.purchaseLabel, value: purchaseId },
            {
                label: copy.paymentStatusLabel,
                value:
                    billingSettled === true && amountText !== null
                        ? copy.paidSentence(amountText)
                        : purchase === null
                          ? "—"
                          : copy.purchaseStateLabel(purchase.state),
            },
            { label: copy.workspaceLabel, value: readyWorkspaceId ?? copy.workspacePending },
            { label: copy.offerPlan, value: offer?.offerVersion ?? "—" },
            {
                label: copy.invoicePaidAt,
                value:
                    billingSettled === true &&
                    purchase?.billing.observedAt !== null &&
                    purchase?.billing.observedAt !== undefined
                        ? format.stampOf(purchase.billing.observedAt)
                        : "—",
            },
        ],
        cadenceFacts: [
            { label: copy.cadenceLabel, value: cadenceText },
            { label: copy.renewalLabel, value: renewalText },
        ],
        operation: provisioningOperationOf(
            purchase,
            copy,
            purchase?.lastConfirmedAt ?? null,
            format.timeOf,
            format.elapsedOf,
        ),
        footnote: `Order ${purchaseId} ${copy.reconcileNote}`,
        action:
            phase === "queued" || phase === "provisioning"
                ? { label: copy.refreshStatusAction, pending: reconciling }
                : phase === "provisioning-unknown"
                  ? { label: copy.reconcileOrderAction, pending: reconciling }
                  : undefined,
    }
}
