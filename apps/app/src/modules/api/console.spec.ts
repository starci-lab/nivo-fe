import { describe, expect, it, vi } from "vitest"

vi.mock("./graphql", () => ({ graphql: vi.fn() }))

import { graphql } from "./graphql"
import {
    catalogItems,
    installAgentosSolutionModule,
    myAcademyStudents,
    myAgentWorkspaceControlCenter,
    myExpertSiteLeads,
    myPodOpenclawStatus,
    orderAgentOs,
    payInvoice,
} from "./console"

describe("console API operations", () => {
    it("keeps operation variables and documents aligned for high-risk mutations and paged reads", async () => {
        vi.mocked(graphql).mockResolvedValue({ ok: true, data: {} } as never)
        await payInvoice("invoice-1")
        await orderAgentOs("agent-os", "tier-pro")
        await installAgentosSolutionModule({
            agentWorkspaceId: "workspace-1",
            moduleKey: "sales-copilot",
            idempotencyKey: "idem-1",
        })
        await myAgentWorkspaceControlCenter("workspace-1")
        await myPodOpenclawStatus()
        await catalogItems("ai_agent")
        await myAcademyStudents({ siteId: "site-1", limit: 25, offset: 50 })
        await myExpertSiteLeads("site-1", 10, 20)

        const calls = vi.mocked(graphql).mock.calls
        expect(calls).toHaveLength(8)
        expect(calls[0][0]).toContain("mutation PayInvoice")
        expect(calls[0][1]).toEqual({ input: { invoiceId: "invoice-1" } })
        expect(calls[1][0]).toContain("mutation OrderAgentOs")
        expect(calls[1][1]).toEqual({ input: { catalogItemSlug: "agent-os", catalogTierId: "tier-pro" } })
        expect(calls[2][0]).toContain("mutation InstallAgentosSolutionModule")
        expect(calls[2][1]).toEqual({ input: {
            agentWorkspaceId: "workspace-1",
            moduleKey: "sales-copilot",
            idempotencyKey: "idem-1",
            channelAccountRefs: [],
            sharedKnowledgeSourceIds: [],
            modelProfileRef: "nivo-default",
        } })
        expect(calls[3][1]).toEqual({ workspaceId: "workspace-1" })
        expect(calls[5][1]).toEqual({ category: "ai_agent" })
        expect(calls[6][1]).toEqual({ input: { siteId: "site-1", limit: 25, offset: 50 } })
        expect(calls[7][1]).toEqual({ siteId: "site-1", limit: 10, offset: 20 })
    })
})
