import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    offers: {
        data: undefined as unknown,
        error: undefined as unknown,
    },
    status: {
        data: undefined as unknown,
        error: undefined as unknown,
        mutate: vi.fn(() => Promise.resolve(undefined)),
    },
    entry: {
        resolve: vi.fn(),
    },
    recover: {
        trigger: vi.fn(),
        isMutating: false,
    },
    aiReadiness: undefined as unknown,
    aiMutate: vi.fn(() => Promise.resolve(undefined)),
    aiTrigger: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
    realtime: {
        status: "disconnected" as string,
        event: undefined as { kind: string; id: string; status?: string; reason?: string } | undefined,
    },
}))

type AgentProbeProps = {
    state: string
    props: {
        subject: string
        detail: string
        statusText: string
        statusActionLabel?: string
        statusActionDisabled?: boolean
        requestActionDisabled?: boolean
        isRequestPending?: boolean
        selection?: { offers: Array<{ id: string; label: string }>; selectedOfferId?: string }
    }
    on?: {
        request?: () => void
        statusAction?: () => void
        selectOffer?: (id: string) => void
        selectTier?: (id: string) => void
    }
}

vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/workspace-controlplane", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    resolveWorkspaceCheckoutEntry: mocks.entry.resolve,
}))
vi.mock("@/hooks", () => ({
    useQueryWorkspaceCheckoutOffersSwr: () => ({
        data: mocks.offers.data,
        error: mocks.offers.error,
        isValidating: false,
        mutate: vi.fn(),
    }),
    useQueryWorkspaceCheckoutStatusSwr: () => ({
        data: mocks.status.data,
        error: mocks.status.error,
        isValidating: false,
        mutate: mocks.status.mutate,
    }),
    useMutateRecoverWorkspacePurchaseSwr: () => ({
        trigger: mocks.recover.trigger,
        isMutating: mocks.recover.isMutating,
    }),
    useQueryMyAgentosAiKnowledgeReadinessSwr: () => ({
        data: mocks.aiReadiness,
        error: undefined,
        isValidating: false,
        mutate: mocks.aiMutate,
    }),
    useMutateRunAgentosAiReadinessTestSwr: () => ({ trigger: mocks.aiTrigger, isMutating: false }),
    useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
    useSession: () => mocks.session,
    useAccessToken: () => mocks.session.state.status === "signed-in" ? mocks.session.state.accessToken : null,
    useProvisioningRealtime: () => mocks.realtime,
}))
vi.mock("./component", () => ({
    AgentOSProvisioningBase: (props: AgentProbeProps) => (
        <div>
            <output data-testid="agent-flow">
                {JSON.stringify({
                    state: props.state,
                    subject: props.props.subject,
                    detail: props.props.detail,
                    text: props.props.statusText,
                    pending: props.props.isRequestPending,
                    action: props.props.statusActionLabel,
                    disabled: props.props.statusActionDisabled,
                    requestDisabled: props.props.requestActionDisabled,
                    offers: props.props.selection?.offers,
                    selectedOfferId: props.props.selection?.selectedOfferId,
                })}
            </output>
            <button data-testid="request" onClick={props.on?.request}>
                request
            </button>
            <button data-testid="select-offer" onClick={() => props.on?.selectOffer?.("offer-1")}>
                select offer
            </button>
            <button data-testid="status" onClick={props.on?.statusAction}>
                status
            </button>
        </div>
    ),
}))

import { AgentOSProvisioning } from "./"

