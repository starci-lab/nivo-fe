import { updateExpertSiteLead } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_LEAD_UPDATE_SWR_KEY, QUERY_EXPERT_SITE_LEADS_SWR_KEY } from "../swr.shared"

/** Advance or annotate a lead and refresh its owner-scoped collection. */
export const useMutateUpdateExpertSiteLeadSwr = (siteId: string) =>
    useNivoMutation(MUTATION_ACADEMY_LEAD_UPDATE_SWR_KEY(siteId), updateExpertSiteLead, {
        invalidates: [QUERY_EXPERT_SITE_LEADS_SWR_KEY(siteId)],
        shouldInvalidate: (answer) => answer.ok,
    })
