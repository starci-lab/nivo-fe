/**
 * The spec-side polling helpers: playwright's `expect` waits on locators, but assertions about
 * what the boundary received (a request log, a fixture mode) poll plain values instead.
 */
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** Poll until `check` answers truthy; playwright has no expect() outside @playwright/test. */
export const waitFor = async (check: () => Promise<boolean>, label: string, timeout = 20_000): Promise<void> => {
    const deadline = Date.now() + timeout
    let failure: unknown
    for (;;) {
        try {
            if (await check()) return
        } catch (error) {
            failure = error
        }
        if (Date.now() > deadline) {
            const reason = failure instanceof Error ? ` (last: ${failure.message})` : ""
            throw new Error(`timed out waiting for ${label}${reason}`)
        }
        await sleep(150)
    }
}
