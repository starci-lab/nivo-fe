import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"

const mocks = vi.hoisted(() => {
    const api = {
        myAgentWorkspace: vi.fn(),
        myAgentWorkspaceControlCenter: vi.fn(),
        myCatalogOrders: vi.fn(),
        myInvoices: vi.fn(),
        issueAgentWorkspaceAppLaunch: vi.fn(),
    }
    return {
        api,
        retryProvision: vi.fn(),
        push: vi.fn(),
        replace: vi.fn(),
        followRedirect: vi.fn(),
        session: { state: { status: "signed-in", accessToken: "token" } },
        realtime: { status: "disconnected" as string, event: undefined as { kind: string, id: string, status?: string, reason?: string | null, updatedAt?: string } | undefined },
    }
})

const catalog = enMessages.console.agentos.purchaseStatus as Record<string, unknown>
const translate = (key: string, params?: Record<string, unknown>) => {
    const value = key.split(".").reduce<unknown>((node, part) => node === null || typeof node !== "object" ? undefined : (node as Record<string, unknown>)[part], catalog)
    let text = typeof value === "string" ? value : key
    if (params !== undefined) for (const [name, replacement] of Object.entries(params)) text = text.replace(`{${name}}`, String(replacement))
    return text
}

type RailProbe = { label?: string, fact?: string, facts?: Array<{ label: string, value: string }>, checks?: Array<{ id: string, word: string, mark?: unknown }>, action?: { label: string }, actionCaption?: string, notice?: string, refusalText?: string, outcome?: { title: string, detail?: string }, secondaryLink?: { label: string } }
type PrimaryProbe = { label?: string, fact?: string, operation?: { name: string, word: string, progressValue?: number }, action?: { label: string } }
type FlowProbeProps = {
    state: string
    props: { title?: string, subtitle?: string, badge?: { label: string, tone: string }, trail?: Array<{ id: string, label: string, isCurrent?: boolean }>, message?: string, description?: string, primary?: PrimaryProbe, rail?: RailProbe, escapeLink?: { label: string, href: string } }
    on?: { primary?: () => void, returnToList?: () => void }
}

type PathnameRequest = { readonly href: string }

