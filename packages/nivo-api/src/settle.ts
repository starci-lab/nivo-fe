import { failed, type Outcome } from "./outcome"

/**
 * Run one asynchronous call and answer with an outcome instead of a rejection.
 *
 * A caller that must keep going whether the call succeeds or not (a background re-read, a
 * fire-and-forget revoke) reads the outcome or ignores it explicitly; it never swallows a rejection
 * in an empty catch. A rejection becomes an `unavailable` failure carrying the thrown reason.
 *
 * @param run - The call to run.
 * @returns The call's value, or the failure that says it did not answer.
 */
export const settle = async <T>(run: () => Promise<T>): Promise<Outcome<T>> => {
    try {
        return { ok: true, data: await run() }
    } catch (cause) {
        return failed("unavailable", {
            code: "REJECTED",
            reason: cause instanceof Error ? cause.message : "The call did not answer.",
        })
    }
}
