import { grantAcademyCourseAccess } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_COURSE_ACCESS_GRANT_SWR_KEY, QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY, QUERY_ACADEMY_STUDENTS_SWR_KEY } from "../swr.shared"

/** Grant course access and refresh the affected student projection. */
export const useMutateGrantAcademyCourseAccessSwr = (siteId: string, memberId?: string) =>
    useNivoMutation(MUTATION_ACADEMY_COURSE_ACCESS_GRANT_SWR_KEY(siteId), grantAcademyCourseAccess, {
        invalidates:
            memberId === undefined
                ? [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)]
                : [
                      QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId),
                      QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId),
                  ],
        shouldInvalidate: (answer) => answer.ok,
    })
