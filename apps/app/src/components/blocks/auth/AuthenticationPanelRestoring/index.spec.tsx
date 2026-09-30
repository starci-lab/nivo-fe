import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
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

    it("has no accessibility violations while restoring", async () => {
        const { container } = render(
            <AuthenticationPanelRestoring
                state="restoring"
                props={{ title: "Checking your session", subtitle: "One moment", progressLabel: "Restoring your session" }}
            />,
        )
        await expectNoA11yViolations(container)
    })
})
