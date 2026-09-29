import { afterEach, beforeEach, vi } from "vitest"
import { formatShellSourceIdentity } from "./index"
import type { ShellRead, ShellSourceIdentity } from "./index"

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"
const COMMAND = "44444444-4444-4444-8444-444444444444"
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature"
const SELECTION = "shell-selection-1"

const scope = { workspaceId: WORKSPACE, instanceId: INSTANCE }
const readOf = (identity: ShellSourceIdentity, readGeneration: number): ShellRead => ({ identity, readGeneration })

const envelopeFor = (read: ShellRead, overrides: Record<string, unknown> = {}) => ({
    sourceIdentity: formatShellSourceIdentity(read.identity),
    readGeneration: read.readGeneration,
    availability: "available",
    freshness: "current",
    completeness: "complete",
    observedAt: "2026-09-25T03:00:00.000Z",
    payload: { installations: [] },
    ...overrides,
})

const coreResult = () => ({
    availability: "available",
    reason: null,
    workspaceId: WORKSPACE,
    instanceId: INSTANCE,
    name: "Support",
    runtimeGeneration: "generation-1",
    runtimeAvailability: "provisioned",
    inventory: {
        availability: "available",
        completeness: "complete",
        observedAt: "2026-09-25T03:00:00.000Z",
        installations: [],
    },
})

const overviewBody = (reads: ReadonlyArray<ShellRead>) => ({
    kind: "overview",
    selectionGeneration: SELECTION,
    core: coreResult(),
    sources: reads.map((read) => envelopeFor(read)),
})

let fetchMock: ReturnType<typeof vi.fn>

const answerWith = (status: number, body: unknown): void => {
    fetchMock.mockResolvedValue({ status, json: async () => body })
}

const sentUrls = (): Array<string> => fetchMock.mock.calls.map((call) => String(call[0]))
const sentUrl = (index = 0): string => sentUrls()[index] ?? ""
const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] as RequestInit

beforeEach(() => {
    vi.restoreAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

/** Shared agentos-shell spec fixtures and request controls. */
export const shellSpec = {
    WORKSPACE,
    INSTANCE,
    INSTALLATION,
    COMMAND,
    TOKEN,
    SELECTION,
    scope,
    readOf,
    envelopeFor,
    coreResult,
    overviewBody,
    answerWith,
    sentUrls,
    sentUrl,
    sentInit,
    get fetchMock() {
        return fetchMock
    },
}
