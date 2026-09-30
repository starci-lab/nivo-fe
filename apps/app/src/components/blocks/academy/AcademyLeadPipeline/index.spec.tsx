import { NextIntlClientProvider } from "next-intl"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import viMessages from "@/messages/vi.json"
import type * as AcademyLeadPipelineComponent from "./component"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademyLeadPipeline as AcademyLeadPipelineBlock } from "./index"

type LeadPipelineHostProps = { readonly siteId: string }
const AcademyLeadPipeline = (props: LeadPipelineHostProps) => (
    <NextIntlClientProvider locale="vi" messages={viMessages}>
        <AcademyLeadPipelineBlock {...props} />
    </NextIntlClientProvider>
)

const m = vi.hoisted(() => ({
    session: { state: { status: "signed-in", accessToken: "test-token" } },
    leads: { ok: true, data: [] as Array<unknown> },
    calls: { list: vi.fn(), update: vi.fn(), draft: vi.fn() },
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => m.session }))
vi.mock("@/modules/api/academy", () => ({
    myExpertSiteLeads: m.calls.list,
    updateExpertSiteLead: m.calls.update,
    draftLeadReply: m.calls.draft,
}))
type LeadView = { state: string; on: { openLead: (id: string) => void; advance: () => void; draftReply: () => void } }
vi.mock("./component", () => ({
    AcademyLeadPipelineBase: (input: LeadView) => (
        <>
            <output data-testid="state">{input.state}</output>
            <button onClick={() => input.on.openLead("lead-1")}>open</button>
            <button onClick={input.on.draftReply}>draft</button>
            <button onClick={input.on.advance}>advance</button>
        </>
    ),
}))

let viewerSequence = 0
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
beforeEach(() => {
    vi.clearAllMocks()
    viewerSequence += 1
    m.session.state.accessToken = `lead-pipeline-${viewerSequence}`
    m.leads = {
        ok: true,
        data: [
            {
                id: "lead-1",
                name: "Reader",
                contact: "reader@example.test",
                message: "Interested",
                status: "new",
                note: null,
            },
        ],
    }
    m.calls.list.mockResolvedValue(m.leads)
    m.calls.update.mockResolvedValue({ ok: true })
    m.calls.draft.mockResolvedValue({ ok: true, data: { reply: "Draft reply" } })
})

describe("AcademyLeadPipeline", () => {
    it("checks accessibility on the real lead pipeline", async () => {
        const { AcademyLeadPipelineBase } = await vi.importActual<typeof AcademyLeadPipelineComponent>("./component")
        const { container } = render(
            <AcademyLeadPipelineBase
                state="empty"
                props={{
                    leads: [],
                    labels: {
                        section: "Leads",
                        empty: "No leads yet",
                        open: "Open",
                        detail: "Lead details",
                        advance: "Advance",
                        draft: "Draft reply",
                        saved: "Saved",
                        actionFailed: "Action failed",
                    },
                }}
                on={{ openLead: vi.fn(), advance: vi.fn(), draftReply: vi.fn(), retryNotice: vi.fn() }}
            />,
        )
        await expectNoA11yViolations(container)
    })

    it("loads leads, drafts replies, and advances status with locale", async () => {
        render(<AcademyLeadPipeline siteId="site-1" />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered"))
        fireEvent.click(screen.getByText("open"))
        fireEvent.click(screen.getByText("draft"))
        await waitFor(() => expect(m.calls.draft).toHaveBeenCalledWith({ leadId: "lead-1", locale: "vi" }))
        fireEvent.click(screen.getByText("advance"))
        await waitFor(() =>
            expect(m.calls.update).toHaveBeenCalledWith(
                expect.objectContaining({ leadId: "lead-1", status: "contacted" }),
            ),
        )
    })
    it("handles read failure and converted/failure actions", async () => {
        m.calls.list.mockResolvedValue({ ok: false, kind: "unavailable", code: "UNAVAILABLE", reason: "down" })
        render(<AcademyLeadPipeline siteId="site-1" />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("failed"))
        cleanup()
        resetQueryCache()
        m.calls.update.mockResolvedValue({ ok: false })
        m.leads = {
            ok: true,
            data: [{ id: "lead-1", name: "Reader", contact: "x", message: null, status: "converted", note: null }],
        }
        m.calls.list.mockResolvedValue(m.leads)
        render(<AcademyLeadPipeline siteId="site-1" />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered"))
        fireEvent.click(screen.getByText("open"))
        fireEvent.click(screen.getByText("advance"))
        await waitFor(() =>
            expect(m.calls.update).toHaveBeenCalledWith(expect.objectContaining({ status: "converted" })),
        )
    })
    it("reports draft generation failure after selecting a lead", async () => {
        m.calls.draft.mockResolvedValue({ ok: false })
        render(<AcademyLeadPipeline siteId="site-1" />)
        await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("answered"))
        fireEvent.click(screen.getByText("open"))
        fireEvent.click(screen.getByText("draft"))
        await waitFor(() => expect(m.calls.draft).toHaveBeenCalled())
    })
})
