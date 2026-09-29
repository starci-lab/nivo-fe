import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CompanyPage } from "./index"

describe("CompanyPage", () => {
    it("keeps unverified leadership and milestones out of Company", () => {
        const html = renderToStaticMarkup(<CompanyPage />)

        expect(html.match(/<h1/g)).toHaveLength(1)
        expect(html).toContain("Leadership = Responsibility before prestige.")
        expect(html).not.toContain("Nguyễn Tuấn Nam")
    })
})
