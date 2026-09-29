import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QueryNoticeView } from "./"

describe("QueryNoticeView", () => {
    it("draws the sign-in door instead of a retry for a refused session", () => {
        const retry = vi.fn()
        render(
            <QueryNoticeView
                props={{ message: "Sign in to continue.", signIn: { label: "Sign in", href: "/authentication" } }}
                on={{ retry }}
            />,
        )
        expect(screen.getByText("Sign in to continue.")).toBeInTheDocument()
        expect(screen.getByRole("link")).toHaveAttribute("href", "/authentication")
        expect(screen.queryByText("Try again")).toBeNull()
        expect(retry).not.toHaveBeenCalled()
    })

    it("offers the retry only when the copy carries its label", () => {
        const retry = vi.fn()
        const { unmount } = render(
            <QueryNoticeView props={{ message: "Unavailable", retryLabel: "Try again" }} on={{ retry }} />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledTimes(1)
        unmount()

        render(<QueryNoticeView props={{ message: "Not found" }} on={{ retry }} />)
        expect(screen.queryByRole("button")).toBeNull()
    })

    it("shows the phrased reason beside the sentence", () => {
        render(<QueryNoticeView props={{ message: "Unavailable", description: "Try again in a minute." }} />)
        expect(screen.getByText("Try again in a minute.")).toBeInTheDocument()
    })
})
