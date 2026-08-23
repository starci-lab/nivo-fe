"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { answerAgentosCustomModuleIntake, myAgentosCustomModuleStudio, type AgentosModuleStudio } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { AgentOSModuleInterviewBase } from "./component"

type AgentOSModuleInterviewProps = { readonly workspaceId: string, readonly moduleId: string }

/** Own the durable interview read and answer-before-next-question mutation. */
export const AgentOSModuleInterview = ({ workspaceId, moduleId }: AgentOSModuleInterviewProps) => {
    const t = useTranslations("console.agentos.modules.studio.interview")
    const session = useSession()
    const [studio, setStudio] = useState<AgentosModuleStudio | null | undefined>()
    const [answer, setAnswer] = useState("")
    const [pending, setPending] = useState(false)
    const load = useCallback(async () => { const result = await myAgentosCustomModuleStudio(workspaceId, moduleId); setStudio(result.ok ? result.data : null) }, [moduleId, workspaceId])
    useEffect(() => { if (session.state.status === "signed-in") void load() }, [load, session.state.status])
    const send = async () => { setPending(true); const result = await answerAgentosCustomModuleIntake({ agentWorkspaceId: workspaceId, moduleId, answer: answer.trim() }); setPending(false); if (result.ok) { setStudio(result.data); setAnswer("") } else setStudio(null) }
    return <AgentOSModuleInterviewBase state={studio === undefined ? "loading" : studio === null ? "refused" : "ready"} studio={studio ?? undefined} answer={answer} pending={pending} labels={{ title: t("title"), saved: t("saved"), refused: t("refused"), field: t("field"), placeholder: t("placeholder"), send: t("send"), complete: t("complete"), agent: t("agent"), you: t("you") }} onAnswer={setAnswer} onSend={() => void send()} />
}

/** Source-level tier marker for the connected interview owner. */
export const meta = { shape: "block", world: "connected" } as const
