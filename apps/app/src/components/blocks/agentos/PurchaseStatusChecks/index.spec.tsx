import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { IconSource } from "@starci/grammar/common"
import { createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import { createPurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"
import type { PurchaseStatusFlowViewProps } from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusChecks } from "./index"

const copy = createPurchaseStatusCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.purchaseStatus",
        onError: (error) => {
            throw error
        },
    }),
    enMessages.console.provisioningFlows.connecting,
)
const mark: IconSource = () => null
const head = {
    copy,
    links: { workspaces: "/agentos/workspaces", offerSelection: "/agentos/workspaces/new" },
    trail: [],
    title: "Payment is not confirmed",
    subtitle: "Server verification is still in progress.",
}
const pendingView: PurchaseStatusFlowViewProps = {
    state: "payment-pending",
    props: {
        ...head,
        primary: {
            label: "Purchase facts",
            facts: [{ label: "Offer", value: "Operations workspace" }],
            timeline: [{ id: "read", title: "Status read", detail: "Owner-scoped snapshot", mark }],
        },
        rail: {
            label: "Current verification",
            checks: [
                {
                    id: "provider",
                    label: "Provider settlement",
                    word: "running",
                    tone: "warning",
                    mark,
                    detail: "Awaiting canonical confirmation.",
                },
            ],
            notice: "Provisioning remains locked until settlement is accepted.",
        },
    },
    on: {},
}

describe("PurchaseStatusChecks", () => {
    it("draws purchase facts and source checks as separate cards", () => {
        const html = renderToStaticMarkup(<PurchaseStatusChecks {...pendingView} />)

        expect(html).toContain("Purchase facts")
        expect(html).toContain("Operations workspace")
        expect(html).toContain("Current verification")
        expect(html).toContain("Provider settlement")
        expect(html).toContain("Awaiting canonical confirmation.")
        expect(html).toContain("Provisioning remains locked until settlement is accepted.")
    })

    it("keeps the denied surface free of purchase facts", () => {
        const denied: PurchaseStatusFlowViewProps = {
            state: "denied",
            props: {
                ...head,
                message: "This purchase is not visible.",
                description: "No purchase facts are disclosed.",
            },
            on: {},
        }
        const html = renderToStaticMarkup(<PurchaseStatusChecks {...denied} />)

        expect(html).toContain("This purchase is not visible.")
        expect(html).not.toContain("Operations workspace")
    })

    it("keeps the loading preview skeleton-only and busy-neutral", () => {
        const loading: PurchaseStatusFlowViewProps = { state: "loading", props: head }
        const html = renderToStaticMarkup(<PurchaseStatusChecks {...loading} />)

        expect(html).toContain("data-loading")
        expect(html).not.toContain("Provider settlement")
    })
})
