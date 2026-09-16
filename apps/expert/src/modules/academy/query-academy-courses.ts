import { fetchCourses } from "@/modules/api/academy";

/** Keep the public Academy catalog transport behind one server query boundary. */
export const queryAcademyCourses = () => fetchCourses();