vi.mock("@/i18n/navigation", () => ({
    useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
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
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("@/modules/api/workspace-controlplane", () => ({ retryWorkspaceProvisioningOrder: mocks.retryProvision }))
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))
vi.mock("@/modules/window/workspace-app-launch", () => ({
    safeWorkspaceAppRedirect: (url: string) => url.startsWith("https://") ? url : null,
    followWorkspaceAppRedirect: mocks.followRedirect,
}))
vi.mock("@nivo/ui", () => ({ nivoIconSource: (name: string) => () => name }))
vi.mock("./component", () => ({
    PurchaseStatusFlowBase: (props: FlowProbeProps) => (
        <div>
            <output data-testid="flow">{JSON.stringify({ state: props.state, title: props.props.title, subtitle: props.props.subtitle, badge: props.props.badge, trail: props.props.trail, message: props.props.message, description: props.props.description, primary: props.props.primary, rail: props.props.rail, escapeLink: props.props.escapeLink })}</output>
            <button data-testid="primary" onClick={props.on?.primary}>primary</button>
            <button data-testid="return" onClick={props.on?.returnToList}>return</button>
        </div>
    ),
}))

import PurchaseStatusFlow from "./"

const order = { id: "purchase-1", status: "pending_payment", catalogItem: { id: "item-1", name: "Nivo Operations Workspace" }, catalogTier: { id: "tier-1", name: "Team" } }
const invoice = { id: "invoice-1", amountVnd: 4800000, status: "unpaid", dueAt: "2026-09-22T07:30:00.000Z", paidAt: null, catalogOrder: { id: "purchase-1", catalogItem: { id: "item-1", name: "Nivo Operations Workspace" }, catalogTier: { id: "tier-1", name: "Team" } } }
const workspace = { id: "workspace-1", name: "ops-room", status: "provisioning", catalogOrder: { id: "purchase-1" } }

const flow = () => screen.getByTestId("flow").textContent ?? ""
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
const recovery = (attemptCount: number) => ({
    state: "running", phase: "configure", attemptCount,
    lastAttemptAt: "2026-09-22T07:34:00.000Z", nextAttemptAt: null, failureCode: null,
    targetGeneration: "gen-2", requiredSyncRevision: "rev-2", appliedSyncRevision: "rev-1",
    syncCompletedAt: null, observedAt: "2026-09-22T07:35:00.000Z", recoverableDataScope: "core_retained",
})
const controlCenter = (recoveryView: unknown = null) => ({
    ok: true,
    data: {
        workspace: { id: "workspace-1", name: "ops-room", status: "provisioning", externalWorkspaceRef: null },
        instance: null, apps: [], runtime: null, recovery: recoveryView,
    },
})
const snapshot = (overrides: { orders?: unknown[], invoices?: unknown[], workspaces?: unknown[], ordersResult?: unknown, invoicesResult?: unknown, workspacesResult?: unknown, controlCenterResult?: unknown } = {}) => {
    mocks.api.myCatalogOrders.mockResolvedValue(overrides.ordersResult ?? { ok: true, data: overrides.orders ?? [order] })
    mocks.api.myInvoices.mockResolvedValue(overrides.invoicesResult ?? { ok: true, data: overrides.invoices ?? [invoice] })
    mocks.api.myAgentWorkspace.mockResolvedValue(overrides.workspacesResult ?? { ok: true, data: overrides.workspaces ?? [] })
    mocks.api.myAgentWorkspaceControlCenter.mockResolvedValue(overrides.controlCenterResult ?? controlCenter())
}
const paidInvoice = { ...invoice, status: "paid", paidAt: "2026-09-22T07:32:00.000Z" }
const paidOrder = { ...order, status: "in_progress" }

describe("PurchaseStatusFlow connected flow", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        resetQueryCache()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
        mocks.realtime.event = undefined
        mocks.api.issueAgentWorkspaceAppLaunch.mockResolvedValue({ ok: true, data: { launchId: "launch", redirectUrl: "https://pod.example.test/launch", expiresAt: "2030-01-01T00:00:00Z" } })
        mocks.retryProvision.mockResolvedValue({ ok: true, data: { ...workspace, status: "provisioning" } })
        snapshot()
    })

    it("keeps an unpaid invoice as payment-pending with a check action that creates no charge", async () => {
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-pending"'))
        expect(flow()).toContain("Payment is not confirmed")
        expect(flow()).toContain('"value":"invoice-1"')
        expect(flow()).toContain("Check payment status")
        expect(flow()).not.toContain('"state":"ready"')
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.api.myInvoices).toHaveBeenCalled())
    })

    it("reports payment-unknown when the invoice source is refused, never a verdict", async () => {
        snapshot({ invoicesResult: { ok: false, reason: "invoice source refused", code: "INVOICES_REFUSED" } })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-unknown"'))
        expect(flow()).toContain("Reconcile payment")
        expect(flow()).not.toContain('"state":"payment-failed"')
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [paidInvoice] })
        mocks.api.myCatalogOrders.mockResolvedValue({ ok: true, data: [paidOrder] })
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [workspace] })
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
    })

    it("keeps a fully refused status read as payment-unknown, not a terminal failure", async () => {
        snapshot({
            ordersResult: { ok: false, reason: "all sources refused" },
            invoicesResult: { ok: false, reason: "all sources refused" },
            workspacesResult: { ok: false, reason: "all sources refused" },
        })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-unknown"'))
        expect(flow()).toContain("all sources refused")
    })

    it("denies entry without disclosure when the purchase is not visible", async () => {
        snapshot({ orders: [], invoices: [], workspaces: [] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"denied"'))
        expect(flow()).toContain("This purchase is not visible to the signed-in account.")
        expect(flow()).not.toContain("invoice-1")
        expect(flow()).not.toContain("Nivo Operations Workspace")
        fireEvent.click(screen.getByTestId("return"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces")
    })

    it("settles a cancelled order into payment-failed with no looping retry", async () => {
        snapshot({ orders: [{ ...order, status: "cancelled" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-failed"'))
        expect(flow()).toContain("Change offer")
        expect(flow()).not.toContain("Check payment status")
        fireEvent.click(screen.getByTestId("primary"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
    })

    it("settles a cancelled invoice into payment-failed", async () => {
        snapshot({ invoices: [{ ...invoice, status: "cancelled" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-failed"'))
    })

    it("stands a settled purchase with no admitted workspace on its own paid state", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"paid"'))
        expect(flow()).toContain("Payment settled")
        expect(flow()).toContain('"label":"Paid","tone":"success"')
        expect(flow()).toContain("the workspace is not ready yet")
        expect(flow()).toContain("View provisioning status")
        expect(flow()).toContain("still being admitted")
        expect(flow()).not.toContain("Enter workspace")
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/purchases/purchase-1/provisioning")
        expect(flow()).toContain("Admit provisioning order")
    })

    it("pins the provisioning surface when the declared route mounts it", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" surface="provisioning" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain("Confirmed facts")
    })

    it("reports provisioning with the purchase-bound order facts once payment is verified", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain("Preparing Nivo Operations Workspace")
        expect(flow()).toContain('"label":"Provisioning","tone":"warning"')
        expect(flow()).toContain("Payment verified")
        expect(flow()).toContain('"word":"running"')
        expect(flow()).toContain("Refresh status")
        expect(flow()).toContain("Entry unavailable until readiness is confirmed")
        expect(flow()).toContain('{"id":"provisioning","label":"Provisioning","isCurrent":true}')
    })

    it("renders the cadence and renewal band from the order's billing seam", async () => {
        snapshot({
            orders: [{ ...paidOrder, renewsAt: "2026-10-22T07:32:00.000Z", autoRenew: false, catalogItem: { id: "item-1", name: "Nivo Operations Workspace", billingModel: "recurring" } }],
            invoices: [paidInvoice],
            workspaces: [workspace],
        })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"cadenceFacts":[{"label":"Billing cadence","value":"Monthly billing cycle"},{"label":"Renewal","value":"Manual re-authorization by t-2026-10-22T07:32:00.000Z"}]')
    })

    it("withholds cadence and renewal values the order seam does not publish", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"cadenceFacts":[{"label":"Billing cadence","value":"—"},{"label":"Renewal","value":"—"}]')
    })

    it("renders the owner identity row and withholds the unbound attempt value", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"facts":[{"label":"Owner","value":"—"},{"label":"Attempt","value":"—"}]')
        expect(flow()).not.toContain('"secondaryLink"')
        expect(flow()).toContain('"escapeLink":{"label":"Return to workspace list","href":"/agentos/workspaces"}')
    })

    it("binds the fenced attempt from the bound workspace's recovery read", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace], controlCenterResult: controlCenter(recovery(3)) })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        await waitFor(() => expect(flow()).toContain('"facts":[{"label":"Owner","value":"—"},{"label":"Attempt","value":"3"}]'))
        expect(flow()).toContain('"fact":"Attempt 3"')
        expect(mocks.api.myAgentWorkspaceControlCenter).toHaveBeenCalledWith("workspace-1")
    })

    it("keeps the attempt withheld when the bound workspace carries no recovery row", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        await waitFor(() => expect(mocks.api.myAgentWorkspaceControlCenter).toHaveBeenCalledWith("workspace-1"))
        expect(flow()).toContain('"label":"Attempt","value":"—"')
        expect(flow()).not.toContain('"fact":"Attempt')
    })

    it("keeps the attempt withheld when the control-center read is refused", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace], controlCenterResult: { ok: false, reason: "control center refused", code: "CONTROL_CENTER_REFUSED" } })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        await waitFor(() => expect(mocks.api.myAgentWorkspaceControlCenter).toHaveBeenCalledWith("workspace-1"))
        expect(flow()).toContain('"label":"Attempt","value":"—"')
    })

    it("never issues the control-center read before a workspace row is bound", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" surface="provisioning" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(mocks.api.myAgentWorkspaceControlCenter).not.toHaveBeenCalled()
    })

    it("names the provisioning owner from the session token's claims", async () => {
        const claims = globalThis.btoa(JSON.stringify({ sub: "user-an-nguyen", name: "An Nguyen", preferred_username: "an.nguyen", email: "an.nguyen@northstar.test" }))
        mocks.session.state = { status: "signed-in", accessToken: `hdr.${claims}.sig` }
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        expect(flow()).toContain('"label":"Owner","value":"An Nguyen · an.nguyen@northstar.test"')
    })

    it("keeps the escape action page-level on the failed provisioning state", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [{ ...workspace, status: "failed" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        expect(flow()).toContain('"escapeLink"')
        expect(flow()).not.toContain('"secondaryLink"')
    })

    it("keeps the escape action page-level on the unknown provisioning state", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspacesResult: { ok: false, reason: "workspace read refused", code: "WORKSPACES_REFUSED" } })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-unknown"'))
        expect(flow()).toContain('"escapeLink"')
        expect(flow()).not.toContain('"secondaryLink"')
    })

    it("keeps a refused workspace read as provisioning-unknown, withholding entry", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspacesResult: { ok: false, reason: "workspace read refused", code: "WORKSPACES_REFUSED" } })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-unknown"'))
        expect(flow()).toContain("Reconcile provisioning order")
        expect(flow()).not.toContain("Enter workspace")
    })

    it("offers the fenced workspace retry on a failed workspace and re-drives the same order", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [{ ...workspace, status: "failed" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        expect(flow()).toContain("Provisioning needs attention")
        expect(flow()).toContain("Retry provisioning")
        expect(flow()).toContain("never a second workspace")
        expect(flow()).not.toContain("Enter workspace")
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [workspace] })
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.retryProvision).toHaveBeenCalledWith("workspace-1"))
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
    })

    it("renders a suspended workspace as terminal failure with no retry and no entry", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [{ ...workspace, status: "suspended" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-terminal"'))
        expect(flow()).toContain("Provisioning ended")
        expect(flow()).toContain("no workspace entry is possible")
        expect(flow()).not.toContain("Retry provisioning")
        expect(flow()).not.toContain("Enter workspace")
    })

    it("keeps the retry surface mounted and shows the refusal when the fenced retry is refused", async () => {
        mocks.retryProvision.mockResolvedValue({ ok: false, reason: "retry refused by owner policy" })
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [{ ...workspace, status: "failed" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain("retry refused by owner policy"))
        expect(flow()).toContain('"state":"provisioning-failed-retryable"')
    })

    it("exposes workspace entry only once readiness is authoritatively confirmed", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [{ ...workspace, status: "active" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        expect(flow()).toContain("Enter workspace")
        expect(flow()).toContain('"escapeLink":{"label":"Return to workspace list"')
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(mocks.followRedirect).toHaveBeenCalledWith("https://pod.example.test/launch"))
        expect(mocks.api.issueAgentWorkspaceAppLaunch).toHaveBeenCalledWith("workspace-1")
    })

    it("keeps the ready surface mounted and shows the refusal when entry is refused", async () => {
        mocks.api.issueAgentWorkspaceAppLaunch.mockResolvedValue({ ok: false, reason: "workspace not launchable" })
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [{ ...workspace, status: "active" }] })
        render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("primary"))
        await waitFor(() => expect(flow()).toContain("workspace not launchable"))
        await waitFor(() => expect(flow()).toContain('"action":{"label":"Refresh status"'))
        expect(mocks.followRedirect).not.toHaveBeenCalled()
        expect(flow()).toContain('"state":"ready"')
    })

    it("turns workspace realtime events into ready and retryable-failed states", async () => {
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        const view = render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace-1", status: "active", reason: null, updatedAt: "2026-09-22T07:36:00.000Z" } }
        view.rerender(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace-1", status: "failed", reason: "broken", updatedAt: "2026-09-22T07:37:00.000Z" } }
        view.rerender(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning-failed-retryable"'))
        expect(flow()).toContain("broken")
    })

    it("reconciles the original order when an order event arrives", async () => {
        snapshot()
        const view = render(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"payment-pending"'))
        snapshot({ orders: [paidOrder], invoices: [paidInvoice], workspaces: [workspace] })
        mocks.realtime = { status: "event", event: { kind: "order", id: "purchase-1", status: "in_progress" } }
        view.rerender(<PurchaseStatusFlow purchaseId="purchase-1" />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning"'))
    })
})
