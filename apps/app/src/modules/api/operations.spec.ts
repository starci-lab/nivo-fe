import { beforeEach, describe, expect, it, vi } from "vitest"

const { graphql } = vi.hoisted(() => ({ graphql: vi.fn().mockResolvedValue({ ok: true, data: {} }) }))
vi.mock("./graphql", () => ({ graphql }))

import {
    catalogItems,
    myCatalogOrders,
    myDomains,
    myInvoices,
    myWallet,
    myWalletTransactions,
    orderAgentOs,
    payInvoice,
} from "./commerce"
import { createExpertSite, myExpertSiteDeployment, myExpertSites, publishExpertSite } from "./expert-sites"
import {
    issueAgentWorkspaceAppLaunch,
    myAgentWorkspace,
    myAgentWorkspaceControlCenter,
    renewAgentWorkspaceAppLaunch,
    revokeAgentWorkspaceAppLaunch,
} from "./agentos-workspaces"
import {
    myAgentosModuleInstallations,
    myAgentosModuleInstallation,
    myAgentosSolutionModules,
    installAgentosSolutionModule,
} from "./agentos-modules"
import { myInstances, myPodOpenclawStatus } from "./instances"
import {
    myAcademyGrowthSnapshot,
    myAcademyStudents,
    myAcademyStudentDetail,
    myAcademyIntegrations,
    myExpertSiteLeads,
    createAcademyStudent,
    updateAcademyStudent,
    setAcademyStudentStatus,
    grantAcademyCourseAccess,
    revokeAcademyCourseAccess,
    updateExpertSiteLead,
    draftLeadReply,
    saveAcademyCredential,
    setAcademyCustomDomain,
    saveAcademyGoogleOAuth,
    disconnectAcademyGoogleOAuth,
    beginAcademyZaloAuthorization,
    saveAcademyAnalytics,
    createAcademyWebhook,
    rotateAcademyWebhookSecret,
    disableAcademyWebhook,
} from "./academy"
import {
    myAgentosCustomModuleStudio,
    startAgentosCustomModuleIntake,
    answerAgentosCustomModuleIntake,
    prepareAgentosModuleAttachmentUpload,
    finalizeAgentosModuleAttachment,
    removeAgentosModuleAttachment,
    saveAgentosModuleIntegrationSecret,
    removeAgentosModuleIntegrationSecret,
    publishAgentosCustomModule,
    resolveCoreApiCapabilityUrl,
} from "./agentos-module-studio"
import { manageAgentosModuleRuntime, myAgentosModuleRuntime } from "./agentos-module-runtime"
import { myAgentosModuleTestRun, myAgentosModuleTestSurface, runAgentosModuleTest } from "./agentos-module-tests"

describe("modules/api operation documents", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps operation variables and documents aligned for high-risk mutations and paged reads", async () => {
        vi.mocked(graphql).mockResolvedValue({ ok: true, data: {} })
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
        expect(calls[0]![0]).toContain("mutation PayInvoice")
        expect(calls[0]![2]).toEqual({ input: { invoiceId: "invoice-1" } })
        expect(calls[1]![0]).toContain("mutation OrderAgentOs")
        expect(calls[1]![2]).toEqual({ input: { catalogItemSlug: "agent-os", catalogTierId: "tier-pro" } })
        expect(calls[2]![0]).toContain("mutation InstallAgentosSolutionModule")
        expect(calls[2]![2]).toEqual({
            input: {
                agentWorkspaceId: "workspace-1",
                moduleKey: "sales-copilot",
                idempotencyKey: "idem-1",
                channelAccountRefs: [],
                sharedKnowledgeSourceIds: [],
                modelProfileRef: "nivo-default",
            },
        })
        expect(calls[3]![2]).toEqual({ request: { workspaceId: "workspace-1" } })
        expect(calls[5]![2]).toEqual({ request: { category: "ai_agent" } })
        expect(calls[6]![2]).toEqual({ input: { siteId: "site-1", limit: 25, offset: 50 } })
        expect(calls[7]![2]).toEqual({ request: { siteId: "site-1", limit: 10, offset: 20 } })
    })
})

