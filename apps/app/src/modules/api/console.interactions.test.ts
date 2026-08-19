import { describe, expect, it, vi } from "vitest"

const { graphql } = vi.hoisted(() => ({ graphql: vi.fn().mockResolvedValue({ ok: true, data: {} }) }))
vi.mock("./graphql", () => ({ graphql }))

import {
    catalogItems, createExpertSite, issueAgentWorkspaceAppLaunch, myAgentWorkspace, myAgentWorkspaceControlCenter,
    myAgentosModuleInstallations, myAgentosModuleInstallation, myAgentosSolutionModules, myCatalogOrders,
    myDomains, myExpertSiteDeployment, myExpertSites, myInstances, myInvoices, myPodOpenclawStatus, myWallet,
    myWalletTransactions, orderAgentOs, payInvoice, publishExpertSite, renewAgentWorkspaceAppLaunch,
    revokeAgentWorkspaceAppLaunch, installAgentosSolutionModule,
    myAcademyGrowthSnapshot, myAcademyStudents, myAcademyStudentDetail, myAcademyIntegrations,
    myExpertSiteLeads, createAcademyStudent, updateAcademyStudent, setAcademyStudentStatus,
    grantAcademyCourseAccess, revokeAcademyCourseAccess, updateExpertSiteLead, draftLeadReply,
    saveAcademyCredential, setAcademyCustomDomain, saveAcademyGoogleOAuth, disconnectAcademyGoogleOAuth,
    beginAcademyZaloAuthorization, saveAcademyAnalytics, createAcademyWebhook, rotateAcademyWebhookSecret,
    disableAcademyWebhook,
} from "./console"

describe("console API interaction wrappers", () => {
    it("dispatches owner-scoped reads and lifecycle mutations to GraphQL", async () => {
        await Promise.all([
            myExpertSites(), myAgentWorkspace(), myInstances(), myDomains(), myWallet(), myWalletTransactions(),
            myInvoices(), myCatalogOrders(), myPodOpenclawStatus(), myAgentWorkspaceControlCenter("workspace-1"),
            myAgentosSolutionModules(), myAgentosModuleInstallations("workspace-1"), myAgentosModuleInstallation("install-1"),
            myExpertSiteDeployment("site-1"),
            payInvoice("invoice-1"), catalogItems("site_from_template"), issueAgentWorkspaceAppLaunch("workspace-1"),
            renewAgentWorkspaceAppLaunch("launch-1"), revokeAgentWorkspaceAppLaunch("launch-1"),
            createExpertSite("academy"), publishExpertSite("site-1"), orderAgentOs("ai_agent"),
            installAgentosSolutionModule({ agentWorkspaceId: "workspace-1", moduleKey: "module-1", idempotencyKey: "key-1" } as never),
            myAcademyGrowthSnapshot("site-1"), myAcademyStudents({ siteId: "site-1" } as never), myAcademyStudentDetail("site-1", "student-1"), myAcademyIntegrations("site-1"),
            myExpertSiteLeads("site-1"), createAcademyStudent({ siteId: "site-1" } as never), updateAcademyStudent({ siteId: "site-1" } as never), setAcademyStudentStatus({ siteId: "site-1" } as never),
            grantAcademyCourseAccess({ siteId: "site-1" } as never), revokeAcademyCourseAccess({ siteId: "site-1" } as never), updateExpertSiteLead({ siteId: "site-1" } as never), draftLeadReply({ siteId: "site-1" } as never),
            saveAcademyCredential({ siteId: "site-1" } as never), setAcademyCustomDomain({ siteId: "site-1" } as never), saveAcademyGoogleOAuth({ siteId: "site-1" } as never), disconnectAcademyGoogleOAuth("site-1"),
            beginAcademyZaloAuthorization("site-1"), saveAcademyAnalytics({ siteId: "site-1" } as never), createAcademyWebhook({ siteId: "site-1" } as never), rotateAcademyWebhookSecret({ siteId: "site-1" } as never), disableAcademyWebhook("site-1", "webhook-1"),
        ])
        expect(graphql.mock.calls.length).toBeGreaterThan(40)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("myWallet"))).toBe(true)
        expect(graphql.mock.calls.some((call) => call.length > 0)).toBe(true)
    })
})
