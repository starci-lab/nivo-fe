import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceAiKnowledgePane } from "./index"

type AiKnowledgeProbeProps = { readonly workspaceId: string }

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceAiKnowledge", () => ({
    AgentOSWorkspaceAiKnowledge: ({ workspaceId }: AiKnowledgeProbeProps) => <output>{workspaceId}</output>,
}))

describe("AgentOSWorkspaceAiKnowledgePane", () => {
    it("keeps the knowledge pane within the selected workspace", () => {
        render(<AgentOSWorkspaceAiKnowledgePane workspaceId="workspace-1" />)

        expect(screen.getByText("workspace-1")).toBeInTheDocument()
    })
})
