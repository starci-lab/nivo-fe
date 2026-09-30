

import type { RunAgentosModuleTestMutationVariables } from "@/modules/api/__generated__/core"

import { runAgentosModuleTest } from "../../../modules/api/agentos-module-tests"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_TEST_SWR_KEY } from "../swr.shared"

/** Start one immutable module test run for the exact installation under test. */
export const useMutateRunAgentosModuleTestSwr = (installationId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_TEST_SWR_KEY(installationId),
        (input: RunAgentosModuleTestMutationVariables["input"]) => runAgentosModuleTest(input),
    )
