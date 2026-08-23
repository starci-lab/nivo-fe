import { describe, expect, it } from "vitest"
import { CONTRACTS } from "./index"

describe("console operations contracts", () => {
    it("admits the shallow path without requiring it from the sibling Apps dashboard", () => {
        expect(CONTRACTS["console-primary-aside-page"].children.path).toEqual({ leaf: "breadcrumbs", optional: true })
    })

    it("keeps wallet facts primary while admitting a top-up action", () => {
        expect(CONTRACTS["wallet-summary"].children).toMatchObject({
            facts: { contract: "labelled-fact-stack" },
            action: { leaf: "button", optional: true },
        })
    })

    it("lets a single AgentOS capability use the whole status grid", () => {
        expect(CONTRACTS["status-action-card-grid"].classes).toContain("sm:[&>*:only-child]:col-span-2")
    })

    it("keeps AgentOS route measures inside the console main landmark and admits an outline bridge", () => {
        expect("host" in CONTRACTS["agentos-route-page"]).toBe(false)
        expect(CONTRACTS["agentos-route-page"].children.sectionHeading).toEqual({ leaf: "heading", optional: true })
        expect(CONTRACTS["workspace-ai-knowledge-stack"].children.heading).toEqual({ leaf: "heading" })
    })

    it("keeps the signal strip compact and gives its four heterogeneous peers semantic icon tiles", () => {
        expect(CONTRACTS["account-signal-grid"].children.artwork).toEqual({ leaf: "nivo-unicorn-artwork" })
        expect(CONTRACTS["account-signal-grid"].classes).toEqual(expect.arrayContaining([
            "grid-cols-2",
            "lg:grid-cols-4",
            "[&>*:first-child]:col-span-2",
            "lg:[&>*:first-child]:col-span-4",
        ]))
        expect(CONTRACTS["account-signal-heading"].children.mark).toEqual({
            leaf: "icon-tile",
            props: { size: "sm", tone: "accent" },
        })
        expect(CONTRACTS["account-signal-card"].classes).toContain("p-4")
        expect(CONTRACTS["account-signal-card"].classes).not.toContain("p-6")
        expect(CONTRACTS["account-signal-card"].children.value).toEqual({ leaf: "text", props: { size: "sm" } })
    })
})
