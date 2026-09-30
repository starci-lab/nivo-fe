import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Session } from "@/modules/auth/session"
import type { AuthenticationFlowControl, AuthenticationTranslate } from "./auth.shared"

const mocks = vi.hoisted(() => ({ verify: vi.fn() }))

vi.mock("@/hooks/swr/mutations/useMutateVerifyTwoFactorSwr", () => ({
    useMutateVerifyTwoFactorSwr: () => ({ trigger: mocks.verify }),
}))

import { useAuthenticationTwoFactor } from "./useAuthenticationTwoFactor"

const t: AuthenticationTranslate = (key) => key
const makeControl = (): AuthenticationFlowControl => ({
    phase: "details",
    feedback: { statusMessage: "", isError: false },
    pendingAction: null,
    markCode: vi.fn(),
    markDone: vi.fn(),
    markTwoFactor: vi.fn(),
    resetFlow: vi.fn(),
    clearFeedback: vi.fn(),
    refuse: vi.fn(),
    hesitate: vi.fn(),
    setPendingAction: vi.fn(),
    runPending: async <Answer>(_action: "submit" | "resend" | "provider", request: () => Promise<Answer>) => request(),
})
const session: Session = {
    state: { status: "anonymous" },
    adopt: vi.fn(),
    end: async () => ({ localCleared: true, remoteRevocation: "unknown", authorityEnding: "notAsked" }),
    discard: vi.fn(),
}

describe("useAuthenticationTwoFactor", () => {
    beforeEach(() => vi.resetAllMocks())

    it("uses the held challenge, adopts a session and returns to the chosen destination", async () => {
        const control = makeControl()
        const landOnReturnTo = vi.fn()
        mocks.verify.mockResolvedValue({
            ok: true,
            data: { accessToken: "factor-access", requiresTwoFactor: false, twoFactorToken: null },
        })
        const { result } = renderHook(() => useAuthenticationTwoFactor({ control, session, t }))

        act(() => result.current.activate("factor-token"))
        await act(() => result.current.submit({ code: "123456" }, landOnReturnTo))

        expect(mocks.verify).toHaveBeenCalledWith({ twoFactorToken: "factor-token", code: "123456" })
        expect(session.adopt).toHaveBeenCalledWith({
            accessToken: "factor-access",
            requiresTwoFactor: false,
            twoFactorToken: null,
        })
        expect(landOnReturnTo).toHaveBeenCalledTimes(1)
        expect(control.markTwoFactor).toHaveBeenCalledTimes(1)
    })

    it("keeps an undecided verification separate from a refusal", async () => {
        const control = makeControl()
        mocks.verify.mockResolvedValue({ ok: false, kind: "unavailable" })
        const { result } = renderHook(() => useAuthenticationTwoFactor({ control, session, t }))

        await act(() => result.current.submit({ code: "123456" }, vi.fn()))

        expect(control.hesitate).toHaveBeenCalledWith("signIn.undecided")
        expect(control.refuse).not.toHaveBeenCalled()
    })
})
