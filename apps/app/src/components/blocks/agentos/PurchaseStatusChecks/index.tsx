import type { PurchaseStatusFlowViewProps } from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusChecksBase } from "./component"

/** Complete resolved purchase-status view contract consumed by the evidence-card block. */
type PurchaseStatusChecksProps = PurchaseStatusFlowViewProps

/** Hand the resolved purchase-status evidence to its drawing half. */
export const PurchaseStatusChecks = (props: PurchaseStatusChecksProps) => <PurchaseStatusChecksBase {...props} />
