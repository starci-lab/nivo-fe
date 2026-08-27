import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    session: { state: { status: "signed-in", accessToken: "test-token" } },
    api: {
        myExpertSites: vi.fn(),
        myAgentWorkspace: vi.fn(),
        myPodOpenclawStatus: vi.fn(),
        myDomains: vi.fn(),
        myWallet: vi.fn(),
        myInvoices: vi.fn(),
    },
}))

vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)

import { OverviewDataProvider, useOverviewData } from "./context"

const Probe = () => <output>{JSON.stringify(useOverviewData())}</output>

describe("OverviewDataProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "test-token" }
        mocks.api.myExpertSites.mockResolvedValue({ ok: true, data: [{ id: "app" }] })
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [{ id: "workspace" }] })
        mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: true, data: { reachable: false } })
        mocks.api.myDomains.mockResolvedValue({ ok: true, data: [{ id: "domain" }] })
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 2450000 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{ id: "invoice" }] })
    })

    it("asks all six operations once and keeps their answers in one shared owner", async () => {
        render(<OverviewDataProvider content={Probe} contentProps={{}} />)

        expect(await screen.findByText(/2450000/)).toBeInTheDocument()
        for (const request of Object.values(mocks.api)) expect(request).toHaveBeenCalledTimes(1)
        expect(screen.getByText(/workspace/)).toBeInTheDocument()
        expect(screen.getByText(/invoice/)).toBeInTheDocument()
    })

    it("does not ask protected operations before the session is signed in", () => {
        mocks.session.state = { status: "restoring", accessToken: "" }
        render(<OverviewDataProvider content={Probe} contentProps={{}} />)

        for (const request of Object.values(mocks.api)) expect(request).not.toHaveBeenCalled()
        expect(screen.getByText(/"apps":null/)).toBeInTheDocument()
    })
})
