import type { WorkspaceCheckoutStatusView } from "@/modules/api/workspace-controlplane"
import { check, type PurchaseStatusCheck, type WordTone } from "./checks"
import type { PurchaseStatusCopy } from "./copy"
import { OBSERVED_ORDER_STATES } from "./phase"
import type { PurchaseStatusOperation } from "./view-model"

type TimeOf = (iso: string) => string

/** Derive provider, amount, canonical-settlement and admission checks for a payment surface. */
export const paymentChecksOf = (
    purchase: WorkspaceCheckoutStatusView | null,
    copy: PurchaseStatusCopy,
    amountText: string | null,
    billingSettled: boolean,
    timeOf: TimeOf,
): ReadonlyArray<PurchaseStatusCheck> => {
    const payment = purchase?.payment
    const billing = purchase?.billing
    const provisioning = purchase?.provisioning
    const paymentTerminal =
        payment?.state === "refused" ||
        payment?.state === "failed" ||
        payment?.state === "cancelled" ||
        payment?.state === "failed-no-start" ||
        billing?.state === "refused" ||
        billing?.state === "failed" ||
        billing?.state === "cancelled"
    const provider: PurchaseStatusCheck =
        payment?.state === "unavailable"
            ? check("provider", copy.checkProvider, "unknown", copy.detailSourceRefused)
            : payment?.state === "verified-success"
              ? check(
                    "provider",
                    copy.checkProvider,
                    "done",
                    payment.state,
                    payment.observedAt === null ? undefined : timeOf(payment.observedAt),
                )
              : paymentTerminal
                ? check("provider", copy.checkProvider, "failed", copy.detailRefused)
                : payment?.state === "outcome-unknown" || payment?.state === "verified-unmatched-charge"
                  ? check("provider", copy.checkProvider, "unknown", copy.detailWithheld)
                  : check("provider", copy.checkProvider, "running", copy.detailAwaiting)
    const amountState: WordTone["word"] = billingSettled
        ? "done"
        : billing?.state === "unavailable"
          ? "unknown"
          : "queued"
    const amount = check(
        "amount",
        amountText === null ? copy.checkAmount : `${copy.checkAmount} — ${amountText}`,
        amountState,
        amountState === "done"
            ? copy.detailEvaluated
            : amountState === "unknown"
              ? copy.detailSourceRefused
              : copy.detailNotEvaluated,
    )
    const canonical: PurchaseStatusCheck = billingSettled
        ? check(
              "canonical",
              copy.checkCanonical,
              "done",
              copy.detailConfirmed,
              billing?.observedAt === null || billing?.observedAt === undefined
                  ? undefined
                  : timeOf(billing.observedAt),
          )
        : billing?.state === "refused" || billing?.state === "failed" || billing?.state === "cancelled"
          ? check("canonical", copy.checkCanonical, "failed", copy.detailRefused)
          : billing?.state === "unavailable"
            ? check("canonical", copy.checkCanonical, "unknown", copy.detailSourceRefused)
            : check("canonical", copy.checkCanonical, "queued", copy.detailWithheld)
    const admission: PurchaseStatusCheck =
        provisioning !== undefined && provisioning !== null && OBSERVED_ORDER_STATES.has(provisioning.state)
            ? check("admission", copy.checkAdmission, "done", copy.detailAdmitted)
            : provisioning?.state === "unavailable"
              ? check("admission", copy.checkAdmission, "unknown", copy.detailSourceRefused)
              : billingSettled
                ? check("admission", copy.checkAdmission, "queued", copy.detailWaitingAdmission)
                : check("admission", copy.checkAdmission, "queued", copy.detailLocked)
    return [provider, amount, canonical, admission]
}

