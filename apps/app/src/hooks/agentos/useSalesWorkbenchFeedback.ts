import {
    salesActionStatusKey,
    salesCommandStatusKey,
    salesLifecycleKey,
    salesRefusalKey,
    salesWording,
    type SalesCommandAnswer,
} from "@/modules/sales/sales-workbench"
import {
    parseSalesActionValue,
    parseSalesCommandValue,
    parseSalesOpportunityValue,
    parseSalesPolicyValue,
} from "@/modules/api/sales/payload.guards"
import { useWorkbenchCommand } from "./useWorkbenchCommand"
import type { useSalesWorkbenchContext } from "./useSalesWorkbenchContext"

type ServedSalesAnswer = Extract<SalesCommandAnswer, { readonly ok: true }>

/** Project the SalesWorkbenchFeedback responsibility for one workbench. */
export const useSalesWorkbenchFeedback = (context: ReturnType<typeof useSalesWorkbenchContext>) => {
    const { t } = context
    const workbenchCommand = useWorkbenchCommand({
        refusal: (code, reason) => t(salesRefusalKey(code), { reason }),
        unsettled: t("refusal.unsettled"),
        unreachable: t("refusal.unreachable"),
        acceptsFailedAnswer: (code) => code === "outcome_unknown" || code === "DEADLINE_EXCEEDED",
    })

    const planSettled = (answer: ServedSalesAnswer): string | null => {
        const state = parseSalesCommandValue(answer.data)
        const status = state?.status
        return status === undefined
            ? null
            : t("command.settled", { status: salesWording(salesCommandStatusKey(status), status, t) })
    }
    const closeSettled = (answer: ServedSalesAnswer): string | null => {
        const state = parseSalesOpportunityValue(answer.data)
        const status = state?.status
        return state?.opportunityId === undefined || status === undefined
            ? null
            : t("closure.settled", {
                  opportunity: state.opportunityId,
                  status: salesWording(salesLifecycleKey(status), status, t),
              })
    }
    const actionSettled = (answer: ServedSalesAnswer): string | null => {
        const state = parseSalesActionValue(answer.data)
        const status = state?.status
        return state?.actionId === undefined || status === undefined
            ? null
            : t("recovery.settled", {
                  action: state.actionId,
                  status: salesWording(salesActionStatusKey(status), status, t),
              })
    }
    const policySettled = (answer: ServedSalesAnswer): string | null => {
        const state = parseSalesPolicyValue(answer.data)
        return state?.revision === undefined ? null : t("policy.settled", { revision: state.revision })
    }
    const describe = (answer: SalesCommandAnswer, settled: (served: ServedSalesAnswer) => string | null) => {
        if (!answer.ok) {
            return { kind: "refused" as const, message: t(salesRefusalKey(answer.code), { reason: answer.reason }) }
        }
        const message = settled(answer)
        return message === null ? null : { kind: "success" as const, message }
    }
    return { workbenchCommand, planSettled, closeSettled, actionSettled, policySettled, describe }
}
