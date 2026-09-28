import { beforeEach, describe, expect, it, vi } from "vitest"

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
    disableAcademyWebhook, myAgentosCustomModules, myAgentosCustomModuleStudio,
    startAgentosCustomModuleIntake, answerAgentosCustomModuleIntake, prepareAgentosModuleAttachmentUpload,
    finalizeAgentosModuleAttachment, removeAgentosModuleAttachment, saveAgentosModuleIntegrationSecret,
    removeAgentosModuleIntegrationSecret, publishAgentosCustomModule, resolveCoreApiCapabilityUrl,
    manageAgentosModuleRuntime, myAgentosModuleRuntime, myAgentosModuleTestRun, myAgentosModuleTestSurface,
    runAgentosModuleTest,
} from "./console"

describe("modules/api/console", () => {
    beforeEach(() => vi.clearAllMocks())

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
        expect(calls[3][1]).toEqual({ request: { workspaceId: "workspace-1" } })
        expect(calls[5][1]).toEqual({ category: "ai_agent" })
        expect(calls[6][1]).toEqual({ input: { siteId: "site-1", limit: 25, offset: 50 } })
        expect(calls[7][1]).toEqual({ siteId: "site-1", limit: 10, offset: 20 })
    })
})

describe("console", () => {
    it("dispatches owner-scoped reads and lifecycle mutations to GraphQL", async () => {
        await Promise.all([
            myExpertSites(), myAgentWorkspace(), myInstances(), myDomains(), myWallet(), myWalletTransactions(),
            myInvoices(), myCatalogOrders(), myPodOpenclawStatus(), myAgentWorkspaceControlCenter("workspace-1"),
            myAgentosSolutionModules(), myAgentosModuleInstallations("workspace-1"), myAgentosModuleInstallation("install-1"),
            myAgentosModuleRuntime("install-1", true),
            myAgentosModuleTestSurface("install-1"), myAgentosModuleTestRun("install-1", "run-1"),
            runAgentosModuleTest({ installationId: "install-1", contextVersionId: "context-1", scenarioKey: "safe-fixture", mode: "exploratory", idempotencyKey: "test-run-1", scenarioInput: {} }),
            manageAgentosModuleRuntime({ action: "CREATE_EXECUTE_SESSION", installationId: "install-1", idempotencyKey: "runtime-key", title: "Planning" }),
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
            myAgentosCustomModules("workspace-1"), myAgentosCustomModuleStudio("workspace-1", "module-1"),
            startAgentosCustomModuleIntake({ agentWorkspaceId: "workspace-1", goal: "Qualify support", idempotencyKey: "intake-1" }),
            answerAgentosCustomModuleIntake({ agentWorkspaceId: "workspace-1", moduleId: "module-1", answer: "Support team" }),
            prepareAgentosModuleAttachmentUpload({ agentWorkspaceId: "workspace-1", moduleId: "module-1", fileName: "playbook.pdf", mediaType: "application/pdf", sizeBytes: 42 }),
            finalizeAgentosModuleAttachment({ agentWorkspaceId: "workspace-1", moduleId: "module-1", attachmentId: "attachment-1" }),
            removeAgentosModuleAttachment({ agentWorkspaceId: "workspace-1", moduleId: "module-1", attachmentId: "attachment-1" }),
            saveAgentosModuleIntegrationSecret({ agentWorkspaceId: "workspace-1", moduleId: "module-1", providerKey: "crm-api", secret: "secret-value" }),
            removeAgentosModuleIntegrationSecret({ agentWorkspaceId: "workspace-1", moduleId: "module-1", providerKey: "crm-api" }),
            publishAgentosCustomModule({ agentWorkspaceId: "workspace-1", moduleId: "module-1", acknowledgedVersion: 3, idempotencyKey: "publish-1" }),
        ])
        expect(graphql.mock.calls.length).toBeGreaterThan(50)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("myWallet"))).toBe(true)
        expect(graphql.mock.calls.some((call) => call.length > 0)).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("PublishAgentosCustomModule"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("MyAgentosModuleRuntime"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("ManageAgentosModuleRuntime"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("MyAgentosModuleTestSurface"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("MyAgentosModuleTestRun"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("RunAgentosModuleTest"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("attachmentId uploadUrl uploadMethod uploadExpiresAt"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("ingestionStatus detectedMediaType sha256 chunkCount"))).toBe(true)
        expect(resolveCoreApiCapabilityUrl("/pods/self/module-document-uploads/document-1?signature=signed"))
            .toBe("http://localhost:3068/pods/self/module-document-uploads/document-1?signature=signed")
    })
})
