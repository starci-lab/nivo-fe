import { NextIntlClientProvider } from "next-intl"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSWorkspaceAiKnowledgePane } from "./index"

const readinessQuery = vi.hoisted(() => ({ data: undefined, mutate: vi.fn() }))

vi.mock("@/hooks", () => ({
    useMutateReindexAgentWorkspaceKnowledgeSwr: () => ({ trigger: vi.fn() }),
    useMutateRunAgentosAiReadinessTestSwr: () => ({ trigger: vi.fn() }),
    useQueryMyAgentosAiKnowledgeReadinessSwr: () => ({ ...readinessQuery, error: undefined }),
    useQueryNoticeData: () => () => undefined,
}))

describe("AgentOSWorkspaceAiKnowledgePane", () => {
    it("renders the real knowledge screen for the selected workspace", async () => {
        const { container } = render(
            <NextIntlClientProvider
                locale="en"
                messages={enMessages}
                timeZone={TIME_ZONE}
                onError={(error) => {
                    throw error
                }}
            >
                <AgentOSWorkspaceAiKnowledgePane workspaceId="workspace-1" />
            </NextIntlClientProvider>,
        )

        expect(screen.getByText(enMessages.console.agentos.workspace.aiKnowledge.title)).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
