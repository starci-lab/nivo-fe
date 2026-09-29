"use client"
import { myAcademyIntegrations } from "@/modules/api/academy"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_ACADEMY_INTEGRATIONS_SWR_KEY } from "../swr.shared"

/** Read configured Academy integrations for one site. */
export const useQueryMyAcademyIntegrationsSwr = (siteId: string) =>
    useNivoQuery(QUERY_ACADEMY_INTEGRATIONS_SWR_KEY(siteId), () => myAcademyIntegrations(siteId))
