import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { IconSource } from "@starci/grammar/common"
import { PurchaseStatusFlowBase, type PurchaseStatusCheck, type PurchaseStatusFlowViewProps, type PurchaseStatusHeadProps } from "./component"
import type { PurchaseStatusCopy } from "./copy"
import enMessages from "../../../../messages/en.json"

/** The view contract resolves copy through the locale catalogs; tests bind the real English strings. */
const copy = enMessages.console.agentos.purchaseStatus as unknown as PurchaseStatusCopy
/** A no-op mark glyph; the view only forwards it into IconTile. */
const mark = (() => null) as unknown as IconSource

const links = { workspaces: "/agentos/workspaces", offerSelection: "/agentos/workspaces/new" }
const trail = [
    { id: "workspaces", label: "Workspaces", href: "/agentos/workspaces" },
    { id: "purchases", label: "Purchases" },
    { id: "purchase", label: "NVP-2026-0922-1847", isCurrent: true },
]
const head: PurchaseStatusHeadProps = {
    copy,
    links,
    trail,
    title: "Payment is not confirmed",
    subtitle: "Server verification is still in progress.",
    badge: { label: "Pending reconciliation", tone: "warning" },
}
const paymentChecks: ReadonlyArray<PurchaseStatusCheck> = [
    { id: "provider", label: "Provider settlement", word: "running", tone: "warning", mark, detail: "Awaiting canonical confirmation." },
    { id: "amount", label: "Amount and currency — 4,800,000 VND", word: "queued", tone: "neutral", mark, detail: "This check runs after confirmation arrives." },
    { id: "canonical", label: "Canonical paid result", word: "queued", tone: "neutral", mark, detail: "Final confirmation is still pending." },
    { id: "admission", label: "Provisioning admission", word: "queued", tone: "neutral", mark, detail: "Locked until exact settlement is accepted." },
]
const paymentView: PurchaseStatusFlowViewProps = {
    state: "payment-pending",
    props: {
        ...head,
        primary: {
            label: "Purchase facts",
            fact: "NVP-2026-0922-1847",
            banner: ["Nivo Operations Workspace", "4,800,000 VND", "Team"],
            facts: [
                { label: "Offer", value: "Nivo Operations Workspace" },
                { label: "Purchase reference", value: "NVP-2026-0922-1847" },
                { label: "Payment attempt", value: "PAY-4M7K2" },
                { label: "Payment status", value: "unpaid" },
            ],
            timeline: [
                { id: "order", title: "Purchase order observed", detail: "Order reports pending_payment", mark },
                { id: "read", title: "Status read", detail: "Owner-scoped snapshot", at: "14:12", mark },
            ],
        },
        rail: {
            label: "Current verification",
            latestCheck: "Latest check · 14:12",
            checks: paymentChecks,
            notice: "Provisioning remains locked until exact settlement is accepted.",
            action: { label: "Check payment status" },
            actionCaption: "Rechecks PAY-4M7K2 only — no new charge.",
            secondaryLink: { label: "Return to workspace list", href: "/agentos/workspaces" },
        },
    },
    on: { primary: vi.fn() },
}
const provisioningView: PurchaseStatusFlowViewProps = {
    state: "provisioning",
    props: {
        ...head,
        title: "Preparing Nivo Operations Workspace",
        badge: { label: "Provisioning", tone: "warning" },
        primary: {
            label: "Provisioning order",
            fact: "ws-1",
            facts: [
                { label: "Offer", value: "Nivo Operations Workspace" },
                { label: "Purchase", value: "NVP-2026-0922-1847" },
                { label: "Workspace", value: "ws-1" },
            ],
            cadenceFacts: [
                { label: "Billing cadence", value: "Monthly billing cycle" },
                { label: "Renewal", value: "Manual re-authorization by Sep 22, 2027" },
            ],
            operation: {
                heading: "Current operation",
                name: "Configure workspace",
                word: "running",
                tone: "warning",
                progressLabel: "Configure workspace",
                progressValue: 62,
                started: "Started 14:34 · 2m elapsed",
                lastObservation: "Last observation: runtime configuration accepted at 14:35",
            },
            footnote: "Order NVP-2026-0922-1847 is purchase-bound and safe to reconcile. A refresh never creates a second workspace.",
            action: { label: "Refresh status" },
        },
        rail: {
            label: "Confirmed facts",
            fact: "Attempt 1",
            checks: [
                { id: "payment", label: "Payment verified", word: "done", tone: "success", mark, at: "14:32" },
                { id: "entitlement", label: "Entitlement reserved", word: "done", tone: "success", mark, at: "14:33" },
                { id: "configure", label: "Configure workspace", word: "running", tone: "warning", mark, at: "14:34" },
                { id: "readiness", label: "Readiness check", word: "queued", tone: "neutral", mark, detail: "Waiting for configuration" },
            ],
            facts: [
                { label: "Owner", value: "An Nguyen · an.nguyen@northstar.test" },
                { label: "Attempt", value: "1" },
            ],
            outcome: { title: "Workspace outcome: Nivo Operations Workspace", detail: "Entry unavailable until readiness is confirmed." },
        },
        escapeLink: { label: "Return to workspace list", href: "/agentos/workspaces" },
    },
    on: { primary: vi.fn() },
}

