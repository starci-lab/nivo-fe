"use client"
import { myAcademyGrowthSnapshot } from "@/modules/api/academy"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_ACADEMY_GROWTH_SWR_KEY } from "../swr.shared"

/** Read the Academy growth projection for one site. */
export const useQueryMyAcademyGrowthSnapshotSwr = (siteId: string) =>
    useNivoQuery(QUERY_ACADEMY_GROWTH_SWR_KEY(siteId), () => myAcademyGrowthSnapshot(siteId))
