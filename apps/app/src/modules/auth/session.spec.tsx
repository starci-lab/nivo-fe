import { act, renderHook, waitFor } from "@testing-library/react"
import type { ComponentProps } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: {
        refreshSession: vi.fn(),
        signOut: vi.fn(),
    },
    transport: {
        useAccessTokenFrom: vi.fn(),
        useLocaleFrom: vi.fn(),
    },
}))

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("../api/auth", () => ({
    refreshSession: mocks.api.refreshSession,
    signOut: mocks.api.signOut,
}))
vi.mock("../api/graphql", () => ({
    useAccessTokenFrom: mocks.transport.useAccessTokenFrom,
    useLocaleFrom: mocks.transport.useLocaleFrom,
}))

import type { AuthPayload } from "../api/auth"
import { SessionProvider, useSession } from "./session"

const payload = (overrides: Partial<AuthPayload> = {}): AuthPayload => ({
    accessToken: "token-1",
    requiresTwoFactor: false,
    twoFactorToken: null,
    ...overrides,
})

const deferred = <T,>() => {
    let resolve!: (value: T) => void
    const promise = new Promise<T>(res => {
        resolve = res
    })
    return { promise, resolve }
}

const wrapper = ({ children }: ComponentProps<"div">) => <SessionProvider>{children}</SessionProvider>

const renderSession = () => renderHook(() => useSession(), { wrapper })

