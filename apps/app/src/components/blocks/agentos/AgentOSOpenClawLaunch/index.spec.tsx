import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    useLocale: () => "en",
    useFormatter: () => ({ dateTime: (value: Date) => value.toISOString() }),
}))
vi.mock("@/modules/api/console", () => ({ issueAgentWorkspaceAppLaunch: mocks.issue, revokeAgentWorkspaceAppLaunch: mocks.revoke }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/window/workspace-app-launch", () => ({
    followWorkspaceAppRedirect: mocks.followRedirect,
    safeWorkspaceAppRedirect: mocks.safeRedirect,
    workspaceAppLaunchChannelName: (workspaceId: string) => `launch:${workspaceId}`,
}))

type LaunchBridgeViewInput = { launchState: string; onRetry: () => void; onReturn: () => void }

vi.mock("./component", () => ({
    AgentOSOpenClawLaunchBase: (input: LaunchBridgeViewInput) => (
        <><output data-testid="launch-state">{input.launchState}</output><button onClick={input.onRetry}>retry</button><button onClick={input.onReturn}>return</button></>
    ),
}))

import { AgentOSOpenClawLaunch } from "./"

describe("AgentOSOpenClawLaunch connected orchestration", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.safeRedirect.mockReturnValue("https://openclaw.test/launch")
        mocks.issue.mockResolvedValue({
            ok: true,
            data: { launchId: "launch-1", redirectUrl: "https://openclaw.test/launch", expiresAt: "2026-08-22T10:00:00.000Z" },
        })
        vi.stubGlobal("BroadcastChannel", vi.fn(() => ({ postMessage: mocks.postMessage, close: mocks.close })))
        vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1 })
    })

    it("advances only the launch block from issuing to connected", async () => {
        render(<AgentOSOpenClawLaunch workspaceId="workspace-1" />)
        expect(screen.getByTestId("launch-state")).toHaveTextContent("issuing")
        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("connected"))
        expect(mocks.followRedirect).toHaveBeenCalledWith("https://openclaw.test/launch")
    })

    it("settles the launch block as blocked when issuance is refused", async () => {
        mocks.issue.mockResolvedValue({ ok: false, code: "LAUNCH_BLOCKED" })
        render(<AgentOSOpenClawLaunch workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("blocked"))
        expect(mocks.postMessage).toHaveBeenCalledWith({ status: "failed", workspaceId: "workspace-1" })
    })

    it("blocks an anonymous launch without issuing a credential", async () => {
        mocks.session.state = { status: "anonymous", accessToken: "" }
        render(<AgentOSOpenClawLaunch workspaceId="workspace-1" />)

        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("blocked"))
        expect(mocks.issue).not.toHaveBeenCalled()
    })

    it("revokes an issued launch when its redirect is outside the safe app boundary", async () => {
        mocks.safeRedirect.mockReturnValue(null)
        render(<AgentOSOpenClawLaunch workspaceId="workspace-1" />)

        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("blocked"))
        expect(mocks.revoke).toHaveBeenCalledWith("launch-1")
        expect(mocks.postMessage).toHaveBeenCalledWith({ status: "failed", workspaceId: "workspace-1" })
        expect(mocks.followRedirect).not.toHaveBeenCalled()
    })

    it("retries a refused launch from a fresh issuing state", async () => {
        mocks.issue
            .mockResolvedValueOnce({ ok: false, code: "LAUNCH_BLOCKED" })
            .mockResolvedValueOnce({
                ok: true,
                data: { launchId: "launch-2", redirectUrl: "https://openclaw.test/launch", expiresAt: "2026-08-22T10:00:00.000Z" },
            })
        render(<AgentOSOpenClawLaunch workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("blocked"))

        fireEvent.click(screen.getByRole("button", { name: "retry" }))

        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("connected"))
        expect(mocks.issue).toHaveBeenCalledTimes(2)
    })

    it("returns to the exact workspace without treating navigation as launch state", async () => {
        render(<AgentOSOpenClawLaunch workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getByTestId("launch-state")).toHaveTextContent("connected"))
        fireEvent.click(screen.getByRole("button", { name: "return" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/agentos/workspaces/workspace-1")
    })
})
