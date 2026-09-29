import type { PurchasePhase } from "./phase"
import { provisioningChecksOf, paymentChecksOf } from "./derive-checks"
import type { PurchaseStatusPresentationContext } from "./presentation.types"
import type { PurchaseStatusRail } from "./view-model"

/** Derive the payment verification rail and its safe recheck action. */
export const paymentRailOf = (
    context: PurchaseStatusPresentationContext,
    phase: PurchasePhase,
): PurchaseStatusRail => {
    const { purchase, copy, links, format, reconciling, recoverRefusal } = context
    const amountText =
        purchase?.offer === null || purchase?.offer === undefined
            ? null
            : format.amountOf(purchase.offer.amount, purchase.offer.currency)
    const billingSettled = purchase?.billing.state === "paid"
    const paymentAttempt = purchase !== null && purchase.payment.reference !== null ? purchase.payment.reference : null
    const observedAt = purchase?.lastConfirmedAt ?? null
    return {
        label: copy.verificationLabel,
        latestCheck: observedAt === null ? undefined : `${copy.latestCheck} · ${format.timeOf(observedAt)}`,
        checks: paymentChecksOf(purchase, copy, amountText, billingSettled === true, format.timeOf),
        notice:
            phase === "payment-pending"
                ? copy.lockedNotice
                : phase === "payment-unknown"
                  ? copy.unavailableNotice
                  : undefined,
        action:
            phase === "payment-refused" || phase === "payment-failed" || phase === "payment-cancelled"
                ? { label: copy.changeOffer }
                : phase === "paid"
                  ? { label: copy.viewProvisioningAction }
                  : {
                        label: phase === "payment-unknown" ? copy.reconcilePaymentAction : copy.checkPaymentAction,
                        pending: reconciling,
                    },
        actionCaption:
            phase === "payment-refused" ||
            phase === "payment-failed" ||
            phase === "payment-cancelled" ||
            phase === "paid"
                ? undefined
                : copy.rechecksOnly(paymentAttempt ?? context.purchaseId),
        secondaryLink: { label: copy.returnToList, href: links.workspaces },
        refusalText: recoverRefusal ?? undefined,
    }
}

/** Derive confirmed provisioning facts, eligibility notices and entry/retry actions. */
export const provisioningRailOf = (
    context: PurchaseStatusPresentationContext,
    phase: PurchasePhase,
): PurchaseStatusRail => {
    const { purchase, copy, links, format, readyWorkspaceId, purchaserFact, entryRefusal, recoverRefusal, entryPending, recovering, reconciling } = context
    const ready = phase === "ready"
    const retryable = phase === "provisioning-failed-retryable"
    const terminal = phase === "provisioning-failed-terminal"
    const held = phase === "service-eligibility-hold"
    const refunding =
        phase === "refund-started" || phase === "refund-pending-reconciliation" || phase === "provisioning-refused"
    const refund = purchase?.refund ?? purchase?.refundStatus ?? null
    const eligibility = purchase?.serviceEligibility ?? null
    const renewal = eligibility?.renewalAction ?? null
    const renewalHref =
        renewal === null
            ? null
            : `${links.offerSelection}/checkout?offer=${encodeURIComponent(renewal.offerId)}&offerVersion=${encodeURIComponent(renewal.offerVersion)}${eligibility?.reference !== null && eligibility?.reference !== undefined ? `&entitlement=${encodeURIComponent(eligibility.reference)}` : ""}`
    const entryDenied = (ready || held) && entryRefusal !== null
    const heldSince = eligibility?.heldSince ?? null
    const paidThrough = eligibility?.paidThrough ?? null
    const holdFacts =
        held && eligibility !== null
            ? [
                  {
                      label: copy.holdStateLabel("held"),
                      value:
                          eligibility.reason === null
                              ? copy.holdStateLabel("held")
                              : copy.holdReasonLabel(eligibility.reason),
                  },
                  {
                      label: copy.renewalEvidenceLabel(eligibility.renewalEvidence),
                      value:
                          [
                              heldSince === null ? null : copy.heldSinceLabel(format.dayOf(heldSince)),
                              paidThrough === null ? null : copy.paidThroughLabel(format.dayOf(paidThrough)),
                          ]
                              .filter((part): part is string => part !== null)
                              .join(" · ") || "—",
                  },
              ]
            : []
    const refundFacts =
        phase === "refunded" &&
        purchase?.refund?.refundEntryId !== null &&
        purchase?.refund?.refundEntryId !== undefined
            ? [{ label: copy.ledgerEntryKindLabel("refund"), value: purchase.refund.refundEntryId }]
            : []
    const outcomeDetail = ready
        ? entryDenied
            ? copy.outcomeEntryDenied
            : copy.outcomeEntryReady
        : held
          ? `${copy.holdStateLabel("held")}${eligibility?.reason === null || eligibility?.reason === undefined ? "" : ` · ${copy.holdReasonLabel(eligibility.reason)}`}${eligibility?.paidThrough === null || eligibility?.paidThrough === undefined ? "" : ` · ${copy.paidThroughLabel(format.dayOf(eligibility.paidThrough))}`}`
          : terminal
            ? copy.outcomeProvisioningTerminal
            : retryable
              ? copy.outcomeProvisioningRetryable
              : phase === "refunded"
                ? copy.refundStateLabel("refunded")
                : refunding && refund !== null
                  ? copy.refundStateLabel(refund.state)
                  : refunding
                    ? copy.provisioningDispositionLabel("refused")
                    : copy.outcomeEntryWithheld
    return {
        label: copy.confirmedFactsLabel,
        checks: provisioningChecksOf(purchase, copy, purchase?.billing.state === "paid", format.timeOf),
        facts: [
            { label: copy.ownerLabel, value: purchaserFact ?? "—" },
            { label: copy.attemptLabel, value: "—" },
            ...holdFacts,
            ...refundFacts,
        ],
        notice:
            phase === "provisioning-unknown"
                ? copy.unavailableNotice
                : (retryable || terminal || phase === "provisioning-refused") && purchase !== null
                  ? (purchase.provisioning.reason ?? undefined)
                  : undefined,
        outcome: {
            title: `${copy.outcomeLabel}: ${readyWorkspaceId ?? purchase?.offer.displayName ?? "—"}`,
            detail: outcomeDetail,
        },
        action: entryDenied
            ? { label: copy.refreshStatusAction, pending: reconciling }
            : ready || (held && readyWorkspaceId !== null)
              ? { label: copy.enterWorkspaceAction, pending: entryPending }
              : held && renewal !== null
                ? { label: copy.renewAction }
                : retryable
                  ? { label: copy.retryProvisionAction, pending: recovering }
                  : refunding && phase !== "provisioning-refused"
                    ? { label: copy.refreshStatusAction, pending: reconciling }
                    : undefined,
        actionCaption: retryable ? copy.retryProvisionCaption : undefined,
        secondaryLink:
            held && renewalHref !== null && readyWorkspaceId !== null
                ? { label: copy.renewAction, href: renewalHref }
                : undefined,
        refusalText: entryRefusal ?? recoverRefusal ?? undefined,
    }
}
