import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    locale: "vi",
    push: vi.fn(),
    load: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale, useTranslations: () => (key: string) => key }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => ({ myAgentWorkspace: mocks.load }))

import { AgentOSWorkspaceList } from "."

describe("AgentOSWorkspaceList", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
        mocks.load.mockReset()
        mocks.load.mockResolvedValue({ ok: true, data: [] })
        mocks.session.state = { status: "signed-in", accessToken: "token" }
    })

    it("owns the empty read and routes creation", async () => {
        render(<AgentOSWorkspaceList />)
        fireEvent.click(await screen.findByRole("button", { name: "agentos.create" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/create")
    })

    it("maps rows and preserves locale when opening a workspace", async () => {
        mocks.locale = "en"
        mocks.load.mockResolvedValue({ ok: true, data: [{ id: "workspace-1", name: "Support", status: "ready", catalogOrder: { id: "order-1" } }] })
        render(<AgentOSWorkspaceList />)
        fireEvent.click(await screen.findByRole("link", { name: "Support" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/agentos/workspaces/workspace-1")
    })

    it("settles refusal and waits while signed out", async () => {
        mocks.load.mockResolvedValue({ ok: false, reason: "unavailable" })
        const { unmount } = render(<AgentOSWorkspaceList />)
        await waitFor(() => expect(screen.getByText("refusal.unknown")).toBeInTheDocument())
        unmount()
        mocks.session.state = { status: "signed-out", accessToken: "" }
        render(<AgentOSWorkspaceList />)
        expect(mocks.load).toHaveBeenCalledTimes(1)
    })
})
