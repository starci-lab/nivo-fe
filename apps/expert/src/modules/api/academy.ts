import { createGraphqlClient, isNumber, isNullableString, isRecord, isString, parseEach, type Outcome } from "@nivo/api"
import { ACADEMY_API_URL } from "@/modules/config"

/**
 * The two public operations an academy's landing page needs, through the same core-API client the
 * console uses (one envelope decoder, one {@link Outcome}), bound to the academy endpoint.
 *
 * BOTH ARE PUBLIC ON THE BACKEND, and that is stated there rather than assumed here: the `courses`
 * resolver notes the catalog "stays browsable without an account", and `submitLead` is marked
 * public. So neither call carries a token or a cookie (`credentials: "omit"`), and a visitor who has
 * never signed in sees the same catalog the owner does.
 *
 * WHERE THE ADDRESS COMES FROM. `modules/config` reads `NEXT_PUBLIC_ACADEMY_API_URL` once; only a
 * development build defaults to the port `metadata.json` in nivo-backend projects gives this app
 * (`ports.expertApi`, academy slot = 4068), and a production build without it stops.
 */
const { graphql } = createGraphqlClient({ endpoint: ACADEMY_API_URL, credentials: "omit" })

/** One course in the catalog. A subset of `CourseEntity` -- what a landing page can show. */
export interface Course {
    id: string
    slug: string
    title: string
    summary: string | null
    priceText: string | null
    sortIndex: number
}

const parseCourse = (input: unknown): Course | null =>
    isRecord(input) &&
    isString(input.id) &&
    isString(input.slug) &&
    isString(input.title) &&
    isNullableString(input.summary) &&
    isNullableString(input.priceText) &&
    isNumber(input.sortIndex)
        ? {
              id: input.id,
              slug: input.slug,
              title: input.title,
              summary: input.summary,
              priceText: input.priceText,
              sortIndex: input.sortIndex,
          }
        : null

const parseLeadReceipt = (input: unknown): { id: string } | null =>
    isRecord(input) && isString(input.id) ? { id: input.id } : null

/**
 * Reads the course catalog.
 *
 * ASKS FOR SIX FIELDS, NOT THE ENTITY. `CourseEntity` also carries `lessons`, `priceVnd` and
 * timestamps; a landing page shows none of them, and requesting them would make the page's payload
 * grow every time somebody adds a column to a table it does not read.
 *
 * The catalog is re-read once a minute: a course list changes when the expert edits it, which is rare
 * and never urgent, and serving it from cache keeps a marketing page fast while the API is busy.
 *
 * @returns The catalog in the expert's own order, or why there is none.
 */
export const fetchCourses = async (): Promise<Outcome<Array<Course>>> => {
    const result = await graphql(
        `
            query Courses {
                courses {
                    success
                    message
                    error
                    data {
                        id
                        slug
                        title
                        summary
                        priceText
                        sortIndex
                    }
                }
            }
        `,
        (data) => {
            const courses = parseEach(data, parseCourse)
            return courses === null ? null : [...courses]
        },
        undefined,
        { revalidate: 60 },
    )
    return result.ok ? { ok: true, data: result.data.sort((a, b) => a.sortIndex - b.sortIndex) } : result
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
 * @returns The receipt, or the API's own words for the refusal.
 */
export const submitLead = (input: LeadSubmission): Promise<Outcome<{ id: string }>> =>
    graphql(
        `
            mutation SubmitLead($input: SubmitLeadInput!) {
                submitLead(request: $input) {
                    success
                    message
                    error
                    data {
                        id
                    }
                }
            }
        `,
        parseLeadReceipt,
        { input },
    )
