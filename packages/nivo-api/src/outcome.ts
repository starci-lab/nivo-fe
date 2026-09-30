/**
 * The one outcome every call to the core API answers with.
 *
 * A caller learns two things from an answer: whether it holds a payload, and - when it does not -
 * WHICH refusal it is, because the screen does different things for each. The kind is the whole
 * vocabulary; an HTTP status is never folded into a bare `null`, and a status is never spelt as a
 * string a caller would have to parse.
 *
 * - `refused`     the session is not accepted (HTTP 401): sign in again.
 * - `forbidden`   the session is accepted but may not do this (HTTP 403, or the operation's own denial).
 * - `not-found`   the named thing is not there (HTTP 404).
 * - `invalid`     the request was understood and rejected: bad input or a state conflict (other 4xx).
 * - `unavailable` no usable answer arrived: no network, a timeout, a 5xx, or a body that is not the
 *                 shape the contract promises. Trying again may help.
 */
export type FailureKind = "refused" | "forbidden" | "not-found" | "invalid" | "unavailable"

/** One failed answer of one kind. `X` is the domain detail a gateway adds beside the common fields. */
type FailureOf<K extends FailureKind, X extends object> = X & {
    readonly ok: false
    readonly kind: K
    /** The HTTP status that produced this answer, or null when no reply arrived. */
    readonly status: number | null
    /** A stable machine code: `NETWORK`, `TIMEOUT`, `MALFORMED`, `GRAPHQL`, or the operation's own code. */
    readonly code: string
    /** The sentence that explains the refusal; the server's own words when it supplied them. */
    readonly reason: string
    /** Whether repeating the same request could succeed. */
    readonly retryable: boolean
}

/** Every failed answer, discriminated by `kind`. */
export type Failure<X extends object = object> = { readonly [K in FailureKind]: FailureOf<K, X> }[FailureKind]

/** A payload, or the failure that says why there is none. */
export type Outcome<T, X extends object = object> =
    | {
          readonly ok: true
          readonly data: T
      }
    | Failure<X>

/** What a failed answer states about itself when a gateway builds one. */
export type FailureInput = {
    readonly status?: number | null
    readonly code: string
    readonly reason: string
    readonly retryable?: boolean
}

/**
 * Build one failed answer.
 *
 * @param kind - Which refusal this is.
 * @param input - Its code, reason and, optionally, the status and retryability.
 * @returns The failure; `retryable` defaults to true only for `unavailable`.
 */
export const failed = (kind: FailureKind, input: FailureInput): Failure => ({
    ok: false,
    kind,
    status: input.status ?? null,
    code: input.code,
    reason: input.reason,
    retryable: input.retryable ?? kind === "unavailable",
})

/**
 * Build one failed answer that carries the gateway's own fields beside the common ones.
 *
 * @param kind - Which refusal this is.
 * @param input - Its code, reason and, optionally, the status and retryability.
 * @param detail - The gateway's own fields.
 * @returns The failure with the detail merged in.
 */
export const failedWith = <X extends object>(kind: FailureKind, input: FailureInput, detail: X): Failure<X> =>
    Object.assign(failed(kind, input), detail)

/**
 * Which kind an operation's own refusal code states.
 *
 * The core API names a refusal by a code (`unauthenticated`, `offer-version-stale`,
 * `purchase-not-found-non-disclosing`, ...). The kind is read from the words the code is built from;
 * a code that names none of them is a plain `invalid` refusal: the request was understood and
 * declined.
 *
 * @param code - The operation's refusal code.
 * @returns The failure kind that code states.
 */
export const failureKindOfCode = (code: string): FailureKind => {
    const words = code.toLowerCase().replaceAll("_", "-")
    if (words.includes("unauthenticated")) return "refused"
    if (words.includes("forbidden") || words.includes("denied") || words.includes("not-admitted")) return "forbidden"
    if (words.includes("not-found")) return "not-found"
    if (words.includes("unavailable") || words.includes("unreachable") || words.includes("outcome-unknown"))
        return "unavailable"
    return "invalid"
}
