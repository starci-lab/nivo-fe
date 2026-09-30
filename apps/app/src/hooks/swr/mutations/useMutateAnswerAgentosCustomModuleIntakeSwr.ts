import { answerAgentosCustomModuleIntake } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Append one intake answer and refresh the exact Studio projection. */
export const useMutateAnswerAgentosCustomModuleIntakeSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY(workspaceId, moduleId),
        (input: AnswerAgentosCustomModuleIntakeCommand) =>
            answerAgentosCustomModuleIntake({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

type AnswerAgentosCustomModuleIntakeCommand = {
    readonly answer: string
}
