import { startAgentosCustomModuleIntake } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY } from "../swr.shared"

/** Create one durable custom-module intake. */
export const useMutateStartAgentosCustomModuleIntakeSwr = (workspaceId: string) =>
    useNivoMutation(MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY(workspaceId), (input: StartAgentosCustomModuleIntakeCommand) =>
        startAgentosCustomModuleIntake({
            agentWorkspaceId: workspaceId,
            ...input,
        }),
    )

type StartAgentosCustomModuleIntakeCommand = {
    readonly goal: string
    readonly idempotencyKey: string
}
