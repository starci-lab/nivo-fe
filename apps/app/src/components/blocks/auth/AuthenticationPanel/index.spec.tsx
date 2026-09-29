import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AuthenticationPanel } from "./"

describe("AuthenticationPanel", () => {
    it("dispatches restoring state to its wait block", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanel
                state="restoring"
                props={{ title: "Checking session", subtitle: "One moment", progressLabel: "Restoring session" }}
                on={{ back: vi.fn() }}
            />,
        )
        expect(markup).toContain("Restoring session")
        expect(markup).not.toContain("One moment")
    })

    it("dispatches all settled states to the notice block", () => {
        const props = {
            title: "Done",
            subtitle: "Continue",
            statusMessage: "",
            isError: false,
            isPending: false,
            doneTitle: "Complete",
            doneHint: "You may continue",
            onwardLabel: "Continue",
            secondaryLabel: "",
        }
        const states = ["done", "twoFactorUnsupported", "notice"] as const
        for (const state of states) {
            const markup = renderToStaticMarkup(<AuthenticationPanel state={state} props={props} />)
            expect(markup).toContain("Complete")
        }
    })
})
