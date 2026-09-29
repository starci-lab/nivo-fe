import { afterEach, describe, expect, it, vi } from "vitest"
import {
    cancelWorkspaceProvisioningSaga,
    createWorkspacePurchasePayLink,
    payWorkspacePurchaseInvoice,
    resolvePurchasedWorkspaceEntry,
    retryWorkspaceProvisioningSaga,
    workspaceProvisioningSaga,
} from "./index"
import { envelope, invoiceRow, requestBody, sagaRow, sagaStep } from "./spec-helpers"
describe("workspaceProvisioningSaga", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("reads, retries and cancels a provisioning saga by its stable identity", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(envelope("myProvisioningSaga", { saga: sagaRow, steps: [sagaStep] }))
            .mockResolvedValueOnce(envelope("retryProvisioningSaga", { ...sagaRow, status: "queued" }))
            .mockResolvedValueOnce(envelope("cancelProvisioningSaga", { ...sagaRow, status: "compensating" }))
        vi.stubGlobal("fetch", fetchMock)

        const view = await workspaceProvisioningSaga("saga-1")
        const retried = await retryWorkspaceProvisioningSaga("saga-1")
        const cancelled = await cancelWorkspaceProvisioningSaga("saga-1")

        expect(view).toEqual({ ok: true, data: { saga: sagaRow, steps: [sagaStep] } })
        expect(retried).toMatchObject({ ok: true, data: { id: "saga-1", status: "queued" } })
        expect(cancelled).toMatchObject({ ok: true, data: { id: "saga-1", status: "compensating" } })
        expect(requestBody(fetchMock, 0).query).toContain("myProvisioningSaga(request: $input)")
        expect(requestBody(fetchMock, 0).variables.input).toEqual({ sagaId: "saga-1" })
        expect(requestBody(fetchMock, 1).query).toContain("retryProvisioningSaga(request: $input)")
        expect(requestBody(fetchMock, 1).variables.input).toEqual({ sagaId: "saga-1" })
        expect(requestBody(fetchMock, 2).query).toContain("cancelProvisioningSaga(request: $input)")
        expect(requestBody(fetchMock, 2).variables.input).toEqual({ sagaId: "saga-1" })
    })
})

describe("payWorkspacePurchaseInvoice", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("settles the purchase invoice through the billing mutation", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("payInvoice", { ...invoiceRow, status: "paid" }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await payWorkspacePurchaseInvoice("inv-1")

        expect(result).toMatchObject({ ok: true, data: { id: "inv-1", status: "paid" } })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("payInvoice(request: $input)")
        expect(body.variables.input).toEqual({ invoiceId: "inv-1" })
    })
})

describe("createWorkspacePurchasePayLink", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("raises the provider payment action without claiming settlement", async () => {
        const payLink = {
            paymentId: "pay-1",
            gateway: "sepay",
            referenceId: "ref-1",
            checkoutUrl: "https://pay.example/checkout",
            qrCode: null,
            checkoutFields: null,
            amountVnd: 99000,
            chargedAmountVnd: 99000,
        }
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("createWalletTopUpPayLink", payLink))
        vi.stubGlobal("fetch", fetchMock)

        const result = await createWorkspacePurchasePayLink({
            amountVnd: 99000,
            returnUrl: "https://app.example/return",
            cancelUrl: "https://app.example/cancel",
        })

        expect(result).toEqual({ ok: true, data: payLink })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("createWalletTopUpPayLink(request: $input)")
        expect(body.variables.input).toEqual({
            amountVnd: 99000,
            gateway: "sepay",
            returnUrl: "https://app.example/return",
            cancelUrl: "https://app.example/cancel",
        })
    })
})

describe("resolvePurchasedWorkspaceEntry", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("resolves workspace entry through the issued launch grant", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("issueAgentWorkspaceAppLaunch", {
                launchId: "launch-1",
                redirectUrl: "https://pod.example/launch",
                expiresAt: "2026-01-01T01:00:00.000Z",
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await resolvePurchasedWorkspaceEntry("ws-1")

        expect(result).toEqual({
            ok: true,
            data: {
                launchId: "launch-1",
                redirectUrl: "https://pod.example/launch",
                expiresAt: "2026-01-01T01:00:00.000Z",
            },
        })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("issueAgentWorkspaceAppLaunch(request: $input)")
        expect(body.variables.input).toEqual({ workspaceId: "ws-1", app: "Openclaw" })
    })
})
