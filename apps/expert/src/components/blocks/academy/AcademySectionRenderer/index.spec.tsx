import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademySectionRenderer } from "./index"

describe("AcademySectionRenderer", () => {
    it("routes product sections to their drawing blocks", async () => {
        const { container } = render(
            <AcademySectionRenderer
                section={{ kind: "offer", id: "offer", title: "Offer", body: "Join" }}
                state={{ failedImageSources: new Set(), failImage: () => undefined, leadStatus: "idle", submitLead: () => undefined }}
            />,
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html).toContain("Join")
    })
})
