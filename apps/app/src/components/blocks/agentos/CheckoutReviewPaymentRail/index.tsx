import { Button, SurfaceCard, Text, TextAction } from "@starci/grammar/common"
import type {
    CheckoutReviewDecisionProps,
    CheckoutReviewFlowActions,
    CheckoutReviewStep,
} from "../../../../modules/agentos/checkout-review"
import {
    ORDINAL_CLASS_NAME,
    RAIL_BAND_CLASS_NAME,
    RAIL_OPTION_CLASS_NAME,
    RAIL_OPTIONS_CLASS_NAME,
    RAIL_RADIO_CLASS_NAME,
    SELECTED_RAIL_OPTION_CLASS_NAME,
    STEP_BODY_CLASS_NAME,
    STEP_ROW_CLASS_NAME,
} from "./classNames"

/** Props for {@link CheckoutReviewPaymentRail}. */
export type CheckoutReviewPaymentRailProps = {
    readonly props: CheckoutReviewDecisionProps
    readonly state: "review" | "not-started"
    readonly on: CheckoutReviewFlowActions
}

const stepRow = (step: CheckoutReviewStep, position: number) => (
    <li key={step.title} className={STEP_ROW_CLASS_NAME}>
        <span aria-hidden="true" className={ORDINAL_CLASS_NAME}>
            {position}
        </span>
        <span className={STEP_BODY_CLASS_NAME}>
            <Text size="sm" weight="semibold">
                {step.title}
            </Text>
            <Text size="xs" tone="muted" overflow="wrap">
                {step.detail}
            </Text>
        </span>
    </li>
)

const railChoiceBand = (props: CheckoutReviewDecisionProps, on: CheckoutReviewFlowActions) => (
    <div className={RAIL_BAND_CLASS_NAME}>
        <Text size="sm" weight="semibold">
            {props.copy.railChoice}
        </Text>
        <div role="radiogroup" aria-label={props.copy.railChoice} className={RAIL_OPTIONS_CLASS_NAME}>
            {props.rails.map((rail) => (
                <label
                    key={rail.rail}
                    data-rail={rail.rail}
                    className={
                        rail.rail === props.selectedRail ? SELECTED_RAIL_OPTION_CLASS_NAME : RAIL_OPTION_CLASS_NAME
                    }
                >
                    <input
                        type="radio"
                        name="payment-rail"
                        value={rail.rail}
                        aria-label={rail.label}
                        checked={rail.rail === props.selectedRail}
                        onChange={() => on.selectRail(rail.rail)}
                        className={RAIL_RADIO_CLASS_NAME}
                    />
                    <span className={STEP_BODY_CLASS_NAME}>
                        <Text size="sm" weight="semibold">
                            {rail.label}
                        </Text>
                        <Text size="xs" tone="muted" overflow="wrap">
                            {rail.detail}
                        </Text>
                    </span>
                </label>
            ))}
        </div>
        {props.selectedRail === null ? (
            <Text size="xs" tone="muted" overflow="wrap">
                {props.copy.railRequired}
            </Text>
        ) : null}
        <Text size="xs" tone="muted" overflow="wrap">
            {props.copy.railCredentialPending}
        </Text>
    </div>
)

/** Draw the payment rail, ordered recheck steps, and the same-identity retry action. */
export const CheckoutReviewPaymentRail = (props: CheckoutReviewPaymentRailProps) => {
    const { props: decision, state, on }: CheckoutReviewPaymentRailProps = props
    const notStarted = state === "not-started"
    return (
        <SurfaceCard label={decision.copy.railLabel} composition="joined" height="fill">
            <div className={RAIL_BAND_CLASS_NAME}>
                <Text size="sm" tone="muted" overflow="wrap">
                    {decision.copy.railNote}
                </Text>
            </div>
            {railChoiceBand(decision, on)}
            <div className={RAIL_BAND_CLASS_NAME}>
                <ol className={STEP_BODY_CLASS_NAME}>
                    {decision.steps.map((step, index) => stepRow(step, index + 1))}
                </ol>
            </div>
            {notStarted && decision.notice !== null ? (
                <div className={RAIL_BAND_CLASS_NAME}>
                    <Text size="sm" tone="muted" overflow="wrap">
                        {decision.notice}
                    </Text>
                </div>
            ) : null}
            <div className={RAIL_BAND_CLASS_NAME}>
                <Button
                    variant="primary"
                    size="lg"
                    width="fill"
                    type="button"
                    isDisabled={decision.selectedRail === null}
                    isPending={decision.isPaymentPending === true}
                    onPress={on.requestPayment}
                >
                    {notStarted ? decision.copy.retryPayment : decision.copy.requestPayment}
                </Button>
                <TextAction href={decision.links.offerSelection} size="sm" onFollow={on.changeOffer}>
                    {notStarted ? decision.copy.returnToOffers : decision.copy.changeOffer}
                </TextAction>
            </div>
            <div className={RAIL_BAND_CLASS_NAME}>
                <Text size="xs" tone="muted" overflow="wrap">
                    {decision.copy.footnote}
                </Text>
            </div>
        </SurfaceCard>
    )
}
