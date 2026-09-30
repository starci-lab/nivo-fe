import { revokeAcademyCourseAccess } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_COURSE_ACCESS_REVOKE_SWR_KEY, QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY, QUERY_ACADEMY_STUDENTS_SWR_KEY } from "../swr.shared"

/** Revoke course access and refresh the affected student projection. */
export const useMutateRevokeAcademyCourseAccessSwr = (siteId: string, memberId?: string) =>
    useNivoMutation(MUTATION_ACADEMY_COURSE_ACCESS_REVOKE_SWR_KEY(siteId), revokeAcademyCourseAccess, {
        invalidates:
            memberId === undefined
                ? [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)]
                : [
                      QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId),
                      QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId),
                  ],
        shouldInvalidate: (answer) => answer.ok,
    })
