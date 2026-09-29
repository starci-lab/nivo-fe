import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Session } from "@/modules/auth/session"
import type { AuthenticationFlowControl, AuthenticationTranslate } from "./auth.shared"

const mocks = vi.hoisted(() => ({
    forgotResend: vi.fn(),
    forgotVerify: vi.fn(),
    signUpResend: vi.fn(),
    signUpVerify: vi.fn(),
}))

vi.mock("@/hooks/swr/mutations/auth", () => ({
    useMutateForgotPasswordResendSwr: () => ({ trigger: mocks.forgotResend }),
    useMutateForgotPasswordVerifyOtpSwr: () => ({ trigger: mocks.forgotVerify }),
    useMutateSignUpResendSwr: () => ({ trigger: mocks.signUpResend }),
    useMutateSignUpVerifyOtpSwr: () => ({ trigger: mocks.signUpVerify }),
}))

import { useAuthenticationCode } from "./useAuthenticationCode"

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

describe("useAuthenticationCode", () => {
    beforeEach(() => vi.resetAllMocks())

    it("starts a code journey and reports a held address as a notice", async () => {
        const control = makeControl()
        const showNotice = vi.fn()
        mocks.signUpVerify.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                conclusion: { reason: "heldAddress" },
                undecided: null,
            },
        })
        const { result } = renderHook(() =>
            useAuthenticationCode({
                mode: "signUp",
                control,
                session,
                t,
                showNotice,
                activateTwoFactor: vi.fn(),
            }),
        )

        act(() => result.current.start("reader@example.test", { challengeId: "challenge", expiresInSeconds: 300 }))
        await act(() => result.current.submit({ otp: "123456", newPassword: "" }))

        expect(result.current.email).toBe("reader@example.test")
        expect(result.current.ttlMinutes).toBe(5)
        expect(control.markCode).toHaveBeenCalledTimes(1)
        expect(showNotice).toHaveBeenCalledWith("heldAddress")
        expect(control.markDone).not.toHaveBeenCalled()
    })

    it("resends the active challenge and renews its local cooldown", async () => {
        mocks.signUpResend.mockResolvedValue({
            ok: true,
            data: { challengeId: "challenge-next", expiresInSeconds: 120 },
        })
        const { result } = renderHook(() =>
            useAuthenticationCode({
                mode: "signUp",
                control: makeControl(),
                session,
                t,
                showNotice: vi.fn(),
                activateTwoFactor: vi.fn(),
            }),
        )
        act(() => result.current.start("reader@example.test", { challengeId: "challenge", expiresInSeconds: 300 }))
        await act(() => result.current.resend())

        expect(mocks.signUpResend).toHaveBeenCalledWith({ challengeId: "challenge" })
        expect(result.current.challenge).toEqual({ challengeId: "challenge-next", expiresInSeconds: 120 })
        expect(result.current.cooldownSeconds).toBe(60)
    })

    it("adopts a created account and finishes on the done step", async () => {
        const control = makeControl()
        mocks.signUpVerify.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "new-account-access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                conclusion: null,
                undecided: null,
            },
        })
        const { result } = renderHook(() =>
            useAuthenticationCode({
                mode: "signUp",
                control,
                session,
                t,
                showNotice: vi.fn(),
                activateTwoFactor: vi.fn(),
            }),
        )
        act(() => result.current.start("reader@example.test", { challengeId: "challenge", expiresInSeconds: 300 }))
        await act(() => result.current.submit({ otp: "123456", newPassword: "" }))

        expect(session.adopt).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "new-account-access" }))
        expect(control.markDone).toHaveBeenCalledTimes(1)
    })
})
