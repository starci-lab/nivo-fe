import { myAgentosSolutionModules } from "@/modules/api/agentos-modules"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_SOLUTION_MODULES_SWR_KEY } from "../swr.shared"

/** Read the module-kind registry offered to the current viewer. */
export const useQueryMyAgentosSolutionModulesSwr = () =>
    useNivoQuery(QUERY_AGENTOS_SOLUTION_MODULES_SWR_KEY, myAgentosSolutionModules)
