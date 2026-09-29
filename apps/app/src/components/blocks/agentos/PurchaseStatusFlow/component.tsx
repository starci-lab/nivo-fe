import { PageContainer } from "@starci/grammar/common"
import type { PurchaseStatusFlowViewProps } from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusActions } from "../PurchaseStatusActions"
import { PurchaseStatusChecks } from "../PurchaseStatusChecks"
import { PurchaseStatusHeader } from "../PurchaseStatusHeader"
import { SECTIONS_CLASS_NAME } from "./classNames"

type PurchaseStatusFlowBaseProps = PurchaseStatusFlowViewProps

/** Compose the purchase-status header, evidence cards and separate page-level escape action. */
export const PurchaseStatusFlowBase = (props: PurchaseStatusFlowBaseProps) => (
    <PageContainer measure="product">
        <div
            className={SECTIONS_CLASS_NAME}
            aria-busy={props.state === "loading" ? "true" : undefined}
            data-contract="GAP-5"
        >
            <PurchaseStatusHeader
                head={props.props}
                reserveResolvedTitle={props.state === "loading" && props.props.surface === "provisioning"}
            />
            <PurchaseStatusChecks {...props} />
            {props.state === "loading" || props.state === "denied" || props.props.escapeLink === undefined ? null : (
                <PurchaseStatusActions kind="escape" link={props.props.escapeLink} on={props.on} />
            )}
        </div>
    </PageContainer>
)
