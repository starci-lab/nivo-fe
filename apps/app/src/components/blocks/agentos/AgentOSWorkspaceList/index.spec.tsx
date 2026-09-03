import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import viMessages from "@/messages/vi.json"
import enMessages from "@/messages/en.json"
import { TIME_ZONE, type Locale } from "@/i18n/config"

const mocks = vi.hoisted(() => ({
    locale: "vi" as Locale,
    push: vi.fn(),
    load: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
}))

vi.mock("@/i18n/navigation", async () => ({
    ...(await vi.importActual<typeof import("@/i18n/navigation")>("@/i18n/navigation")),
    useRouter: () => ({ push: mocks.push }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => ({ myAgentWorkspace: mocks.load }))

import { AgentOSWorkspaceList } from "."

const messages = { vi: viMessages, en: enMessages }
const renderList = () => render(<NextIntlClientProvider locale={mocks.locale} messages={messages[mocks.locale]} timeZone={TIME_ZONE} onError={error => { throw error }}><AgentOSWorkspaceList /></NextIntlClientProvider>)

describe("AgentOSWorkspaceList", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
        mocks.load.mockReset()
        mocks.load.mockResolvedValue({ ok: true, data: [] })
        mocks.session.state = { status: "signed-in", accessToken: "token" }
    })

    it("owns the empty read and routes creation", async () => {
        renderList()
        fireEvent.click(await screen.findByRole("button", { name: viMessages.console.agentos.create }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/create")
    })

    it("maps rows to native locale-aware links without pushing", async () => {
        mocks.locale = "en"
        mocks.load.mockResolvedValue({ ok: true, data: [{ id: "workspace/a?b#c", name: "Support", status: "ready", catalogOrder: { id: "order-1" } }] })
        renderList()
        const link = await screen.findByRole("link", { name: "Support" })
        expect(link).toHaveAttribute("href", "/en/agentos/workspaces/workspace%2Fa%3Fb%23c")
        fireEvent.click(link)
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("keeps the default locale bare in native links", async () => {
        mocks.load.mockResolvedValue({ ok: true, data: [{ id: "workspace-1", name: "Support", status: "ready" }] })
        renderList()
        expect(await screen.findByRole("link", { name: "Support" })).toHaveAttribute("href", "/agentos/workspaces/workspace-1")
    })

    it("settles refusal and waits while signed out", async () => {
        mocks.load.mockResolvedValue({ ok: false, reason: "unavailable" })
        const { unmount } = renderList()
        expect(await screen.findByText(viMessages.console.refusal.unknown)).toBeInTheDocument()
        unmount()
        mocks.session.state = { status: "signed-out", accessToken: "" }
        renderList()
        expect(mocks.load).toHaveBeenCalledTimes(1)
    })
})
