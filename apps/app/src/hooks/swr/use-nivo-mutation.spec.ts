/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react"
import type * as SwrModule from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useNivoMutation } from "./use-nivo-mutation"

const mocks = vi.hoisted(() => ({
    mutateCache: vi.fn(),
    state: { status: "anonymous" } as
        | { readonly status: "anonymous" }
        | { readonly status: "signed-in"; readonly accessToken: string },
}))

vi.mock("swr", async (importOriginal) => ({
    ...await importOriginal<typeof SwrModule>(),
    useSWRConfig: () => ({ mutate: mocks.mutateCache }),
}))

vi.mock("@/modules/auth/session", () => ({
    useSession: () => ({ state: mocks.state }),
}))

const tokenFor = (subject: string) => {
    const payload = btoa(JSON.stringify({ sub: subject })).replaceAll("=", "")
    return `header.${payload}.signature`
}

beforeEach(() => {
    mocks.state = { status: "anonymous" }
    mocks.mutateCache.mockReset()
    mocks.mutateCache.mockResolvedValue(undefined)
})

describe("useNivoMutation", () => {
    it("refuses a press while no viewer is signed in", async () => {
        const mutation = vi.fn().mockResolvedValue({ ok: true })
        const { result } = renderHook(() => useNivoMutation(["resource", "one"], mutation))

        await act(async () => {
            await expect(result.current.trigger({ value: "input" })).rejects.toThrow()
        })
        expect(mutation).not.toHaveBeenCalled()
    })

    it("runs one viewer-scoped press and returns operation data unchanged", async () => {
        mocks.state = { status: "signed-in", accessToken: tokenFor("viewer-1") }
        const answer = { ok: false as const, reason: "policy refused" }
        const mutation = vi.fn().mockResolvedValue(answer)
        const { result } = renderHook(() => useNivoMutation(["resource", "one"], mutation))

        await act(async () => {
            await expect(result.current.trigger({ value: "input" })).resolves.toEqual(answer)
        })
        expect(mutation).toHaveBeenCalledWith({ value: "input" })
        expect(result.current.error).toBeUndefined()
    })

    it("keeps mutation lifecycle local to its exact resource key", async () => {
        mocks.state = { status: "signed-in", accessToken: tokenFor("viewer-1") }
        let settle: (value: { readonly ok: true }) => void = () => undefined
        const mutation = vi.fn().mockReturnValue(new Promise((resolve) => { settle = resolve }))
        const { result } = renderHook(() => ({
            first: useNivoMutation(["resource", "one"], mutation),
            second: useNivoMutation(["resource", "two"], mutation),
        }))

        let inFlight: Promise<unknown> = Promise.resolve()
        act(() => {
            inFlight = result.current.first.trigger({ value: "input" })
        })
        expect(result.current.first.isMutating).toBe(true)
        expect(result.current.second.isMutating).toBe(false)

        await act(async () => {
            settle({ ok: true })
            await inFlight
        })
    })

    it("invalidates the accepted command's viewer-scoped resource keys", async () => {
        mocks.state = { status: "signed-in", accessToken: tokenFor("viewer-1") }
        const mutation = vi.fn().mockResolvedValue({ ok: true as const, data: { id: "module-1" } })
        const { result } = renderHook(() => useNivoMutation<
            { readonly ok: true, readonly data: { readonly id: string } },
            { readonly value: string }
        >(
            ["command", "module-1"],
            mutation,
            {
                invalidates: [["agentos", "module-studio", "workspace-1", "module-1"]],
                shouldInvalidate: (answer) => answer.ok,
            },
        ))

        await act(async () => {
            await result.current.trigger({ value: "input" })
        })

        expect(mocks.mutateCache).toHaveBeenCalledWith([
            "NIVO_QUERY",
            "viewer-1",
            "agentos",
            "module-studio",
            "workspace-1",
            "module-1",
        ])
    })

    it("does not invalidate durable reads when the command is refused", async () => {
        mocks.state = { status: "signed-in", accessToken: tokenFor("viewer-1") }
        const mutation = vi.fn().mockResolvedValue({ ok: false as const, reason: "policy" })
        const { result } = renderHook(() => useNivoMutation<
            { readonly ok: false, readonly reason: string },
            { readonly value: string }
        >(
            ["command", "module-1"],
            mutation,
            {
                invalidates: [["agentos", "module-studio", "workspace-1", "module-1"]],
                shouldInvalidate: (answer) => answer.ok,
            },
        ))

        await act(async () => {
            await result.current.trigger({ value: "input" })
        })

        expect(mocks.mutateCache).not.toHaveBeenCalled()
    })
})
