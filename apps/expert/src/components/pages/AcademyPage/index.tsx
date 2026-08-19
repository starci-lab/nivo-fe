import { fetchCourses } from "@/modules/api/academy"
import { _AcademyPage as AcademyPageView } from "./component"

/**
 * PAGE - the academy's landing screen, connected half.
 *
 * A SERVER COMPONENT, AND THE CATALOG IS WHY. This screen exists to be found and to sell courses, so
 * the courses belong in the first HTML response rather than in a second round trip a crawler will
 * not wait for. Fetching here also keeps the API's address on the server for this read.
 *
 * It briefly was a Client Component instead, because the sections block is one and the section
 * registry could not be indexed across the boundary - every lookup returned `undefined` and the page
 * rendered an empty landmark without an error. The registry now owns its own loop inside
 * `AcademySections`, which puts the boundary where the interactivity actually starts.
 *
 * A FAILED FETCH IS AN EMPTY CATALOG, NOT AN ERROR PAGE. The `courses` section already owns the
 * empty state a new academy hits on its first day; showing it beats taking the whole landing page
 * down because one query timed out.
 *
 * IT RESOLVES THE WORLD AND DRAWS NOTHING. Every render path crosses `_AcademyPage`, which is the
 * whole of the presentation - the moment this file rendered a tree of its own there would be two
 * owners of the screen and the line would stop meaning anything.
 *
 * @returns The page.
 */
export const AcademyPage = async () => {
    const { courses } = await fetchCourses()
    return <AcademyPageView courses={courses} />
}
