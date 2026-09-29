import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyLeadBand } from "./index"

describe("AcademyLeadBand", () => {
    it("draws required name and phone controls with authored copy", () => {
        const html = renderToStaticMarkup(
            <AcademyLeadBand
                section={{ kind: "lead", id: "lead", title: "Contact", body: "Tell us", nameLabel: "Name", phoneLabel: "Phone", submitLabel: "Send", sendingLabel: "Sending", sentMessage: "Sent", errorMessage: "Failed" }}
                status="idle"
                submit={vi.fn()}
            />,
        )
        expect(html).toContain("lead-name")
        expect(html).toContain("lead-phone")
        expect(html).toContain("Tell us")
    })
})
