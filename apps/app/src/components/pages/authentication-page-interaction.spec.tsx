// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const push = vi.fn()
const signIn = vi.hoisted(() => vi.fn().mockResolvedValue({ ok: false, reason: "Invalid credentials" }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => ({ state: { status: "anonymous" }, adopt: vi.fn(), end: vi.fn() }) }))
vi.mock("@/modules/api/auth", () => ({ signIn, signUpInit: vi.fn(), signUpResend: vi.fn(), signUpVerifyOtp: vi.fn(), forgotPasswordInit: vi.fn(), forgotPasswordResend: vi.fn(), forgotPasswordVerifyOtp: vi.fn(), exchangeOauthCode: vi.fn(), oauthRedirectUrl: vi.fn(() => "https://auth.test") }))

import { AuthenticationPage } from "./AuthenticationPage"

describe("AuthenticationPage interactions", () => {
    it("keeps invalid input at its fields without sending a request", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitLabel" }))

        expect(await screen.findByText("emailRequired")).toBeInTheDocument()
        expect(screen.getByText("passwordRequired")).toBeInTheDocument()
        expect(document.querySelector("input[name='email']")).toHaveAttribute("aria-invalid", "true")
        expect(document.querySelector("input[name='password']")).toHaveAttribute("aria-invalid", "true")
        expect(signIn).not.toHaveBeenCalled()
    })

    it("submits valid credentials and masks the transport refusal", async () => {
        render(<AuthenticationPage />)
        const fields = screen.getAllByRole("textbox")
        fireEvent.change(fields[0], { target: { value: "reader@example.test" } })
        const password = document.querySelector("input[type='password']")
        if (!(password instanceof HTMLInputElement)) throw new Error("expected password input")
        fireEvent.change(password, { target: { value: "wrong-password" } })
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitLabel" }))
        expect(await screen.findByText("signIn.refused")).toBeInTheDocument()
        expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument()
        expect(push).not.toHaveBeenCalled()
    })
})
