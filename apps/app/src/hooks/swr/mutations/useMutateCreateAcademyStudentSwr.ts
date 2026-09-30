import { createAcademyStudent } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_STUDENT_CREATE_SWR_KEY, QUERY_ACADEMY_STUDENTS_SWR_KEY } from "../swr.shared"

/** Create an Academy student and refresh the owner-scoped collection. */
export const useMutateCreateAcademyStudentSwr = (siteId: string) =>
    useNivoMutation(MUTATION_ACADEMY_STUDENT_CREATE_SWR_KEY(siteId), createAcademyStudent, {
        invalidates: [QUERY_ACADEMY_STUDENTS_SWR_KEY(siteId)],
        shouldInvalidate: (answer) => answer.ok,
    })
