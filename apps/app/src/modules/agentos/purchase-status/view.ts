import { PAYMENT_PHASES, PROVISIONING_PHASES, type PurchasePhase } from "./phase"
import type { PurchaseStatusPresentationContext } from "./presentation.types"
import { paymentPrimaryOf, provisioningPrimaryOf } from "./primary-view"
import { paymentRailOf, provisioningRailOf } from "./rail-view"
import type { PurchaseStatusFlowViewProps, PurchaseStatusHeadProps } from "./view-model"

const headFor = (
    context: PurchaseStatusPresentationContext,
    title: string,
    subtitle: string,
    badge?: PurchaseStatusHeadProps["badge"],
): PurchaseStatusHeadProps => {
    const { copy, links, purchaseId } = context
    const onProvisioningSurface = PROVISIONING_PHASES.has(context.phase)
    return {
        copy,
        links,
        trail: [
            { id: "workspaces", label: copy.workspaces, href: links.workspaces },
            { id: "purchases", label: copy.purchases },
            { id: "purchase", label: purchaseId, isCurrent: !onProvisioningSurface },
            ...(onProvisioningSurface ? [{ id: "provisioning", label: copy.provisioning, isCurrent: true }] : []),
        ],
        title,
        subtitle,
        badge,
    }
}

const paymentHead = (context: PurchaseStatusPresentationContext, phase: PurchasePhase): PurchaseStatusHeadProps => {
    const { copy, purchase } = context
    if (phase === "payment-pending")
        return headFor(context, copy.paymentPendingTitle, copy.paymentPendingSubtitle, {
            label: copy.paymentPendingBadge,
            tone: "warning",
        })
    if (phase === "payment-unknown")
        return headFor(context, copy.paymentUnknownTitle, copy.paymentUnknownSubtitle, {
            label: copy.paymentUnknownBadge,
            tone: "warning",
        })
    if (phase === "paid") return headFor(context, copy.paidTitle, copy.paidSubtitle, { label: copy.paidBadge, tone: "success" })
    return headFor(context, copy.paymentFailedTitle, copy.paymentFailedSubtitle, {
        label: purchase === null ? copy.paymentFailedBadge : copy.purchaseStateLabel(purchase.state),
        tone: "danger",
    })
}

const provisioningHead = (
    context: PurchaseStatusPresentationContext,
    phase: PurchasePhase,
): PurchaseStatusHeadProps => {
    const { copy, purchase, format } = context
    const offerName = purchase?.offer.displayName ?? null
    const observedAt = purchase?.lastConfirmedAt ?? null
    const subtitle = `${phase === "ready" ? copy.readySubtitle : `${copy.provisioningSubtitle} ${observedAt === null ? "" : format.stampOf(observedAt)}.`}`
    const refundTitle =
        phase === "refunded"
            ? copy.refundStateLabel("refunded")
            : phase === "refund-started"
              ? copy.refundStateLabel("refund-started")
              : phase === "refund-pending-reconciliation"
                ? copy.refundStateLabel("refund-pending-reconciliation")
                : purchase === null
                  ? copy.provisioningFailedTerminalTitle
                  : copy.refundStateLabel("unavailable")

    if (phase === "queued")
        return headFor(context, offerName === null ? copy.provisioningTitle : copy.preparingOffer(offerName), subtitle, {
            label: copy.provisioningDispositionLabel("admitted"),
            tone: "neutral",
        })
    if (phase === "provisioning")
        return headFor(context, offerName === null ? copy.provisioningTitle : copy.preparingOffer(offerName), subtitle, {
            label: copy.provisioningBadge,
            tone: "warning",
        })
    if (phase === "provisioning-unknown")
        return headFor(context, copy.provisioningUnknownTitle, subtitle, {
            label: copy.provisioningUnknownBadge,
            tone: "warning",
        })
    if (phase === "provisioning-failed-retryable")
        return headFor(context, copy.provisioningFailedTitle, subtitle, {
            label: copy.provisioningFailedBadge,
            tone: "warning",
        })
    if (phase === "provisioning-failed-terminal")
        return headFor(context, copy.provisioningFailedTerminalTitle, subtitle, {
            label: copy.provisioningFailedTerminalBadge,
            tone: "danger",
        })
    if (phase === "provisioning-refused")
        return headFor(context, copy.provisioningFailedTerminalTitle, subtitle, {
            label: copy.provisioningDispositionLabel("refused"),
            tone: "danger",
        })
    if (phase === "refund-started" || phase === "refund-pending-reconciliation")
        return headFor(context, refundTitle, subtitle, { label: refundTitle, tone: "warning" })
    if (phase === "refunded") return headFor(context, refundTitle, subtitle, { label: refundTitle, tone: "success" })
    if (phase === "service-eligibility-hold")
        return headFor(context, copy.holdStateLabel("held"), subtitle, {
            label: copy.holdStateLabel("held"),
            tone: "warning",
        })
    return headFor(context, copy.readyTitle, subtitle, { label: copy.readyBadge, tone: "success" })
}

/** Derive the complete view contract from confirmed data, resolved copy and event callbacks. */
export const purchaseStatusViewOf = (context: PurchaseStatusPresentationContext): PurchaseStatusFlowViewProps => {
    const { phase, copy, links, actions, purchase } = context
    if (phase === "loading") {
        return {
            state: "loading",
            props: { ...headFor(context, copy.loadingTitle, copy.loadingText), surface: context.surfacePinned },
        }
    }
    if (phase === "denied") {
        const outage =
            context.answer === undefined ||
            !context.answer.ok ||
            context.outcome === null ||
            context.outcome.status !== "refused"
        return {
            state: "denied",
            props: {
                ...headFor(context, copy.deniedTitle, copy.deniedSubtitle),
                message: outage ? copy.unavailableNotice : copy.deniedNotice,
                description: copy.deniedText,
            },
            on: { returnToList: actions.returnToList },
        }
    }
    if (PAYMENT_PHASES.has(phase)) {
        const heading = paymentHead(context, phase)
        const failed = phase === "payment-refused" || phase === "payment-failed" || phase === "payment-cancelled"
        return {
            state: phase,
            props: { ...heading, primary: paymentPrimaryOf(context), rail: paymentRailOf(context, phase) },
            on: {
                primary:
                    failed
                        ? actions.changeOffer
                        : phase === "paid"
                          ? actions.viewProvisioning
                          : phase === "payment-unknown"
                            ? actions.recover
                            : actions.reconcile,
                returnToList: actions.returnToList,
            },
        }
    }
    const heading = provisioningHead(context, phase)
    const held = phase === "service-eligibility-hold"
    const renewal = purchase?.serviceEligibility?.renewalAction ?? null
    const entryDenied = (phase === "ready" || held) && context.entryRefusal !== null
    const primaryAction = entryDenied
        ? actions.reconcile
        : phase === "ready" || (held && context.readyWorkspaceId !== null)
          ? actions.enterWorkspace
          : held && renewal !== null
            ? actions.renewEntitlement
            : phase === "provisioning-failed-retryable"
              ? actions.recover
              : phase === "queued" || phase === "provisioning" || phase === "provisioning-unknown"
                ? actions.reconcile
                : phase === "refund-started" || phase === "refund-pending-reconciliation"
                  ? actions.reconcile
                  : undefined
    return {
        state: phase,
        props: {
            ...heading,
            primary: provisioningPrimaryOf(context, phase),
            rail: provisioningRailOf(context, phase),
            escapeLink: { label: copy.returnToList, href: links.workspaces },
        },
        on: { primary: primaryAction, returnToList: actions.returnToList },
    }
}
