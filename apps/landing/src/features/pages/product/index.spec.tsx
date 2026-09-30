import { render, screen, within } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
import vi from "@/messages/vi.json"
import { ProductPage } from "."

const expectSectionOrder = (html: string, ids: ReadonlyArray<string>) => {
    const positions = ids.map((id) => html.indexOf(`id="${id}"`))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
}

describe("ProductPage", () => {
    it("keeps the NIVO OS narrative in canonical order with textual strategic diagrams", async () => {
        const { container } = render(<ProductPage page="nivoOs" />)
        await expectNoA11yViolations(container)
        const html = container.innerHTML

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        expect(
            screen.getByRole("heading", { level: 1, name: "THE AI-NATIVE BUSINESS OPERATING SYSTEM" }),
        ).toBeInTheDocument()
        expectSectionOrder(html, [
            "responsibility-center",
            "operating-model",
            "capability-model",
            "nivo-os-today",
            "trust-bridge",
            "target-architecture",
            "next-path",
        ])
        expect(html).toContain("CURRENT FOCUS · BUILDING &amp; VERIFYING")
        expect(html).toContain("Target Architecture")
        expect(html).toContain('data-product-page="nivo-os"')
        expect(screen.getByRole("list", { name: "NIVO OS operating model" })).toBeInTheDocument()
        expect(
            screen.getAllByRole("link", { name: "Explore Solutions" }).map((link) => link.getAttribute("href")),
        ).toEqual(["/en/applications", "/en/applications", "/en/applications"])
        expect(html).not.toContain('href="/activation"')
        expect(html).not.toContain("→")
    })

    it("renders semantic comparisons and ordered evidence on the Responsibility page", () => {
        const { container } = render(<ProductPage page="systemOfResponsibility" />)
        expectSectionOrder(container.innerHTML, [
            "definition",
            "core-anatomy",
            "task-vs-responsibility",
            "evidence",
            "nivo-os-current",
            "trust-bridge",
            "next-path",
        ])

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        const comparison = screen.getByRole("table", { name: "Task versus Responsibility comparison" })
        expect(within(comparison).getAllByRole("columnheader")).toHaveLength(2)
        expect(screen.getByRole("list", { name: "The evidence and verification chain" })).toBeInTheDocument()
        expect(screen.getByRole("list", { name: "Responsibility assurance loop" })).toBeInTheDocument()
        expect(screen.getByText("Permission", { selector: "h3" })).toBeInTheDocument()
        expect(container.innerHTML).toContain("nivo-unicorn-responsibility-transparent-v18.png")
    })

    it("distinguishes one current application from four directional need areas", () => {
        const { container } = render(<ProductPage page="applications" />)
        const html = container.innerHTML
        expectSectionOrder(html, [
            "need-selector",
            "current-focus",
            "by-need",
            "by-role",
            "by-context",
            "truth-evidence",
            "next-path",
        ])

        expect(screen.getAllByText("CURRENT FOCUS · BUILDING & VERIFYING").length).toBeGreaterThan(0)
        expect(screen.getAllByText("DIRECTIONAL · VERIFY")).toHaveLength(4)
        expect(screen.getByRole("navigation", { name: "Explore Solutions by need" })).toBeInTheDocument()
        expect(screen.getByRole("list", { name: "The four evidence levels of Applications" })).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { level: 1, name: "What does your business need guaranteed to happen?" }),
        ).toBeInTheDocument()
        expect(screen.getByText("Create growth")).toBeInTheDocument()
        expect(html).toContain("revenue-v2.png")
        expect(html).toContain("operate-v2.png")
        expect(html).toContain("money-v2.png")
        expect(html).toContain("create-v2.png")
        expect(html).not.toContain("→")
    })

    it("separates current offers from future growth directions and unresolved policies", () => {
        const { container } = render(<ProductPage page="pricing" />)
        expectSectionOrder(container.innerHTML, [
            "discover",
            "available-now",
            "pro-decision",
            "comparison",
            "what-you-buy",
            "usage-resources",
            "growth",
            "service-support",
            "faq",
            "start-right",
        ])

        const comparison = screen.getByRole("table", { name: "NIVO Start versus NIVO Pro comparison" })
        expect(within(comparison).getAllByRole("row")).toHaveLength(8)
        expect(screen.getByText("OPC · Expand", { selector: "h3" })).toBeInTheDocument()
        expect(screen.getByText("Team · Coordinate", { selector: "h3" })).toBeInTheDocument()
        expect(screen.getByText("Enterprise · Govern", { selector: "h3" })).toBeInTheDocument()
        expect(screen.getAllByText(/VERIFY BEFORE PUBLICATION/)).toHaveLength(2)
        expect(screen.getByText("What about VAT, refunds and proration?")).toBeInTheDocument()
    })

    it("emits page structured data in the language and on the localized path of the request", () => {
        const { container } = render(<ProductPage page="pricing" />)
        const english = JSON.parse(
            container.querySelector("script[type='application/ld+json']")?.textContent ?? "{}",
        ) as Record<string, string>
        expect(english.name).toBe("NIVO OS Pricing — Start and Pro")
        expect(english.inLanguage).toBe("en")
        expect(english.url).toBe("https://nivo.vn/en/pricing")
    })

    it("renders the Vietnamese catalog with Vietnamese links when the locale is vi", () => {
        const { container } = render(
            <NextIntlClientProvider locale="vi" messages={vi} timeZone="UTC">
                <ProductPage page="nivoOs" />
            </NextIntlClientProvider>,
        )

        expect(screen.getByRole("heading", { level: 1, name: "HỆ ĐIỀU HÀNH KINH DOANH AI-NATIVE" })).toBeInTheDocument()
        expect(
            screen
                .getAllByRole("link", { name: "Khám phá Giải pháp" })
                .every((link) => link.getAttribute("href") === "/applications"),
        ).toBe(true)
        const data = JSON.parse(
            container.querySelector("script[type='application/ld+json']")?.textContent ?? "{}",
        ) as Record<string, string>
        expect(data.inLanguage).toBe("vi")
        expect(data.url).toBe("https://nivo.vn/nivo-os")
        expect(en.product.nivoOs.hero.title).not.toBe(vi.product.nivoOs.hero.title)
    })
})
