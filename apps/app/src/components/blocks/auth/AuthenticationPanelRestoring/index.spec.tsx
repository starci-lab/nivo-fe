import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AuthenticationPanelRestoring } from "./"

describe("AuthenticationPanelRestoring", () => {
    it("draws the wait instead of a form or a second title", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanelRestoring
                state="restoring"
                props={{ title: "Checking your session", subtitle: "One moment", progressLabel: "Restoring your session" }}
            />,
        )
        expect(markup).toContain("Restoring your session")
        expect(markup).not.toContain("Checking your session")
        expect(markup).not.toContain("submit")
    })
})
