import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import { createPurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"
import type { PurchaseStatusHeadProps } from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusHeader } from "./index"

const copy = createPurchaseStatusCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.purchaseStatus",
        onError: (error) => {
            throw error
        },
    }),
)
const head: PurchaseStatusHeadProps = {
    copy,
    links: { workspaces: "/agentos/workspaces", offerSelection: "/agentos/workspaces/new" },
    trail: [
        { id: "workspaces", label: "Workspaces", href: "/agentos/workspaces" },
        { id: "purchase", label: "purchase-1", isCurrent: true },
    ],
    title: "Payment is not confirmed",
    subtitle: "Server verification is still in progress.",
    badge: { label: "Pending reconciliation", tone: "warning" },
}

describe("PurchaseStatusHeader", () => {
    it("draws the breadcrumb, heading, subtitle and phase badge", () => {
        const html = renderToStaticMarkup(<PurchaseStatusHeader head={head} />)

        expect(html).toContain('aria-label="Purchase path"')
        expect(html).toContain("Workspaces")
        expect(html).toContain("Payment is not confirmed")
        expect(html).toContain("Server verification is still in progress.")
        expect(html).toContain("Pending reconciliation")
    })

    it("reserves the resolved provisioning title rank in the loading preview", () => {
        const html = renderToStaticMarkup(<PurchaseStatusHeader head={head} reserveResolvedTitle />)

        expect(html).toContain("max-[540px]:min-h-[49px]")
    })
})
