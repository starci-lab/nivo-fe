import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HomePage } from "./index"

describe("HomePage", () => {
    it("renders one canonical Homepage heading and the exact mascot master", () => {
        const html = renderToStaticMarkup(<HomePage />)

        expect(html.match(/<h1/g)).toHaveLength(1)
        expect(html).toContain("Nền tảng vận hành kinh doanh")
        expect(html).toContain("nivo-unicorn-responsibility-transparent-v18.png")
        expect(html).not.toContain("home-hero__orbit")
        expect(html).toContain("home-hero__spotlight")
        expect(html).toContain("Đang xây. Đang vận hành. Đang kiểm chứng.")
        expect(html).toContain("Evidence before scale.")
        expect(html).toContain("Action ≠ Outcome")
        expect(html).toContain("Outcome")
        expect(html).toContain("Vai trò trọng tâm")
        expect(html).toContain("home-commercial__route-step")
        expect(html).not.toContain("→")
        expect(html).not.toContain("Accountability")
        expect(html).not.toContain("Boundary")
        expect(html).not.toContain("+18.7%")
    })
})