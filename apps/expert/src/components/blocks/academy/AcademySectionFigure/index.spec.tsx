import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademySectionFigure } from "./index"

describe("AcademySectionFigure", () => {
    it("keeps the placeholder frame when no image is authored", () => {
        const html = renderToStaticMarkup(
            <AcademySectionFigure alt="Teacher" failedImageSources={new Set()} failImage={() => undefined} />,
        )
        expect(html).toContain("<figure")
        expect(html).toContain("<svg")
    })
})
