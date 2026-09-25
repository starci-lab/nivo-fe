import { act, renderHook, waitFor } from "@testing-library/react"
import type { ComponentProps } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: {
        refreshSession: vi.fn(),
        signOut: vi.fn()
    },
    transport: {
        setAccessTokenReader: vi.fn(),
        setLocaleReader: vi.fn()
    }
}))

vi.mock("next-intl", () => ({ useLocale: () => "vi" }))
vi.mock("@/modules/api/auth", () => ({
    refreshSession: mocks.api.refreshSession,
    signOut: mocks.api.signOut
}))
vi.mock("@/modules/api/graphql", () => ({
    setAccessTokenReader: mocks.transport.setAccessTokenReader,
    setLocaleReader: mocks.transport.setLocaleReader
}))

import { SessionProvider } from "@/modules/auth/session"
import { useAgentOSShell } from "./useAgentOSShell"
import type { AgentOSShellOptions } from "./useAgentOSShell"

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const OTHER_WORKSPACE = "99999999-9999-4999-8999-999999999999"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"
const TOKEN = "token-1"

const options: AgentOSShellOptions = { workspaceId: WORKSPACE, instanceId: INSTANCE, installationIds: [INSTALLATION] }

const wrapper = ({ children }: ComponentProps<"div">) => <SessionProvider>{children}</SessionProvider>

let fetchMock: ReturnType<typeof vi.fn>

/** Answer a registered overview the way Core does: one self-qualified envelope per requested read. */
const answerOverview = () => {
    fetchMock.mockImplementation(async (input: string) => {
        const url = new URL(String(input))
        const reads = url.searchParams.getAll("read")
        return {
            status: 200,
            json: async () => ({
                kind: "overview",
                selectionGeneration: url.searchParams.get("selectionGeneration"),
                core: {
                    availability: "available",
                    reason: null,
                    workspaceId: WORKSPACE,
                    instanceId: INSTANCE,
                    name: "Support",
                    runtimeGeneration: "generation-1",
                    runtimeAvailability: "provisioned",
                    inventory: null
                },
                sources: reads.map(read => {
                    const separator = read.lastIndexOf(":")
                    return {
                        sourceIdentity: decodeURIComponent(read.slice(0, separator)),
                        readGeneration: Number(read.slice(separator + 1)),
                        availability: "available",
                        freshness: "current",
                        completeness: "complete",
                        observedAt: "2026-09-25T03:00:00.000Z",
                        payload: {}
                    }
                })
            })
        }
    })
}

const sentUrls = (): Array<string> => fetchMock.mock.calls.map(call => String(call[0]))

const renderShell = (props: AgentOSShellOptions = options) => renderHook((input: AgentOSShellOptions) => useAgentOSShell(input), { wrapper, initialProps: props })

