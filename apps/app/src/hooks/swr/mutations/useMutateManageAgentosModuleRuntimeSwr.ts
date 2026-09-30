

import type { ManageAgentosModuleRuntimeMutationVariables } from "@/modules/api/__generated__/core"

import { manageAgentosModuleRuntime } from "../../../modules/api/agentos-module-runtime"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_RUNTIME_SWR_KEY } from "../swr.shared"

/** Execute one command against a module installation without sharing press state with neighbours. */
export const useMutateManageAgentosModuleRuntimeSwr = (installationId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_RUNTIME_SWR_KEY(installationId),
        (input: ManageAgentosModuleRuntimeMutationVariables["input"]) => manageAgentosModuleRuntime(input),
    )
