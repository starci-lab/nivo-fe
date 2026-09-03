import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { InfrastructureSummaryBase } from "./component"

describe("InfrastructureSummary", () => {
    it("keeps derived service context separate from domain facts", () => {
        const html = renderToStaticMarkup(<InfrastructureSummaryBase label="Infrastructure" context="Apps and workspaces run on managed infrastructure." domains={{ phase: "populated", facts: [
            { id: "domain-1", label: "example.com", value: "Renews 12 Sep" },
        ] }} />)
        expect(html).toContain("managed infrastructure")
        expect(html).toContain("example.com")
        expect(html).toContain("Renews 12 Sep")
    })

    it("keeps a failed domain query beside answered context", () => {
        const html = renderToStaticMarkup(<InfrastructureSummaryBase label="Infrastructure" context="Two built services" domains={{ phase: "failed", note: "Domains unavailable" }} />)
        expect(html).toContain("Two built services")
        expect(html).toContain("Domains unavailable")
    })

    it("lets maximum-length DNS labels and values shrink inside a narrow rail", () => {
        const label = "a".repeat(63)
        const value = "b".repeat(63)
        render(<InfrastructureSummaryBase label="Infrastructure" context="Managed" domains={{ phase: "populated", facts: [
            { id: "domain-stress", label, value },
        ] }} />)

        const labelColumn = screen.getByText(label).parentElement
        const valueColumn = screen.getByText(value).parentElement
        const factRow = labelColumn?.parentElement

        expect(labelColumn).toHaveClass("min-w-0", "flex-1", "break-all")
        expect(valueColumn).toHaveClass("min-w-0", "flex-1", "break-all")
        expect(factRow).toHaveClass("min-w-0", "flex-wrap")
    })
})
