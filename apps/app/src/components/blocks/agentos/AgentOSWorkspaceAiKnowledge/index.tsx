"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { myAgentosAiKnowledgeReadiness, reindexAgentWorkspaceKnowledge, runAgentosAiReadinessTest, type AgentosAiKnowledgeReadiness } from "@/modules/api/console"
import { AgentOSWorkspaceAiKnowledgeBase, type AgentOSWorkspaceAiKnowledgeViewProps } from "./component"

/** Exact workspace identity whose AI and knowledge readiness is owned by this block. */
export type AgentOSWorkspaceAiKnowledgeProps = { readonly workspaceId: string }

/** Browser-local lifecycle for the bounded readiness or recovery operation started by this page. */
export type AgentOSWorkspaceAiKnowledgeAction = {
    readonly kind: "testing" | "recovering" | "success"
    readonly operationId: string | null
} | null

/** Complete only the exact operation receipt returned to this browser action. */
export const resolveAgentOSWorkspaceAiKnowledgeAction = (
    action: AgentOSWorkspaceAiKnowledgeAction,
    readiness: AgentosAiKnowledgeReadiness | null | undefined,
): AgentOSWorkspaceAiKnowledgeAction => {
    if (action === null || action.kind === "success" || action.operationId === null || readiness === undefined || readiness === null) return action
    if (action.kind === "testing" && readiness.readinessOperationId === action.operationId && readiness.readinessStatus !== "testing") {
        return readiness.aiReady ? { kind: "success", operationId: null } : null
    }
    if (action.kind === "recovering" && readiness.knowledgeRecoveryOperationId === action.operationId) {
        return { kind: "success", operationId: null }
    }
    return action
}

/** Resolve the visible state from the server lifecycle plus only the action started by this page. */
export const resolveAgentOSWorkspaceAiKnowledgeState = (
    readiness: AgentosAiKnowledgeReadiness | null | undefined,
    action: AgentOSWorkspaceAiKnowledgeAction,
    actionRefused: boolean,
): AgentOSWorkspaceAiKnowledgeViewProps["state"] => {
    if (readiness === null || actionRefused) return "refused"
    if (action?.kind === "testing" || readiness?.readinessStatus === "testing") return "testing"
    if (action?.kind === "recovering") return "recovering"
    if (action?.kind === "success") return "success"
    if (readiness === undefined) return "loading"
    return readiness.credentialStatus !== "configured" ? "key-configuring" : readiness.aiReady ? "ready" : "refused"
}

/** Own workspace AI readiness reads, bounded tests, recovery dispatch and operation polling. */
export const AgentOSWorkspaceAiKnowledge = ({ workspaceId }: AgentOSWorkspaceAiKnowledgeProps) => {
    const t = useTranslations("console.agentos.workspace.aiKnowledge")
    const locale = useLocale()
    const [readiness, setReadiness] = useState<AgentosAiKnowledgeReadiness | null | undefined>()
    const [action, setAction] = useState<AgentOSWorkspaceAiKnowledgeAction>(null)
    const [actionRefused, setActionRefused] = useState(false)
    const load = useCallback(async () => { const result = await myAgentosAiKnowledgeReadiness(workspaceId); setReadiness(result.ok ? result.data : null) }, [workspaceId])
    useEffect(() => { void load() }, [load])
    useEffect(() => {
        if (action?.kind !== "testing" && action?.kind !== "recovering" && readiness?.readinessStatus !== "testing") return
        const timer = window.setInterval(() => { void load() }, 2_000)
        return () => window.clearInterval(timer)
    }, [action?.kind, load, readiness?.readinessStatus])
    useEffect(() => {
        const nextAction = resolveAgentOSWorkspaceAiKnowledgeAction(action, readiness)
        if (nextAction !== action) setAction(nextAction)
    }, [action, readiness])
    const run = async () => { setActionRefused(false); setAction({ kind: "testing", operationId: null }); const result = await runAgentosAiReadinessTest({ workspaceId, idempotencyKey: crypto.randomUUID() }); if (!result.ok) { setActionRefused(true); setAction(null); return }; setAction({ kind: "testing", operationId: result.data.operationId }); await load() }
    const recover = async () => { setActionRefused(false); setAction({ kind: "recovering", operationId: null }); const result = await reindexAgentWorkspaceKnowledge({ workspaceId, idempotencyKey: crypto.randomUUID() }); if (!result.ok) { setActionRefused(true); setAction(null); return }; setAction({ kind: "recovering", operationId: result.data.operationId }); await load() }
    const state = resolveAgentOSWorkspaceAiKnowledgeState(readiness, action, actionRefused)
    const labels = {
        sectionHeading: t("sectionHeading"), title: t("title"), description: t("description"), ready: t("ready"), testing: t("testing"), refused: t("refused"),
        provider: t("provider"), model: t("model"), embedding: t("embedding"), qdrant: t("qdrant"), credential: t("credential"), testedAt: t("testedAt"),
        runTest: t("runTest"), recover: t("recover"), origins: t("origins"), components: t("components"), evidence: t("evidence"),
        documents: (count: number) => t("documents", { count }), current: t("current"), unknownVersion: t("unknownVersion"),
        readinessStages: [t("stages.credential"), t("stages.model"), t("stages.knowledge"), t("stages.qdrant"), t("stages.test")],
        complete: t("complete"), upcoming: t("upcoming"), failureTitle: t("failureTitle"),
        formatTestedAt: (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)),
    }
    return <AgentOSWorkspaceAiKnowledgeBase state={state} readiness={readiness ?? undefined} labels={labels} onTest={() => void run()} onRecover={() => void recover()} />
}

/** Source-level tier marker for the connected workspace AI and knowledge block. */
export const meta = { shape: "block", world: "connected" } as const