const offer = (id = "offer-1", version = "v1") => ({
    offerId: id,
    offerVersion: version,
    displayName: "Nivo Operations Workspace",
    includedOutcome: "Run operations",
    amount: "4800000",
    currency: "VND",
    billingCadence: "monthly",
    renewalMode: "manual",
    eligibility: "vn",
})
const presentedOffer = offer("nivo-workspace-growth", "draft-2026-09-22")
const sourceFact = (
    state: string,
    reference: string | null = null,
    observedAt: string | null = null,
    source = "test-source",
) => ({ source, state, reference, observedAt })
const purchase = (overrides: Record<string, unknown> = {}) => ({
    purchaseId: "order",
    state: "payment-pending",
    offer: presentedOffer,
    payment: sourceFact("pending", null, "2026-09-22T07:31:00.000Z", "payment-reconciliation"),
    billing: sourceFact("pending", null, null, "platform-billing-ledger"),
    provisioning: { ...sourceFact("none", null, null, "workspace-provisioning"), disposition: null, reason: null },
    readiness: sourceFact("not-ready", null, null, "workspace-provisioning"),
    serviceEligibility: null,
    ledger: null,
    refund: null,
    refundStatus: null,
    lastConfirmedAt: "2026-09-22T07:35:00.000Z",
    ...overrides,
})
const statusAnswer = (record: ReturnType<typeof purchase>) => ({
    ok: true,
    data: { status: "status", purchaseId: record.purchaseId, purchase: record },
})
const offersAnswer = (selectionState = "current") => ({
    ok: true,
    data: {
        status: "offers",
        offers: [presentedOffer, offer()],
        selection: { offerId: "nivo-workspace-growth", offerVersion: "draft-2026-09-22", state: selectionState },
    },
})
const readyPurchase = () =>
    purchase({
        state: "ready",
        payment: sourceFact("verified-success", "attempt-1", "2026-09-22T07:32:00.000Z", "payment-reconciliation"),
        billing: sourceFact("paid", "receipt-1", "2026-09-22T07:32:30.000Z", "platform-billing-ledger"),
        provisioning: {
            ...sourceFact("ready", "PRV-1", "2026-09-22T07:34:00.000Z", "workspace-provisioning"),
            disposition: "ready",
            reason: null,
        },
        readiness: sourceFact("ready", "workspace-1", "2026-09-22T07:34:30.000Z", "workspace-provisioning"),
    })
const aiReadySnapshot = {
    ok: true,
    data: {
        provider: "OpenRouter",
        chatModel: "deepseek/deepseek-chat",
        embeddingProfile: "nivo",
        embeddingDimension: 1024,
        credentialStatus: "configured",
        credentialMaskedHint: "or-…",
        qdrantHealth: "healthy",
        readinessStatus: "ready",
        aiReady: true,
        readinessOperationId: null,
        knowledgeRecoveryOperationId: null,
        components: [],
        origins: [{ origin: "nivo", version: "v1", digest: "digest", documentCount: 1, lastUpdatedAt: null }],
        failureCode: null,
        testedAt: null,
    },
}

const flow = () => screen.getByTestId("agent-flow").textContent ?? ""
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}

