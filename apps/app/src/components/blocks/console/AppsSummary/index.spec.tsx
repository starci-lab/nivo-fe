import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppsSummaryBase } from "./component"

describe("AppsSummary", () => {
    it("draws owned application identity, lifecycle, and action without a total", () => {
        const html = renderToStaticMarkup(<AppsSummaryBase label="Apps" state={{ phase: "populated", items: [{
            id: "app-1", name: "Store", detail: "store.example", statusLabel: "Ready", statusTone: "success", actionLabel: "Open",
        }] }} onOpenApp={vi.fn()} />)
        expect(html).toContain("Store")
        expect(html).toContain("store.example")
        expect(html).toContain("Ready")
        expect(html).not.toContain("total")
    })

    it("keeps a forbidden answer local to the section", () => {
        const html = renderToStaticMarkup(<AppsSummaryBase label="Apps" state={{ phase: "forbidden", message: "Access denied" }} onOpenApp={vi.fn()} />)
        expect(html).toContain("Access denied")
    })
})
