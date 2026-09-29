"use client"
import { myExpertSiteDeployment } from "@/modules/api/expert-sites"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY } from "../swr.shared"

/** Read one expert-site deployment and optionally poll its durable projection. */
export const useQueryMyExpertSiteDeploymentSwr = (siteId?: string, polling = false) =>
    useNivoQuery(
        siteId === undefined ? null : QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY(siteId),
        () => myExpertSiteDeployment(siteId ?? ""),
        {
            refreshInterval: polling ? 4_000 : 0,
        },
    )
