import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/provisioning/TemplateAppProvisioning", () => ({
    TemplateAppProvisioningPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { TemplateAppProvisioningPage } from "."

describe("TemplateAppProvisioningPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<TemplateAppProvisioningPage mode="resume" siteId="site-1" />)
        expect(screen.getByTestId("block")).toHaveTextContent("site-1")
    })
})