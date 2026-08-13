/**
 * The academy GraphQL endpoint.
 *
 * Read from the environment rather than hard-coded, because the port is derived
 * from `metadata.json`'s offset registry and a second literal here is a second
 * place to be wrong.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_ACADEMY_API_URL ?? "http://localhost:3069/graphql"

/**
 * The envelope every academy mutation answers with.
 *
 * A refusal arrives as a 200 carrying `success: false` and a sentence written
 * for the reader -- the backend's `GraphQLTransformInterceptor` puts it there
 * rather than in GraphQL's `errors`. A caller that only read `data` would turn
 * every refusal into a blank screen with nothing to say, which is the bug this
 * type exists to make impossible.
 */
export interface Envelope<TData> {
    /** Whether the operation succeeded. */
    readonly success: boolean
    /** A sentence meant for the reader. */
    readonly message: string
    /** The exception name when it failed, for branching that copy cannot express. */
    readonly error?: string | null
    /** The payload, absent on refusal. */
    readonly data?: TData | null
}

/** What a caller gets back, with transport faults folded into the same shape. */
export type GraphQLResult<TData> =
    | { readonly ok: true, readonly data: TData, readonly message: string }
    | { readonly ok: false, readonly message: string, readonly error?: string | null }

/**
 * Sends one mutation and normalizes every way it can fail into one shape.
 *
 * THREE FAILURE MODES, ONE RESULT. The network can refuse, the schema can
 * reject the document, and the operation can decline -- and a caller that had
 * to tell them apart would grow three branches at every call site. They differ
 * only in what the message says, which is the one thing the reader cares about.
 *
 * No credentials header is negotiated per call: `include` is unconditional
 * because the refresh token lives in an HttpOnly cookie the browser must be
 * allowed to set, and omitting it is how a session silently fails to persist.
 *
 * @param query - The document.
 * @param variables - Its variables.
 * @param field - The mutation's field name, used to reach into `data`.
 * @param signal - Optional abort signal.
 * @returns The normalized result.
 */
export const mutate = async <TData>(
    query: string,
    variables: Record<string, unknown>,
    field: string,
    signal?: AbortSignal,
): Promise<GraphQLResult<TData>> => {
    let response: Response
    try {
        response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            signal,
            body: JSON.stringify({ query, variables }),
        })
    } catch (error) {
        return {
            ok: false,
            message: error instanceof Error ? error.message : "network error",
        }
    }
    let body: {
        data?: Record<string, Envelope<TData> | undefined>
        errors?: ReadonlyArray<{ message: string }>
    }
    try {
        body = await response.json()
    } catch {
        return { ok: false, message: `unreadable response (HTTP ${response.status})` }
    }
    if (body.errors?.length) {
        // a schema-level rejection: the operation does not exist, or the
        // document does not match it. Surfaced verbatim because the only
        // audience for it is whoever is building the client.
        return { ok: false, message: body.errors[0].message, error: "GRAPHQL_ERROR" }
    }
    const envelope = body.data?.[field]
    if (!envelope) {
        return { ok: false, message: `no ${field} in response`, error: "GRAPHQL_ERROR" }
    }
    if (!envelope.success || envelope.data == null) {
        return { ok: false, message: envelope.message, error: envelope.error }
    }
    return { ok: true, data: envelope.data, message: envelope.message }
}

/** What every `init` and `resend` hands back. */
export interface OtpChallenge {
    /** Opaque handle for the matching resend and verify. */
    readonly challengeId: string
    /** Seconds until the code stops being accepted. */
    readonly expiresInSeconds: number
}

/**
 * What an entry step hands back.
 *
 * Exactly one field is present, and which one depends on a setting the client
 * cannot see: an academy that verifies email answers with a challenge, one that
 * does not answers with the session itself. Branching on it is not defensive
 * coding -- it is the flow.
 */
export interface AuthEntry {
    /** Present when this academy requires email verification. */
    readonly challenge?: OtpChallenge | null
    /** Present when it does not, in which case the reader is already signed in. */
    readonly session?: AuthPayload | null
}

/** What a completed sign-up or sign-in hands back. */
export interface AuthPayload {
    /** The access token. The refresh token stays in an HttpOnly cookie. */
    readonly accessToken: string
}

/** What a completed password reset hands back. */
export interface PasswordReset {
    /** The address whose password was changed. */
    readonly email: string
}
