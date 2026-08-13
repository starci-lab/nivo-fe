import { graphql } from "./graphql"

/**
 * The two public operations an academy's landing page needs.
 *
 * BOTH ARE PUBLIC ON THE BACKEND, and that is stated there rather than assumed here: the `courses`
 * resolver notes the catalog "stays browsable without an account", and `submitLead` is marked
 * public. So neither call carries a token, and a visitor who has never signed in sees the same
 * catalog the owner does.
 */

/** One course in the catalog. A subset of `CourseEntity` -- what a landing page can show. */
export interface Course {
    id: string
    slug: string
    title: string
    summary: string | null
    priceText: string | null
    sortIndex: number
}

/**
 * Reads the course catalog.
 *
 * ASKS FOR SIX FIELDS, NOT THE ENTITY. `CourseEntity` also carries `lessons`, `priceVnd` and
 * timestamps; a landing page shows none of them, and requesting them would make the page's payload
 * grow every time somebody adds a column to a table it does not read.
 *
 * AN EMPTY LIST AND A FAILED CALL ARE THE SAME PICTURE HERE, deliberately. The `courses` section
 * already owns an empty state a new academy hits on its first day, and showing that beats an error
 * banner on a marketing page when the API is briefly down. The reason is returned anyway so a
 * caller that wants to log it can.
 *
 * @returns The catalog in the expert's own order.
 */
export const fetchCourses = async (): Promise<{ courses: Array<Course>, reason?: string }> => {
    const result = await graphql<Array<Course>>(
        `query Courses {
            courses {
                success
                message
                error
                data { id slug title summary priceText sortIndex }
            }
        }`,
        undefined,
        // Re-read once a minute. A course list changes when the expert edits it, which is rare and
        // never urgent; serving it from cache is what keeps a marketing page fast for the visitor
        // who arrives while the API is busy.
        { next: { revalidate: 60 } },
    )
    if (!result.ok) {
        return { courses: [], reason: result.reason }
    }
    return {
        courses: [...(result.data ?? [])].sort((a, b) => a.sortIndex - b.sortIndex),
    }
}

/** What the lead form collects. `contact` is a phone number or an email -- the backend takes either. */
export interface LeadSubmission {
    name: string
    contact: string
    message?: string
}

/**
 * Submits a contact request.
 *
 * THE ONLY WRITE ON THIS PAGE, and BR-B07 draws its boundary exactly here: input fields belong to
 * the `lead` section and never to a section the expert wrote.
 *
 * @param input - The reader's name and how to reach them.
 * @returns Whether it was accepted, and the API's own words if not.
 */
export const submitLead = async (input: LeadSubmission): Promise<{ ok: boolean, reason?: string }> => {
    const result = await graphql<{ id: string }>(
        `mutation SubmitLead($input: SubmitLeadInput!) {
            submitLead(input: $input) {
                success
                message
                error
                data { id }
            }
        }`,
        { input },
    )
    return result.ok ? { ok: true } : { ok: false, reason: result.reason }
}
