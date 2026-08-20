import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { InfrastructureSummary } from "./index"

describe("InfrastructureSummary", () => {
    it("keeps derived service context separate from domain facts", () => {
        const html = renderToStaticMarkup(<InfrastructureSummary label="Infrastructure" context="Apps and workspaces run on managed infrastructure." domains={{ phase: "populated", facts: [
            { id: "domain-1", label: "example.com", value: "Renews 12 Sep" },
        ] }} />)
        expect(html).toContain("managed infrastructure")
        expect(html).toContain("example.com")
        expect(html).toContain("Renews 12 Sep")
    })

    it("keeps a failed domain query beside answered context", () => {
        const html = renderToStaticMarkup(<InfrastructureSummary label="Infrastructure" context="Two built services" domains={{ phase: "failed", note: "Domains unavailable" }} />)
        expect(html).toContain("Two built services")
        expect(html).toContain("Domains unavailable")
    })
})
