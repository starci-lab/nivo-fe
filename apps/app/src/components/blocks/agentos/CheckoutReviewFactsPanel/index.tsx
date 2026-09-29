import { Badge, Text } from "@starci/grammar/common"
import type { CheckoutReviewCopy, CheckoutReviewFacts } from "@/modules/agentos/checkout-review"
import { FACT_ROW_CLASS_NAME, FACT_VALUE_CLASS_NAME } from "./classNames"

export type CheckoutReviewFactsPanelProps = {
    readonly copy: CheckoutReviewCopy
    readonly facts?: CheckoutReviewFacts | null
    readonly admission?: string | null
    readonly skeleton?: boolean
}

const factRow = (label: string, value: string, isSkeleton: boolean) => (
    <div key={label} className={FACT_ROW_CLASS_NAME}>
        <Text size="sm" weight="semibold" isSkeleton={isSkeleton}>
            {label}
        </Text>
        <div className={FACT_VALUE_CLASS_NAME}>
            <Text size="sm" tone="muted" overflow="wrap" isSkeleton={isSkeleton}>
                {value}
            </Text>
        </div>
    </div>
)

const admissionRow = (label: string, admission: string, isSkeleton: boolean) => (
    <div className={FACT_ROW_CLASS_NAME}>
        <Text size="sm" weight="semibold" isSkeleton={isSkeleton}>
            {label}
        </Text>
        <div className={FACT_VALUE_CLASS_NAME}>
            <Badge tone="neutral" isSkeleton={isSkeleton}>
                {admission}
            </Badge>
        </div>
    </div>
)

/** Draw the frozen offer facts or their matching loading shape. */
export const CheckoutReviewFactsPanel = ({
    copy,
    facts,
    admission = null,
    skeleton = false,
}: CheckoutReviewFactsPanelProps) => {
    if (skeleton)
        return (
            <>
                {factRow(copy.offer, copy.offer, true)}
                {factRow(copy.offerVersion, copy.offerVersion, true)}
                {factRow(copy.amount, copy.amount, true)}
                {factRow(copy.billingTerm, copy.billingTerm, true)}
                {admissionRow(copy.admission, copy.admission, true)}
            </>
        )
    if (facts === undefined || facts === null) return null
    return (
        <>
            {factRow(copy.offer, facts.offer, false)}
            {factRow(copy.offerVersion, facts.offerVersion, false)}
            {factRow(copy.amount, facts.amount, false)}
            {factRow(copy.billingTerm, facts.billingTerm, false)}
            {factRow(copy.renewal, facts.renewal, false)}
            {factRow(copy.includedOutcome, facts.includedOutcome, false)}
            {factRow(copy.eligibility, facts.eligibility, false)}
            {factRow(copy.seller, facts.seller, false)}
            {facts.purchaser === null ? null : factRow(copy.purchaser, facts.purchaser, false)}
            {admission === null ? null : admissionRow(copy.admission, admission, false)}
        </>
    )
}
