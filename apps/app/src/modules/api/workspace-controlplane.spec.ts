import { afterEach, describe, expect, it, vi } from "vitest"
import {
    chatbotWorkbench,
    reconcileChatbotDelivery,
    workspaceControlplaneTesting,
} from "./workspace-controlplane"

describe("workspace control-plane transport", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("routes Chatbot reads and reconciliation through Core without trusting the workspace hostname", async () => {
        const workspaceId = "f9ad3fac-34b3-4a82-a5f4-dc62782bc472"
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: { chatbotWorkspaceWorkbench: { data: { chatbotWorkbench: { installationId: "chatbot-2", lifecycleState: "active", approvedVersion: 4, channels: [], conversations: [], messages: [] } } } } }) })
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: { chatbotWorkspaceCommand: { data: { reconcileChatbotDelivery: { id: "receipt-1", installationId: "chatbot-2", state: "recorded" } } } } }) })
        vi.stubGlobal("fetch", fetchMock)

        await chatbotWorkbench("attacker.invalid", workspaceId, "memory-token", "chatbot-2")
        await reconcileChatbotDelivery("attacker.invalid", workspaceId, "memory-token", { installationId: "chatbot-2", providerOutboxId: "outbox-1", outcome: "failed", requestToken: "request-1" })

        const readBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { query: string; variables: unknown }
        const mutationBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as { query: string; variables: { request: { installationId: string; operation: string; input: { outboxId: string; terminalState: string; evidenceRef: string } } } }
        expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:3068/graphql")
        expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3068/graphql")
        expect(readBody.query).toContain("chatbotWorkspaceWorkbench(request: $request)")
        expect(readBody.variables).toEqual({ request: { workspaceId, installationId: "chatbot-2" } })
        expect(mutationBody.query).toContain("chatbotWorkspaceCommand(request: $request)")
        expect(mutationBody.variables.request).toMatchObject({ installationId: "chatbot-2", operation: "reconcile-delivery", input: { outboxId: "outbox-1", terminalState: "failed", evidenceRef: "operator://manual-reconciliation/outbox-1" } })
        expect(workspaceControlplaneTesting.chatbotCoreEndpoint(workspaceId)).toBe("http://localhost:3068/graphql")
    })
})
