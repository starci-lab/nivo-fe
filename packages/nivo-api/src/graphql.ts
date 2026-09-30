/**
 * The core-API GraphQL client every nivo app shares, reached with `fetch` and nothing else.
 *
 * ONE DECODER FOR THE BACKEND ENVELOPE. `GraphQLTransformInterceptor` wraps every operation payload
 * with a `success` flag and a localised `message`; this module unwraps it once, classifies the three
 * failure modes (the request never arrived, GraphQL refused the document, the operation ran and was
 * refused) into one {@link Outcome}, and never throws. An app binds it to its own endpoint with
 * {@link createGraphqlClient}: the console binds the core API with a session (a Bearer token from
 * memory, the HttpOnly refresh cookie via `credentials: "include"`, the reader's language), a public
 * app binds its own endpoint with `credentials: "omit"` and no token reader.
 *
 * WHY NO CLIENT LIBRARY. The console has a session, a refresh cycle and mutations that invalidate
 * each other, but no set of interdependent reads worth normalising; a cache library would solve the
 * half that is not the problem. When two screens start reading the same entity and disagreeing about
 * it, that is the moment to reconsider.
 */

import { failed, failureKindOfCode, type Failure, type Outcome } from "./outcome"
import { send } from "./transport"
import { isRecord } from "./wire"

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
 * Nearly every operation's answer is its `data` and nothing else, and `graphql` hands back exactly
 * that. Sign-out is the exception: its `data` says only that the request completed, while whether
 * the provider confirmed revoking this browser's lineage - and, for an everywhere scope, whether the
 * identity authority confirmed ending its side - are answers the backend states BESIDE `data`.
 * `TExtra` is how a caller names those siblings; `data` is narrowed to the payload itself, since the
 * classification only succeeds with one.
 */
export type EnvelopeAnswer<T, TExtra extends object> = Envelope<T> & TExtra & { readonly data: T }

/** How a caller supplies the credential without this module knowing where sessions are kept. */
export type TokenReader = () => string | null

/** How a caller supplies the reader's language without this module knowing how routing works. */
export type LocaleReader = () => string

/** What a caller may pass beside the document: a credential of its own, a signal, a revalidation hint. */
export type GraphqlOptions = {
    /** Overrides the bound token reader; an empty string sends no credential at all. */
    readonly accessToken?: string | null
    /** Abandon the call when this signal aborts. */
    readonly signal?: AbortSignal
    /** Next's revalidation hint for a server read, in seconds. */
    readonly revalidate?: number
}

/**
 * The checked shell of one operation envelope.
 *
 * `data` stays `unknown`: only the document's own parser can say what its payload is, and it runs
 * after the refusal and empty checks, exactly like the unchecked reads they replace.
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

/** What binds one client to one API: where it lives and whether the browser carries cookies to it. */
export type GraphqlClientConfig = {
    /** The GraphQL endpoint address. */
    readonly endpoint: string
    /**
     * `include` carries the HttpOnly refresh cookie; `omit` keeps it out of an API that must not see
     * it. Without `include` a refresh looks like a signed-out user rather than a missing credential.
     */
    readonly credentials: "include" | "omit"
}

/**
 * Narrow one root-field value to the envelope shell every operation answers with.
 *
 * `error` and `message` read as their declared types or their safe defaults; `success` is checked
 * because the refusal branch depends on it.
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

/*
 * A GraphQL-level error is a different animal from a refused operation: the document was wrong, or
 * the request was unauthenticated before any resolver ran. It never carries the interceptor's
 * envelope, so it has to be read before the envelope is looked for. The server's own extension code
 * decides the kind; an error that names none means the operation never ran, so it is unavailable.
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
 * Bind the GraphQL doors to one API endpoint.
 *
 * The token and language readers are FUNCTIONS held per client, because the token is replaced on
 * every refresh and a value captured at load would be the one that expired. They are set through the
 * module-side doors returned here (a session store cannot import a hook root), so the dependency
 * runs one way: the session knows about the client, and the client knows only how to ask for a string.
 *
 * @param config - The endpoint and cookie policy of this API.
 * @returns The three operation doors and the two reader setters, all bound to that endpoint.
 */
export const createGraphqlClient = (config: GraphqlClientConfig) => {
    let readToken: TokenReader = () => null
    let readLocale: LocaleReader = (): string => "vi"

    /**
     * Tell the client where the current access token lives.
     *
     * @param reader - Answers with the token in force right now, or null when signed out.
     */
    const setAccessTokenReader = (reader: TokenReader) => {
        readToken = reader
    }

    /**
     * Tell the client which language the reader is in, sent as the standard `Accept-Language` so the
     * backend reads it with the mechanism any other client would use.
     *
     * @param reader - Answers with the active locale.
     */
    const setLocaleReader = (reader: LocaleReader) => {
        readLocale = reader
    }

    /**
     * Run one GraphQL document and hand back the operation fields of its answer.
     *
     * THE ONLY GRAPHQL DOOR: the endpoint, the credential, the language and the three failure modes
     * are decided here once. NEVER THROWS.
     *
     * @param query - The operation document.
     * @param variables - Its variables, if any.
     * @param options - A credential of its own, a signal that abandons the call, a revalidation hint.
     * @returns The `data` object of the response, or why there is none.
     */
    const graphqlFields = async (
        query: string,
        variables?: Readonly<Record<string, unknown>>,
        options?: GraphqlOptions,
    ): Promise<Outcome<Readonly<Record<string, unknown>>>> => {
        const sent = await send({
            url: config.endpoint,
            method: "POST",
            credentials: config.credentials,
            accessToken: options?.accessToken === undefined ? readToken() : options.accessToken,
            locale: readLocale(),
            json: { query, variables: variables ?? {} },
            signal: options?.signal,
            revalidate: options?.revalidate,
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
     * THE ENVELOPE-STATING DOOR: for the operation that states answers beside its payload, carried
     * unchanged. Failures are classified exactly as {@link graphql} does.
     *
     * @param query - The operation document.
     * @param parse - The document's own check of the checked envelope shell; null means malformed.
     * @param variables - Its variables, if any.
     * @param options - A credential of its own, or a signal that abandons the call.
     * @returns The whole envelope, or why there is none.
     */
    const graphqlEnvelope = async <T, TExtra extends object = Record<string, unknown>>(
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
            return failed("unavailable", {
                code: root === undefined ? "EMPTY" : "MALFORMED",
                reason: root === undefined ? "empty" : "malformed",
            })
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
     * THE DOOR FOR EVERY ORDINARY OPERATION: answers an operation states beside its payload are
     * dropped here.
     *
     * @param query - The operation document.
     * @param parse - The document's own check of the wire payload; null means malformed, and a
     *   malformed payload is an unavailable outcome, never a thrown error and never a value named
     *   for a shape it does not have.
     * @param variables - Its variables, if any.
     * @param options - A credential of its own, or a signal that abandons the call.
     * @returns The unwrapped payload, or why there is none.
     */
    const graphql = async <T>(
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

    return { graphql, graphqlEnvelope, graphqlFields, setAccessTokenReader, setLocaleReader }
}
