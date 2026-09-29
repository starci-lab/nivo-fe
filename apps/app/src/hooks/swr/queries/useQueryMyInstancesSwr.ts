"use client"
import { myInstances } from "@/modules/api/instances"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_INSTANCES_SWR_KEY } from "../swr.shared"

/** Read infrastructure instances owned by the signed-in viewer. */
export const useQueryMyInstancesSwr = () => useNivoQuery(QUERY_INSTANCES_SWR_KEY, myInstances)