/** Derive billing, entitlement, configuration and readiness checks for a provisioning surface. */
export const provisioningChecksOf = (
    purchase: WorkspaceCheckoutStatusView | null,
    copy: PurchaseStatusCopy,
    billingSettled: boolean,
    timeOf: TimeOf,
): ReadonlyArray<PurchaseStatusCheck> => {
    const billing = purchase?.billing
    const provisioning = purchase?.provisioning
    const readiness = purchase?.readiness
    const eligibility = purchase?.serviceEligibility
    const paymentVerified =
        billingSettled
            ? check(
                  "payment",
                  copy.checkPaymentVerified,
                  "done",
                  copy.detailConfirmed,
                  billing?.observedAt === null || billing?.observedAt === undefined
                      ? undefined
                      : timeOf(billing.observedAt),
              )
            : billing?.state === "unavailable"
              ? check("payment", copy.checkPaymentVerified, "unknown", copy.detailSourceRefused)
              : check("payment", copy.checkPaymentVerified, "queued", copy.detailAwaiting)
    const entitlement =
        eligibility === null || eligibility === undefined
            ? provisioning !== undefined && provisioning !== null && OBSERVED_ORDER_STATES.has(provisioning.state)
                ? check("entitlement", copy.checkEntitlement, "done", copy.detailOrderRecorded)
                : check("entitlement", copy.checkEntitlement, "queued", copy.detailAwaiting)
            : eligibility.state === "eligible"
              ? check("entitlement", copy.checkEntitlement, "done", copy.detailOrderRecorded)
              : eligibility.state === "held"
                ? check(
                      "entitlement",
                      copy.checkEntitlement,
                      "failed",
                      eligibility.reason === null
                          ? copy.holdStateLabel("held")
                          : copy.holdReasonLabel(eligibility.reason),
                      eligibility.heldSince === null ? undefined : timeOf(eligibility.heldSince),
                  )
                : eligibility.state === "unavailable"
                  ? check("entitlement", copy.checkEntitlement, "unknown", copy.detailSourceRefused)
                  : check("entitlement", copy.checkEntitlement, "queued", copy.detailAwaiting)
    const disposition = provisioning?.state ?? "none"
    const orderFailed =
        disposition === "refused" || disposition === "failed-retryable" || disposition === "failed-terminal"
    const configure: PurchaseStatusCheck = orderFailed
        ? check(
              "configure",
              copy.checkConfigure,
              "failed",
              provisioning?.reason ?? copy.detailRefused,
              provisioning?.observedAt === null || provisioning?.observedAt === undefined
                  ? undefined
                  : timeOf(provisioning.observedAt),
          )
        : disposition === "ready"
          ? check(
                "configure",
                copy.checkConfigure,
                "done",
                undefined,
                provisioning?.observedAt === null || provisioning?.observedAt === undefined
                    ? undefined
                    : timeOf(provisioning.observedAt),
            )
          : disposition === "running"
            ? check(
                  "configure",
                  copy.checkConfigure,
                  "running",
                  copy.provisioningDispositionLabel(disposition),
                  provisioning?.observedAt === null || provisioning?.observedAt === undefined
                      ? undefined
                      : timeOf(provisioning.observedAt),
              )
            : disposition === "unavailable"
              ? check("configure", copy.checkConfigure, "unknown", copy.detailSourceRefused)
              : disposition === "outcome-unknown"
                ? check("configure", copy.checkConfigure, "unknown", copy.detailWithheld)
                : check("configure", copy.checkConfigure, "queued", copy.detailWaitingConfiguration)
    const readinessCheck: PurchaseStatusCheck =
        readiness?.state === "ready"
            ? check(
                  "readiness",
                  copy.checkReadiness,
                  "done",
                  undefined,
                  readiness.observedAt === null ? undefined : timeOf(readiness.observedAt),
              )
            : readiness?.state === "unavailable"
              ? check("readiness", copy.checkReadiness, "unknown", copy.detailSourceRefused)
              : orderFailed
                ? check("readiness", copy.checkReadiness, "failed", copy.detailRefused)
                : check("readiness", copy.checkReadiness, "queued", copy.detailWaitingReadiness)
    return [paymentVerified, entitlement, configure, readinessCheck]
}

/** Derive the operation panel's progress and observation sentences from source facts. */
export const provisioningOperationOf = (
    purchase: WorkspaceCheckoutStatusView | null,
    copy: PurchaseStatusCopy,
    observedAt: string | null,
    timeOf: TimeOf,
    elapsedOf: (iso: string, now: string) => string,
): PurchaseStatusOperation | undefined => {
    if (purchase === null) return undefined
    const disposition = purchase.provisioning.state
    const observed = OBSERVED_ORDER_STATES.has(disposition)
    const name = observed ? copy.provisioningDispositionLabel(disposition) : copy.operationAdmit
    const failed =
        disposition === "refused" || disposition === "failed-retryable" || disposition === "failed-terminal"
    const steps = provisioningChecksOf(purchase, copy, purchase.billing.state === "paid", timeOf)
    const score = steps.reduce(
        (total, step) => total + (step.word === copy.stateDone ? 100 : step.word === copy.stateRunning ? 50 : 0),
        0,
    )
    const progressValue = Math.round(score / steps.length)
    const orderObservedAt = purchase.provisioning.observedAt
    return {
        heading: copy.currentOperation,
        name,
        word:
            disposition === "ready"
                ? copy.stateDone
                : failed
                  ? copy.stateFailed
                  : disposition === "outcome-unknown" || disposition === "unavailable"
                    ? copy.stateUnknown
                    : disposition === "running"
                      ? copy.stateRunning
                      : copy.stateQueued,
        tone:
            disposition === "ready"
                ? "success"
                : failed
                  ? "danger"
                  : disposition === "outcome-unknown" || disposition === "unavailable"
                    ? "warning"
                    : disposition === "running"
                      ? "warning"
                      : "neutral",
        progressLabel: name,
        progressValue,
        started:
            orderObservedAt === null || observedAt === null
                ? undefined
                : copy.startedSentence(timeOf(orderObservedAt), elapsedOf(orderObservedAt, observedAt)),
        lastObservation:
            observedAt === null
                ? undefined
                : copy.lastObservationSentence(
                      observed ? copy.provisioningDispositionLabel(disposition) : copy.detailPaymentSettled,
                      timeOf(observedAt),
                  ),
    }
}
