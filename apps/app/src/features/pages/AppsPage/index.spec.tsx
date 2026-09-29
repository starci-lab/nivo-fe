import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { apiAnswer, unavailableFailure } from "@/test-support/mock-result"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
let viewerSequence = 0
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("./component", () => ({ AppsPageBase: () => <div>apps page</div> }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
vi.mock("@/hooks/i18n/useRouter", () => ({ useRouter: () => ({ push, replace }) }))
vi.mock("@/hooks/i18n/usePathname", () => ({ usePathname: () => "/en/apps" }))
vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useProvisioningRealtime: () => ({ status: "disconnected", reason: null }),
}))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }) }))
vi.mock("@/modules/api/instances", () => ({ myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }) }))
vi.mock("@/modules/api/commerce", () => ({
    myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }),
    myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    createWalletTopUpPayLink: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }),
    payInvoice: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }),
}))
vi.mock("@/modules/api/agentos-workspaces", () => ({
    myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/agentos-modules", () => ({
    myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/agentos-module-runtime", () => ({
    myAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    manageAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/agentos-module-tests", () => ({
    myAgentosModuleTestSurface: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/academy", () => ({
    myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({
        ok: true,
        data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 },
    }),
}))

import { AppsPage } from "."
import type { AgentOSPage } from "../AgentOSPage"
import enMessages from "@/messages/en.json"
import { myAgentWorkspace } from "@/modules/api/agentos-workspaces"
import { myExpertSites } from "@/modules/api/expert-sites"
import { myInstances } from "@/modules/api/instances"
import { myCatalogOrders, catalogItems } from "@/modules/api/commerce"

