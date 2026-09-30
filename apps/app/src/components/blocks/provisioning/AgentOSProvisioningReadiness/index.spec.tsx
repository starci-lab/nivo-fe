import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AgentOSProvisioningReadiness } from "./index"

describe("AgentOSProvisioningReadiness", () => {
    it("announces the current readiness status", async () => {
        const { container } = render(<AgentOSProvisioningReadiness title="Testing" text="Checking the workspace" />)
        expect(screen.getByText("Testing")).toBeInTheDocument()
        expect(screen.getByText("Checking the workspace")).toHaveAttribute("aria-live", "polite")
        await expectNoA11yViolations(container)
    })
})
