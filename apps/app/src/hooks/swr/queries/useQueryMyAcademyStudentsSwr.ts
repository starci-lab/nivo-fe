"use client"
import { myAcademyStudents } from "@/modules/api/academy"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_ACADEMY_STUDENTS_SWR_KEY } from "../swr.shared"

/** Read the Academy student collection for one site. */
export const useQueryMyAcademyStudentsSwr = (siteId: string) =>
    useNivoQuery(QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId), () =>
        myAcademyStudents({
            siteId,
        }),
    )
