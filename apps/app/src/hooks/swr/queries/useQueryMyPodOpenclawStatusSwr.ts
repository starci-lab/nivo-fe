import { myPodOpenclawStatus } from "@/modules/api/instances"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_POD_OPENCLAW_STATUS_SWR_KEY } from "../swr.shared"

/** Read the owner's OpenClaw pod status. */
export const useQueryMyPodOpenclawStatusSwr = () => useNivoQuery(QUERY_POD_OPENCLAW_STATUS_SWR_KEY, myPodOpenclawStatus)
