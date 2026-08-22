import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    installation: vi.fn(),
    push: vi.fn(),
    realtime: { status: "disconnected" },
    session: { state: { status: "signed-in", accessToken: "token" } },
}))

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }))
vi.mock("@/modules/api/console", () => ({ myAgentosModuleInstallation: mocks.installation }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))

type ModuleDetailViewInput = { detailState: string; installation?: { id: string }; onBack: () => void }

vi.mock("./component", () => ({
    AgentOSSolutionModuleDetailBase: (input: ModuleDetailViewInput) => (
        <><output data-testid="module-detail">{input.detailState}:{input.installation?.id ?? "none"}</output><button onClick={input.onBack}>back</button></>
    ),
}))

import { AgentOSSolutionModuleDetail } from "./"

const installation = {
    id: "installation-1",
    agentWorkspaceId: "workspace-1",
    moduleKey: "sales-copilot",
    moduleVersion: "1.2.0",
    status: "ready",
    sagaId: null,
    generatedAgentIds: [],
    sharedKnowledgeSourceIds: [],
    channelAccountRefs: [],
    commonKnowledgeVersion: "common-v1",
    privateKnowledgeVersion: "private-v1",
    failureCode: null,
}

describe("AgentOSSolutionModuleDetail connected orchestration", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
    })

    it("resolves the detail block independently from the fixed page anatomy", async () => {
        mocks.installation.mockResolvedValue({ ok: true, data: installation })
        render(<AgentOSSolutionModuleDetail workspaceId="workspace-1" installationId="installation-1" />)
        expect(screen.getByTestId("module-detail")).toHaveTextContent("loading:none")
        await waitFor(() => expect(screen.getByTestId("module-detail")).toHaveTextContent("ready:installation-1"))
    })

    it("refuses a snapshot that does not belong to the exact workspace", async () => {
        mocks.installation.mockResolvedValue({ ok: true, data: { ...installation, agentWorkspaceId: "workspace-2" } })
        render(<AgentOSSolutionModuleDetail workspaceId="workspace-1" installationId="installation-1" />)
        await waitFor(() => expect(screen.getByTestId("module-detail")).toHaveTextContent("refused:none"))
    })

    it("returns to the exact workspace route", () => {
        mocks.installation.mockReturnValue(new Promise(() => undefined))
        render(<AgentOSSolutionModuleDetail workspaceId="workspace-1" installationId="installation-1" />)
        fireEvent.click(screen.getByRole("button", { name: "back" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/agentos/workspaces/workspace-1")
    })
})
