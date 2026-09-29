"use client"

import { useCheckoutReviewFlow } from "@/hooks/agentos/useCheckoutReviewFlow"
import type { CheckoutReviewFlowProps } from "@/modules/agentos/checkout-review"
import { CheckoutReviewFlowBase } from "./component"

export type { CheckoutReviewFlowProps } from "@/modules/agentos/checkout-review"

/** Connect the offer recheck and payment command to its pure review surface. */
const CheckoutReviewFlow = (props: CheckoutReviewFlowProps) => (
    <CheckoutReviewFlowBase {...useCheckoutReviewFlow(props)} />
)

export { CheckoutReviewFlow }
export default CheckoutReviewFlow
