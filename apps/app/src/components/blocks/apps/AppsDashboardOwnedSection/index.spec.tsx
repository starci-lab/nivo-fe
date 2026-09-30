import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CatalogueSectionView, OwnedSectionView } from "../../../../modules/apps/apps-dashboard"
import { AppsDashboardOwnedSection } from "."

const catalogue: CatalogueSectionView = {
    phase: "answered",
    label: "Catalogue",
    fact: "One template",
    offers: [
        {
            id: "offer",
            templateKey: "ai_academy",
            name: "Academy",
            tagline: "Learn",
            kindLabel: "Template app",
            priceLabel: "₫1",
            actionLabel: "Build",
            actionDisabled: false,
        },
    ],
}

describe("AppsDashboardOwnedSection", () => {
    it("offers the supported template action when the owned set is empty", async () => {
        const owned: OwnedSectionView = { phase: "empty", label: "Your apps", note: "There is no app yet." }
        const { container } = render(
            <AppsDashboardOwnedSection
                owned={owned}
                catalogue={catalogue}
                buildAppLabel="Build app"
                onBuildTemplate={vi.fn()}
                onOpenOwnedApp={vi.fn()}
            />,
        )
        expect(screen.getByText("There is no app yet.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Build app" })).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
