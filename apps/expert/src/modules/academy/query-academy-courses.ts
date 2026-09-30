import { fetchCourses, type Course } from "@/modules/api/academy"

/**
 * Keep the public Academy catalog transport behind one server query boundary.
 *
 * A failed read is an empty catalog, not an error page: the `courses` section already owns the empty
 * state a new academy hits on its first day.
 */
export const queryAcademyCourses = async (): Promise<{ readonly courses: ReadonlyArray<Course> }> => {
    const result = await fetchCourses()
    return { courses: result.ok ? result.data : [] }
}
