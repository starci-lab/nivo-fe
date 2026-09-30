import { expectNoA11yViolations } from "@/testing/axe"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSProvisioningActions } from "./index"

describe("AgentOSProvisioningActions", () => {
    it("selects the offered package and keeps an unavailable action disabled", async () => {
        const selectOffer = vi.fn()
        const { container } = render(
            <AgentOSProvisioningActions
                selection={{
                    label: "Packages",
                    chooseOffer: "Choose product",
                    chooseTier: "Choose tier",
                    selected: "Selected",
                    offers: [{ id: "item", label: "AgentOS", tiers: [] }],
                }}
                requestActionLabel="Continue"
                requestActionDisabled
                onSelectOffer={selectOffer}
                onRequest={vi.fn()}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "AgentOS" }))
        expect(selectOffer).toHaveBeenCalledWith("item")
        expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
        await expectNoA11yViolations(container)
    })
})
