/**
 * The nivo core API, reached with `fetch` and nothing else.
 *
 * WHY NO CLIENT LIBRARY, AND WHY THAT ANSWER IS NOT THE EXPERT APP'S. `apps/expert` runs two public
 * unauthenticated calls and its own transport says a normalised cache would be a dependency that had
 * not earned itself - correct there. This app is the opposite case on every count except one: it has
 * a session, a refresh cycle and mutations that invalidate each other. What it still does NOT have
 * is a set of interdependent reads worth normalising; the console pages each own one query. So the
 * missing piece is a SESSION, not a cache, and a cache library would arrive to solve the half that
 * is not the problem. When two screens start reading the same entity and disagreeing about it, that
 * is the moment to reconsider.
 *
 * TWO THINGS TRAVEL, AND ONLY ONE OF THEM IS READABLE HERE. The access token is a Bearer header this
 * module sets from memory. The refresh token is an HttpOnly cookie the browser carries on its own -
 * `nivo_refresh_token`, written by the backend with `sameSite: "lax"` and `path: "/"`. JavaScript
 * cannot read it, which is the point, and it is why every call sets `credentials: "include"`: without
 * that the cookie is simply not sent and a refresh silently behaves like a signed-out user.
 *
 * SAME-SITE HOLDS ACROSS THE PORT SPLIT. `localhost:3067` and `localhost:3068` are different ORIGINS
 * but the same SITE, and `SameSite=Lax` is decided by site rather than by port - so the cookie does
 * travel in development. In production `app.nivo.vn` and the API share `nivo.vn`, so it holds there
 * too. What the port split does require is CORS, and the backend already allows this origin with
 * credentials: `CORS_ORIGIN=http://localhost:3067` in `.env.override`.
 */

import { CORE_API_URL } from "@/modules/config"
import { failed, failureKindOfCode, type Failure, type Outcome } from "./outcome"
import { send } from "./transport"

/**
 * Every response this API sends, whatever the operation.
 *
 * The shape comes from `GraphQLTransformInterceptor`: the payload is wrapped with a `success` flag
 * and a localised `message` rather than returned bare. A caller therefore has three failure modes to
 * tell apart - the request never arrived, GraphQL refused the document, and the operation ran and
 * was refused - and conflating them is how a wrong password gets reported as "network problem".
 */
export interface Envelope<T> {
    /** The operation's payload, or null when there is none. */
    readonly data: T | null
    /** A machine-readable refusal code, when the backend supplies one. */
    readonly error?: string | null
    /** The refusal or success sentence, already in the reader's language. */
    readonly message: string
    /** Whether the operation itself succeeded. */
    readonly success: boolean
}

/**
 * The whole envelope of one successful operation: its payload together with every answer the
 * operation states beside it.
 *
 * WHY AN OPERATION WOULD NEED THIS. Nearly every operation's answer is its `data` and nothing else,
 * and {@link graphql} hands back exactly that. Sign-out is the exception: its `data` says only that
 * the request completed, while whether the provider confirmed revoking this browser's lineage - and,
 * for an everywhere scope, whether the identity authority confirmed ending its side - are answers
 * the backend states BESIDE `data`, because folding either into a completed request would report a
 * revocation nobody observed. `TExtra` is how a caller names those siblings; `data` is narrowed to
 * the payload itself, since the classification below only succeeds with one.
 */
export type EnvelopeAnswer<T, TExtra extends object> = Envelope<T> & TExtra & { readonly data: T }

/** How a caller supplies the credential without this module knowing where sessions are kept. */
export type TokenReader = () => string | null

/** How a caller supplies the reader's language without this module knowing how routing works. */
export type LocaleReader = () => string

/**
 * The access token this transport puts on the wire.
 *
 * A FUNCTION RATHER THAN A VALUE, because the token is replaced on every refresh and a value captured
 * at module load would be the one that expired. Held here rather than imported from the session so
 * the dependency runs one way: the session knows about the transport, and the transport knows only
 * how to ask for a string.
 */
let readToken: TokenReader = () => null

/**
 * The language every refusal should come back in.
 *
 * THE BACKEND ALREADY HAS THE SENTENCES. Every resolver declares both `[Locale.En]` and `[Locale.Vi]`
 * messages, and `GraphQLTransformInterceptor` picks English every time - its own comment says "no
 * per-request locale detection in nivo yet". So the Vietnamese half of the API's voice is written and
 * unreachable. This header is the FE end of closing that; until the interceptor reads it, a refusal
 * still arrives in English and the screen shows the API's sentence as it was sent.
 */
