"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { FailureKind } from "@nivo/api"
import { useAgentOSModuleStudioProjection } from "@/hooks/agentos"
import { useMutateAnswerAgentosCustomModuleIntakeSwr } from "@/hooks/swr"
import { AgentOSModuleInterviewBase } from "./component"
type AgentOSModuleInterviewProps = {
    readonly workspaceId: string
    readonly moduleId: string
}
const projectionState = (refused: boolean, studio: ReturnType<typeof useAgentOSModuleStudioProjection>["studio"]) => {
    if (refused) return "refused"
    return studio === undefined ? "loading" : "ready"
}

/** Consume the page projection and own the answer-before-next-question mutation. */
export const AgentOSModuleInterview = (props: AgentOSModuleInterviewProps) => {
    const { workspaceId, moduleId }: AgentOSModuleInterviewProps = props
    const t = useTranslations("console.agentos.modules.studio.interview")
    const queryT = useTranslations("console.query")
    const { studio } = useAgentOSModuleStudioProjection()
    const answerIntake = useMutateAnswerAgentosCustomModuleIntakeSwr(workspaceId, moduleId)
    const [failureMessage, setFailureMessage] = useState<string>()
    const [answer, setAnswer] = useState("")
    const send = async () => {
        try {
            const result = await answerIntake.trigger({
                answer: answer.trim(),
            })
            if (result.ok) {
                setFailureMessage(undefined)
                setAnswer("")
                return
            }
            const failureText = (kind: FailureKind): string => {
                switch (kind) {
                    case "refused":
                        return queryT("signInRequired")
                    case "forbidden":
                        return queryT("forbidden")
                    case "not-found":
                        return queryT("notFound")
                    case "invalid":
                        return queryT("invalid")
                    case "unavailable":
                        return queryT("actionUnavailable")
                }
            }
            switch (result.kind) {
                case "refused":
                    setFailureMessage(failureText(result.kind))
                    return
                case "forbidden":
                    setFailureMessage(failureText(result.kind))
                    return
                case "not-found":
                    setFailureMessage(failureText(result.kind))
                    return
                case "invalid":
                    setFailureMessage(failureText(result.kind))
                    return
                case "unavailable":
                    setFailureMessage(failureText(result.kind))
                    return
            }
        } catch {
            setFailureMessage(queryT("actionUnavailable"))
        }
    }
    return (
        <AgentOSModuleInterviewBase
            state={projectionState(failureMessage !== undefined, studio)}
            props={{
                studio: studio ?? undefined,
                answer,
                pending: answerIntake.isMutating,
                labels: {
                    title: t("title"),
                    saved: t("saved"),
                    refused: failureMessage ?? t("refused"),
                    field: t("field"),
                    placeholder: t("placeholder"),
                    send: t("send"),
                    complete: t("complete"),
                    agent: t("agent"),
                    you: t("you"),
                },
            }}
            on={{ onAnswer: setAnswer, onSend: () => void send() }}
        />
    )
}
