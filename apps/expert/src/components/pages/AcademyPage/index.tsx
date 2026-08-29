import { queryAcademyCourses } from "@/hooks/academy/query-academy-courses";
import { AcademyPageBase as AcademyPageView } from "./component";
/** Props for the routed academy page. */
export type AcademyPageProps = Record<string, never>;

/**
 * PAGE - the academy's landing screen, connected half.
 *
 * A SERVER COMPONENT, AND THE CATALOG IS WHY. This screen exists to be found and to sell courses, so
 * the courses belong in the first HTML response rather than in a second round trip a crawler will
 * not wait for. Fetching here also keeps the API's address on the server for this read.
 *
 * The interactive sections stay behind their client boundary, while this server component keeps
 * the catalog request in the first HTML response.
 *
 * A FAILED FETCH IS AN EMPTY CATALOG, NOT AN ERROR PAGE. The `courses` section already owns the
 * empty state a new academy hits on its first day; showing it beats taking the whole landing page
 * down because one query timed out.
 *
 * IT RESOLVES THE WORLD AND DRAWS NOTHING. Every render path crosses `AcademyPageBase`, which is the
 * whole of the presentation - the moment this file rendered a tree of its own there would be two
 * owners of the screen and the line would stop meaning anything.
 *
 * @returns The page.
 */
export const AcademyPage = async (props: AcademyPageProps) => {
  void props;
  const {
    courses
  } = await queryAcademyCourses();
  return <AcademyPageView courses={courses} />;
};
