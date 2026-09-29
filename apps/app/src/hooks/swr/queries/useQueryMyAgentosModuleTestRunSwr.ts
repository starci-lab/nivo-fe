"use client"
import type { SWRConfiguration } from "swr"
import { myAgentosModuleTestRun, type AgentosModuleTestSurface } from "../../../modules/api/agentos-module-tests"
import type { Outcome } from "../../../modules/api/outcome"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY } from "../swr.shared"

/** Read one durable module test run only after its identity exists. */
export const useQueryMyAgentosModuleTestRunSwr = (
    installationId: string,
    runId?: string,
    config?: SWRConfiguration<Outcome<AgentosModuleTestSurface>, Error>,
) =>
    useNivoQuery(
        runId === undefined ? null : QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY(installationId, runId),
        () => myAgentosModuleTestRun(installationId, runId ?? ""),
        config,
    )
