import { NextIntlClientProvider } from "next-intl"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import en from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import type { NivoQueryFailure } from "@/modules/query"
import { QueryNotice } from "./index"

const renderNotice = (failure: NivoQueryFailure, retry?: () => void, locale: "en" | "vi" = "en") =>
    render(
        <NextIntlClientProvider locale={locale} messages={locale === "en" ? en : viMessages}>
            <QueryNotice props={{ failure }} on={retry === undefined ? undefined : { retry }} />
        </NextIntlClientProvider>,
    )

const failure = (overrides: Partial<NivoQueryFailure>): NivoQueryFailure => ({
    kind: "unavailable",
    code: "NETWORK",
    reason: "",
    retryable: true,
    ...overrides,
})

describe("QueryNotice", () => {
    it("draws the refused kind as the sign-in door, not a retry", () => {
        const retry = vi.fn()
        renderNotice(failure({ kind: "refused", retryable: false }), retry)
        expect(screen.getByText("Sign in to continue.")).toBeInTheDocument()
        expect(screen.getByRole("link")).toHaveAttribute("href", "/authentication")
        expect(screen.queryByText("Try again")).toBeNull()
        fireEvent.click(screen.getByRole("link"))
        expect(retry).not.toHaveBeenCalled()
    })

    it("draws each denied kind with its own sentence and no retry the answer did not allow", () => {
        const { unmount } = renderNotice(failure({ kind: "forbidden", retryable: false }), vi.fn())
        expect(screen.getByText("You don't have access to this.")).toBeInTheDocument()
        expect(screen.queryByText("Try again")).toBeNull()
        unmount()

        renderNotice(failure({ kind: "not-found", retryable: false }), vi.fn())
        expect(screen.getByText("This could not be found.")).toBeInTheDocument()
        expect(screen.queryByText("Try again")).toBeNull()
        unmount()

        renderNotice(failure({ kind: "invalid", retryable: false }), vi.fn())
        expect(screen.getByText("This request was declined.")).toBeInTheDocument()
        expect(screen.queryByText("Try again")).toBeNull()
    })

    it("offers the retry only while the answer itself permits it", () => {
        const retry = vi.fn()
        const { unmount } = renderNotice(failure({ kind: "unavailable", retryable: true }), retry)
        fireEvent.click(screen.getByText("Try again"))
        expect(retry).toHaveBeenCalledTimes(1)
        unmount()

        renderNotice(failure({ kind: "unavailable", retryable: false }), retry)
        expect(screen.queryByText("Try again")).toBeNull()
    })

    it("shows a phrased reason beside the kind's sentence and hides a bare code", () => {
        const { unmount } = renderNotice(failure({ reason: "The service is restarting." }))
        expect(screen.getByText("The service is restarting.")).toBeInTheDocument()
        unmount()

        renderNotice(failure({ reason: "NETWORK" }))
        expect(screen.queryByText("NETWORK")).toBeNull()
    })

    it("reads the same keys in Vietnamese", () => {
        renderNotice(failure({ kind: "forbidden", retryable: false }), undefined, "vi")
        expect(screen.getByText("Bạn không có quyền truy cập mục này.")).toBeInTheDocument()
    })
})