describe("AppsPage", () => {
    it("mounts the dashboard compositor", () => {
        render(<AppsPage />)
        expect(screen.getByText("apps page")).toBeInTheDocument()
    })

    // The connected composition needs the real dashboard and the real intl runtime, so this
    // block re-registers both for its own module registry instead of the probe above.
    describe("connected orchestration", () => {
        let ConnectedAppsPage: typeof AppsPage
        let ConnectedAgentOSPage: typeof AgentOSPage
        beforeEach(async () => {
            vi.resetModules()
            vi.doMock("./component", async () => await vi.importActual("./component"))
            ConnectedAppsPage = (await import(".")).AppsPage
            ConnectedAgentOSPage = (await import("../AgentOSPage")).AgentOSPage
            window.matchMedia = vi
                .fn()
                .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
            viewerSequence += 1
            signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
            push.mockClear()
            replace.mockClear()
        }, 60000)
        afterEach(() => {
            vi.doUnmock("./component")
            cleanup()
            resetQueryCache()
        })

        it("settles AppsPage into its empty catalogue state", async () => {
            render(<ConnectedAppsPage />)
            expect(screen.getByText(enMessages.console.apps.title)).toBeInTheDocument()
        })

        it("renders owned apps, an in-progress order, and catalogue offers", async () => {
            vi.mocked(myExpertSites).mockResolvedValue(apiAnswer(myExpertSites, {
                ok: true,
                data: [
                    { id: "site-1", slug: "academy", customDomain: null, provisionStatus: "ready", status: "live" },
                    {
                        id: "site-2",
                        slug: "unknown",
                        customDomain: "unknown.test",
                        provisionStatus: "awaiting_dns",
                        status: "live",
                    },
                ],
            }))
            vi.mocked(myInstances).mockResolvedValue(apiAnswer(myInstances, {
                ok: true,
                data: [
                    {
                        id: "instance-1",
                        appKey: "ai_academy",
                        detailId: "site-1",
                        name: null,
                        plan: null,
                        ram: null,
                        vcpu: null,
                        status: "ready",
                    },
                ],
            }))
            vi.mocked(myCatalogOrders).mockResolvedValue(apiAnswer(myCatalogOrders, {
                ok: true,
                data: [
                    {
                        id: "order-1",
                        status: "in_progress",
                        catalogItem: { id: "item-1", name: "Academy" },
                        catalogTier: { id: "tier-1", name: "Starter" },
                    },
                    { id: "order-2", status: "in_progress", catalogItem: null, catalogTier: null },
                ],
            }))
            vi.mocked(catalogItems).mockResolvedValue(apiAnswer(catalogItems, {
                ok: true,
                data: [
                    {
                        id: "item-1",
                        slug: "academy",
                        name: "Academy",
                        tagline: "Learn",
                        templateKey: "ai_academy",
                        tiers: [
                            { id: "tier-1", tierKey: "starter", name: "Starter", priceMonthlyVnd: null, orderIndex: 0 },
                            { id: "tier-2", tierKey: "basic", name: "Basic", priceMonthlyVnd: 100, orderIndex: 1 },
                            { id: "tier-3", tierKey: "pro", name: "Pro", priceMonthlyVnd: 200, orderIndex: 2 },
                        ],
                    },
                    { id: "item-2", slug: "custom", name: "Custom", tagline: null, templateKey: "custom", tiers: null },
                    { id: "item-3", slug: "ignored", name: "Ignored", tagline: null, templateKey: null, tiers: null },
                ],
            }))
            render(<ConnectedAppsPage />)
            await waitFor(() => expect(screen.getAllByText("Academy").length).toBeGreaterThan(0))
            for (const button of screen.getAllByRole("button")) {
                if (!button.hasAttribute("disabled")) fireEvent.click(button)
            }
        })

        it("covers AppsPage refusal and empty catalogue answers", async () => {
            cleanup()
            resetQueryCache()
            vi.mocked(myExpertSites).mockResolvedValue(apiAnswer(myExpertSites, unavailableFailure()))
            vi.mocked(myInstances).mockResolvedValue(apiAnswer(myInstances, { ok: true, data: [] }))
            vi.mocked(myCatalogOrders).mockResolvedValue(apiAnswer(myCatalogOrders, { ok: true, data: [] }))
            vi.mocked(catalogItems).mockResolvedValue(apiAnswer(catalogItems, unavailableFailure()))
            render(<ConnectedAppsPage />)
            await waitFor(() =>
                expect(screen.getAllByText(enMessages.console.refusal.unknown).length).toBeGreaterThan(0),
            )
            cleanup()
            resetQueryCache()
            vi.mocked(myExpertSites).mockResolvedValue(apiAnswer(myExpertSites, { ok: true, data: [] }))
            vi.mocked(catalogItems).mockResolvedValue(apiAnswer(catalogItems, { ok: true, data: [] }))
            render(<ConnectedAppsPage />)
            await waitFor(() =>
                expect(screen.getAllByText(enMessages.console.apps.emptyDescription).length).toBeGreaterThan(0),
            )
        })

        it("covers signed-out and non-default AppsPage routing plus missing joins", async () => {
            cleanup()
            resetQueryCache()
            signedIn.state = { status: "signed-out", accessToken: "" }
            render(<ConnectedAppsPage />)
            expect(screen.getByText(enMessages.console.apps.title)).toBeInTheDocument()
            cleanup()
            resetQueryCache()
            signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-apps` }
            vi.mocked(myExpertSites).mockResolvedValue(apiAnswer(myExpertSites, {
                ok: true,
                data: [
                    { id: "site-1", slug: "academy", customDomain: null, provisionStatus: "failed", status: "live" },
                ],
            }))
            vi.mocked(myInstances).mockResolvedValue(apiAnswer(myInstances, unavailableFailure()))
            vi.mocked(myCatalogOrders).mockResolvedValue(apiAnswer(myCatalogOrders, { ok: true, data: [] }))
            vi.mocked(catalogItems).mockResolvedValue(apiAnswer(catalogItems, unavailableFailure()))
            render(<ConnectedAppsPage />)
            expect(await screen.findByText("academy")).toBeInTheDocument()
            cleanup()
            resetQueryCache()
            vi.mocked(myAgentWorkspace).mockResolvedValue(apiAnswer(myAgentWorkspace, {
                ok: true,
                data: [{ id: "workspace-1", name: null, status: "unknown", catalogOrder: null }],
            }))
            render(<ConnectedAgentOSPage mode="dashboard" />)
            await waitFor(() =>
                expect(
                    screen.getAllByText(enMessages.console.agentos.businessDashboard.workspaceFallback).length,
                ).toBeGreaterThan(0),
            )
            expect(
                screen.queryByRole("link", { name: enMessages.console.agentos.businessDashboard.workspaceFallback }),
            ).toBeNull()
        })
    })
})