let readLocale: LocaleReader = (): string => "vi"

/**
 * Tell the transport where the current access token lives.
 *
 * THE MODULE-SIDE DOOR, and deliberately not a hook: the session store is a `modules/` owner, which
 * may not import the hooks root, so it binds its reader here directly. A component binds through the
 * `useAccessTokenFrom` hook (`@/hooks`), which calls this setter - the dependency runs one way, and
 * both doors write the same reader.
 *
 * @param reader - Answers with the token in force right now, or null when signed out.
 */
export const setAccessTokenReader = (reader: TokenReader) => {
    readToken = reader
}

/**
 * Tell the transport which language the reader is in.
 *
 * THE MODULE-SIDE DOOR, beside {@link setAccessTokenReader}: a component binds through the
 * `useLocaleFrom` hook (`@/hooks`), while a `modules/` owner calls this setter directly.
 *
 * @param reader - Answers with the active locale.
 */
export const setLocaleReader = (reader: LocaleReader) => {
    readLocale = reader
}

/** What a caller may pass beside the document: a credential of its own, or a signal that abandons the call. */
export type GraphqlOptions = {
    /** Overrides the bound token reader; an empty string sends no credential at all. */
    readonly accessToken?: string | null
    /** Abandon the call when this signal aborts. */
    readonly signal?: AbortSignal
}

/**
 * The checked shell of one operation envelope.
 *
 * `data` stays `unknown`: only the document's own parser can say what its payload is, and it runs
 * after the refusal and empty checks below, exactly like the unchecked reads they replace.
 * `siblings` are the answers an operation states beside the envelope keys, still unchecked.
 */
export interface EnvelopeShell {
    readonly data: unknown
    readonly error: string | null
    readonly message: string
    readonly success: boolean
    readonly siblings: Readonly<Record<string, unknown>>
}

/** A document parser: the unchecked wire value in, the checked payload out, null when malformed. */
export type GraphqlParse<T> = (input: unknown) => T | null

/** An envelope parser: the checked shell in, the whole typed answer out, null when malformed. */
export type EnvelopeParse<T, TExtra extends object> = (shell: EnvelopeShell) => EnvelopeAnswer<T, TExtra> | null

/**
 * Narrow one root-field value to the envelope shell every operation answers with.
 *
 * `error` and `message` read as their declared types or their safe defaults, the same reads the
 * unchecked envelope cast performed; `success` is checked because the refusal branch depends on it.
 */
