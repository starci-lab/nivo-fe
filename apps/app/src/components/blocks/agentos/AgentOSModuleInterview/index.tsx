"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { answerAgentosCustomModuleIntake } from "@/modules/api/console"
import { useAgentOSModuleStudioProjection } from "@/components/pages/AgentOSModuleStudioPage/component"
import { AgentOSModuleInterviewBase } from "./component"

type AgentOSModuleInterviewProps = { readonly workspaceId: string, readonly moduleId: string }

/** Consume the page projection and own the answer-before-next-question mutation. */
export const AgentOSModuleInterview = ({ workspaceId, moduleId }: AgentOSModuleInterviewProps) => {
    const t = useTranslations("console.agentos.modules.studio.interview")
    const { studio, refresh } = useAgentOSModuleStudioProjection()
    const [refused, setRefused] = useState(false)
    const [answer, setAnswer] = useState("")
    const [pending, setPending] = useState(false)
    const send = async () => {
        setPending(true)
        const result = await answerAgentosCustomModuleIntake({ agentWorkspaceId: workspaceId, moduleId, answer: answer.trim() })
        setPending(false)
        if (!result.ok) { setRefused(true); return }
        setRefused(false)
        setAnswer("")
        await refresh()
    }
    return <AgentOSModuleInterviewBase state={refused || studio === null ? "refused" : studio === undefined ? "loading" : "ready"} studio={studio ?? undefined} answer={answer} pending={pending} labels={{ title: t("title"), saved: t("saved"), refused: t("refused"), field: t("field"), placeholder: t("placeholder"), send: t("send"), complete: t("complete"), agent: t("agent"), you: t("you") }} onAnswer={setAnswer} onSend={() => void send()} />
}

/** Source-level tier marker for the connected interview owner. */
export const meta = { shape: "block", world: "connected" } as const
