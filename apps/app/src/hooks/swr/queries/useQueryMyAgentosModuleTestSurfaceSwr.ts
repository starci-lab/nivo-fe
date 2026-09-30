
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY } from "../swr.shared"
import { myAgentosModuleTestSurface } from "@/modules/api/agentos-module-tests"

/** Read the immutable test surface for one module installation. */
export const useQueryMyAgentosModuleTestSurfaceSwr = (installationId: string, enabled = true) =>
    useNivoQuery(enabled ? QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY(installationId) : null, () =>
        myAgentosModuleTestSurface(installationId),
    )
