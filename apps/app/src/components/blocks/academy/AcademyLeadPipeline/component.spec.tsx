import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyLeadPipelineBase } from "./component"

const labels = { section: "Leads", empty: "No leads", refused: "Unavailable", open: "Open", detail: "Detail", advance: "Advance", draft: "Draft", saved: "Saved", actionFailed: "Failed" }
const lead = { id: "lead-1", name: "Reader", contact: "reader@example.test", message: "Interested", status: "new", note: null }

describe("AcademyLeadPipelineBase", () => {
    it("renders empty and refusal notes distinctly", () => {
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase state="empty" props={{ leads: [], labels }} on={{ openLead: vi.fn(), advance: vi.fn(), draftReply: vi.fn() }} />)).toContain("No leads")
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase state="refused" props={{ leads: [], labels }} on={{ openLead: vi.fn(), advance: vi.fn(), draftReply: vi.fn() }} />)).toContain("Unavailable")
    })

    it("renders selected lead content and switches action from draft to advance", () => {
        const base = { state: "answered" as const, props: { leads: [lead], selected: lead, labels }, on: { openLead: vi.fn(), advance: vi.fn(), draftReply: vi.fn() } }
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase {...base} />)).toContain("Interested")
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase {...base} props={{ ...base.props, draft: "Prepared reply" }} />)).toContain("Advance")
    })
})

describe("AcademyLeadPipelineBase", () => {
    it("fires integration, lead, student, and solution actions", () => {
        const openLead = vi.fn()
        const advance = vi.fn()
        const draftReply = vi.fn()
        const lead = { id: "lead-1", name: "Reader", contact: "reader@example.test", message: "Interested", status: "new", note: null }
        const on = { openLead, advance, draftReply }
        render(<AcademyLeadPipelineBase state="answered" props={{ leads: [lead], selected: lead, labels }} on={on} />)
        fireEvent.click(screen.getAllByRole("button", { name: "Open" }).at(-1)!)
        fireEvent.click(screen.getByRole("button", { name: "Draft" }))
        render(<AcademyLeadPipelineBase state="answered" props={{ leads: [lead], selected: lead, draft: "Prepared", labels }} on={on} />)
        fireEvent.click(screen.getByRole("button", { name: "Advance" }))
        expect(openLead).toHaveBeenCalled()
        expect(draftReply).toHaveBeenCalled()
        expect(advance).toHaveBeenCalled()
        cleanup()
        renderToStaticMarkup(<AcademyLeadPipelineBase state="resting" props={{ leads: [], labels }} on={on} />)
        renderToStaticMarkup(<AcademyLeadPipelineBase state="answered" props={{ leads: [{ ...lead, status: "converted" }], selected: lead, message: "Saved", pendingAction: "advance", labels }} on={on} />)
    })
})