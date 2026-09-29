import { Button, SurfaceCard, Text, TextAction } from "@starci/grammar/common"
import type {
    CheckoutReviewDecisionProps,
    CheckoutReviewFlowActions,
    CheckoutReviewStep,
} from "@/modules/agentos/checkout-review"
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
export const CheckoutReviewPaymentRail = ({ props, state, on }: CheckoutReviewPaymentRailProps) => {
    const notStarted = state === "not-started"
    return (
        <SurfaceCard label={props.copy.railLabel} composition="joined" height="fill">
            <div className={RAIL_BAND_CLASS_NAME}>
                <Text size="sm" tone="muted" overflow="wrap">
                    {props.copy.railNote}
                </Text>
            </div>
            {railChoiceBand(props, on)}
            <div className={RAIL_BAND_CLASS_NAME}>
                <ol className={STEP_BODY_CLASS_NAME}>{props.steps.map((step, index) => stepRow(step, index + 1))}</ol>
            </div>
            {notStarted && props.notice !== null ? (
                <div className={RAIL_BAND_CLASS_NAME}>
                    <Text size="sm" tone="muted" overflow="wrap">
                        {props.notice}
                    </Text>
                </div>
            ) : null}
            <div className={RAIL_BAND_CLASS_NAME}>
                <Button
                    variant="primary"
                    size="lg"
                    width="fill"
                    type="button"
                    isDisabled={props.selectedRail === null}
                    isPending={props.isPaymentPending === true}
                    onPress={on.requestPayment}
                >
                    {notStarted ? props.copy.retryPayment : props.copy.requestPayment}
                </Button>
                <TextAction href={props.links.offerSelection} size="sm" onFollow={on.changeOffer}>
                    {notStarted ? props.copy.returnToOffers : props.copy.changeOffer}
                </TextAction>
            </div>
            <div className={RAIL_BAND_CLASS_NAME}>
                <Text size="xs" tone="muted" overflow="wrap">
                    {props.copy.footnote}
                </Text>
            </div>
        </SurfaceCard>
    )
}