describe("AgentOSProvisioning", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        resetQueryCache()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
        mocks.realtime.event = undefined
        mocks.offers.data = offersAnswer()
        mocks.offers.error = undefined
        mocks.status.data = undefined
        mocks.status.error = undefined
        mocks.status.mutate.mockResolvedValue(undefined)
        mocks.entry.resolve.mockResolvedValue({ ok: false, kind: "unavailable", code: "ENTRY_DOWN", reason: "entry unavailable" })
        mocks.recover.isMutating = false
        mocks.recover.trigger.mockResolvedValue({
            ok: true,
            data: { status: "status", purchaseId: "order", purchase: purchase({ state: "paid" }) },
        })
        mocks.aiReadiness = aiReadySnapshot
        mocks.aiTrigger.mockResolvedValue({ ok: true, data: {} })
    })

    it("loads the checkout offers and routes the owner's selection to checkout review", async () => {
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        expect(flow()).toContain('"subject":"Nivo Operations Workspace"')
        expect(flow()).toContain('"offers":[{"id":"nivo-workspace-growth"')
        expect(flow()).toContain('"selectedOfferId":"nivo-workspace-growth"')
        fireEvent.click(screen.getByTestId("request"))
        expect(mocks.push).toHaveBeenCalledWith(
            "/agentos/workspaces/new/checkout?offer=nivo-workspace-growth&offerVersion=draft-2026-09-22",
        )
    })

    it("keeps the submit action disabled when the boundary verdict is not current", async () => {
        mocks.offers.data = offersAnswer("stale")
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        expect(flow()).toContain('"requestDisabled":true')
        fireEvent.click(screen.getByTestId("request"))
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("lets the purchaser change the selected offer", async () => {
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        fireEvent.click(screen.getByTestId("select-offer"))
        await waitFor(() => expect(flow()).toContain('"selectedOfferId":"offer-1"'))
    })

    it("retries a failed AI readiness check", async () => {
        mocks.status.data = statusAnswer(readyPurchase())
        mocks.aiReadiness = {
            ...aiReadySnapshot,
            data: {
                ...aiReadySnapshot.data,
                aiReady: false,
                failureCode: "probe-failed",
                readinessOperationId: null,
                knowledgeRecoveryOperationId: null,
            },
        }
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(mocks.aiTrigger).toHaveBeenCalled())
        expect(mocks.aiMutate).toHaveBeenCalled()
    })

    it("reports a failed AI readiness read by kind, and only offers its retry when the answer asks", async () => {
        mocks.status.data = statusAnswer(readyPurchase())
        mocks.aiReadiness = { ok: false, kind: "forbidden", code: "FORBIDDEN", reason: "denied" }
        const forbidden = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("You don't have access to this.")
        expect(flow()).not.toContain('"action"')
        forbidden.unmount()
        resetQueryCache()

        mocks.aiReadiness = { ok: false, kind: "unavailable", code: "UNAVAILABLE", reason: "down" }
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("This could not be loaded. Check your connection and try again.")
        expect(flow()).toContain('"action":"Retry AI readiness"')
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(mocks.aiTrigger).toHaveBeenCalled())
        expect(mocks.aiMutate).toHaveBeenCalled()
    })

    it("reports a refused or unavailable offers read as failed without inventing a catalogue", async () => {
        mocks.offers.data = { ok: false, kind: "unavailable", code: "CATALOG_DOWN", reason: "catalog-down" }
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("This could not be loaded. Check your connection and try again.")
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos")
    })

    it("reconciles resume snapshots into payment, accepted, preparing, ready and failed phases", async () => {
        mocks.status.data = statusAnswer(purchase())
        const payment = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/purchases/order")
        payment.unmount()
        resetQueryCache()

        mocks.status.data = statusAnswer(
            purchase({
                state: "payment-outcome-unknown",
                payment: sourceFact("outcome-unknown", "attempt-1", null, "payment-reconciliation"),
            }),
        )
        const unknown = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"payment_unknown"'))
        expect(flow()).toContain('"action":"Try again"')
        unknown.unmount()
        resetQueryCache()

        mocks.status.data = statusAnswer(purchase({ state: "paid", billing: sourceFact("paid", "receipt-1") }))
        const accepted = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"accepted"'))
        expect(flow()).toContain('"action":"Watch fulfillment"')
        expect(flow()).toContain('"disabled":true')
        accepted.unmount()
        resetQueryCache()

        mocks.status.data = statusAnswer(
            purchase({
                state: "provisioning",
                provisioning: {
                    ...sourceFact("running", "PRV-1", null, "workspace-provisioning"),
                    disposition: "running",
                    reason: null,
                },
            }),
        )
        const preparing = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"preparing"'))
        preparing.unmount()
        resetQueryCache()

        mocks.status.data = statusAnswer(readyPurchase())
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        expect(flow()).toContain('"action":"Manage AgentOS"')
    })

    it("keeps an unanswered status read as payment-unknown with a reconcile action", async () => {
        mocks.status.data = { ok: false, kind: "unavailable", code: "STATUS_DOWN", reason: "status source refused" }
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"payment_unknown"'))
        expect(flow()).toContain("This could not be loaded. Check your connection and try again.")
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(mocks.status.mutate).toHaveBeenCalled())
        expect(mocks.recover.trigger).not.toHaveBeenCalled()
    })

    it("keeps an unanswered provisioning facet as provisioning-unknown and recovers with observed identities", async () => {
        mocks.status.data = statusAnswer(
            purchase({
                state: "provisioning",
                payment: sourceFact("verified-success", "attempt-1", null, "payment-reconciliation"),
                billing: sourceFact("paid", "receipt-1", null, "platform-billing-ledger"),
                provisioning: {
                    ...sourceFact("unavailable", "PRV-1", null, "workspace-provisioning"),
                    disposition: null,
                    reason: null,
                },
            }),
        )
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning_unknown"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(mocks.recover.trigger).toHaveBeenCalled())
        const request = mocks.recover.trigger.mock.calls[0]![0] as {
            purchaseId: string
            lastObserved: Record<string, string>
        }
        expect(request.purchaseId).toBe("order")
        expect(request.lastObserved).toEqual({ billingReceiptId: "receipt-1", provisioningOrderId: "PRV-1" })
        expect(request.lastObserved).not.toHaveProperty("paymentAttemptId")
        await waitFor(() => expect(flow()).toContain('"state":"accepted"'))
    })

    it("denies a resume whose status names another purchase identity", async () => {
        mocks.status.data = statusAnswer(purchase({ purchaseId: "order-9" }))
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("This AgentOS order was not found for the signed-in account.")
    })

    it("settles refused and unavailable outcomes without inventing a purchase", async () => {
        mocks.status.data = { ok: true, data: { status: "refused", code: "purchase-not-found-non-disclosing" } }
        const refused = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("This AgentOS order was not found for the signed-in account.")
        refused.unmount()
        resetQueryCache()

        mocks.status.data = {
            ok: true,
            data: { status: "unavailable", code: "source-unavailable", source: "workspace-provisioning" },
        }
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"payment_unknown"'))
        expect(flow()).toContain("source-unavailable")
    })

    it("reports a refused provisioning order as failed at the workspace step", async () => {
        mocks.status.data = statusAnswer(
            purchase({
                state: "provisioning",
                provisioning: {
                    ...sourceFact("refused", "PRV-1", null, "workspace-provisioning"),
                    disposition: "refused",
                    reason: "entitlement refused",
                },
            }),
        )
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("entitlement refused")
    })

    it("enters the ready workspace only through the entry boundary's registered destination", async () => {
        mocks.entry.resolve.mockResolvedValue({
            ok: true,
            data: {
                status: "entry",
                purchaseId: "order",
                workspaceId: "workspace-1",
                destination: {
                    workspaceId: "workspace-1",
                    ownerId: "owner-1",
                    routeName: "instance-management.workspace-shell",
                    routeVersion: "1",
                    context: {},
                },
            },
        })
        mocks.status.data = statusAnswer(readyPurchase())
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1"))
        const request = mocks.entry.resolve.mock.calls[0]![0] as Record<string, unknown>
        expect(request).toEqual({
            purchaseId: "order",
            workspaceId: "workspace-1",
            returnContext: { name: "workspace-dashboard", version: "1" },
        })
        expect(request).not.toHaveProperty("readinessObservationId")
    })

    it("keeps the ready surface mounted and shows the refusal when entry is refused", async () => {
        mocks.entry.resolve.mockResolvedValue({
            ok: true,
            data: { status: "refused", code: "workspace-not-ready", purchaseId: "order" },
        })
        mocks.status.data = statusAnswer(readyPurchase())
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(flow()).toContain("The workspace is not ready yet."))
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/workspaces/workspace-1")
        expect(flow()).toContain('"state":"ready"')
    })

    it("refuses to enter when the registered destination names another workspace", async () => {
        mocks.entry.resolve.mockResolvedValue({
            ok: true,
            data: {
                status: "entry",
                purchaseId: "order",
                workspaceId: "workspace-9",
                destination: {
                    workspaceId: "workspace-9",
                    ownerId: "owner-9",
                    routeName: "instance-management.workspace-shell",
                    routeVersion: "1",
                    context: {},
                },
            },
        })
        mocks.status.data = statusAnswer(readyPurchase())
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(flow()).toContain("This part could not be read"))
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/workspaces/workspace-9")
    })

    it("turns a realtime order event into a re-read of the same purchase", async () => {
        mocks.status.data = statusAnswer(
            purchase({
                state: "provisioning",
                provisioning: {
                    ...sourceFact("running", "PRV-1", null, "workspace-provisioning"),
                    disposition: "running",
                    reason: null,
                },
            }),
        )
        mocks.status.mutate.mockImplementation(async () => {
            mocks.status.data = statusAnswer(readyPurchase())
            return undefined
        })
        const view = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"preparing"'))
        mocks.realtime = { status: "event", event: { kind: "order", id: "order", status: "ready" } }
        view.rerender(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(mocks.status.mutate).toHaveBeenCalled())
        view.rerender(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
    })
})
