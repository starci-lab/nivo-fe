/**
 * The academy API, reached with `fetch` and nothing else.
 *
 * WHY NO CLIENT LIBRARY. This app makes two calls, both public and both unauthenticated: read the
 * course catalog, submit a lead. Apollo or urql would arrive to give us a normalised cache,
 * optimistic updates and subscription plumbing for a page that has no logged-in state to keep
 * coherent -- a dependency that has not earned itself. When the classroom lands, with a member
 * session and mutations that invalidate each other, that is the moment to reconsider; the two
 * functions here are small enough to throw away then.
 *
 * WHERE THE PORT COMES FROM. `NEXT_PUBLIC_ACADEMY_API_URL`, defaulting to the port
 * `metadata.json` in nivo-backend projects for this app (`ports.expertApi`, academy slot = 4067).
 * The default is written out rather than derived because this repository has no copy of that
 * registry, and a wrong guess should be visible in one place instead of implied.
 */

/** Where the academy API answers. */
const ENDPOINT = process.env.NEXT_PUBLIC_ACADEMY_API_URL ?? "http://localhost:4067/graphql"

/**
 * Every response this API sends, whatever the operation.
 *
 * The shape comes from `GraphQLTransformInterceptor` on the backend: the payload is wrapped with a
 * `success` flag and a localised `message` rather than returned bare. A caller therefore has two
 * failure modes to tell apart -- the request never arrived, and the request arrived and was
 * refused -- and conflating them is how a validation error gets reported as "network problem".
 */
interface Envelope<T> {
    data: T | null
    error?: string | null
    message: string
    success: boolean
}

/** What a caller gets back: the payload, or the reason there is none. */
export type Result<T> =
    | { ok: true, data: T }
    | { ok: false, reason: string }

/**
 * Runs one GraphQL operation.
 *
 * NEVER THROWS. Every call site here is rendering a page or handling a submit, and both have
 * something better to show than a stack trace: an empty catalog, or the API's own refusal message.
 * A thrown error in a Server Component would take the whole page down over a section that could
 * have said "no courses yet".
 *
/** Fetch options plus the Next revalidation hint this transport understands. */
export interface FetchInit extends RequestInit {
    /** Next's own cache directive for this request. */
    readonly next?: { readonly revalidate?: number }
}

/**
 * @param query - The operation document.
 * @param variables - Its variables, if any.
 * @param init - Extra fetch options; `next` revalidation belongs here.
 * @returns The unwrapped payload, or why there is none.
 */
export const graphql = async <T,>(
    query: string,
    variables?: Record<string, unknown>,
    init?: FetchInit,
): Promise<Result<T>> => {
    let response: Response
    try {
        response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
            ...init,
        })
    } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : "network error" }
    }
    if (!response.ok) {
        return { ok: false, reason: `HTTP ${response.status}` }
    }

    let body: { data?: Record<string, Envelope<T>>, errors?: Array<{ message: string }> }
    try {
        body = await response.json()
    } catch {
        return { ok: false, reason: "response was not JSON" }
    }
    if (body.errors?.length) {
        return { ok: false, reason: body.errors[0].message }
    }
    // One operation per call, so the envelope is whatever single key came back. Read positionally
    // rather than by name: the caller already knows which operation it asked for, and repeating the
    // name here would be a second place to keep in step with the document above.
    const envelope = Object.values(body.data ?? {})[0]
    if (!envelope) {
        return { ok: false, reason: "empty response" }
    }
    if (!envelope.success) {
        return { ok: false, reason: envelope.error || envelope.message }
    }
    return { ok: true, data: envelope.data as T }
}
