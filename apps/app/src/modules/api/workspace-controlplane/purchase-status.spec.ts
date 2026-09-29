import { afterEach, describe, expect, it, vi } from "vitest"
import { readWorkspacePurchaseStatus } from "./index"
import { envelope, invoiceRow, orderRow, refusal, requestBody, workspaceRow } from "./spec-helpers"
describe("readWorkspacePurchaseStatus", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("assembles source-qualified status from the order, invoice and workspace reads", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(envelope("myCatalogOrders", [orderRow]))
            .mockResolvedValueOnce(
                envelope("myInvoices", [{ ...invoiceRow, status: "paid", paidAt: "2026-01-01T00:10:00.000Z" }]),
            )
            .mockResolvedValueOnce(envelope("myAgentWorkspace", [workspaceRow]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.purchaseId).toBe("order-1")
        expect(result.data.order).toEqual({
            state: "observed",
            status: "pending_payment",
            offerName: "AgentOS Workspace",
            tierName: "Solo",
        })
        expect(result.data.payment).toEqual({
            state: "observed",
            invoiceId: "inv-1",
            status: "paid",
            amountVnd: 99000,
            paidAt: "2026-01-01T00:10:00.000Z",
        })
        expect(result.data.provisioning).toEqual({
            state: "observed",
            workspaceId: "ws-1",
            workspaceName: "studio",
            workspaceStatus: "provisioning",
        })
        expect(requestBody(fetchMock, 0).query).toContain("myCatalogOrders")
        expect(requestBody(fetchMock, 1).query).toContain("myInvoices")
        expect(requestBody(fetchMock, 2).query).toContain("myAgentWorkspace")
    })

    it("keeps an unknown purchase non-disclosing rather than reporting any state", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(envelope("myCatalogOrders", [orderRow]))
            .mockResolvedValueOnce(envelope("myInvoices", [invoiceRow]))
            .mockResolvedValueOnce(envelope("myAgentWorkspace", [workspaceRow]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-9")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.order).toEqual({ state: "missing" })
        expect(result.data.payment).toEqual({ state: "not-raised" })
        expect(result.data.provisioning).toEqual({ state: "not-admitted" })
    })

    it("marks a refused source unavailable beside the facts the others confirmed", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(envelope("myCatalogOrders", [orderRow]))
            .mockResolvedValueOnce(refusal("myInvoices", "INVOICE_READ_REFUSED"))
            .mockResolvedValueOnce(envelope("myAgentWorkspace", [workspaceRow]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.order).toMatchObject({ state: "observed" })
        expect(result.data.payment).toEqual({ state: "unavailable", code: "INVOICE_READ_REFUSED" })
        expect(result.data.provisioning).toMatchObject({ state: "observed" })
    })

    it("fails closed when no source answered", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(refusal("myCatalogOrders", "AUTH"))
            .mockResolvedValueOnce(refusal("myInvoices", "AUTH"))
            .mockResolvedValueOnce(refusal("myAgentWorkspace", "AUTH"))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-1")

        expect(result).toMatchObject({ ok: false, reason: "refused", code: "AUTH" })
    })
})
