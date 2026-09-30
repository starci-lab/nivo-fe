
"use client"
import {
    useMutateReindexAgentWorkspaceKnowledgeSwr,
    useMutateRunAgentosAiReadinessTestSwr,
    useQueryMyAgentosAiKnowledgeReadinessSwr,
} from "@/hooks/swr"
import { useQueryNoticeData } from "@/hooks/query"
import { nivoQueryReading } from "@/modules/query"
import type { FailureKind } from "@nivo/api"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { AgentOSWorkspaceAiKnowledgeBase } from "./component"
import {
    agentOSWorkspaceAiKnowledgeFailureMessage,
    resolveAgentOSWorkspaceAiKnowledgeAction,
    resolveAgentOSWorkspaceAiKnowledgeState,
    type AgentOSWorkspaceAiKnowledgeAction,
} from "./ai-knowledge.shared"

export {
    agentOSWorkspaceAiKnowledgeFailureMessage,
    resolveAgentOSWorkspaceAiKnowledgeAction,
    resolveAgentOSWorkspaceAiKnowledgeState,
} from "./ai-knowledge.shared"
export type { AgentOSWorkspaceAiKnowledgeAction } from "./ai-knowledge.shared"
/** Exact workspace identity whose AI and knowledge readiness is owned by this block. */
export type AgentOSWorkspaceAiKnowledgeProps = {
    readonly workspaceId: string
}
/** Own workspace AI readiness reads, bounded tests, recovery dispatch and operation polling. */
export const AgentOSWorkspaceAiKnowledge = (props: AgentOSWorkspaceAiKnowledgeProps) => {
    const { workspaceId }: AgentOSWorkspaceAiKnowledgeProps = props
    const t = useTranslations("console.agentos.workspace.aiKnowledge")
    const queryT = useTranslations("console.query")
    const noticeOf = useQueryNoticeData()
    const format: Formatter = useFormatter()
    const [action, setAction] = useState<AgentOSWorkspaceAiKnowledgeAction>(null)
    const [actionFailure, setActionFailure] = useState<FailureKind>()
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
    const failAction = (kind: FailureKind) => setActionFailure(kind)
    const run = async () => {
        setRecoveryFromRefused(false)
        setActionFailure(undefined)
        setAction({
            kind: "testing",
            operationId: null,
        })
        const result = await runReadinessTest.trigger(crypto.randomUUID())
        if (result.ok) {
            setAction({
                kind: "testing",
                operationId: result.data.operationId,
            })
            return
        }
        switch (result.kind) {
            case "refused":
                failAction(result.kind)
                setAction(null)
                return
            case "forbidden":
                failAction(result.kind)
                setAction(null)
                return
            case "not-found":
                failAction(result.kind)
                setAction(null)
                return
            case "invalid":
                failAction(result.kind)
                setAction(null)
                return
            case "unavailable":
                failAction(result.kind)
                setAction(null)
                return
        }
    }
    const recover = async () => {
        setRecoveryFromRefused(
            resolveAgentOSWorkspaceAiKnowledgeState(readiness, visibleAction, actionFailure !== undefined) === "refused",
        )
        setActionFailure(undefined)
        setAction({
            kind: "recovering",
            operationId: null,
        })
        const result = await reindexKnowledge.trigger(crypto.randomUUID())
        if (result.ok) {
            setAction({
                kind: "recovering",
                operationId: result.data.operationId,
            })
            return
        }
        switch (result.kind) {
            case "refused":
                failAction(result.kind)
                setAction(null)
                return
            case "forbidden":
                failAction(result.kind)
                setAction(null)
                return
            case "not-found":
                failAction(result.kind)
                setAction(null)
                return
            case "invalid":
                failAction(result.kind)
                setAction(null)
                return
            case "unavailable":
                failAction(result.kind)
                setAction(null)
                return
        }
    }
    const state =
        reading.status === "failed"
            ? "failed"
            : resolveAgentOSWorkspaceAiKnowledgeState(readiness, visibleAction, actionFailure !== undefined)
    const labels = {
        sectionHeading: t("sectionHeading"),
        title: t("title"),
        description: t("description"),
        ready: t("ready"),
        testing: t("testing"),
        refused:
            actionFailure === undefined
                ? t("refused")
                : queryT(agentOSWorkspaceAiKnowledgeFailureMessage(actionFailure)),
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
