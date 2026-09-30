import { setAcademyStudentStatus } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_STUDENT_STATUS_SWR_KEY, QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY, QUERY_ACADEMY_STUDENTS_SWR_KEY } from "../swr.shared"

/** Change one Academy student's status and refresh its collection and detail projections. */
export const useMutateSetAcademyStudentStatusSwr = (siteId: string, memberId?: string) =>
    useNivoMutation(MUTATION_ACADEMY_STUDENT_STATUS_SWR_KEY(siteId), setAcademyStudentStatus, {
        invalidates:
            memberId === undefined
                ? [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)]
                : [
                      QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId),
                      QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY(siteId, memberId),
                  ],
        shouldInvalidate: (answer) => answer.ok,
    })
