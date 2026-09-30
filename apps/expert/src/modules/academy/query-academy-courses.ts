import { fetchCourses } from "@/modules/api/academy"
import type { CoursesQuery } from "@/modules/api/__generated__/graphql"
import type { Outcome } from "@nivo/api"

/**
 * Keep the public Academy catalog transport behind one server query boundary.
 *
 * Return the API outcome intact so the page can choose how to present a failed read.
 */
export const queryAcademyCourses = (): Promise<
    Outcome<Array<NonNullable<CoursesQuery["courses"]["data"]>[number]>>
> => fetchCourses()
