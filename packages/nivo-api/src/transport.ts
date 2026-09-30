/**
 * The only `fetch` of the nivo core API clients.
 *
 * Every gateway describes ITS request (an address, a body, whose credential
 * travels) and reads ITS reply; the mechanics of getting bytes across are decided here once: the
 * credential header, the deadline, the cancellation, and what each HTTP status means.
 *
 * NEVER THROWS. A submit handler and a page render both have something better to show than a stack
 * trace, and a thrown error inside a submit would leave the form pending forever. Every way a
 * request can fail comes back as a typed {@link Outcome}: a status is a `kind`, never a `null`.
 *
 * ONE CALL IS ONE REQUEST. Nothing here retries. A caller whose operation is idempotent by identity
 * decides to send it again.
 */
import { failed, failureKindOfStatus, type Failure, type Outcome } from "./outcome"

/** How long one request may take before it is abandoned as unavailable. */
export const DEFAULT_TIMEOUT_MS = 30_000

/** One request, described by a gateway. */
export type WireRequest = {
    readonly url: string
    readonly method: "GET" | "POST" | "PUT"
    /** Sent as `Authorization: Bearer` when set and non-empty. */
    readonly accessToken?: string | null
    /** Sent as `Accept-Language` when set. */
    readonly locale?: string
    /** `include` carries the HttpOnly refresh cookie; `omit` keeps it out of routes that must not see it. */
    readonly credentials: "include" | "omit"
    /** A JSON document; serialised here, with its content type. */
    readonly json?: unknown
    /** A raw body, for a byte upload; sent with the given content type. */
    readonly body?: BodyInit
    readonly contentType?: string
    /** Whether the reply carries a JSON body to read. `none` ignores the body entirely (an upload's empty 200). */
    readonly reply?: "json" | "none"
    /** Abandon the request when this signal aborts (an unmounted page, a superseded read). */
    readonly signal?: AbortSignal
    readonly timeoutMs?: number
    /** Next's revalidation hint for a server read, in seconds; ignored by a plain browser fetch. */
    readonly revalidate?: number
}

/** What arrived: the status and the parsed JSON body (`null` when the reply said `none` or was not JSON on a failure). */
export type WireReply = {
    readonly status: number
    readonly body: unknown
}

/** What a failed exchange still knows: the parsed body of a non-2xx reply, for a gateway that reads it. */
export type WireFailureDetail = {
    readonly body: unknown
}

/** The answer of one exchange. */
export type WireOutcome = Outcome<WireReply, WireFailureDetail>

const failure = (
    kind: Parameters<typeof failed>[0],
    status: number | null,
    code: string,
    reason: string,
    body: unknown,
): Failure<WireFailureDetail> => Object.assign(failed(kind, { status, code, reason }), { body })

const headersOf = (request: WireRequest): Record<string, string> => {
    const headers: Record<string, string> = {}
    if (request.json !== undefined) headers["content-type"] = "application/json"
    if (request.contentType !== undefined) headers["content-type"] = request.contentType
    if (request.locale !== undefined) headers["accept-language"] = request.locale
    if (request.accessToken !== undefined && request.accessToken !== null && request.accessToken.length > 0)
        headers.authorization = `Bearer ${request.accessToken}`
    return headers
}

const readJson = async (
    response: Response,
): Promise<{ readonly parsed: true; readonly body: unknown } | { readonly parsed: false }> => {
    try {
        return { parsed: true, body: (await response.json()) as unknown }
    } catch {
        return { parsed: false }
    }
}

/**
 * Send one request and classify what came back.
 *
 * @param request - The gateway's description of the request.
 * @returns The reply of a 2xx answer, or the typed failure of anything else.
 */
export const send = async (request: WireRequest): Promise<WireOutcome> => {
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
        timedOut = true
        controller.abort()
    }, request.timeoutMs ?? DEFAULT_TIMEOUT_MS)
    const forwardAbort = () => controller.abort()
    request.signal?.addEventListener("abort", forwardAbort)
    if (request.signal?.aborted === true) controller.abort()
    try {
        let response: Response
        try {
            response = await fetch(request.url, {
                method: request.method,
                credentials: request.credentials,
                headers: headersOf(request),
                body: request.json === undefined ? request.body : JSON.stringify(request.json),
                signal: controller.signal,
                ...(request.revalidate === undefined ? {} : { next: { revalidate: request.revalidate } }),
            })
        } catch {
            if (timedOut) return failure("unavailable", null, "TIMEOUT", "timeout", null)
            if (request.signal?.aborted === true) return failure("unavailable", null, "ABORTED", "aborted", null)
            return failure("unavailable", null, "NETWORK", "network", null)
        }
        const parsed = request.reply === "none" ? { parsed: true as const, body: null } : await readJson(response)
        const body = parsed.parsed ? parsed.body : null
        if (response.status < 200 || response.status >= 300) {
            return failure(
                failureKindOfStatus(response.status),
                response.status,
                `HTTP_${response.status}`,
                `http:${response.status}`,
                body,
            )
        }
        if (!parsed.parsed) return failure("unavailable", response.status, "MALFORMED", "malformed", null)
        return { ok: true, data: { status: response.status, body } }
    } finally {
        clearTimeout(timer)
        request.signal?.removeEventListener("abort", forwardAbort)
    }
}