describe("modules/api owner-scoped operations", () => {
    it("dispatches owner-scoped reads and lifecycle mutations to GraphQL", async () => {
        await Promise.all([
            myExpertSites(),
            myAgentWorkspace(),
            myInstances(),
            myDomains(),
            myWallet(),
            myWalletTransactions(),
            myInvoices(),
            myCatalogOrders(),
            myPodOpenclawStatus(),
            myAgentWorkspaceControlCenter("workspace-1"),
            myAgentosSolutionModules(),
            myAgentosModuleInstallations("workspace-1"),
            myAgentosModuleInstallation("install-1"),
            myAgentosModuleRuntime("install-1", true),
            myAgentosModuleTestSurface("install-1"),
            myAgentosModuleTestRun("install-1", "run-1"),
            runAgentosModuleTest({
                installationId: "install-1",
                contextVersionId: "context-1",
                scenarioKey: "safe-fixture",
                mode: "exploratory",
                idempotencyKey: "test-run-1",
                scenarioInput: {},
            }),
            manageAgentosModuleRuntime({
                action: "CREATE_EXECUTE_SESSION",
                installationId: "install-1",
                idempotencyKey: "runtime-key",
                title: "Planning",
            }),
            myExpertSiteDeployment("site-1"),
            payInvoice("invoice-1"),
            catalogItems("site_from_template"),
            issueAgentWorkspaceAppLaunch("workspace-1"),
            renewAgentWorkspaceAppLaunch("launch-1"),
            revokeAgentWorkspaceAppLaunch("launch-1"),
            createExpertSite("academy"),
            publishExpertSite("site-1"),
            orderAgentOs("ai_agent"),
            installAgentosSolutionModule({
                agentWorkspaceId: "workspace-1",
                moduleKey: "module-1",
                idempotencyKey: "key-1",
            }),
            myAcademyGrowthSnapshot("site-1"),
            myAcademyStudents({ siteId: "site-1", limit: 25 }),
            myAcademyStudentDetail("site-1", "student-1"),
            myAcademyIntegrations("site-1"),
            myExpertSiteLeads("site-1"),
            createAcademyStudent({ siteId: "site-1", name: "Learner", email: "learner@example.test" }),
            updateAcademyStudent({ siteId: "site-1", memberId: "student-1", name: "Learner" }),
            setAcademyStudentStatus({ siteId: "site-1", memberId: "student-1", status: "active" }),
            grantAcademyCourseAccess({ siteId: "site-1", email: "learner@example.test", courseSlug: "course-1" }),
            revokeAcademyCourseAccess({ siteId: "site-1", email: "learner@example.test", courseSlug: "course-1" }),
            updateExpertSiteLead({ leadId: "lead-1", status: "contacted" }),
            draftLeadReply({ leadId: "lead-1", locale: "en" }),
            saveAcademyCredential({ siteId: "site-1", key: "provider-key", value: "" }),
            setAcademyCustomDomain({ siteId: "site-1", domain: null }),
            saveAcademyGoogleOAuth({ siteId: "site-1", clientId: "", clientSecret: "" }),
            disconnectAcademyGoogleOAuth("site-1"),
            beginAcademyZaloAuthorization("site-1"),
            saveAcademyAnalytics({ siteId: "site-1", provider: "ga4", identifier: null, consentMode: "required" }),
            createAcademyWebhook({ siteId: "site-1", endpoint: "https://example.test/webhook", events: [] }),
            rotateAcademyWebhookSecret({ siteId: "site-1", webhookId: "webhook-1", expectedVersion: 0 }),
            disableAcademyWebhook("site-1", "webhook-1"),
            myAgentosCustomModuleStudio("workspace-1", "module-1"),
            startAgentosCustomModuleIntake({
                agentWorkspaceId: "workspace-1",
                goal: "Qualify support",
                idempotencyKey: "intake-1",
            }),
            answerAgentosCustomModuleIntake({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                answer: "Support team",
            }),
            prepareAgentosModuleAttachmentUpload({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                fileName: "playbook.pdf",
                mediaType: "application/pdf",
                sizeBytes: 42,
            }),
            finalizeAgentosModuleAttachment({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                attachmentId: "attachment-1",
            }),
            removeAgentosModuleAttachment({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                attachmentId: "attachment-1",
            }),
            saveAgentosModuleIntegrationSecret({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                providerKey: "crm-api",
                secret: "secret-value",
            }),
            removeAgentosModuleIntegrationSecret({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                providerKey: "crm-api",
            }),
            publishAgentosCustomModule({
                agentWorkspaceId: "workspace-1",
                moduleId: "module-1",
                acknowledgedVersion: 3,
                idempotencyKey: "publish-1",
            }),
        ])
        expect(graphql.mock.calls.length).toBeGreaterThan(50)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("myWallet"))).toBe(true)
        expect(graphql.mock.calls.some((call) => call.length > 0)).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("PublishAgentosCustomModule"))).toBe(
            true,
        )
        expect(graphql.mock.calls.some(([document]) => String(document).includes("MyAgentosModuleRuntime"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("ManageAgentosModuleRuntime"))).toBe(
            true,
        )
        expect(graphql.mock.calls.some(([document]) => String(document).includes("MyAgentosModuleTestSurface"))).toBe(
            true,
        )
        expect(graphql.mock.calls.some(([document]) => String(document).includes("MyAgentosModuleTestRun"))).toBe(true)
        expect(graphql.mock.calls.some(([document]) => String(document).includes("RunAgentosModuleTest"))).toBe(true)
        expect(
            graphql.mock.calls.some(([document]) =>
                String(document).includes("attachmentId uploadUrl uploadMethod uploadExpiresAt"),
            ),
        ).toBe(true)
        expect(
            graphql.mock.calls.some(([document]) =>
                String(document).includes("ingestionStatus detectedMediaType sha256 chunkCount"),
            ),
        ).toBe(true)
        expect(resolveCoreApiCapabilityUrl("/pods/self/module-document-uploads/document-1?signature=signed")).toBe(
            "http://localhost:3068/pods/self/module-document-uploads/document-1?signature=signed",
        )
    })
})
