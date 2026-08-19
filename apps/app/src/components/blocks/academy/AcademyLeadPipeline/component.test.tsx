import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademyLeadPipelineBase } from "./component"

const labels = { section: "Leads", empty: "No leads", refused: "Unavailable", open: "Open", detail: "Detail", advance: "Advance", draft: "Draft", saved: "Saved", actionFailed: "Failed" }
const lead = { id: "lead-1", name: "Reader", contact: "reader@example.test", message: "Interested", status: "new", note: null }

describe("academy lead pipeline states", () => {
    it("renders empty and refusal notes distinctly", () => {
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase state="empty" leads={[]} labels={labels} onOpenLead={vi.fn()} onAdvance={vi.fn()} onDraftReply={vi.fn()} />)).toContain("No leads")
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase state="refused" leads={[]} labels={labels} onOpenLead={vi.fn()} onAdvance={vi.fn()} onDraftReply={vi.fn()} />)).toContain("Unavailable")
    })

    it("renders selected lead content and switches action from draft to advance", () => {
        const base = { state: "answered" as const, leads: [lead], selected: lead, labels, onOpenLead: vi.fn(), onAdvance: vi.fn(), onDraftReply: vi.fn() }
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase {...base} />)).toContain("Interested")
        expect(renderToStaticMarkup(<AcademyLeadPipelineBase {...base} draft="Prepared reply" />)).toContain("Advance")
    })
})
