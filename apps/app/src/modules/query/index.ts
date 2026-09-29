import type { FailureKind } from "@/modules/api/outcome"

/**
 * How a caller reads one settled query answer.
 *
 * The transport under `@/modules/api` produces the answer and the hooks under
 * `@/hooks` deliver it; neither owns the reading of it. Keeping that reading
 * here gives a connected component one import that is not a hook and not the
 * transport, which is what both boundaries require: the hooks barrel names
 * hooks only, and a component may not import a runtime value from the transport
 * folder (`component-runtime-transport-import`).
 */

export type { FailureKind } from "@/modules/api/outcome"

/**
 * The narrowest answer shape the settlement helpers accept; every `Outcome<T>` satisfies it.
 *
 * A failure is required to name its `kind` only; the narrower shape still admits an answer that
 * knows its code, reason and retryability and a settled reading keeps all of them.
 */
export type NivoQueryAnswer<T> =
    | {
          readonly ok: true
          readonly data: T
      }
    | {
          readonly ok: false
          readonly kind: FailureKind
          readonly code?: string
          readonly reason?: string
          readonly retryable?: boolean
      }

/** What a settled failure states: its kind, and the code, reason and retryability it carries. */
export type NivoQueryFailure = {
    readonly kind: FailureKind
    readonly code: string
    readonly reason: string
    readonly retryable: boolean
}

/**
 * How one answer stands once it is read: still in flight, accepted data, or a failed settlement
 * that keeps every fact the answer stated. A failed reading never degrades to a bare `null` - the
 * kind is what the drawing above it is chosen by.
 */
export type NivoQueryReading<T> =
    | {
          readonly status: "resting"
      }
    | {
          readonly status: "ready"
          readonly data: T
      }
    | ({ readonly status: "failed" } & NivoQueryFailure)

/** A retry the answer did not ask for is never offered: unset retryability follows the kind's own. */
const retryableOf = (answer: Extract<NivoQueryAnswer<unknown>, { readonly ok: false }>): boolean =>
    answer.retryable ?? answer.kind === "unavailable"

/**
 * Read one answer into its explicit settlement: `resting` while the answer has not landed, `ready`
 * with the accepted data, or `failed` with the kind and every fact the answer stated.
 */
export const nivoQueryReading = <T>(answer: NivoQueryAnswer<T> | undefined): NivoQueryReading<T> => {
    if (answer === undefined) return { status: "resting" }
    if (answer.ok) return { status: "ready", data: answer.data }
    return {
        status: "failed",
        kind: answer.kind,
        code: answer.code ?? "",
        reason: answer.reason ?? "",
        retryable: retryableOf(answer),
    }
}

/**
 * The data of an accepted answer; nothing while the read runs or after any failure.
 *
 * For a caller that draws its failure elsewhere - a chrome reading a name, a hook deriving an
 * identity - the payload is all it asks for; the reading above stays the door for a caller that
 * renders the failure itself.
 */
export const nivoQueryPayload = <T>(answer: NivoQueryAnswer<T> | undefined): T | undefined =>
    answer === undefined || !answer.ok ? undefined : answer.data

/**
 * Whether a settled answer says the viewer may not have this: the session is not accepted, or the
 * session may not read it. Every other failure is a fault the viewer could retry.
 */
export const nivoAnswerDenied = (answer: NivoQueryAnswer<unknown> | undefined): boolean =>
    answer !== undefined && !answer.ok && (answer.kind === "refused" || answer.kind === "forbidden")
