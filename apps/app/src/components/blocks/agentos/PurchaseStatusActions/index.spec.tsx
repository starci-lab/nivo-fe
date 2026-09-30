import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type {
    PurchaseStatusActions as PurchaseStatusActionCallbacks,
    PurchaseStatusRail,
} from "@/modules/agentos/purchase-status/view-model"
import { PurchaseStatusActions } from "./index"

describe("PurchaseStatusActions", () => {
    it("binds the primary action to the connected owner callback", async () => {
        const primary = vi.fn()
        const on: PurchaseStatusActionCallbacks = { primary }
        const { container } = render(<PurchaseStatusActions kind="primary" action={{ label: "Check payment status" }} on={on} />)

        fireEvent.click(screen.getByRole("button", { name: "Check payment status" }))

        expect(primary).toHaveBeenCalledOnce()
        await expectNoA11yViolations(container)
    })

    it("draws a refusal with the return link inside the rail action group", () => {
        const returnToList = vi.fn()
        const rail: PurchaseStatusRail = {
            label: "Confirmed facts",
            checks: [],
            refusalText: "workspace not launchable",
            secondaryLink: { label: "Return to workspace list", href: "/agentos/workspaces" },
        }
        render(<PurchaseStatusActions kind="rail" rail={rail} on={{ returnToList }} />)

        expect(screen.getByRole("status")).toHaveTextContent("workspace not launchable")
        fireEvent.click(screen.getByRole("link", { name: "Return to workspace list" }))

        expect(returnToList).toHaveBeenCalledOnce()
    })

    it("draws the provisioning escape action as a separate page-level link", () => {
        render(
            <PurchaseStatusActions
                kind="escape"
                link={{ label: "Return to workspace list", href: "/agentos/workspaces" }}
                on={{}}
            />,
        )

        expect(screen.getByRole("link", { name: "Return to workspace list" })).toBeTruthy()
    })
})
