import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HomePage, SiteHeader, SiteShell } from "."

describe("public-site composition", () => {
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

    it("mounts one shared skip-link, banner, routed content, and footer", () => {
        const html = renderToStaticMarkup(<SiteShell><main id="main-content">Route</main></SiteShell>)

        expect(html).toContain("Bỏ qua đến nội dung chính")
        expect(html).toContain("Điều hướng chính")
        expect(html).toContain("Human Leads. AI Operates. System Learns.")
    })

    it("opens and closes the compact navigation with keyboard-safe state", async () => {
        const user = userEvent.setup()
        render(<SiteHeader />)

        const trigger = screen.getByRole("button", { name: "Mở điều hướng" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        await user.click(trigger)
        expect(screen.getByRole("navigation", { name: "Điều hướng di động" })).toBeInTheDocument()
        expect(trigger).toHaveAttribute("aria-expanded", "true")

        await user.keyboard("{Escape}")
        expect(screen.queryByRole("navigation", { name: "Điều hướng di động" })).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })
})
