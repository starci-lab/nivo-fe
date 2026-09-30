import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { AuthNoticeCopy } from "@/modules/auth/authentication-panel/copy"
import { AuthenticationPanelNotice } from "./"

const notice: AuthNoticeCopy = {
    title: "Done",
    subtitle: "You may continue",
    statusMessage: "",
    isError: false,
    isPending: false,
    doneTitle: "Done",
    doneHint: "You may continue",
    onwardLabel: "Continue",
    secondaryLabel: "",
}

describe("AuthenticationPanelNotice", () => {
    it("draws success and unsupported-factor notices", () => {
        const done = renderToStaticMarkup(
            <AuthenticationPanelNotice state="done" props={notice} on={{ onward: vi.fn() }} />,
        )
        const unsupported = renderToStaticMarkup(
            <AuthenticationPanelNotice
                state="twoFactorUnsupported"
                props={{ ...notice, doneTitle: "Two-factor unavailable" }}
                on={{ onward: vi.fn() }}
            />,
        )
        expect(done).toContain("Done")
        expect(unsupported).toContain("Two-factor unavailable")
    })

    it("has no accessibility violations in the real notice", async () => {
        const { container } = render(
            <AuthenticationPanelNotice state="done" props={notice} on={{ onward: vi.fn() }} />,
        )
        await expectNoA11yViolations(container)
    })

    it("offers a second way out only when a secondary action is present", () => {
        const single = renderToStaticMarkup(
            <AuthenticationPanelNotice
                state="notice"
                props={{ ...notice, doneTitle: "That address already has an account", doneHint: "Sign in or reset it." }}
                on={{ onward: vi.fn() }}
            />,
        )
        const double = renderToStaticMarkup(
            <AuthenticationPanelNotice
                state="notice"
                props={{ ...notice, secondaryLabel: "Reset password" }}
                on={{ onward: vi.fn(), onwardSecondary: vi.fn() }}
            />,
        )
        expect(single).toContain("That address already has an account")
        expect(single).not.toContain("Reset password")
        expect(double).toContain("Reset password")
    })

    it("draws a reasonless notice without inventing a heading", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanelNotice
                state="notice"
                props={{ ...notice, doneTitle: "", doneHint: "That place is not open right now." }}
                on={{ onward: vi.fn() }}
            />,
        )
        expect(markup).toContain("That place is not open right now.")
        expect(markup).not.toContain("<h2")
    })
})
