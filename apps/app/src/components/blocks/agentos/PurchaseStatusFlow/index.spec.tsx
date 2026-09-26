import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"

const mocks = vi.hoisted(() => ({
    status: {
        data: undefined as unknown,
        error: undefined as unknown,
        isValidating: false,
        mutate: vi.fn(() => Promise.resolve(undefined)),
    },
    entry: {
        data: undefined as unknown,
        lastRequest: null as unknown,
    },
    recover: {
        trigger: vi.fn(),
        isMutating: false,
    },
    push: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "token" } },
    realtime: { status: "disconnected" as string, event: undefined as { kind: string, id: string, status?: string, reason?: string | null, updatedAt?: string } | undefined },
}))

const catalog = enMessages.console.agentos.purchaseStatus as Record<string, unknown>
const translate = (key: string, params?: Record<string, unknown>) => {
    const value = key.split(".").reduce<unknown>((node, part) => node === null || typeof node !== "object" ? undefined : (node as Record<string, unknown>)[part], catalog)
    let text = typeof value === "string" ? value : key
    if (params !== undefined) for (const [name, replacement] of Object.entries(params)) text = text.replace(`{${name}}`, String(replacement))
    return text
}

type RailProbe = { label?: string, fact?: string, facts?: Array<{ label: string, value: string }>, checks?: Array<{ id: string, word: string, mark?: unknown }>, action?: { label: string }, actionCaption?: string, notice?: string, refusalText?: string, outcome?: { title: string, detail?: string }, secondaryLink?: { label: string } }
type PrimaryProbe = { label?: string, fact?: string, facts?: Array<{ label: string, value: string }>, operation?: { name: string, word: string, progressValue?: number }, action?: { label: string }, cadenceFacts?: Array<{ label: string, value: string }> }
type FlowProbeProps = {
    state: string
    props: { title?: string, subtitle?: string, badge?: { label: string, tone: string }, trail?: Array<{ id: string, label: string, isCurrent?: boolean }>, message?: string, description?: string, primary?: PrimaryProbe, rail?: RailProbe, escapeLink?: { label: string, href: string }, copy?: { renewalAutoAt: (date: string) => string, renewalManualAt: (date: string) => string, attemptFact: (attempt: number) => string, orderReports: (status: string) => string, invoiceReports: (status: string) => string, operationStatus: (status: string) => string, sourceLabel: (source: string) => string } }
    on?: { primary?: () => void, returnToList?: () => void }
}

type PathnameRequest = { readonly href: string }

vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ push: mocks.push, replace: mocks.push }),
    getPathname: ({ href }: PathnameRequest) => href,
}))
vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useFormatter: () => ({
        number: (value: number) => `money-${value}`,
        dateTime: (value: Date) => `t-${value.toISOString()}`,
    }),
    useTranslations: () => Object.assign(translate, { has: (key: string) => translate(key) !== key }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/hooks", () => ({
    useQueryWorkspaceCheckoutStatusSwr: () => ({
        data: mocks.status.data,
        error: mocks.status.error,
        isValidating: mocks.status.isValidating,
        mutate: mocks.status.mutate,
    }),
    useQueryWorkspaceCheckoutEntrySwr: (request: unknown, enabled: boolean) => {
        if (enabled) mocks.entry.lastRequest = request
        return { data: enabled ? mocks.entry.data : undefined, error: undefined, isValidating: false, mutate: vi.fn() }
    },
    useMutateRecoverWorkspacePurchaseSwr: () => ({ trigger: mocks.recover.trigger, isMutating: mocks.recover.isMutating }),
}))
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))
vi.mock("@nivo/ui", () => ({ nivoIconSource: (name: string) => () => name }))
vi.mock("./component", () => ({
    PurchaseStatusFlowBase: (props: FlowProbeProps) => (
        <div>
            <output data-testid="flow">{JSON.stringify({ state: props.state, title: props.props.title, subtitle: props.props.subtitle, badge: props.props.badge, trail: props.props.trail, message: props.props.message, description: props.props.description, primary: props.props.primary, rail: props.props.rail, escapeLink: props.props.escapeLink })}</output>
            <button data-testid="primary" onClick={props.on?.primary}>primary</button>
            <button data-testid="return" onClick={props.on?.returnToList}>return</button>
            {props.props.copy !== undefined && <output data-testid="copy-probes">{JSON.stringify([
                props.props.copy.renewalAutoAt("2026-10-01"),
                props.props.copy.renewalManualAt("2026-10-01"),
                props.props.copy.attemptFact(2),
                props.props.copy.orderReports("completed"),
                props.props.copy.invoiceReports("paid"),
                props.props.copy.operationStatus("future-state"),
                props.props.copy.sourceLabel("custom-ledger")
            ])}</output>}
        </div>
    ),
}))

