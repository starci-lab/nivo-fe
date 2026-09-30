"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { FailureKind } from "@nivo/api"
import { useRouter } from "@/hooks/i18n"
import { useMutateStartAgentosCustomModuleIntakeSwr } from "@/hooks/swr"
import { moduleStudio } from "@/modules/routes"
import { AgentOSModuleIntakeBase } from "./component"
type AgentOSModuleIntakeProps = {
    readonly workspaceId: string
}

/** Create the durable intake identity and continue to its exact studio route. */
export const AgentOSModuleIntake = (props: AgentOSModuleIntakeProps) => {
    const { workspaceId }: AgentOSModuleIntakeProps = props
    const t = useTranslations("console.agentos.modules.intake")
    const queryT = useTranslations("console.query")
    const router = useRouter()
    const startIntake = useMutateStartAgentosCustomModuleIntakeSwr(workspaceId)
    const [goal, setGoal] = useState("")
    const [error, setError] = useState<string>()
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
    const submit = async () => {
        setError(undefined)
        try {
            const result = await startIntake.trigger({
                goal: goal.trim(),
                idempotencyKey: `nivo-fe:${crypto.randomUUID()}`,
            })
            if (result.ok) {
                router.push(moduleStudio(workspaceId, result.data.module.id))
                return
            }
            switch (result.kind) {
                case "refused":
                    setError(failureText(result.kind))
                    return
                case "forbidden":
                    setError(failureText(result.kind))
                    return
                case "not-found":
                    setError(failureText(result.kind))
                    return
                case "invalid":
                    setError(failureText(result.kind))
                    return
                case "unavailable":
                    setError(failureText(result.kind))
                    return
            }
        } catch {
            setError(queryT("actionUnavailable"))
        }
    }
    return (
        <AgentOSModuleIntakeBase
            props={{
                goal,
                pending: startIntake.isMutating,
                error,
                title: t("title"),
                description: t("description"),
                fieldLabel: t("fieldLabel"),
                placeholder: t("placeholder"),
                note: t("note"),
                action: t("action"),
                guideTitle: t("guideTitle"),
                guideSteps: [t("steps.goal"), t("steps.followUp"), t("steps.review")],
                guideNote: t("guideNote"),
            }}
            on={{ onGoal: setGoal, onSubmit: () => void submit() }}
        />
    )
}