describe("SessionProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.api.refreshSession.mockResolvedValue({ ok: false, reason: "no-cookie", code: "EMPTY" })
        mocks.api.signOut.mockResolvedValue({
            ok: true,
            data: { data: true, remoteRevocationObserved: false, authorityEndingConfirmed: null },
        })
    })

    it("restores a signed-in session from the refresh cookie", async () => {
        mocks.api.refreshSession.mockResolvedValue({ ok: true, data: payload() })
        const { result } = renderSession()

        await waitFor(() => expect(result.current.state.status).toBe("signed-in"))
        expect(result.current.state).toEqual({ status: "signed-in", accessToken: "token-1" })
    })

    it("settles anonymous when the refresh is refused", async () => {
        const { result } = renderSession()

        await waitFor(() => expect(result.current.state.status).toBe("anonymous"))
    })

    it("settles anonymous when the refresh still owes a factor", async () => {
        mocks.api.refreshSession.mockResolvedValue({
            ok: true,
            data: payload({ accessToken: null, requiresTwoFactor: true, twoFactorToken: "challenge-1" }),
        })
        const { result } = renderSession()

        await waitFor(() => expect(result.current.state.status).toBe("anonymous"))
    })

    it("adopts a complete payload and ignores one still owing a factor", async () => {
        const { result } = renderSession()
        await waitFor(() => expect(result.current.state.status).toBe("anonymous"))

        act(() => result.current.adopt(payload({ accessToken: null, requiresTwoFactor: true, twoFactorToken: "challenge-1" })))
        expect(result.current.state.status).toBe("anonymous")

        act(() => result.current.adopt(payload({ accessToken: "adopted-token" })))
        expect(result.current.state).toEqual({ status: "signed-in", accessToken: "adopted-token" })
    })

    it("drops a stale refresh refusal that arrives after a newer adopt", async () => {
        /*
         * The losing observation must not clear the newer custody result: the refresh was started
         * before the sign-in landed, so its late refusal is older information than the adopt.
         */
        const refresh = deferred<Awaited<ReturnType<typeof mocks.api.refreshSession>>>()
        mocks.api.refreshSession.mockReturnValue(refresh.promise)
        const { result } = renderSession()

        act(() => result.current.adopt(payload({ accessToken: "adopted-token" })))
        expect(result.current.state.status).toBe("signed-in")

        await act(async () => refresh.resolve({ ok: false, reason: "lineage-lost", code: "REFUSED" }))
        expect(result.current.state).toEqual({ status: "signed-in", accessToken: "adopted-token" })
    })

    it("drops a stale refresh success that arrives after end", async () => {
        /*
         * The mirror of the losing refusal: a success issued before sign-out must not put a session
         * back - the refresh answer was minted before custody was cleared.
         */
        const refresh = deferred<Awaited<ReturnType<typeof mocks.api.refreshSession>>>()
        mocks.api.refreshSession.mockReturnValue(refresh.promise)
        const { result } = renderSession()

        await act(async () => {
            await result.current.end()
        })
        expect(result.current.state.status).toBe("anonymous")

        await act(async () => refresh.resolve({ ok: true, data: payload() }))
        expect(result.current.state.status).toBe("anonymous")
    })

    it("ends locally and reports what the sign-out envelope stated", async () => {
        mocks.api.refreshSession.mockResolvedValue({ ok: true, data: payload() })
        const { result } = renderSession()
        await waitFor(() => expect(result.current.state.status).toBe("signed-in"))

        let report: Awaited<ReturnType<typeof result.current.end>> | undefined
        await act(async () => {
            report = await result.current.end()
        })

        expect(mocks.api.signOut).toHaveBeenCalledTimes(1)
        // this browser only: no scope travels, and none is invented
        expect(mocks.api.signOut).toHaveBeenCalledWith(undefined)
        expect(result.current.state.status).toBe("anonymous")
        /*
         * The envelope stated an unobserved revocation and a null authority answer - null because a
         * this-browser sign-out never reaches the identity authority at all. Neither is inflated:
         * the remote outcome stays unknown and the principal-wide ending was never asked.
         */
        expect(report).toEqual({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "notAsked" })
    })

    it("reports an observed revocation and a confirmed everywhere ending as stated", async () => {
        mocks.api.refreshSession.mockResolvedValue({ ok: true, data: payload() })
        mocks.api.signOut.mockResolvedValue({
            ok: true,
            data: { data: true, remoteRevocationObserved: true, authorityEndingConfirmed: true },
        })
        const { result } = renderSession()
        await waitFor(() => expect(result.current.state.status).toBe("signed-in"))

        let report: Awaited<ReturnType<typeof result.current.end>> | undefined
        await act(async () => {
            report = await result.current.end("everywhere")
        })

        expect(mocks.api.signOut).toHaveBeenCalledWith({ scope: "everywhere" })
        expect(report).toEqual({ localCleared: true, remoteRevocation: "observed", authorityEnding: "confirmed" })
    })

    it("keeps an asked but unconfirmed everywhere ending unconfirmed", async () => {
        /*
         * contract.login.session-ending: reporting an unconfirmed authority-side ending as confirmed
         * breaks the consumer. The ask was made, so this is unconfirmed - never `notAsked`, which
         * would deny the ask, and never `confirmed`, which nobody said.
         */
        mocks.api.refreshSession.mockResolvedValue({ ok: true, data: payload() })
        mocks.api.signOut.mockResolvedValue({
            ok: true,
            data: { data: true, remoteRevocationObserved: false, authorityEndingConfirmed: false },
        })
        const { result } = renderSession()
        await waitFor(() => expect(result.current.state.status).toBe("signed-in"))

        let report: Awaited<ReturnType<typeof result.current.end>> | undefined
        await act(async () => {
            report = await result.current.end("everywhere")
        })

        expect(report).toEqual({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "unconfirmed" })
    })

    it("still clears locally and stays honest when the sign-out call fails", async () => {
        mocks.api.refreshSession.mockResolvedValue({ ok: true, data: payload() })
        mocks.api.signOut.mockResolvedValue({ ok: false, reason: "network", code: "NETWORK" })
        const { result } = renderSession()
        await waitFor(() => expect(result.current.state.status).toBe("signed-in"))

        let report: Awaited<ReturnType<typeof result.current.end>> | undefined
        await act(async () => {
            report = await result.current.end()
        })

        expect(result.current.state.status).toBe("anonymous")
        // nothing answered, so nothing was observed and no authority was asked
        expect(report).toEqual({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "notAsked" })

        await act(async () => {
            report = await result.current.end("everywhere")
        })

        // the wider ending WAS asked; an unanswered request confirms no part of it
        expect(report).toEqual({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "unconfirmed" })
    })

    it("throws outside the provider", () => {
        expect(() => renderHook(() => useSession())).toThrow("useSession was called outside SessionProvider")
    })
})
