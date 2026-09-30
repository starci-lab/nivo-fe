import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AgentOSProvisioningSteps } from "./index"

describe("AgentOSProvisioningSteps", () => {
    it("draws the supplied lifecycle positions", async () => {
        const { container } = render(
            <AgentOSProvisioningSteps
                label="Progress"
                isLoading={false}
                steps={[
                    { ordinal: "1", label: "Request", state: "done", stateLabel: "Complete" },
                    { ordinal: "2", label: "Payment", state: "current", stateLabel: "Active" },
                ]}
            />,
        )
        expect(screen.getByRole("list", { name: "Progress" })).toBeInTheDocument()
        expect(screen.getByText("Request")).toBeInTheDocument()
        expect(screen.getByText("Payment")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
