"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { startAgentosCustomModuleIntake } from "@/modules/api/console"
import { AgentOSModuleIntakeBase } from "./component"

type AgentOSModuleIntakeProps = { readonly workspaceId: string }

/** Create the durable intake identity and continue to its exact studio route. */
export const AgentOSModuleIntake = ({ workspaceId }: AgentOSModuleIntakeProps) => {
    const t = useTranslations("console.agentos.modules.intake")
    const locale = useLocale()
    const router = useRouter()
    const [goal, setGoal] = useState("")
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string>()
    const submit = async () => {
        setPending(true); setError(undefined)
        const result = await startAgentosCustomModuleIntake({ agentWorkspaceId: workspaceId, goal: goal.trim(), idempotencyKey: `nivo-fe:${crypto.randomUUID()}` })
        setPending(false)
        if (!result.ok) { setError(t("refused")); return }
        router.push(`/${locale}/agentos/workspaces/${workspaceId}/modules/studio/${result.data.module.id}`)
    }
    return <AgentOSModuleIntakeBase goal={goal} pending={pending} error={error} title={t("title")} description={t("description")} fieldLabel={t("fieldLabel")} placeholder={t("placeholder")} note={t("note")} action={t("action")} guideTitle={t("guideTitle")} guideSteps={[t("steps.goal"), t("steps.followUp"), t("steps.review")]} guideNote={t("guideNote")} onGoal={setGoal} onSubmit={() => void submit()} />
}

/** Source-level tier marker for the connected intake owner. */
export const meta = { shape: "block", world: "connected" } as const
