import { type SalesPipelineRequest } from "@/modules/api/sales"
import { type SalesAnswerStanding } from "@/modules/sales/sales-workbench"
import {
    parseSalesActionValue,
    parseSalesCommandValue,
    parseSalesOpportunityValue,
    parseSalesPipelineValue,
    parseSalesPolicyValue,
    parseSalesReadinessValue,
} from "@/modules/api/sales/payload.guards"
import { useSalesWorkbenchCommands } from "./useSalesWorkbenchCommands"
import { useSalesWorkbenchReads } from "./useSalesWorkbenchReads"
import type { useSalesWorkbenchForm } from "./useSalesWorkbenchForm"
import type { useWorkbenchScope } from "./useWorkbenchScope"
const PAGE_SIZE = 20
/** One read's served value, or null when it has not answered with one. */
const answered = <TValue>(
    answer: SalesAnswerStanding | undefined,
    parse: (value: unknown) => TValue | null,
): TValue | null => (answer?.ok === true ? parse(answer.data) : null)

/** The pipeline page a surface opens on, or advances to. */
const pipelinePageOf = (scopeFingerprint: string, cursor: string | null): SalesPipelineRequest => ({
    scopeFingerprint,
    statusFilter: null,
    after: cursor === null ? null : { lastOpportunityId: cursor },
    limit: PAGE_SIZE,
})

/** Project the SalesWorkbenchData responsibility for one workbench. */
export const useSalesWorkbenchData = (
    context: ReturnType<typeof useSalesWorkbenchForm> & ReturnType<typeof useWorkbenchScope>,
) => {
    const { actionId, addressable, commandId, cursor, opportunityId, ready, routeInstallationId, scopeFingerprint } =
        context
    const pipelineInput = pipelinePageOf(scopeFingerprint, cursor)
    const { pipeline, readiness, policy, opportunity, command, action } = useSalesWorkbenchReads({
        addressable,
        pipelineInput,
        routeInstallationId,
        opportunityId,
        commandId,
        actionId,
        ready,
    })
    const { configurePolicy, submitCommand, clarifyCommand, closeOpportunity, recoverAction } =
        useSalesWorkbenchCommands(addressable, ready)

    const pipelineModel = answered(pipeline.data, parseSalesPipelineValue)
    const readinessModel = answered(readiness.data, parseSalesReadinessValue)
    const policyModel = answered(policy.data, parseSalesPolicyValue)
    const opportunityModel = answered(opportunity.data, parseSalesOpportunityValue)
    const commandModel = answered(command.data, parseSalesCommandValue)
    const actionModel = answered(action.data, parseSalesActionValue)

    return {
        action,
        actionModel,
        clarifyCommand,
        closeOpportunity,
        command,
        commandModel,
        configurePolicy,
        opportunity,
        opportunityModel,
        pipeline,
        pipelineModel,
        policy,
        policyModel,
        readiness,
        readinessModel,
        recoverAction,
        submitCommand,
    }
}
