import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AgentOSSummaryBase } from "./component"

const mocks = vi.hoisted(() => ({
    data: { workspaces: null, pod: null } as { workspaces: unknown, pod: unknown },
    locale: "vi",
    push: vi.fn(),
}))
vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({ dateTime: (value: Date) => value.toISOString().slice(11, 16) }),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { AgentOSSummary } from "."

describe("AgentOSSummary", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
        mocks.data.workspaces = null
        mocks.data.pod = null
    })

    it("draws the workspace and its one safe service action", () => {
        const html = renderToStaticMarkup(<AgentOSSummaryBase label="AgentOS" state={{ phase: "populated", workspace: {
            id: "workspace-1", name: "Support", description: "OpenClaw workspace", statusLabel: "Available", statusTone: "success", actionLabel: "Open service", actionHref: "/agentos/workspace-1",
        } }} onOpenService={vi.fn()} />)
        expect(html).toContain("Support")
        expect(html).toContain("Available")
        expect(html).toContain("Open service")
    })

    it("draws a settled missing workspace", () => {
        const html = renderToStaticMarkup(<AgentOSSummaryBase label="AgentOS" state={{ phase: "empty", message: "No workspace" }} onOpenService={vi.fn()} />)
        expect(html).toContain("No workspace")
    })

    it("joins workspace and reachable pod evidence into one service action", () => {
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "nivo AI Agent", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: "...abcd", checkedAt: "2026-08-23T10:20:00.000Z" } }
        render(<AgentOSSummary />)
        expect(screen.getByText("nivo AI Agent")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "agentos.openService" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1")
    })

    it("keeps a pod refusal partial and localises the route", () => {
        mocks.locale = "en"
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-2", name: null, status: "mystery", catalogOrder: null }] }
        mocks.data.pod = { ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" }
        render(<AgentOSSummary />)
        expect(screen.getByText("refusal.POD_REGISTRATION_MISSING_EXCEPTION")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "agentos.openService" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-2")
    })

    it("settles missing and refused workspace answers", () => {
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.pod = { ok: true, data: { reachable: false, httpStatus: null, tokenConfigured: false, tokenHint: null, checkedAt: "2026-08-23T10:20:00.000Z" } }
        const { rerender } = render(<AgentOSSummary />)
        expect(screen.getByText("agentos.emptyDescription")).toBeInTheDocument()
        mocks.data.workspaces = { ok: false, code: "UNKNOWN" }
        rerender(<AgentOSSummary />)
        expect(screen.getByText("refusal.unknown")).toBeInTheDocument()
    })
})
