import { afterEach, describe, expect, it, vi } from "vitest"
import {
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
})
