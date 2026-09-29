import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { createPurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"
import type { PurchaseStatusHeadProps } from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusHeader } from "./index"

const copy = createPurchaseStatusCopy({ text: (key) => key, has: () => false })
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

        expect(html).toContain('aria-label="path"')
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
