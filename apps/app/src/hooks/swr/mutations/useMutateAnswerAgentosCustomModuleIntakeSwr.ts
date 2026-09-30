import { failed } from "@nivo/api"
import { useTranslations } from "next-intl"
import { answerAgentosCustomModuleIntake } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { useQueryMyAgentosCustomModuleStudioSwr } from "../queries/useQueryMyAgentosCustomModuleStudioSwr"
import { MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Append one intake answer and refresh the exact Studio projection. */
export const useMutateAnswerAgentosCustomModuleIntakeSwr = (workspaceId: string, moduleId: string) => {
    const t = useTranslations("console.agentos.modules.studio.interview")
    const studio = useQueryMyAgentosCustomModuleStudioSwr(workspaceId, moduleId)
    return useNivoMutation(
        MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY(workspaceId, moduleId),
        (input: AnswerAgentosCustomModuleIntakeCommand) => {
            const answeredField = studio.data?.ok === true ? (studio.data.data.module.missingFields[0] ?? null) : null
            if (answeredField === null || answeredField.length === 0)
                return Promise.resolve(
                    failed("unavailable", {
                        code: "INTAKE_QUESTION_UNAVAILABLE",
                        reason: t("refused"),
                    }),
                )
            return answerAgentosCustomModuleIntake({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
                answeredField,
            })
        },
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )
}

type AnswerAgentosCustomModuleIntakeCommand = {
    readonly answer: string
}
