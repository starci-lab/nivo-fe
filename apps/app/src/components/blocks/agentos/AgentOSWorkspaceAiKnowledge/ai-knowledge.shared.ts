import type { MyAgentosAiKnowledgeReadinessData } from "@/modules/api/__generated__/core"
import type { FailureKind } from "@nivo/api"

/** Translation key for a distinct action failure returned by the API. */
export const agentOSWorkspaceAiKnowledgeFailureMessage = (
    kind: FailureKind,
): "signInRequired" | "forbidden" | "notFound" | "invalid" | "actionUnavailable" => {
    switch (kind) {
        case "refused":
            return "signInRequired"
        case "forbidden":
            return "forbidden"
        case "not-found":
            return "notFound"
        case "invalid":
            return "invalid"
        case "unavailable":
            return "actionUnavailable"
    }
}

/** Browser-local lifecycle for a bounded readiness or recovery operation. */
export type AgentOSWorkspaceAiKnowledgeAction = {
    readonly kind: "testing" | "recovering" | "success"
    readonly operationId: string | null
} | null

/** Complete only the exact operation receipt returned to this browser action. */
export const resolveAgentOSWorkspaceAiKnowledgeAction = (
    action: AgentOSWorkspaceAiKnowledgeAction,
    readiness: MyAgentosAiKnowledgeReadinessData | null | undefined,
): AgentOSWorkspaceAiKnowledgeAction => {
    if (
        action === null ||
        action.kind === "success" ||
        action.operationId === null ||
        readiness === undefined ||
        readiness === null
    )
        return action
    if (
        action.kind === "testing" &&
        readiness.readinessOperationId === action.operationId &&
        readiness.readinessStatus !== "testing"
    ) {
        return readiness.aiReady ? { kind: "success", operationId: null } : null
    }
    if (action.kind === "recovering" && readiness.knowledgeRecoveryOperationId === action.operationId) {
        return { kind: "success", operationId: null }
    }
    return action
}

/** The source-owned readiness state and the action started by this page. */
export const resolveAgentOSWorkspaceAiKnowledgeState = (
    readiness: MyAgentosAiKnowledgeReadinessData | null | undefined,
    action: AgentOSWorkspaceAiKnowledgeAction,
    actionRefused: boolean,
): "loading" | "key-configuring" | "ready" | "refused" | "testing" | "recovering" | "success" | "failed" => {
    if (readiness === null || actionRefused) return "refused"
    if (action?.kind === "testing" || readiness?.readinessStatus === "testing") return "testing"
    if (action?.kind === "recovering") return "recovering"
    if (action?.kind === "success") return "success"
    if (readiness === undefined) return "loading"
    if (readiness.credentialStatus !== "configured") return "key-configuring"
    return readiness.aiReady ? "ready" : "refused"
}
