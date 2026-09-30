import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import enMessages from "@/messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"
import { expectNoA11yViolations } from "@/testing/axe"

const mocks = vi.hoisted(() => ({
    issue: vi.fn(),
    revoke: vi.fn(),
    safeRedirect: vi.fn(),
    followRedirect: vi.fn(),
    push: vi.fn(),
    postMessage: vi.fn(),
    close: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
}))

vi.mock("@/hooks", async () => ({
    ...((await vi.importActual("@/hooks")) as Record<string, unknown>),
    useRouter: () => ({ push: mocks.push }),
    useSession: () => mocks.session,
}))
vi.mock("@/modules/api/agentos-workspaces", () => ({
    issueAgentWorkspaceAppLaunch: mocks.issue,
    revokeAgentWorkspaceAppLaunch: mocks.revoke,
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/window/workspace-app-launch", () => ({
    followWorkspaceAppRedirect: mocks.followRedirect,
    safeWorkspaceAppRedirect: mocks.safeRedirect,
    workspaceAppLaunchChannelName: (workspaceId: string) => `launch:${workspaceId}`,
}))

import { AgentOSOpenClawLaunch } from "./"

const launchCopy = enMessages.console.agentos.workspace.launch
const renderLaunch = () =>
    render(
        <NextIntlClientProvider
            locale="en"
            messages={enMessages}
            timeZone={TIME_ZONE}
            onError={(error) => {
                throw error
            }}
        >
            <AgentOSOpenClawLaunch workspaceId="workspace-1" />
        </NextIntlClientProvider>,
    )

describe("AgentOSOpenClawLaunch", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.safeRedirect.mockReturnValue("https://openclaw.test/launch")
        mocks.issue.mockResolvedValue({
            ok: true,
            data: {
                launchId: "launch-1",
                redirectUrl: "https://openclaw.test/launch",
                expiresAt: "2026-08-22T10:00:00.000Z",
            },
        })
        vi.stubGlobal(
            "BroadcastChannel",
            vi.fn(() => ({ postMessage: mocks.postMessage, close: mocks.close })),
        )
        vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
            callback(0)
            return 1
        })
    })

    it("advances only the launch block from issuing to connected", async () => {
        const { container } = renderLaunch()
        expect(screen.getByText(launchCopy.states.issuing.label)).toBeInTheDocument()
        await waitFor(() => expect(screen.getByText(launchCopy.states.connected.label)).toBeInTheDocument())
        expect(mocks.followRedirect).toHaveBeenCalledWith("https://openclaw.test/launch")
        await expectNoA11yViolations(container)
    })

    it("settles the launch block as blocked when issuance is refused", async () => {
        mocks.issue.mockResolvedValue({ ok: false, code: "LAUNCH_BLOCKED" })
        renderLaunch()
        await waitFor(() => expect(screen.getByText(launchCopy.states.blocked.label)).toBeInTheDocument())
        expect(mocks.postMessage).toHaveBeenCalledWith({ status: "failed", workspaceId: "workspace-1" })
    })

    it("blocks an anonymous launch without issuing a credential", async () => {
        mocks.session.state = { status: "anonymous", accessToken: "" }
        renderLaunch()

        await waitFor(() => expect(screen.getByText(launchCopy.states.blocked.label)).toBeInTheDocument())
        expect(mocks.issue).not.toHaveBeenCalled()
    })

    it("revokes an issued launch when its redirect is outside the safe app boundary", async () => {
        mocks.safeRedirect.mockReturnValue(null)
        renderLaunch()

        await waitFor(() => expect(screen.getByText(launchCopy.states.blocked.label)).toBeInTheDocument())
        expect(mocks.revoke).toHaveBeenCalledWith("launch-1")
        expect(mocks.postMessage).toHaveBeenCalledWith({ status: "failed", workspaceId: "workspace-1" })
        expect(mocks.followRedirect).not.toHaveBeenCalled()
    })

    it("retries a refused launch from a fresh issuing state", async () => {
        mocks.issue.mockResolvedValueOnce({ ok: false, code: "LAUNCH_BLOCKED" }).mockResolvedValueOnce({
            ok: true,
            data: {
                launchId: "launch-2",
                redirectUrl: "https://openclaw.test/launch",
                expiresAt: "2026-08-22T10:00:00.000Z",
            },
        })
        renderLaunch()
        await waitFor(() => expect(screen.getByText(launchCopy.states.blocked.label)).toBeInTheDocument())

        fireEvent.click(screen.getByRole("button", { name: launchCopy.retry }))

        await waitFor(() => expect(screen.getByText(launchCopy.states.connected.label)).toBeInTheDocument())
        expect(mocks.issue).toHaveBeenCalledTimes(2)
    })

    it("returns to the exact workspace without treating navigation as launch state", async () => {
        renderLaunch()
        await waitFor(() => expect(screen.getByText(launchCopy.states.connected.label)).toBeInTheDocument())
        fireEvent.click(screen.getByRole("button", { name: launchCopy.returnToWorkspace }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1")
    })
})
