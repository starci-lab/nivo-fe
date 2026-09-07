import { afterEach, describe, expect, it, vi } from "vitest"
import {
    chatbotWorkbench,
    reconcileChatbotDelivery,
    supportCustomerMessages,
    workspaceControlplaneTesting,
} from "./workspace-controlplane"

describe("workspace control-plane transport", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("permits HTTPS workspace hosts and bounded local HTTP only", () => {
        expect(workspaceControlplaneTesting.endpointFor("support-1.nivo.vn", "workspace-1")).toBe("https://support-1.nivo.vn/graphql")
        expect(workspaceControlplaneTesting.endpointFor("localhost", "workspace-1")).toBe("http://localhost/graphql")
        expect(workspaceControlplaneTesting.endpointFor("localhost:6068", "workspace-1")).toBe("http://localhost:6068/graphql")
        expect(workspaceControlplaneTesting.endpointFor("http://support-1.nivo.vn", "workspace-1")).toBeNull()
    })

    it("maps a Core-owned internal workspace hostname to its public controller route", () => {
        const workspaceId = "f9ad3fac-34b3-4a82-a5f4-dc62782bc472"

        expect(workspaceControlplaneTesting.endpointFor("tester-f9ad3fac.agentos.local", workspaceId))
            .toBe(`https://agent-${workspaceId}.nivo.vn/graphql`)
        expect(workspaceControlplaneTesting.endpointFor("untrusted.agentos.local", "not-a-workspace-id")).toBeNull()
    })

    it("reads a durable customer transcript with the in-memory bearer token", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                data: {
                    supportCustomerMessages: {
                        nodes: [{
                            id: "message-1", conversationId: "conversation-1", direction: "inbound", senderType: "customer",
                            body: "Căn hộ A-1203 mất điện", sequence: 1, contextDigest: null, policyClass: null,
                            decisionId: null, deliveryOutboxId: null, deliveryState: "received", failureCode: null,
                            occurredAt: "2026-08-26T00:00:00.000Z",
                        }],
                        nextCursor: null,
                    },
                },
            }),
        })
        vi.stubGlobal("fetch", fetchMock)

        const result = await supportCustomerMessages("support-1.nivo.vn", "workspace-1", "memory-token", "conversation-1")

        expect(result.ok).toBe(true)
        expect(result.ok && result.data.nodes[0]?.body).toContain("mất điện")
        expect(fetchMock).toHaveBeenCalledWith("https://support-1.nivo.vn/graphql", expect.objectContaining({
            headers: expect.objectContaining({ authorization: "Bearer memory-token" }),
        }))
    })

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
    })
})