import PurchaseStatusFlow from "./"

/* Fixtures mirror the backend's own facet vocabularies: payment-reconciliation attempt states,
   platform-billing-ledger settlement states, workspace-provisioning order states and readiness. */
const offer = { offerId: "offer-1", offerVersion: "v1", displayName: "Nivo Operations Workspace", includedOutcome: "Run operations", amount: "4800000", currency: "VND", billingCadence: "monthly", renewalMode: "manual", eligibility: "vn" }
const sourceFact = (state: string, reference: string | null = null, observedAt: string | null = null, source = "test-source") => ({ source, state, reference, observedAt })
const purchase = (overrides: Record<string, unknown> = {}) => ({
    purchaseId: "purchase-1",
    state: "payment-pending",
    offer,
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
const paidFacets = {
    state: "paid",
    payment: sourceFact("verified-success", "attempt-1", "2026-09-22T07:32:00.000Z", "payment-reconciliation"),
    billing: sourceFact("paid", "receipt-1", "2026-09-22T07:32:30.000Z", "platform-billing-ledger"),
}
const readyFacets = {
    state: "ready",
    payment: sourceFact("verified-success", "attempt-1", "2026-09-22T07:32:00.000Z", "payment-reconciliation"),
    billing: sourceFact("paid", "receipt-1", "2026-09-22T07:32:30.000Z", "platform-billing-ledger"),
    provisioning: { ...sourceFact("ready", "PRV-2026-0922-0418", "2026-09-22T07:34:00.000Z", "workspace-provisioning"), disposition: "ready", reason: null },
    readiness: sourceFact("ready", "workspace-1", "2026-09-22T07:34:30.000Z", "workspace-provisioning"),
}
const statusAnswer = (record: ReturnType<typeof purchase>) => ({ ok: true, data: { status: "status", purchaseId: record.purchaseId, purchase: record } })
const entryDestination = (workspaceId = "workspace-1") => ({ workspaceId, ownerId: "owner-1", routeName: "instance-management.workspace-shell", routeVersion: "1", context: {} })

const flow = () => screen.getByTestId("flow").textContent ?? ""
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
const provisioningOrder = (state: string, reference: string | null = "PRV-2026-0922-0418", reason: string | null = null) => ({ ...sourceFact(state, reference, "2026-09-22T07:34:00.000Z", "workspace-provisioning"), disposition: state, reason })
const refundEntry = (entryId = "entry-refund-1") => ({ entryId, purchaseId: "purchase-1", billingReceiptId: "receipt-1", kind: "refund", amount: "4800000", currency: "VND", linkedEntryId: "entry-charge-1", observationId: null, actorPrincipal: null, reason: null, paymentRail: null, providerTransactionRef: null, accountingCopyState: "posted", postedAt: "2026-09-22T07:40:00.000Z" })

describe("PurchaseStatusFlow", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        resetQueryCache()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
        mocks.realtime.event = undefined
        mocks.status.data = statusAnswer(purchase())
        mocks.status.error = undefined
        mocks.status.isValidating = false
        mocks.status.mutate.mockResolvedValue(undefined)
        mocks.entry.data = undefined
        mocks.entry.lastRequest = null
        mocks.recover.isMutating = false
        mocks.recover.trigger.mockResolvedValue({ ok: true, data: { status: "status", purchaseId: "purchase-1", purchase: purchase({ state: "paid", billing: sourceFact("paid", "receipt-1") }) } })
    })

    it("stands on loading while the status answer is unsettled", () => {
        mocks.status.data = undefined
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        expect(flow()).toContain('"state":"loading"')
    })

    it("keeps an unsettled payment as payment-pending with a check action that creates no charge", async () => {
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-pending"'))
        expect(screen.getByTestId("copy-probes").textContent).toContain("future-state")
        expect(screen.getByTestId("copy-probes").textContent).toContain("custom-ledger")
        expect(flow()).toContain("Payment is not confirmed")
        expect(flow()).toContain("Check payment status")
        expect(flow()).toContain("Provisioning remains locked until exact settlement is accepted")
        expect(flow()).toContain('"value":"purchase-1"')
        expect(flow()).toContain('"value":"money-4800000"')
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.status.mutate).toHaveBeenCalled())
        expect(mocks.recover.trigger).not.toHaveBeenCalled()
    })

    it("reports payment-outcome-unknown as payment-unknown and recovers with observed identities only", async () => {
        mocks.status.data = statusAnswer(purchase({
            state: "payment-outcome-unknown",
            payment: sourceFact("outcome-unknown", "provider-ref-1", "2026-09-22T07:31:00.000Z", "payment-reconciliation"),
            billing: sourceFact("pending", "receipt-1", "2026-09-22T07:31:30.000Z", "platform-billing-ledger"),
        }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-unknown"'))
        expect(flow()).toContain("Reconcile payment")
        expect(flow()).not.toContain('"state":"payment-failed"')
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.recover.trigger).toHaveBeenCalled())
        const request = mocks.recover.trigger.mock.calls[0][0] as { purchaseId: string, lastObserved: Record<string, string> }
        expect(request.purchaseId).toBe("purchase-1")
        /* payment.reference may be a provider reference or an attempt id; it is never forwarded. */
        expect(request.lastObserved).toEqual({ billingReceiptId: "receipt-1" })
        expect(request.lastObserved).not.toHaveProperty("paymentAttemptId")
        expect(request.lastObserved).not.toHaveProperty("providerReference")
        await waitFor(() => expect(flow()).toContain('"state":"paid"'))
    })

    it("keeps a fully refused status read as denied with the outage notice withheld", async () => {
        mocks.status.data = { ok: true, data: { status: "refused", code: "purchase-not-found-non-disclosing" } }
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"denied"'))
        expect(flow()).toContain("This purchase is not visible to the signed-in account.")
        expect(flow()).not.toContain("Nivo Operations Workspace")
        expect(flow()).not.toContain('"primary"')
        fireEvent.click(screen.getByTestId("return"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces")
    })

    it("separates a source outage from a refused outcome on the non-disclosing surface", async () => {
        mocks.status.data = { ok: false, reason: "transport refused" }
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"denied"'))
        expect(flow()).toContain("One source did not answer")
        expect(flow()).not.toContain("not visible to the signed-in account")
    })

    it("settles refused, failed and cancelled payment outcomes without a retry loop", async () => {
        for (const state of ["payment-refused", "payment-failed", "payment-cancelled"]) {
            cleanup()
            resetQueryCache()
            mocks.status.data = statusAnswer(purchase({ state, payment: sourceFact(state === "payment-cancelled" ? "cancelled" : "refused", "attempt-1") }))
            render(<PurchaseStatusFlow purchaseId="purchase-1" />)
            await waitFor(() => expect(flow()).toContain(`"state":"${state}"`))
            expect(flow()).toContain("Payment did not settle")
            expect(flow()).toContain("Change offer")
            expect(flow()).not.toContain("Check payment status")
            fireEvent.click(screen.getByTestId("primary"))
            expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
        }
    })

    it("stands a settled purchase on paid only from the canonical billing settlement", async () => {
        mocks.status.data = statusAnswer(purchase(paidFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"paid"'))
        expect(flow()).toContain("Payment settled")
        expect(flow()).toContain('"label":"Paid","tone":"success"')
        expect(flow()).toContain("the workspace is not ready yet")
        expect(flow()).toContain("View provisioning status")
        expect(flow()).not.toContain("Enter workspace")
        fireEvent.click(screen.getByTestId("primary"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/purchases/purchase-1/provisioning")
        await waitFor(() => expect(flow()).toContain('"state":"queued"'))
    })

    it("pins the provisioning surface when the declared route mounts it", async () => {
        mocks.status.data = statusAnswer(purchase(paidFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" surface="provisioning" />)
        await waitFor(() => expect(flow()).toContain('"state":"queued"'))
        expect(flow()).toContain("Confirmed facts")
        expect(flow()).toContain('"label":"Provisioning order admitted"')
    })

    it("reports provisioning with the purchase-bound order facts once an order runs", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain("Preparing Nivo Operations Workspace")
        expect(flow()).toContain('"label":"Provisioning","tone":"warning"')
        expect(flow()).toContain('"word":"running"')
        expect(flow()).toContain("Refresh status")
        expect(flow()).toContain("Entry unavailable until readiness is confirmed")
        expect(flow()).toContain('"fact":"PRV-2026-0922-0418"')
        expect(flow()).toContain('"label":"Purchase","value":"purchase-1"')
    })

    it("withholds the provisioning-order fact when no distinct order reference was published", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running", null) }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"label":"Provisioning order"')
        expect(flow()).not.toContain('"fact":"purchase-1"')
        expect(flow()).not.toContain('"fact":"workspace-1"')
        expect(flow()).toContain('"label":"Purchase","value":"purchase-1"')
    })

    it("keeps an unanswered provisioning source as provisioning-unknown, withholding entry", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("unavailable", null) }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-unknown"'))
        expect(flow()).toContain("Reconcile provisioning order")
        expect(flow()).toContain("One source did not answer")
        expect(flow()).not.toContain("Enter workspace")
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.status.mutate).toHaveBeenCalled())
    })

    it("shows a refused provisioning order without retry, re-provision, refund request or new order", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning-refused", provisioning: provisioningOrder("refused", "PRV-9", "policy refusal") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-refused"'))
        expect(flow()).not.toContain("Retry provisioning")
        expect(flow()).not.toContain("Renew by re-paying")
        expect(flow()).not.toContain("Enter workspace")
        expect(flow()).not.toContain('"action":{"label"')
    })

    it("offers the fenced retry on a retryable provisioning failure through the recover boundary", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("failed-retryable", "PRV-9", "capacity") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        expect(flow()).toContain("Provisioning needs attention")
        expect(flow()).toContain("Retry provisioning")
        expect(flow()).toContain("never a second workspace")
        expect(flow()).not.toContain("Enter workspace")
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.recover.trigger).toHaveBeenCalled())
        const request = mocks.recover.trigger.mock.calls[0][0] as { purchaseId: string, lastObserved: Record<string, string> }
        expect(request.lastObserved).toEqual({ billingReceiptId: "receipt-1", provisioningOrderId: "PRV-9" })
    })

    it("keeps the retry surface mounted and shows the refusal when recovery is refused", async () => {
        mocks.recover.trigger.mockResolvedValue({ ok: false, reason: "retry refused by owner policy" })
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("failed-retryable", "PRV-9") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain("retry refused by owner policy"))
        expect(flow()).toContain('"state":"provisioning-failed-retryable"')
    })

    it("shows the conflict notice when recovery reports an identity mismatch", async () => {
        mocks.recover.trigger.mockResolvedValue({ ok: true, data: { status: "conflict", code: "observed-identity-mismatch" } })
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("failed-retryable", "PRV-9") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain("do not match the confirmed record"))
        expect(flow()).toContain('"state":"provisioning-failed-retryable"')
    })

    it("renders a terminal provisioning failure with no retry and no entry", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("failed-terminal", "PRV-9", "terminated") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-terminal"'))
        expect(flow()).toContain("Provisioning ended")
        expect(flow()).toContain("no workspace entry is possible")
        expect(flow()).not.toContain("Retry provisioning")
        expect(flow()).not.toContain("Enter workspace")
    })

    it("renders refund-started beside its source state while reconciliation is open", async () => {
        mocks.status.data = statusAnswer(purchase({
            ...paidFacets,
            state: "provisioning-refused",
            provisioning: provisioningOrder("refused", "PRV-9", "policy refusal"),
            refund: { ...sourceFact("refund-started", "PRV-9", "2026-09-22T07:39:00.000Z", "workspace-provisioning"), projection: "observed", refundEntryId: null },
        }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"refund-started"'))
        expect(flow()).toContain("Refund started")
        expect(flow()).not.toContain('"label":"Refunded"')
    })

    it("renders refunded only when the linked refund ledger entry exists", async () => {
        mocks.status.data = statusAnswer(purchase({
            ...paidFacets,
            state: "provisioning-refused",
            provisioning: provisioningOrder("refused", "PRV-9", "policy refusal"),
            ledger: { source: "platform-billing-ledger", state: "observed", ledgerState: "refund-unresolved", entries: [refundEntry()], observedAt: "2026-09-22T07:40:00.000Z" },
            refund: { ...sourceFact("refunded", "PRV-9", "2026-09-22T07:40:00.000Z", "workspace-provisioning"), projection: "observed", refundEntryId: "entry-refund-1" },
        }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"refunded"'))
        expect(flow()).toContain('"label":"Refunded","tone":"success"')
        expect(flow()).toContain('"label":"Refund entry","value":"entry-refund-1"')
    })

    it("never renders refunded while the ledger is unavailable or the entry is unlinked", async () => {
        for (const ledger of [
            { source: "platform-billing-ledger", state: "unavailable", ledgerState: null, entries: [], observedAt: null },
            { source: "platform-billing-ledger", state: "observed", ledgerState: "paid", entries: [], observedAt: "2026-09-22T07:40:00.000Z" },
        ]) {
            cleanup()
            resetQueryCache()
            mocks.status.data = statusAnswer(purchase({
                ...paidFacets,
                state: "provisioning-refused",
                provisioning: provisioningOrder("refused", "PRV-9"),
                ledger,
                refund: { ...sourceFact("refunded", "PRV-9", "2026-09-22T07:40:00.000Z", "workspace-provisioning"), projection: "observed", refundEntryId: "entry-refund-1" },
            }))
            render(<PurchaseStatusFlow purchaseId="purchase-1" />)
            await waitFor(() => expect(flow()).toContain('"state":"refund-pending-reconciliation"'))
            expect(flow()).toContain("Refund awaiting reconciliation")
            expect(flow()).not.toContain('"label":"Refunded","tone":"success"')
        }
    })

    it("holds a service-eligibility hold without retry while preserving entry to a ready workspace", async () => {
        mocks.status.data = statusAnswer(purchase({
            ...readyFacets,
            serviceEligibility: {
                source: "workspace-provisioning",
                state: "held",
                reason: "expiry",
                heldSince: "2026-09-20T00:00:00.000Z",
                paidThrough: "2026-09-25T00:00:00.000Z",
                renewalAction: { operation: "start-checkout", offerId: "offer-1", offerVersion: "v2", amount: "4800000", currency: "VND" },
                renewalEvidence: "none",
                reference: "ent-1",
                observedAt: "2026-09-22T07:34:00.000Z",
            },
        }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"service-eligibility-hold"'))
        expect(flow()).toContain("On hold")
        expect(flow()).toContain("Paid period ended")
        expect(flow()).not.toContain("Retry provisioning")
        expect(flow()).toContain("Enter workspace")
        expect(flow()).toContain("Renew by re-paying the same offer")
    })

    it("offers renewal to the current owner through the checkout route when no workspace is ready", async () => {
        mocks.status.data = statusAnswer(purchase({
            ...paidFacets,
            state: "provisioning",
            provisioning: provisioningOrder("running"),
            serviceEligibility: {
                source: "workspace-provisioning",
                state: "held",
                reason: "non-payment",
                heldSince: "2026-09-20T00:00:00.000Z",
                paidThrough: null,
                renewalAction: { operation: "start-checkout", offerId: "offer-1", offerVersion: "v2", amount: "4800000", currency: "VND" },
                renewalEvidence: "pending",
                reference: "ent-1",
                observedAt: "2026-09-22T07:34:00.000Z",
            },
        }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"service-eligibility-hold"'))
        fireEvent.click(screen.getByTestId("primary"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new/checkout?offer=offer-1&offerVersion=v2&entitlement=ent-1")
        expect(mocks.recover.trigger).not.toHaveBeenCalled()
    })

    it("exposes workspace entry only through the entry boundary once readiness is confirmed", async () => {
        mocks.entry.data = { ok: true, data: { status: "entry", purchaseId: "purchase-1", workspaceId: "workspace-1", destination: entryDestination() } }
        mocks.status.data = statusAnswer(purchase(readyFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        expect(flow()).toContain("Enter workspace")
        expect(flow()).toContain('"escapeLink":{"label":"Return to workspace list"')
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1"))
        const request = mocks.entry.lastRequest as Record<string, unknown>
        expect(request).toEqual({ purchaseId: "purchase-1", workspaceId: "workspace-1", returnContext: { name: "workspace-dashboard", version: "1" } })
        expect(request).not.toHaveProperty("readinessObservationId")
    })

    it("keeps the ready surface mounted and shows the refusal when entry is refused", async () => {
        mocks.entry.data = { ok: true, data: { status: "refused", code: "workspace-not-ready", purchaseId: "purchase-1" } }
        mocks.status.data = statusAnswer(purchase(readyFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain("The workspace is not ready yet."))
        await waitFor(() => expect(flow()).toContain('"action":{"label":"Refresh status"'))
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/workspaces/workspace-1")
        expect(flow()).toContain('"state":"ready"')
    })

    it("refuses to enter when the registered destination names another workspace", async () => {
        mocks.entry.data = { ok: true, data: { status: "entry", purchaseId: "purchase-1", workspaceId: "workspace-9", destination: entryDestination("workspace-9") } }
        mocks.status.data = statusAnswer(purchase(readyFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain("do not match the confirmed record"))
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/workspaces/workspace-9")
    })

    it("re-settles the surface to the purchase's real state when entry answers not-ready", async () => {
        mocks.entry.data = { ok: true, data: { status: "not-ready", purchaseId: "purchase-1", purchase: purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running") }) } }
        mocks.status.data = statusAnswer(purchase(readyFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain("cannot be entered yet")
    })

    it("denies the surface when the status purchase names another identity", async () => {
        mocks.status.data = statusAnswer(purchase({ purchaseId: "purchase-9" }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"denied"'))
    })

    it("turns a realtime order event into a re-read of the same purchase", async () => {
        mocks.status.mutate.mockImplementation(async () => {
            mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running") }))
            return undefined
        })
        const view = render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-pending"'))
        mocks.realtime = { status: "event", event: { kind: "order", id: "purchase-1", status: "paid", updatedAt: "2026-09-22T07:36:00.000Z" } }
        view.rerender(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(mocks.status.mutate).toHaveBeenCalled())
        view.rerender(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
    })

    it("names the provisioning owner from the session token's claims", async () => {
        const claims = globalThis.btoa(JSON.stringify({ sub: "user-an-nguyen", name: "An Nguyen", preferred_username: "an.nguyen", email: "an.nguyen@northstar.test" }))
        mocks.session.state = { status: "signed-in", accessToken: `hdr.${claims}.sig` }
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"label":"Owner","value":"An Nguyen · an.nguyen@northstar.test"')
    })

    it("withholds the owner identity when the token carries no usable claims", async () => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running") }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"label":"Owner","value":"—"')
    })
    it("keeps unsupported checkout amounts readable and covers the cadence fallbacks", async () => {
        mocks.status.data = statusAnswer(purchase({ offer: { ...offer, amount: "not-a-number", currency: "VND" } }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-pending"'))
        expect(flow()).toContain('"value":"not-a-number VND"')
    })

    it.each([
        ["one-time", "One-time purchase"],
        ["once", "One-time purchase"],
        ["setup-recurring", "One-time setup, then monthly"],
        ["annual", "annual"],
    ])("preserves the published %s billing cadence", async (billingCadence, expected) => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running"), offer: { ...offer, billingCadence } }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" surface="provisioning" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain(`"label":"Billing cadence","value":"${expected}"`)
    })

    it.each([
        ["automatic", "Renews automatically"],
        ["auto", "Renews automatically"],
        ["explicit", "Manual re-authorization"],
        ["manual", "Manual re-authorization"],
        ["none", "No renewal — one-time purchase"],
        ["never", "No renewal — one-time purchase"],
        ["future-policy", "future-policy"],
    ])("preserves the published %s renewal mode", async (renewalMode, expected) => {
        mocks.status.data = statusAnswer(purchase({ ...paidFacets, state: "provisioning", provisioning: provisioningOrder("running"), offer: { ...offer, renewalMode } }))
        render(<PurchaseStatusFlow purchaseId="purchase-1" surface="provisioning" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain(`"label":"Renewal","value":"${expected}"`)
    })

    it.each([
        { status: "refused", code: "workspace-not-ready", purchaseId: "purchase-1" },
        { status: "unavailable", code: "entry-source-unavailable", purchaseId: "purchase-1" },
    ])("keeps the ready purchase mounted when entry returns %s", async (entry) => {
        mocks.entry.data = { ok: true, data: entry }
        mocks.status.data = statusAnswer(purchase(readyFacets))
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain(entry.status === "refused" ? "The workspace is not ready yet." : "entry-source-unavailable"))
        expect(flow()).toContain('"state":"ready"')
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/workspaces/workspace-1")
    })

    it("ignores a realtime event for a workspace other than the ready purchase workspace", async () => {
        mocks.status.data = statusAnswer(purchase(readyFacets))
        const view = render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        mocks.status.mutate.mockClear()
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace-9", status: "suspended" } }
        view.rerender(<PurchaseStatusFlow purchaseId="purchase-1" />)
        expect(mocks.status.mutate).not.toHaveBeenCalled()
        expect(flow()).toContain('"state":"ready"')
    })
})
