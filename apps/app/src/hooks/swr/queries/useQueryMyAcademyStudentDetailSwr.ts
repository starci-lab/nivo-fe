"use client"
import { myAcademyStudentDetail } from "@/modules/api/academy"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY } from "../swr.shared"

/** Read one Academy student projection after a member is selected. */
export const useQueryMyAcademyStudentDetailSwr = (siteId: string, memberId?: string) =>
    useNivoQuery(memberId === undefined ? null : QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId), () =>
        myAcademyStudentDetail(siteId, memberId ?? ""),
    )
