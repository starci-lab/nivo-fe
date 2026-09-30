import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademyLeadBand } from "./index"

describe("AcademyLeadBand", () => {
    it("draws required name and phone controls with authored copy", async () => {
        const { container } = render(
            <AcademyLeadBand
                section={{ kind: "lead", id: "lead", title: "Contact", body: "Tell us", nameLabel: "Name", phoneLabel: "Phone", submitLabel: "Send", sendingLabel: "Sending", sentMessage: "Sent", errorMessage: "Failed" }}
                status="idle"
                submit={vi.fn()}
            />,
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html).toContain("lead-name")
        expect(html).toContain("lead-phone")
        expect(html).toContain("Tell us")
    })
})
