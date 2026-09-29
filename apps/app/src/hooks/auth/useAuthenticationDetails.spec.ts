import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authenticationDestination, readAuthenticationReturnTo } from "./auth.shared"
import type { AuthenticationFlowControl, AuthenticationTranslate } from "./auth.shared"

const mocks = vi.hoisted(() => ({
    signIn: vi.fn(),
    signUpInit: vi.fn(),
    forgotPasswordInit: vi.fn(),
    continueBrokered: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    session: {
        state: { status: "anonymous" as string },
        adopt: vi.fn(),
        end: vi.fn(),
        discard: vi.fn(),
    },
}))

vi.mock("@/hooks/swr/mutations/auth", () => ({
    useMutateForgotPasswordInitSwr: () => ({ trigger: mocks.forgotPasswordInit }),
    useMutateSignInSwr: () => ({ trigger: mocks.signIn }),
    useMutateSignUpInitSwr: () => ({ trigger: mocks.signUpInit }),
    useOauthReturnExchange: () => ({ answer: undefined, isMutating: false }),
}))
vi.mock("@/hooks/swr/mutations/useMutateContinueBrokeredSignInSwr", () => ({
    useMutateContinueBrokeredSignInSwr: () => ({ trigger: mocks.continueBrokered }),
}))
vi.mock("@/hooks/i18n/usePathname", () => ({ usePathname: () => "/authentication" }))
vi.mock("@/hooks/i18n/useRouter", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))

import { useAuthenticationDetails } from "./useAuthenticationDetails"

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

describe("useAuthenticationDetails", () => {
    beforeEach(() => {
        vi.resetAllMocks()
        mocks.session.state = { status: "anonymous" }
        window.history.replaceState(null, "", "/authentication")
    })

    it("adopts a password session and follows the backend-resolved destination", async () => {
        mocks.signIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                destination: "/overview",
                undecided: null,
            },
        })
        const { result } = renderHook(() =>
            useAuthenticationDetails({
                control: makeControl(),
                t,
                activateTwoFactor: vi.fn(),
                isSignedInArrival: false,
            }),
        )

        await act(() =>
            result.current.submit({ email: "reader@example.test", password: "password", name: "" }, vi.fn()),
        )

        expect(mocks.signIn).toHaveBeenCalledWith({ email: "reader@example.test", password: "password" })
        expect(mocks.session.adopt).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "access" }))
        expect(mocks.push).toHaveBeenCalledWith("/overview")
    })

    it("starts the mailed-code step for sign-up without creating a session", async () => {
        mocks.signUpInit.mockResolvedValue({
            ok: true,
            data: { challengeId: "challenge", expiresInSeconds: 300 },
        })
        const startCode = vi.fn()
        const { result } = renderHook(() =>
            useAuthenticationDetails({
                control: makeControl(),
                t,
                activateTwoFactor: vi.fn(),
                isSignedInArrival: false,
            }),
        )
        act(() => result.current.changeMode("signUp"))
        await act(() =>
            result.current.submit({ email: "reader@example.test", password: "password", name: "Reader" }, startCode),
        )

        expect(startCode).toHaveBeenCalledWith("reader@example.test", {
            challengeId: "challenge",
            expiresInSeconds: 300,
        })
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("reports a credential refusal and still allows the reader to switch journeys", async () => {
        const control = makeControl()
        mocks.signIn.mockResolvedValue({ ok: false, kind: "invalid" })
        const { result } = renderHook(() =>
            useAuthenticationDetails({ control, t, activateTwoFactor: vi.fn(), isSignedInArrival: false }),
        )

        await act(() => result.current.submit({ email: "reader@example.test", password: "wrong", name: "" }, vi.fn()))
        act(() => result.current.changeMode("forgotPassword"))

        expect(control.refuse).toHaveBeenCalledWith("signIn.refused")
        expect(result.current.mode).toBe("forgotPassword")
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("keeps only a validated internal return path", () => {
        expect(readAuthenticationReturnTo("?returnTo=%2Fcatalog%2Fitem", null)).toBe("/catalog/item")
        expect(readAuthenticationReturnTo("?returnTo=%2F%2Fevil.test", null)).toBeNull()
        expect(authenticationDestination("/catalog/item", "/overview")).toBe("/overview?returnNotice=unavailable")
    })
})
