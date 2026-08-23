"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { myAgentosAiKnowledgeReadiness, reindexAgentWorkspaceKnowledge, runAgentosAiReadinessTest, type AgentosAiKnowledgeReadiness } from "@/modules/api/console"
import { AgentOSWorkspaceAiKnowledgeBase, type AgentOSWorkspaceAiKnowledgeViewProps } from "./component"

/** Exact workspace identity whose AI and knowledge readiness is owned by this block. */
export type AgentOSWorkspaceAiKnowledgeProps = { readonly workspaceId: string }

/** Own workspace AI readiness reads, bounded tests, recovery dispatch and operation polling. */
export const AgentOSWorkspaceAiKnowledge = ({ workspaceId }: AgentOSWorkspaceAiKnowledgeProps) => {
    const t = useTranslations("console.agentos.workspace.aiKnowledge")
    const locale = useLocale()
    const [readiness, setReadiness] = useState<AgentosAiKnowledgeReadiness | null | undefined>()
    const [action, setAction] = useState<"testing" | "recovering" | "success" | null>(null)
    const load = useCallback(async () => { const result = await myAgentosAiKnowledgeReadiness(workspaceId); setReadiness(result.ok ? result.data : null) }, [workspaceId])
    useEffect(() => { void load() }, [load])
    useEffect(() => {
        if (action !== "testing" && action !== "recovering" && readiness?.readinessOperationId === null && readiness?.knowledgeRecoveryOperationId === null) return
        if (action === null && readiness?.readinessOperationId === null && readiness?.knowledgeRecoveryOperationId === null) return
        const timer = window.setInterval(() => { void load() }, 2_000)
        return () => window.clearInterval(timer)
    }, [action, load, readiness?.knowledgeRecoveryOperationId, readiness?.readinessOperationId])
    useEffect(() => {
        if (action === null || action === "success" || readiness === undefined || readiness === null) return
        if (readiness.readinessOperationId === null && readiness.knowledgeRecoveryOperationId === null && readiness.readinessStatus !== "testing") setAction("success")
    }, [action, readiness])
    const run = async () => { setAction("testing"); const result = await runAgentosAiReadinessTest({ workspaceId, idempotencyKey: crypto.randomUUID() }); if (!result.ok) { setReadiness(null); setAction(null); return }; await load() }
    const recover = async () => { setAction("recovering"); const result = await reindexAgentWorkspaceKnowledge({ workspaceId, idempotencyKey: crypto.randomUUID() }); if (!result.ok) { setReadiness(null); setAction(null); return }; await load() }
    let state: AgentOSWorkspaceAiKnowledgeViewProps["state"] = "loading"
    if (readiness === null) state = "refused"
    else if (action === "testing" || readiness?.readinessStatus === "testing") state = "testing"
    else if (action === "recovering" || readiness?.knowledgeRecoveryOperationId !== null && readiness?.knowledgeRecoveryOperationId !== undefined) state = "recovering"
    else if (action === "success") state = "success"
    else if (readiness !== undefined) state = readiness.aiReady ? "ready" : "refused"
    const labels = {
        title: t("title"), description: t("description"), ready: t("ready"), testing: t("testing"), refused: t("refused"),
        provider: t("provider"), model: t("model"), embedding: t("embedding"), qdrant: t("qdrant"), credential: t("credential"), testedAt: t("testedAt"),
        runTest: t("runTest"), recover: t("recover"), origins: t("origins"), components: t("components"), evidence: t("evidence"),
        documents: (count: number) => t("documents", { count }), current: t("current"), unknownVersion: t("unknownVersion"),
        formatTestedAt: (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)),
    }
    return <AgentOSWorkspaceAiKnowledgeBase state={state} readiness={readiness ?? undefined} labels={labels} onTest={() => void run()} onRecover={() => void recover()} />
}

/** Source-level tier marker for the connected workspace AI and knowledge block. */
export const meta = { shape: "block", world: "connected" } as const
