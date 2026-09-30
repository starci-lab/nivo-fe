import { installAgentosSolutionModule } from "@/modules/api/agentos-modules"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_SOLUTION_MODULE_INSTALL_SWR_KEY, QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY, QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Install one registry module and refresh the workspace installation/control-center projections. */
export const useMutateInstallAgentosSolutionModuleSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_SOLUTION_MODULE_INSTALL_SWR_KEY(workspaceId),
        (input: InstallAgentosSolutionModuleCommand) =>
            installAgentosSolutionModule({
                agentWorkspaceId: workspaceId,
                ...input,
            }),
        {
            invalidates: [
                QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY(workspaceId),
                QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY(workspaceId),
            ],
            shouldInvalidate: accepted,
        },
    )

type InstallAgentosSolutionModuleCommand = {
    readonly moduleKey: string
    readonly idempotencyKey: string
}
