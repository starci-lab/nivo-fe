import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

    it("follows the workspace's own address once the pod can receive a visitor", () => {
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "nivo AI Agent", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: "...abcd", checkedAt: "2026-08-23T10:20:00.000Z" } }
        render(<AgentOSSummary />)
        expect(screen.getByText("nivo AI Agent")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "agentos.openService" })).toHaveAttribute("href", "/vi/launch/agentos/workspace-1/openclaw")
    })

    it("keeps a pod refusal partial and localises the route", () => {
        mocks.locale = "en"
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-2", name: null, status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" }
        render(<AgentOSSummary />)
        expect(screen.getByText("refusal.POD_REGISTRATION_MISSING_EXCEPTION")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "agentos.openService" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-2")
    })

    it("disables the service control while the workspace is not yet running", () => {
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-3", name: null, status: "mystery", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: null, checkedAt: "2026-08-23T10:20:00.000Z" } }
        render(<AgentOSSummary />)

        expect(screen.getByText("status.unknown")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: "agentos.openService" })).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "agentos.openService" }))
        expect(mocks.push).not.toHaveBeenCalled()
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