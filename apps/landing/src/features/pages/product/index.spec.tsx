import { render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ProductPage } from "."

const expectSectionOrder = (html: string, ids: ReadonlyArray<string>) => {
    const positions = ids.map((id) => html.indexOf(`id="${id}"`))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((left, right) => left - right))
}

describe("ProductPage", () => {
    it("keeps the NIVO OS narrative in canonical order with textual strategic diagrams", () => {
        const html = renderToStaticMarkup(<ProductPage page="nivo-os" />)

        expect(html.match(/<h1/g)).toHaveLength(1)
        expectSectionOrder(html, ["responsibility-center", "operating-model", "capability-model", "nivo-os-today", "trust-bridge", "target-architecture", "next-path"])
        expect(html).toContain("CURRENT FOCUS · BUILDING &amp; VERIFYING")
        expect(html).toContain("Target Architecture")
        expect(html).toContain("data-product-page=\"nivo-os\"")
        expect(html).toContain("NIVO OS operating model")
        expect(html).not.toContain("href=\"/activation\"")
        expect(html).not.toContain("→")
    })

    it("renders semantic comparisons and ordered evidence on the Responsibility page", () => {
        const html = renderToStaticMarkup(<ProductPage page="system-of-responsibility" />)
        expectSectionOrder(html, ["definition", "core-anatomy", "task-vs-responsibility", "evidence", "nivo-os-current", "trust-bridge", "next-path"])

        render(<ProductPage page="system-of-responsibility" />)

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        const comparison = screen.getByRole("table", { name: "So sánh Task và Responsibility" })
        expect(within(comparison).getAllByRole("columnheader")).toHaveLength(2)
        expect(screen.getByRole("list", { name: "Chuỗi evidence và verification" })).toBeInTheDocument()
        expect(screen.getByRole("list", { name: "Responsibility assurance loop" })).toBeInTheDocument()
        expect(screen.getByText("Permission", { selector: "h3" })).toBeInTheDocument()
        expect(html).toContain("nivo-unicorn-responsibility-transparent-v18.png")
    })

    it("distinguishes one current application from four directional need areas", () => {
        const html = renderToStaticMarkup(<ProductPage page="applications" />)
        expectSectionOrder(html, ["need-selector", "current-focus", "by-need", "by-role", "by-context", "truth-evidence", "next-path"])

        render(<ProductPage page="applications" />)

        expect(screen.getAllByText("CURRENT FOCUS · BUILDING & VERIFYING").length).toBeGreaterThan(0)
        expect(screen.getAllByText("DIRECTIONAL · VERIFY")).toHaveLength(4)
        expect(screen.getByRole("navigation", { name: "Khám phá Giải pháp theo nhu cầu" })).toBeInTheDocument()
        expect(screen.getByRole("list", { name: "Bốn cấp evidence của Applications" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 1, name: "Doanh nghiệp đang cần điều gì được đảm bảo xảy ra?" })).toBeInTheDocument()
        expect(html).toContain("revenue-v2.png")
        expect(html).toContain("operate-v2.png")
        expect(html).toContain("money-v2.png")
        expect(html).toContain("create-v2.png")
        expect(html).not.toContain("→")
    })

    it("separates current offers from future growth directions and unresolved policies", () => {
        const html = renderToStaticMarkup(<ProductPage page="pricing" />)
        expectSectionOrder(html, ["discover", "available-now", "pro-decision", "comparison", "what-you-buy", "usage-resources", "growth", "service-support", "faq", "start-right"])

        render(<ProductPage page="pricing" />)

        const comparison = screen.getByRole("table", { name: "So sánh NIVO Start và NIVO Pro" })
        expect(within(comparison).getAllByRole("row")).toHaveLength(8)
        expect(screen.getByText("OPC · Expand", { selector: "h3" })).toBeInTheDocument()
        expect(screen.getByText("Team · Coordinate", { selector: "h3" })).toBeInTheDocument()
        expect(screen.getByText("Enterprise · Govern", { selector: "h3" })).toBeInTheDocument()
        expect(screen.getAllByText(/VERIFY BEFORE PUBLICATION/)).toHaveLength(2)
        expect(screen.getByText("VAT, refund và proration thế nào?")).toBeInTheDocument()
    })
})
