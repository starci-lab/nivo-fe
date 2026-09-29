import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { workspaces: null, pod: null } as Record<string, unknown>,
}))
vi.mock("@/hooks", () => ({ useOverviewData: () => mocks.data }))

import { OverviewRuntime } from "."

describe("OverviewRuntime", () => {
    it("draws the pod's own five fields once the workspace and the pod have settled", () => {
        mocks.data.workspaces = {
            ok: true,
            data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }],
        }
        mocks.data.pod = {
            ok: true,
            data: {
                reachable: true,
                httpStatus: 200,
                tokenConfigured: true,
                tokenHint: "4f21",
                checkedAt: "2026-09-03T22:31:00.000Z",
            },
        }
        render(<OverviewRuntime />)

        expect(screen.getByText("Yes")).toBeInTheDocument()
        expect(screen.getByText("200")).toBeInTheDocument()
        expect(screen.getByText("Configured · 4f21")).toBeInTheDocument()
    })

    it("names which part could not be read when the pod refuses", () => {
        mocks.data.workspaces = {
            ok: true,
            data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }],
        }
        mocks.data.pod = { ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" }
        const { container } = render(<OverviewRuntime />)

        expect(
            screen.getByText("This workspace has no pod registered yet. Everything above is still correct."),
        ).toBeInTheDocument()
        expect(screen.getByText("Pod unavailable")).toBeInTheDocument()
        expect(screen.queryByText("Pod answered")).not.toBeInTheDocument()
        expect(container.querySelector('[data-grammar-state="unavailable"]')).toBeInTheDocument()
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

    it("names the pod as unreachable and its status as unread once httpStatus never arrived", () => {
        mocks.data.workspaces = {
            ok: true,
            data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }],
        }
        mocks.data.pod = {
            ok: true,
            data: {
                reachable: false,
                httpStatus: null,
                tokenConfigured: true,
                tokenHint: "4f21",
                checkedAt: "2026-09-03T22:31:00.000Z",
            },
        }
        render(<OverviewRuntime />)

        expect(screen.getByText("No")).toBeInTheDocument()
        expect(screen.getByText("—")).toBeInTheDocument()
    })

    it("names the token as not configured when the pod itself carries none", () => {
        mocks.data.workspaces = {
            ok: true,
            data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }],
        }
        mocks.data.pod = {
            ok: true,
            data: {
                reachable: true,
                httpStatus: 200,
                tokenConfigured: false,
                tokenHint: null,
                checkedAt: "2026-09-03T22:31:00.000Z",
            },
        }
        render(<OverviewRuntime />)

        expect(screen.getByText("Not configured")).toBeInTheDocument()
    })

    it("names the token as configured with no hint when the pod carries a configured token but no hint", () => {
        mocks.data.workspaces = {
            ok: true,
            data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }],
        }
        mocks.data.pod = {
            ok: true,
            data: {
                reachable: true,
                httpStatus: 200,
                tokenConfigured: true,
                tokenHint: null,
                checkedAt: "2026-09-03T22:31:00.000Z",
            },
        }
        render(<OverviewRuntime />)

        expect(screen.getByText("Configured")).toBeInTheDocument()
    })

    it("names the refusal as unknown once the pod's own code carries no named refusal", () => {
        mocks.data.workspaces = {
            ok: true,
            data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: null }],
        }
        mocks.data.pod = { ok: false, code: "SOME_UNNAMED_EXCEPTION" }
        render(<OverviewRuntime />)

        expect(
            screen.getByText("This part could not be read. The rest of the screen is still correct."),
        ).toBeInTheDocument()
    })
})
