import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { workspaces: null, pod: null } as Record<string, unknown>,
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    useFormatter: () => ({ dateTime: (value: Date) => `time-${value.toISOString()}` }),
}))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { OverviewRuntime } from "."

describe("OverviewRuntime", () => {
    it("draws the pod's own five fields once the workspace and the pod have settled", () => {
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: "4f21", checkedAt: "2026-09-03T22:31:00.000Z" } }
        render(<OverviewRuntime />)

        expect(screen.getByText("overview.runtime.yes")).toBeInTheDocument()
        expect(screen.getByText("200")).toBeInTheDocument()
        expect(screen.getByText("overview.runtime.tokenConfigured:{\"hint\":\"4f21\"}")).toBeInTheDocument()
    })

    it("names which part could not be read when the pod refuses", () => {
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" }
        render(<OverviewRuntime />)

        expect(screen.getByText("refusal.POD_REGISTRATION_MISSING_EXCEPTION")).toBeInTheDocument()
    })

    it("renders no wrapper when there is no workspace to read a pod for", () => {
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.pod = { ok: false, code: "AGENT_WORKSPACE_NOT_FOUND_EXCEPTION" }
        const { container } = render(<OverviewRuntime />)

        expect(container).toBeEmptyDOMElement()
    })

    it("keeps the surface loading until both slices settle", () => {
        mocks.data.workspaces = null
        mocks.data.pod = null
        const { container } = render(<OverviewRuntime />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })
})
