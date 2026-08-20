import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AcademyLeadPipeline } from "./index"

const m = vi.hoisted(() => ({ locale: "vi", session: { state: { status: "signed-in" } }, leads: { ok: true, data: [] as unknown[] }, calls: { list: vi.fn(), update: vi.fn(), draft: vi.fn() } }))
vi.mock("next-intl", () => ({ useLocale: () => m.locale, useTranslations: () => (key: string) => key }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => m.session }))
vi.mock("@/modules/api/console", () => ({ myExpertSiteLeads: m.calls.list, updateExpertSiteLead: m.calls.update, draftLeadReply: m.calls.draft }))
type LeadView = { state: string; onOpenLead: (id: string) => void; onAdvance: () => void; onDraftReply: () => void }
vi.mock("./component", () => ({ AcademyLeadPipelineBase: (input: LeadView) => <><output data-testid="state">{input.state}</output><button onClick={() => input.onOpenLead("lead-1")}>open</button><button onClick={input.onDraftReply}>draft</button><button onClick={input.onAdvance}>advance</button></> }))

beforeEach(() => { vi.clearAllMocks(); m.leads = { ok: true, data: [{ id: "lead-1", name: "Reader", contact: "reader@example.test", message: "Interested", status: "new", note: null }] }; m.calls.list.mockResolvedValue(m.leads); m.calls.update.mockResolvedValue({ ok: true }); m.calls.draft.mockResolvedValue({ ok: true, data: { reply: "Draft reply" } }) })

describe("AcademyLeadPipeline connected owner", () => {
    it("loads leads, drafts replies, and advances status with locale", async () => { render(<AcademyLeadPipeline siteId="site-1" />); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered")); fireEvent.click(screen.getByText("open")); fireEvent.click(screen.getByText("draft")); await waitFor(() => expect(m.calls.draft).toHaveBeenCalledWith({ leadId: "lead-1", locale: "vi" })); fireEvent.click(screen.getByText("advance")); await waitFor(() => expect(m.calls.update).toHaveBeenCalledWith(expect.objectContaining({ leadId: "lead-1", status: "contacted" }))) })
    it("handles refusal and converted/failure actions", async () => { m.calls.list.mockResolvedValue({ ok: false, data: undefined }); render(<AcademyLeadPipeline siteId="site-1" />); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("refused")); cleanup(); m.calls.update.mockResolvedValue({ ok: false }); m.leads = { ok: true, data: [{ id: "lead-1", name: "Reader", contact: "x", message: null, status: "converted", note: null }] }; m.calls.list.mockResolvedValue(m.leads); render(<AcademyLeadPipeline siteId="site-1" />); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered")); fireEvent.click(screen.getByText("open")); fireEvent.click(screen.getByText("advance")); await waitFor(() => expect(m.calls.update).toHaveBeenCalledWith(expect.objectContaining({ status: "converted" }))) })
    it("reports draft generation failure after selecting a lead", async () => { m.calls.draft.mockResolvedValue({ ok: false }); render(<AcademyLeadPipeline siteId="site-1" />); await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered")); fireEvent.click(screen.getByText("open")); fireEvent.click(screen.getByText("draft")); await waitFor(() => expect(m.calls.draft).toHaveBeenCalled()) })
})
