import type { SalesInstallationScope, SalesPipelineRequest } from "@/modules/api/sales"
import { useQuerySalesActionSwr } from "@/hooks/swr/queries/useQuerySalesActionSwr"
import { useQuerySalesCommandSwr } from "@/hooks/swr/queries/useQuerySalesCommandSwr"
import { useQuerySalesOpportunitySwr } from "@/hooks/swr/queries/useQuerySalesOpportunitySwr"
import { useQuerySalesPipelineSwr } from "@/hooks/swr/queries/useQuerySalesPipelineSwr"
import { useQuerySalesPolicySwr } from "@/hooks/swr/queries/useQuerySalesPolicySwr"
import { useQuerySalesReadinessSwr } from "@/hooks/swr/queries/useQuerySalesReadinessSwr"

type SalesWorkbenchReadsInput = {
    readonly addressable: SalesInstallationScope
    readonly pipelineInput: SalesPipelineRequest
    readonly routeInstallationId: string
    readonly opportunityId: string
    readonly commandId: string
    readonly actionId: string
    readonly ready: boolean
}

/** Read the Sales pipeline and the selected readiness, policy, opportunity, command and action. */
export const useSalesWorkbenchReads = ({
    addressable,
    pipelineInput,
    routeInstallationId,
    opportunityId,
    commandId,
    actionId,
    ready,
}: SalesWorkbenchReadsInput) => {
    const pipeline = useQuerySalesPipelineSwr(addressable, pipelineInput, ready)
    const readiness = useQuerySalesReadinessSwr(addressable, { salesInstallationId: routeInstallationId }, ready)
    const policy = useQuerySalesPolicySwr(
        addressable,
        { salesInstallationId: routeInstallationId, requestId: null },
        ready,
    )
    const opportunity = useQuerySalesOpportunitySwr(addressable, { opportunityId }, ready && opportunityId.length > 0)
    const command = useQuerySalesCommandSwr(addressable, { commandId }, ready && commandId.length > 0)
    const action = useQuerySalesActionSwr(addressable, { actionId }, ready && actionId.length > 0)

    return { pipeline, readiness, policy, opportunity, command, action }
}
