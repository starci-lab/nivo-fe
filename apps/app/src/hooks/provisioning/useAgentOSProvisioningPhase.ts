
import { useFormatter, useTranslations } from "next-intl"
import { useQueryMyAgentosAiKnowledgeReadinessSwr } from "@/hooks"
import { nivoQueryReading } from "@/modules/query"
import {
    phaseIndexOf,
    queryFailureText,
    readinessMilestoneState,
    stepState,
    type AgentOSFlow,
} from "@/modules/provisioning/agentos-flow"
import { agentOSCopyOf } from "./provisioning.shared"

/** Derive the progress rail and readiness view from the settled purchase phase. */
export const useAgentOSProvisioningPhase = (flow: AgentOSFlow) => {
    const t = useTranslations("console.provisioningFlows")
    const tShared = useTranslations("console")
    const formatter = useFormatter()
    const workspaceId = flow.phase === "ready" ? flow.workspaceId : undefined
    const readinessQuery = useQueryMyAgentosAiKnowledgeReadinessSwr(workspaceId)
    const readinessReading = nivoQueryReading(readinessQuery.data)
    const readinessFailure =
        readinessReading.status === "failed"
            ? {
                  kind: readinessReading.kind,
                  retryable: readinessReading.retryable,
                  text: queryFailureText(readinessReading.kind, agentOSCopyOf(t, tShared).shared),
              }
            : null
    const readiness =
        readinessReading.status === "ready" ? readinessReading.data : readinessReading.status === "failed" ? null : undefined
    const stateLabels = {
        done: t("stepState.done"),
        current: t("stepState.current"),
        upcoming: t("stepState.upcoming"),
    } as const
    const phaseIndex = phaseIndexOf(flow)
    const progressSteps = [t("steps.request"), t("steps.payment"), t("steps.createWorkspace"), t("steps.ready")]
    const steps = progressSteps.map((label, index) => {
        const state = stepState(index, phaseIndex)
        return { ordinal: String(index + 1), label, state, stateLabel: stateLabels[state] }
    })
    if (flow.phase === "ready") {
        const complete = [
            readiness?.credentialStatus === "configured",
            Boolean(readiness?.chatModel),
            (readiness?.origins.length ?? 0) > 0 && readiness?.knowledgeRecoveryOperationId === null,
            readiness?.qdrantHealth === "healthy",
            readiness?.aiReady === true,
        ]
        const current = complete.findIndex((done) => !done)
        const labels = [t("steps.credential"), t("steps.deepseek"), t("steps.knowledge"), t("steps.qdrant"), t("steps.aiTest")]
        steps.splice(
            0,
            steps.length,
            ...labels.map((label, index) => {
                const state = readinessMilestoneState(index, current)
                return { ordinal: String(index + 1), label, state, stateLabel: stateLabels[state] }
            }),
        )
    }
    const amountOf = (amount: string, currency: string): string => {
        const value = Number(amount)
        return Number.isFinite(value)
            ? formatter.number(value, { style: "currency", currency, maximumFractionDigits: 0 })
            : `${amount} ${currency}`
    }

    return { steps, readiness, readinessFailure, refreshReadiness: readinessQuery.mutate, amountOf }
}