const parseEnvelopeShell = (value: unknown): EnvelopeShell | null => {
    if (!isRecord(value) || typeof value.success !== "boolean") return null
    const { data, error, message, success, ...rest } = value
    return {
        data,
        error: typeof error === "string" ? error : null,
        message: typeof message === "string" ? message : "",
        success,
        siblings: rest,
    }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

/*
 * A GraphQL-level error is a different animal from a refused operation: the document was wrong, or
 * the request was unauthenticated before any resolver ran. It never carries the interceptor's
 * envelope, so it has to be read before the envelope is looked for. The server's own extension code
 * decides the kind; an error that names none means the operation never ran, so it is unavailable.
 * Reads the fields it needs off `unknown` and reads nothing else.
 */
const graphqlErrorFailure = (body: unknown, status: number | null): Failure | null => {
    if (!isRecord(body) || !Array.isArray(body.errors) || body.errors.length === 0) return null
    const first: unknown = body.errors[0]
    const firstRecord = isRecord(first) ? first : undefined
    const extensions = isRecord(firstRecord?.extensions) ? firstRecord.extensions : undefined
    const named = typeof extensions?.code === "string" ? extensions.code : undefined
    const message = typeof firstRecord?.message === "string" ? firstRecord.message : "graphql"
    return failed(named === undefined ? "unavailable" : failureKindOfCode(named), {
        status,
        code: "GRAPHQL",
        reason: message,
    })
}

/**
 * Run one GraphQL document and hand back the operation fields of its answer.
 *
 * THE ONLY GRAPHQL DOOR. The envelope-reading doors below and every gateway that owns a differently
 * shaped payload (the collaboration and chatbot gateways answer bare JSON, not the interceptor's
 * envelope) go through here, so the endpoint, the credential, the language and the three failure
 * modes - the request never arrived, GraphQL refused the document, the answer is not readable - are
 * decided once. NEVER THROWS.
 *
 * @param query - The operation document.
 * @param variables - Its variables, if any.
 * @param options - A credential of its own, or a signal that abandons the call.
 * @returns The `data` object of the response, or why there is none.
 */
export const graphqlFields = async (
    query: string,
    variables?: Readonly<Record<string, unknown>>,
    options?: GraphqlOptions,
): Promise<Outcome<Readonly<Record<string, unknown>>>> => {
    const sent = await send({
        url: CORE_API_URL,
        method: "POST",
        // The refresh cookie rides on this. Without it `refreshSession` looks like a signed-out
        // user rather than like a missing credential, which is a much harder failure to read.
        credentials: "include",
        accessToken: options?.accessToken === undefined ? readToken() : options.accessToken,
        /*
         * Standard `Accept-Language` rather than a private header, so the backend can read it
         * with the same mechanism any other client would use and no bespoke contract has to
         * be agreed for it.
         */
        locale: readLocale(),
        json: { query, variables: variables ?? {} },
        signal: options?.signal,
    })
    if (!sent.ok) {
        return graphqlErrorFailure(sent.body, sent.status) ?? sent
    }
    const refusal = graphqlErrorFailure(sent.data.body, sent.data.status)
    if (refusal !== null) return refusal
    const data: unknown = isRecord(sent.data.body) ? sent.data.body.data : undefined
    if (!isRecord(data) || Object.keys(data).length === 0) {
        return failed("unavailable", { status: sent.data.status, code: "EMPTY", reason: "empty" })
    }
    return { ok: true, data }
}

/**
 * Run one GraphQL operation and hand back its whole envelope.
 *
 * THE ENVELOPE-STATING DOOR. {@link graphql} is the door for every operation whose answer is `data`
 * and nothing else, which is nearly all of them; this one exists for the operation that states
 * answers beside it, and carries them unchanged. Both classify failures the same way.
 *
 * @param query - The operation document.
 * @param parse - The document's own check of the checked envelope shell; null means malformed.
 * @param variables - Its variables, if any.
 * @param options - A credential of its own, or a signal that abandons the call.
 * @returns The whole envelope, or why there is none.
 */
export const graphqlEnvelope = async <T, TExtra extends object = Record<string, unknown>>(
    query: string,
    parse: EnvelopeParse<T, TExtra>,
    variables?: Readonly<Record<string, unknown>>,
    options?: GraphqlOptions,
): Promise<Outcome<EnvelopeAnswer<T, TExtra>>> => {
    const fields = await graphqlFields(query, variables, options)
    if (!fields.ok) return fields
    const root = Object.values(fields.data)[0]
    const shell = parseEnvelopeShell(root)
    if (shell === null) {
        return failed("unavailable", { code: root === undefined ? "EMPTY" : "MALFORMED", reason: root === undefined ? "empty" : "malformed" })
    }
    if (!shell.success) {
        const code = shell.error ?? "REFUSED"
        return failed(failureKindOfCode(code), { code, reason: shell.message })
    }
    if (shell.data === null || shell.data === undefined) {
        return failed("not-found", { code: shell.error ?? "NO_DATA", reason: shell.message })
    }
    const answer = parse(shell)
    if (answer === null) {
        return failed("unavailable", { code: "MALFORMED", reason: "malformed" })
    }
    return { ok: true, data: answer }
}

/**
 * Run one GraphQL operation and hand back only its payload.
 *
 * THE DOOR FOR EVERY ORDINARY OPERATION: the console, accounting and collaboration clients read the
 * payload or the reason there is none, and answers an operation states beside its payload are
 * dropped here.
 *
 * @param query - The operation document.
 * @param parse - The document's own check of the wire payload; null means malformed, and a malformed
 *   payload is an unavailable outcome, never a thrown error and never a value named for a shape it
 *   does not have.
 * @param variables - Its variables, if any.
 * @param options - A credential of its own, or a signal that abandons the call.
 * @returns The unwrapped payload, or why there is none.
 */
export const graphql = async <T>(
    query: string,
    parse: GraphqlParse<T>,
    variables?: Readonly<Record<string, unknown>>,
    options?: GraphqlOptions,
): Promise<Outcome<T>> => {
    const answer = await graphqlEnvelope<T, Record<string, unknown>>(
        query,
        (shell) => {
            const data = parse(shell.data)
            return data === null
                ? null
                : { ...shell.siblings, data, error: shell.error, message: shell.message, success: shell.success }
        },
        variables,
        options,
    )
    if (!answer.ok) {
        return answer
    }
    return {
        ok: true,
        data: answer.data.data,
    }
}
