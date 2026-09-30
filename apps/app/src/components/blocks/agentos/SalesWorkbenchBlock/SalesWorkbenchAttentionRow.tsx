import { Badge, Button, Text } from "@starci/grammar/common"
import type { SalesPipelineItem } from "@/modules/api/sales"
import type { SalesTranslation } from "@/modules/sales/sales-workbench"
import {
    SALES_LIFECYCLE_TONES,
    SALES_WORK_STATE_TONES,
    salesWorkbenchLifecycleText,
    salesWorkbenchToneFor,
    salesWorkbenchWorkStateText,
} from "./sales-workbench.helpers"
import { SalesWorkbenchActionRow, SalesWorkbenchRow } from "./sales-workbench.shared"

/** Data, permission, and selection action for one pipeline attention row. */
export type SalesWorkbenchAttentionRowProps = {
    readonly row: SalesPipelineItem
    readonly scopeReady: boolean
    readonly t: SalesTranslation
    readonly selectOpportunity: (opportunityId: string) => void
}

/** Draw one selectable attention row with its work state and lifecycle kept distinct. */
export const SalesWorkbenchAttentionRow = (props: SalesWorkbenchAttentionRowProps) => (
    <SalesWorkbenchRow key={props.row.opportunityId}>
        <SalesWorkbenchActionRow>
            <Button
                size="lg"
                variant="ghost"
                isDisabled={!props.scopeReady}
                onPress={() => props.selectOpportunity(props.row.opportunityId)}
            >
                {props.row.customerRef}
            </Button>
            <Badge tone={salesWorkbenchToneFor(SALES_WORK_STATE_TONES, props.row.workState)}>
                {salesWorkbenchWorkStateText(props.row.workState, props.t)}
            </Badge>
            <Badge tone={salesWorkbenchToneFor(SALES_LIFECYCLE_TONES, props.row.status)}>
                {salesWorkbenchLifecycleText(props.row.status, props.t)}
            </Badge>
        </SalesWorkbenchActionRow>
        <Text size="sm">{props.row.purpose}</Text>
        <Text size="xs" tone="muted">
            {props.t("revision", { value: props.row.revision })}
        </Text>
    </SalesWorkbenchRow>
)
