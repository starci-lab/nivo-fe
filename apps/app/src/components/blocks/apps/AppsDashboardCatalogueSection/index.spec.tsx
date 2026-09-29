import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CatalogueSectionView } from "@/modules/apps/apps-dashboard"
import { AppsDashboardCatalogueSection } from "."

describe("AppsDashboardCatalogueSection", () => {
    it("starts the named template and keeps unsupported offers disabled", () => {
        const onBuildTemplate = vi.fn()
        const catalogue: CatalogueSectionView = {
            phase: "answered",
            label: "Catalogue",
            fact: "Templates",
            offers: [
                {
                    id: "one",
                    templateKey: "ai_academy",
                    name: "Academy",
                    tagline: "Learn",
                    kindLabel: "Template",
                    priceLabel: "₫1",
                    actionLabel: "Build",
                    actionDisabled: false,
                },
                {
                    id: "two",
                    templateKey: "unsupported",
                    name: "Other",
                    tagline: "More",
                    kindLabel: "Template",
                    priceLabel: "₫2",
                    actionLabel: "Unavailable",
                    actionDisabled: true,
                },
            ],
        }
        render(<AppsDashboardCatalogueSection catalogue={catalogue} onBuildTemplate={onBuildTemplate} />)
        fireEvent.click(screen.getByRole("button", { name: "Build" }))
        expect(onBuildTemplate).toHaveBeenCalledExactlyOnceWith("ai_academy")
        expect(screen.getByRole("button", { name: "Unavailable" })).toBeDisabled()
    })
})
