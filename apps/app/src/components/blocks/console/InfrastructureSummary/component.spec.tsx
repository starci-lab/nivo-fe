import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InfrastructureSummaryBase, type InfrastructureDomainsState } from "./component"

const facts = [{ id: "domain-1", label: "example.com", value: "Renews 12 Sep" }]

describe("InfrastructureSummaryBase", () => {
    it("keeps derived service context separate from domain facts", () => {
        render(<InfrastructureSummaryBase
            label="Infrastructure"
            context="Apps and workspaces run on managed infrastructure."
            domains={{ phase: "populated", facts }}
        />)

        expect(screen.getByText("Apps and workspaces run on managed infrastructure.")).toBeInTheDocument()
        expect(screen.getByText("example.com")).toBeInTheDocument()
        expect(screen.getByText("Renews 12 Sep")).toBeInTheDocument()
    })

    it("keeps a failed domain query beside answered context", () => {
        render(<InfrastructureSummaryBase label="Infrastructure" context="Two built services" domains={{ phase: "failed", note: "Domains unavailable" }} />)

        expect(screen.getByText("Two built services")).toBeInTheDocument()
        expect(screen.getByText("Domains unavailable")).toBeInTheDocument()
    })

    it("shows the note beside the facts a partial answer did return", () => {
        render(<InfrastructureSummaryBase label="Infrastructure" context="One built service" domains={{ phase: "partial", facts, note: "Some domains unavailable" }} />)

        expect(screen.getByText("example.com")).toBeInTheDocument()
        expect(screen.getByText("One built service")).toBeInTheDocument()
        expect(screen.getByText("Some domains unavailable")).toBeInTheDocument()
    })

    it("carries a refused and a partially refused read on the card's own published state, not the note alone", () => {
        const failed = render(<InfrastructureSummaryBase label="Infrastructure" context="Two built services" domains={{ phase: "failed", note: "Domains unavailable" }} />)
        expect(failed.container.querySelector('[data-grammar-state="unavailable"]')).not.toBeNull()
        failed.unmount()

        const partial = render(<InfrastructureSummaryBase label="Infrastructure" context="One built service" domains={{ phase: "partial", facts, note: "Some domains unavailable" }} />)
        expect(partial.container.querySelector('[data-grammar-state="cautionary"]')).not.toBeNull()
        partial.unmount()
    })

    it("carries an empty domain read on its own EmptyNotice, not the refusal note", () => {
        render(<InfrastructureSummaryBase label="Infrastructure" context="Two built services" domains={{ phase: "empty", note: "No domains" }} />)

        expect(screen.getByText("Two built services")).toBeInTheDocument()
        expect(screen.getByText("No domains")).toBeInTheDocument()
    })

    it("renders maximum-length DNS labels and values in full", () => {
        const label = "a".repeat(63)
        const value = "b".repeat(63)
        render(<InfrastructureSummaryBase label="Infrastructure" context="Managed" domains={{ phase: "populated", facts: [{ id: "domain-stress", label, value }] }} />)

        expect(screen.getByText(label)).toBeInTheDocument()
        expect(screen.getByText(value)).toBeInTheDocument()
    })

    it("renders every settled state without inventing a domain", () => {
        const states: ReadonlyArray<InfrastructureDomainsState> = [
            { phase: "pending" },
            { phase: "empty", note: "No domains" },
            { phase: "populated", facts },
            { phase: "failed", note: "Domains unavailable" },
            { phase: "partial", facts, note: "Some domains unavailable" },
        ]

        for (const state of states) {
            const view = render(<InfrastructureSummaryBase label="Infrastructure" context="Managed" domains={state} />)
            expect(screen.getAllByText("Infrastructure").length).toBeGreaterThan(0)
            view.unmount()
        }
    })
})
