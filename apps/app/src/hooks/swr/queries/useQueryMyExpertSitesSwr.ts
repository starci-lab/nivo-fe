"use client"
import { myExpertSites } from "@/modules/api/expert-sites"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_EXPERT_SITES_SWR_KEY } from "../swr.shared"

/** Read the signed-in owner's expert sites. */
export const useQueryMyExpertSitesSwr = () => useNivoQuery(QUERY_EXPERT_SITES_SWR_KEY, myExpertSites)
