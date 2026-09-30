import type { SWRConfiguration } from "swr"
import type { AgentosModuleTestSurfaceView } from "@/modules/api/agentos-module-tests"
import { myAgentosModuleTestRun } from "../../../modules/api/agentos-module-tests"
import type { Outcome } from "@nivo/api"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY } from "../swr.shared"

/** Read one durable module test run only after its identity exists. */
export const useQueryMyAgentosModuleTestRunSwr = (
    installationId: string,
    runId?: string,
    config?: SWRConfiguration<Outcome<AgentosModuleTestSurfaceView>, Error>,
) =>
    useNivoQuery(
        runId === undefined ? null : QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY(installationId, runId),
        () => myAgentosModuleTestRun(installationId, runId ?? ""),
        config,
    )
