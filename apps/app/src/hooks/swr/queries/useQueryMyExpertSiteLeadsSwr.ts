"use client"
import { myExpertSiteLeads } from "@/modules/api/academy"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_EXPERT_SITE_LEADS_SWR_KEY } from "../swr.shared"

/** Read captured leads for one expert site. */
export const useQueryMyExpertSiteLeadsSwr = (siteId: string) =>
    useNivoQuery(QUERY_EXPERT_SITE_LEADS_SWR_KEY(siteId), () => myExpertSiteLeads(siteId))
