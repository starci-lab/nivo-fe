import { useCallback } from "react"

/** Read one exact durable test run imperatively while a bounded poll is active. */
export const useReadMyAgentosModuleTestRun = (installationId: string) =>
    useCallback((runId: string) => myAgentosModuleTestRun(installationId, runId), [installationId])