beforeEach(() => {
    vi.clearAllMocks()
    mocks.api.refreshSession.mockResolvedValue({ ok: true, data: { accessToken: TOKEN, requiresTwoFactor: false, twoFactorToken: null } })
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    answerOverview()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useAgentOSShell", () => {
    it("reads every source of the signed-in selection once, under its own generation", async () => {
        const { result } = renderShell()

        await waitFor(() => expect(result.current.sources).toHaveLength(6))

        expect(result.current.sources.every(entry => entry.state === "available")).toBe(true)
        expect(result.current.sources.map(entry => entry.identity.kind).sort()).toEqual(["attention", "capability", "configuration", "core_registry", "installation_inventory", "runtime"])
        expect(result.current.session).toBe("established")
        expect(result.current.sessionStatus).toBe("signed-in")
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: "GET", credentials: "omit", headers: { Authorization: `Bearer ${TOKEN}` } })
        expect(sentUrls()[0]).toContain(`read=core_registry:1`)
        expect(sentUrls()[0]).toContain(`read=runtime:1`)
        expect(sentUrls()[0]).toContain(`read=attention%3A%7B${INSTALLATION}%7D:1`)
        expect(sentUrls()[0]).toContain("selectionGeneration=shell-")
    })

    it("asks for nothing at all while the session is still anonymous", async () => {
        mocks.api.refreshSession.mockResolvedValue({ ok: false, reason: "no-cookie", code: "EMPTY" })
        const { result } = renderShell()

        await waitFor(() => expect(result.current.session).toBe("sign-in-required"))
        expect(result.current.blocked).toBe(true)
        expect(result.current.sources).toEqual([])
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("clears the selection and blocks further reads when the route answers unauthenticated", async () => {
        fetchMock.mockResolvedValue({ status: 401, json: async () => ({ message: "Authentication required" }) })
        const { result } = renderShell()

        await waitFor(() => expect(result.current.session).toBe("sign-in-required"))
        expect(result.current.sources).toEqual([])

        const callsBefore = fetchMock.mock.calls.length
        act(() => result.current.readSelection())
        await waitFor(() => expect(result.current.blocked).toBe(true))
        expect(fetchMock.mock.calls.length).toBe(callsBefore)
    })

    it("discards the former selection's sources and reads only the new selection", async () => {
        const { result, rerender } = renderShell()
        await waitFor(() => expect(result.current.sources).toHaveLength(6))

        rerender({ ...options, workspaceId: OTHER_WORKSPACE })

        await waitFor(() => expect(sentUrls().some(url => url.includes(`/workspaces/${OTHER_WORKSPACE}/`))).toBe(true))
        expect(result.current.selection).toEqual({ workspaceId: OTHER_WORKSPACE, instanceId: INSTANCE })
        expect(result.current.sources).toHaveLength(6)
    })

    it("retries exactly the failed source under a newer generation and replays no command", async () => {
        const { result } = renderShell()
        await waitFor(() => expect(result.current.sources).toHaveLength(6))
        const callsBefore = fetchMock.mock.calls.length

        act(() => result.current.retrySource({ kind: "runtime" }))

        await waitFor(() => expect(fetchMock.mock.calls.length).toBe(callsBefore + 1))
        const retryUrl = sentUrls()[callsBefore]
        expect(retryUrl).toContain("read=runtime:2")
        expect(retryUrl).not.toContain("read=core_registry")
        expect(retryUrl).not.toContain("read=attention")
        expect(fetchMock.mock.calls[callsBefore]?.[1]).toMatchObject({ method: "GET" })
        expect(sentUrls().filter(url => url.includes("/operations/"))).toEqual([])
    })

    it("refreshes the whole selection under newer generations on a return", async () => {
        const { result } = renderShell()
        await waitFor(() => expect(result.current.sources).toHaveLength(6))

        act(() => result.current.readSelection())

        await waitFor(() => expect(sentUrls().some(url => url.includes("read=runtime:2"))).toBe(true))
        expect(sentUrls().at(-1)).toContain("read=runtime:2")
    })

    it("resolves an entry through the registered operation and decides nothing by itself", async () => {
        const { result } = renderShell()
        await waitFor(() => expect(result.current.sources).toHaveLength(6))

        fetchMock.mockResolvedValueOnce({
            status: 200,
            json: async () => ({
                kind: "registered_destination",
                destination: {
                    grammarVersion: 1,
                    routeName: "module-home",
                    workspaceId: WORKSPACE,
                    instanceId: INSTANCE,
                    installationId: INSTALLATION,
                    opaqueItemId: null,
                    returnContext: { routeName: "purchased_agentos", workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION }
                },
                selectionGeneration: `shell-${WORKSPACE}-${INSTANCE}`
            })
        })

        const outcome = await act(async () => result.current.resolveEntry(INSTALLATION, "module_home", null))

        expect(outcome.state).toBe("resolved")
        const navigationUrl = sentUrls().at(-1) ?? ""
        expect(navigationUrl).toContain("/operations/navigation.resolve%401")
        expect(fetchMock.mock.calls.at(-1)?.[1]).toMatchObject({ method: "POST" })
        expect(result.current.navigationDecision(outcome)).toMatchObject({ open: true })
        expect(result.current.navigationDecision({ state: "obsolete" })).toEqual({ open: false, reason: "obsolete" })
    })

    it("holds every observation in memory and writes nothing to browser storage", async () => {
        const storageSet = vi.spyOn(Storage.prototype, "setItem")
        const storageClear = vi.spyOn(Storage.prototype, "clear")
        const { result } = renderShell()
        await waitFor(() => expect(result.current.sources).toHaveLength(6))

        expect(storageSet).not.toHaveBeenCalled()
        expect(storageClear).not.toHaveBeenCalled()
    })
})