describe("PurchaseStatusFlowBase", () => {
    it("draws the payment-pending surface with purchase facts and a verification rail", () => {
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase {...paymentView} />)
        expect(html).toContain("Payment is not confirmed")
        expect(html).toContain("Pending reconciliation")
        expect(html).toContain("Purchase facts")
        expect(html).toContain("Nivo Operations Workspace")
        expect(html).toContain("4,800,000 VND")
        expect(html).toContain("PAY-4M7K2")
        expect(html).toContain("Current verification")
        expect(html).toContain("Latest check · 14:12")
        expect(html).toContain("Canonical paid result")
        expect(html).toContain("Provisioning remains locked until exact settlement is accepted.")
        expect(html).toContain("Rechecks PAY-4M7K2 only — no new charge.")
        expect(html).toContain("Check payment status")
        expect(html).toContain("Return to workspace list")
        expect(html).not.toContain("aria-busy")
    })

    it("pairs every check word with its semantic mark plate", () => {
        const { container } = render(<PurchaseStatusFlowBase {...paymentView} />)
        const tiles = container.querySelectorAll("[class*=iconTile], [class*=tile]")
        expect(tiles.length).toBeGreaterThanOrEqual(paymentChecks.length)
    })

    it("wires the check action to the owner callback", () => {
        const primary = vi.fn()
        render(<PurchaseStatusFlowBase {...paymentView} on={{ primary }} />)
        fireEvent.click(screen.getByRole("button", { name: "Check payment status" }))
        expect(primary).toHaveBeenCalledOnce()
    })

    it("draws the provisioning surface with the running operation and confirmed facts", () => {
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase {...provisioningView} />)
        expect(html).toContain("Preparing Nivo Operations Workspace")
        expect(html).toContain("Provisioning order")
        expect(html).toContain("Billing cadence")
        expect(html).toContain("Monthly billing cycle")
        expect(html).toContain("Manual re-authorization by Sep 22, 2027")
        expect(html).toContain("Configure workspace")
        expect(html).toContain("running")
        expect(html).toContain("62")
        expect(html).toContain("Payment verified")
        expect(html).toContain("Readiness check")
        expect(html).toContain("Entry unavailable until readiness is confirmed.")
        expect(html).toContain("Refresh status")
        expect(html).toContain("Attempt 1")
        expect(html).toContain("An Nguyen · an.nguyen@northstar.test")
    })

    it("keeps the provisioning escape action page-level below the rail card", () => {
        const { container } = render(<PurchaseStatusFlowBase {...provisioningView} />)
        const link = screen.getByRole("link", { name: "Return to workspace list" })
        const surfaces = container.querySelectorAll("[data-grammar-surface-card]")
        for (const surface of surfaces) expect(surface.contains(link)).toBe(false)
        expect(surfaces.length).toBeGreaterThanOrEqual(2)
    })

    it("keeps ready entry bound to the issued grant, not a route", () => {
        const enter = vi.fn()
        const readyView: PurchaseStatusFlowViewProps = {
            state: "ready",
            props: {
                ...provisioningView.props,
                title: "Workspace is ready",
                badge: { label: "Ready", tone: "success" },
                rail: {
                    ...provisioningView.props.rail,
                    action: { label: "Enter workspace" },
                    outcome: { title: "Workspace outcome: ops-room", detail: "Entry confirmed for the bound workspace." },
                },
                escapeLink: { label: "Return to workspace list", href: "/agentos/workspaces" },
            },
            on: { primary: enter },
        }
        render(<PurchaseStatusFlowBase {...readyView} />)
        fireEvent.click(screen.getByRole("button", { name: "Enter workspace" }))
        expect(enter).toHaveBeenCalledOnce()
        expect(screen.getByRole("link", { name: "Return to workspace list" })).toBeTruthy()
    })

    it("announces an entry refusal inside the ready rail without losing the state", () => {
        const refused: PurchaseStatusFlowViewProps = {
            state: "ready",
            props: {
                ...provisioningView.props,
                rail: { ...provisioningView.props.rail, action: { label: "Enter workspace" }, refusalText: "workspace not launchable" },
            },
            on: { primary: vi.fn() },
        }
        render(<PurchaseStatusFlowBase {...refused} />)
        expect(screen.getByRole("status")).toHaveTextContent("workspace not launchable")
    })

    it("keeps the loading treatment skeleton-only and busy", () => {
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase state="loading" props={head} />)
        expect(html).toContain('aria-busy="true"')
        expect(html).toContain("data-loading")
        expect(html).not.toContain("Check payment status")
    })

    it("previews the resolved surface anatomy on the loading cards", () => {
        const payment = renderToStaticMarkup(<PurchaseStatusFlowBase state="loading" props={head} />)
        expect(payment).toContain("Purchase facts")
        expect(payment).toContain("Current verification")
        const provisioning = renderToStaticMarkup(<PurchaseStatusFlowBase state="loading" props={{ ...head, surface: "provisioning" }} />)
        expect(provisioning).toContain("Provisioning order")
        expect(provisioning).toContain("Confirmed facts")
        expect(provisioning).toContain('aria-busy="true"')
    })

    it("discloses no purchase facts on the denied empty notice", () => {
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase state="denied" props={{ ...head, title: "Purchase is not available", message: "This purchase is not visible to the signed-in account.", description: "No purchase, payment or workspace facts are disclosed." }} on={{ returnToList: vi.fn() }} />)
        expect(html).toContain("Purchase is not available")
        expect(html).toContain("This purchase is not visible to the signed-in account.")
        expect(html).not.toContain("PAY-4M7K2")
        expect(html).not.toContain("Nivo Operations Workspace")
    })

    it("binds the denied notice action to the owner return", () => {
        const returnToList = vi.fn()
        render(<PurchaseStatusFlowBase state="denied" props={{ ...head, title: "Purchase is not available", message: "This purchase is not visible to the signed-in account." }} on={{ returnToList }} />)
        fireEvent.click(screen.getByRole("button", { name: "Return to workspace list" }))
        expect(returnToList).toHaveBeenCalledOnce()
    })

    it("marks unknown checks with their own word instead of a verdict", () => {
        const unknown: PurchaseStatusFlowViewProps = {
            state: "payment-unknown",
            props: {
                ...paymentView.props,
                rail: {
                    ...paymentView.props.rail,
                    checks: [{ id: "provider", label: "Provider settlement", word: "unknown", tone: "warning", mark, detail: "This source could not be read." }],
                },
            },
            on: { primary: vi.fn() },
        }
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase {...unknown} />)
        expect(html).toContain("unknown")
        expect(html).toContain("This source could not be read.")
        expect(html).not.toContain('"state":"paid"')
    })

    it("keeps optional timeline, operation, outcome, badge and action rows absent", () => {
        const sparse: PurchaseStatusFlowViewProps = {
            state: "provisioning",
            props: {
                ...head,
                badge: undefined,
                primary: {
                    label: "Provisioning order",
                    facts: [],
                    timeline: [{ id: "order", title: "Purchase order observed", mark }],
                    operation: {
                        heading: "Current operation",
                        name: "Admit order",
                        word: "queued",
                        tone: "neutral",
                        progressLabel: "Admit order",
                        progressValue: 0,
                    },
                },
                rail: {
                    label: "Confirmed facts",
                    checks: [],
                    outcome: { title: "Workspace outcome" },
                },
            },
            on: {},
        }
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase {...sparse} />)
        expect(html).toContain("Purchase order observed")
        expect(html).toContain("Admit order")
        expect(html).toContain("Workspace outcome")
        expect(html).not.toContain("Pending reconciliation")
    })

    it("keeps a refusal or secondary band without a primary rail action", () => {
        const withoutPrimaryAction: PurchaseStatusFlowViewProps = {
            state: "ready",
            props: {
                ...provisioningView.props,
                rail: {
                    label: "Confirmed facts",
                    checks: [],
                    refusalText: "workspace not launchable",
                    secondaryLink: { label: "Return to workspace list", href: "/agentos/workspaces" }
                },
            },
            on: {},
        }
        const html = renderToStaticMarkup(<PurchaseStatusFlowBase {...withoutPrimaryAction} />)
        expect(html).toContain("workspace not launchable")
        expect(html).toContain("Return to workspace list")
        expect(html).not.toContain("Enter workspace")
    })
})
