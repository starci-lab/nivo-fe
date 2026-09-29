import { afterEach, beforeEach, vi } from "vitest"

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature"
const INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80"
const SCOPE = { workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION }
const OPERATIONS_PATH = `/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}/installations/${INSTALLATION}/operations/`
const CORE_ORIGIN = new URL(process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql").origin

let fetchMock: ReturnType<typeof vi.fn>

const answerWith = (status: number, body: unknown): void => {
    fetchMock.mockResolvedValue({ status, json: async () => body })
}
const sentUrls = (): Array<string> => fetchMock.mock.calls.map((call) => String(call[0]))
const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] as RequestInit
const sentBody = (index = 0): Record<string, unknown> =>
    JSON.parse(String(sentInit(index).body)) as Record<string, unknown>
const accountingResult = (op: string, payload: Record<string, unknown>) => ({
    kind: "accounting_result",
    operation: "accounting.evidence@1",
    requestId: INTENT,
    result: { ok: true, result: { op, payload } },
})

beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

/** Shared accounting spec fixtures and request controls. */
export const accountingSpec = {
    WORKSPACE,
    INSTANCE,
    INSTALLATION,
    TOKEN,
    INTENT,
    SCOPE,
    OPERATIONS_PATH,
    CORE_ORIGIN,
    answerWith,
    sentUrls,
    sentInit,
    sentBody,
    accountingResult,
    get fetchMock() {
        return fetchMock
    },
}
