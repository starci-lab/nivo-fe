
import type { MyAgentosAiKnowledgeReadinessData } from "@/modules/api/__generated__/core"

"use client"
import {
    useMutateReindexAgentWorkspaceKnowledgeSwr,
    useMutateRunAgentosAiReadinessTestSwr,
    useQueryMyAgentosAiKnowledgeReadinessSwr,
} from "@/hooks/swr"
import { useQueryNoticeData } from "@/hooks/query"
import { nivoQueryReading } from "@/modules/query"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { AgentOSWorkspaceAiKnowledgeBase, type AgentOSWorkspaceAiKnowledgeViewProps } from "./component"
/** Exact workspace identity whose AI and knowledge readiness is owned by this block. */
export type AgentOSWorkspaceAiKnowledgeProps = {
    readonly workspaceId: string
}
/** Browser-local lifecycle for the bounded readiness or recovery operation started by this page. */
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
        return readiness.aiReady
            ? {
                  kind: "success",
                  operationId: null,
              }
            : null
    }
    if (action.kind === "recovering" && readiness.knowledgeRecoveryOperationId === action.operationId) {
        return {
            kind: "success",
            operationId: null,
        }
    }
    return action
}
/** Resolve the visible state from the server lifecycle plus only the action started by this page. */
export const resolveAgentOSWorkspaceAiKnowledgeState = (
    readiness: MyAgentosAiKnowledgeReadinessData | null | undefined,
    action: AgentOSWorkspaceAiKnowledgeAction,
    actionRefused: boolean,
): AgentOSWorkspaceAiKnowledgeViewProps["state"] => {
    if (readiness === null || actionRefused) return "refused"
    if (action?.kind === "testing" || readiness?.readinessStatus === "testing") return "testing"
    if (action?.kind === "recovering") return "recovering"
    if (action?.kind === "success") return "success"
    if (readiness === undefined) return "loading"
    if (readiness.credentialStatus !== "configured") return "key-configuring"
    return readiness.aiReady ? "ready" : "refused"
}
/** Own workspace AI readiness reads, bounded tests, recovery dispatch and operation polling. */
export const AgentOSWorkspaceAiKnowledge = (props: AgentOSWorkspaceAiKnowledgeProps) => {
    const { workspaceId }: AgentOSWorkspaceAiKnowledgeProps = props
    const t = useTranslations("console.agentos.workspace.aiKnowledge")
    const noticeOf = useQueryNoticeData()
    const format: Formatter = useFormatter()
    const [action, setAction] = useState<AgentOSWorkspaceAiKnowledgeAction>(null)
    const [actionRefused, setActionRefused] = useState(false)
    const [recoveryFromRefused, setRecoveryFromRefused] = useState(false)
    const runReadinessTest = useMutateRunAgentosAiReadinessTestSwr(workspaceId)
    const reindexKnowledge = useMutateReindexAgentWorkspaceKnowledgeSwr(workspaceId)
    const query = useQueryMyAgentosAiKnowledgeReadinessSwr(
        workspaceId,
        action?.kind === "testing" || action?.kind === "recovering",
    )
    const reading = nivoQueryReading(query.data)
    const readiness = reading.status === "ready" ? reading.data : undefined
    const visibleAction = resolveAgentOSWorkspaceAiKnowledgeAction(action, readiness)
    if (visibleAction !== action) setAction(visibleAction)
    const run = async () => {
        setRecoveryFromRefused(false)
        setActionRefused(false)
        setAction({
            kind: "testing",
            operationId: null,
        })
        const result = await runReadinessTest.trigger(crypto.randomUUID())
        if (!result.ok) {
            setActionRefused(true)
            setAction(null)
            return
        }
        setAction({
            kind: "testing",
            operationId: result.data.operationId,
        })
    }
    const recover = async () => {
        setRecoveryFromRefused(
            resolveAgentOSWorkspaceAiKnowledgeState(readiness, visibleAction, actionRefused) === "refused",
        )
        setActionRefused(false)
        setAction({
            kind: "recovering",
            operationId: null,
        })
        const result = await reindexKnowledge.trigger(crypto.randomUUID())
        if (!result.ok) {
            setActionRefused(true)
            setAction(null)
            return
        }
        setAction({
            kind: "recovering",
            operationId: result.data.operationId,
        })
    }
    const state =
        reading.status === "failed"
            ? "failed"
            : resolveAgentOSWorkspaceAiKnowledgeState(readiness, visibleAction, actionRefused)
    const labels = {
        sectionHeading: t("sectionHeading"),
        title: t("title"),
        description: t("description"),
        ready: t("ready"),
        testing: t("testing"),
        refused: t("refused"),
        provider: t("provider"),
        model: t("model"),
        embedding: t("embedding"),
        qdrant: t("qdrant"),
        credential: t("credential"),
        testedAt: t("testedAt"),
        runTest: t("runTest"),
        recover: t("recover"),
        origins: t("origins"),
        components: t("components"),
        evidence: t("evidence"),
        documents: (count: number) =>
            t("documents", {
                count,
            }),
        current: t("current"),
        unknownVersion: t("unknownVersion"),
        readinessStages: [
            t("stages.credential"),
            t("stages.model"),
            t("stages.knowledge"),
            t("stages.qdrant"),
            t("stages.test"),
        ],
        complete: t("complete"),
        upcoming: t("upcoming"),
        failureTitle: t("failureTitle"),
        formatTestedAt: (value: string) =>
            format.dateTime(new Date(value), {
                dateStyle: "medium",
                timeStyle: "short",
            }),
    }
    return (
        <AgentOSWorkspaceAiKnowledgeBase
            state={state}
            props={{
                readiness: readiness ?? undefined,
                notice: reading.status === "failed" ? noticeOf(reading) : undefined,
                labels,
                pendingAction:
                    visibleAction?.kind === "testing" || visibleAction?.kind === "recovering"
                        ? visibleAction.kind
                        : undefined,
                recoveryFromRefused: visibleAction?.kind === "recovering" && recoveryFromRefused,
            }}
            on={{
                onTest: () => void run(),
                onRecover: () => void recover(),
                onRetryNotice: () => void query.mutate(),
                documents: labels.documents,
                formatTestedAt: labels.formatTestedAt,
            }}
        />
    )
}
