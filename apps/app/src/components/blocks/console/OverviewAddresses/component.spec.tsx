import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { OverviewAddressesBase } from "./component"

describe("OverviewAddressesBase", () => {
    it("draws one row per held domain", () => {
        render(<OverviewAddressesBase state={{ phase: "populated", facts: [{ id: "domain-1", label: "api.nivo.vn", value: "Held · Auto-renews" }] }} props={{ label: "Addresses" }} />)

        expect(screen.getByText("api.nivo.vn")).toBeInTheDocument()
        expect(screen.getByText("Held · Auto-renews")).toBeInTheDocument()
    })

    it("states its own absence rather than disappearing", () => {
        render(<OverviewAddressesBase state={{ phase: "empty", message: "No domains yet." }} props={{ label: "Addresses" }} />)

        expect(screen.getByText("No domains yet.")).toBeInTheDocument()
    })

    it("names which part could not be read when the domain read is refused", () => {
        render(<OverviewAddressesBase state={{ phase: "failed", message: "This part could not be read." }} props={{ label: "Addresses" }} />)

        expect(screen.getByText("This part could not be read.")).toBeInTheDocument()
    })

    it("shows the unresolved carrier as the same tree at rest", () => {
        const { container } = render(<OverviewAddressesBase state={{ phase: "pending" }} props={{ label: "Addresses" }} />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })
})
