import { afterEach, beforeEach, vi } from "vitest"
import { isRecord } from "./wire"

/** Workspace fixture used by installation-scoped API specs. */
export const API_SPEC_WORKSPACE = "11111111-1111-4111-8111-111111111111"
/** Instance fixture used by installation-scoped API specs. */
export const API_SPEC_INSTANCE = "22222222-2222-4222-8222-222222222222"
/** Installation fixture used by installation-scoped API specs. */
export const API_SPEC_INSTALLATION = "33333333-3333-4333-8333-333333333333"
/** Access-token fixture used by installation-scoped API specs. */
export const API_SPEC_TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature"
/** Request-identity fixture used by installation-scoped API specs. */
export const API_SPEC_INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80"
/** Operations-route prefix used by installation-scoped API specs. */
export const API_SPEC_OPERATIONS_PATH = `/api/v1/agentos/workspaces/${API_SPEC_WORKSPACE}/instances/${API_SPEC_INSTANCE}/installations/${API_SPEC_INSTALLATION}/operations/`

/** Builds the shared installation address used by operation request fixtures. */
export const apiSpecScope = () => ({
    workspaceId: API_SPEC_WORKSPACE,
    instanceId: API_SPEC_INSTANCE,
    installationId: API_SPEC_INSTALLATION,
})

/** The fetch mock and request readers shared by Sales and Accounting API specs. */
export const createApiFetchSpec = () => {
    let fetchMock: ReturnType<typeof vi.fn>

    const answerWith = (status: number, body: unknown): void => {
        fetchMock.mockResolvedValue({ status, json: async () => body })
    }
    const sentUrls = (): Array<string> => fetchMock.mock.calls.map((call) => String(call[0]))
    const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] ?? {}
    const sentBody = (index = 0): Record<string, unknown> => {
        const parsed: unknown = JSON.parse(String(sentInit(index).body))
        return isRecord(parsed) ? parsed : {}
    }

    beforeEach(() => {
        fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    return {
        answerWith,
        sentUrls,
        sentInit,
        sentBody,
        get fetchMock() {
            return fetchMock
        },
    }
}
