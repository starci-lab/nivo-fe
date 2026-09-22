import { beforeEach, describe, expect, it, vi } from "vitest"

const api = vi.hoisted(() => ({
    orderAgentOs: vi.fn(),
    myCatalogOrders: vi.fn(),
    myInvoices: vi.fn(),
    myAgentWorkspace: vi.fn(),
    catalogItems: vi.fn(),
    payInvoice: vi.fn(),
    createWalletTopUpPayLink: vi.fn(),
    issueAgentWorkspaceAppLaunch: vi.fn(),
}))

vi.mock("@/modules/api/console", () => api)

const order = (id: string, status = "pending_payment") => ({
    id,
    status,
    catalogItem: { id: "item-1", name: "Nivo Operations Workspace" },
    catalogTier: { id: "tier-1", name: "Team" },
})
const load = () => import("@/modules/api/workspace-controlplane")

describe("startWorkspaceCheckout double-submit safety", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.resetModules()
        api.myCatalogOrders.mockResolvedValue({ ok: true, data: [order("purchase-1")] })
        api.myInvoices.mockResolvedValue({ ok: true, data: [] })
        api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [] })
    })

    it("joins an identical repeat while the first admission is still in flight", async () => {
        const { startWorkspaceCheckout } = await load()
        let release: (value: unknown) => void = () => undefined
        api.orderAgentOs.mockImplementation(() => new Promise(resolve => { release = resolve }))
        const first = startWorkspaceCheckout("agent-os", "tier-1")
        const second = startWorkspaceCheckout("agent-os", "tier-1")
        release({ ok: true, data: order("purchase-1") })
        const [a, b] = await Promise.all([first, second])
        expect(api.orderAgentOs).toHaveBeenCalledTimes(1)
        expect(a.ok && a.data.purchaseId).toBe("purchase-1")
        expect(b.ok && b.data.purchaseId).toBe("purchase-1")
    })

    it("keeps a different offer or tier as its own purchase", async () => {
        const { startWorkspaceCheckout } = await load()
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
        await Promise.all([
            startWorkspaceCheckout("agent-os", "tier-1"),
            startWorkspaceCheckout("agent-os", "tier-2"),
            startWorkspaceCheckout("other-offer", "tier-1"),
        ])
        expect(api.orderAgentOs).toHaveBeenCalledTimes(3)
    })

    it("resolves a recent repeat to the same purchase after re-reading its status", async () => {
        const { startWorkspaceCheckout } = await load()
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
        const first = await startWorkspaceCheckout("agent-os", "tier-1")
        const second = await startWorkspaceCheckout("agent-os", "tier-1")
        expect(api.orderAgentOs).toHaveBeenCalledTimes(1)
        expect(api.myCatalogOrders).toHaveBeenCalled()
        expect(second.ok && second.data.purchaseId).toBe(first.ok ? first.data.purchaseId : "")
    })

    it("admits a fresh purchase when the recorded one is terminal", async () => {
        const { startWorkspaceCheckout } = await load()
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
        await startWorkspaceCheckout("agent-os", "tier-1")
        api.myCatalogOrders.mockResolvedValue({ ok: true, data: [order("purchase-1", "cancelled")] })
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-2") })
        const again = await startWorkspaceCheckout("agent-os", "tier-1")
        expect(api.orderAgentOs).toHaveBeenCalledTimes(2)
        expect(again.ok && again.data.purchaseId).toBe("purchase-2")
    })

    it("admits a fresh purchase when the recorded one is no longer visible", async () => {
        const { startWorkspaceCheckout } = await load()
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
        await startWorkspaceCheckout("agent-os", "tier-1")
        api.myCatalogOrders.mockResolvedValue({ ok: true, data: [] })
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-2") })
        const again = await startWorkspaceCheckout("agent-os", "tier-1")
        expect(api.orderAgentOs).toHaveBeenCalledTimes(2)
        expect(again.ok && again.data.purchaseId).toBe("purchase-2")
    })

    it("refuses rather than create blindly when the prior purchase cannot be verified", async () => {
        const { startWorkspaceCheckout } = await load()
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
        await startWorkspaceCheckout("agent-os", "tier-1")
        api.myCatalogOrders.mockResolvedValue({ ok: false, reason: "orders refused", code: "ORDERS_REFUSED" })
        api.myInvoices.mockResolvedValue({ ok: false, reason: "invoices refused" })
        api.myAgentWorkspace.mockResolvedValue({ ok: false, reason: "workspaces refused" })
        const again = await startWorkspaceCheckout("agent-os", "tier-1")
        expect(again.ok).toBe(false)
        expect(api.orderAgentOs).toHaveBeenCalledTimes(1)
    })

    it("never stores a refused admission for reuse", async () => {
        const { startWorkspaceCheckout } = await load()
        api.orderAgentOs.mockResolvedValue({ ok: false, reason: "order mutation failed" })
        const first = await startWorkspaceCheckout("agent-os", "tier-1")
        expect(first.ok).toBe(false)
        api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
        const second = await startWorkspaceCheckout("agent-os", "tier-1")
        expect(api.orderAgentOs).toHaveBeenCalledTimes(2)
        expect(second.ok && second.data.purchaseId).toBe("purchase-1")
    })
})
