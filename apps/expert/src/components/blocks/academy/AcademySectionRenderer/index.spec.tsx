import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademySectionRenderer } from "./index"

describe("AcademySectionRenderer", () => {
    it("routes product sections to their drawing blocks", () => {
        const html = renderToStaticMarkup(
            <AcademySectionRenderer
                section={{ kind: "offer", id: "offer", title: "Offer", body: "Join" }}
                state={{ failedImageSources: new Set(), failImage: () => undefined, leadStatus: "idle", submitLead: () => undefined }}
            />,
        )
        expect(html).toContain("Join")
    })
})
