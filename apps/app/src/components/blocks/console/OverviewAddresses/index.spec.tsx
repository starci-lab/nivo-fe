import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { domains: null } as Record<string, unknown>,
}))
vi.mock("@/hooks", () => ({ useOverviewData: () => mocks.data }))

import { OverviewAddresses } from "."

describe("OverviewAddresses", () => {
    it("names every held domain and its own renewal state", async () => {
        mocks.data.domains = {
            ok: true,
            data: [{ id: "domain-1", name: "api.nivo.vn", status: "active", expiresAt: null, autoRenew: true }],
        }
        const { container } = render(<OverviewAddresses />)

        expect(screen.getByText("api.nivo.vn")).toBeInTheDocument()
        expect(screen.getByText("Held · Auto-renews")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })

    it("states its own absence when there are no domains held", () => {
        mocks.data.domains = { ok: true, data: [] }
        render(<OverviewAddresses />)

        expect(
            screen.getByText("No domains held. A custom domain is only needed once an app is running."),
        ).toBeInTheDocument()
    })

    it("names the refusal when the domain read itself was refused", () => {
        mocks.data.domains = { ok: false, code: "UNKNOWN" }
        render(<OverviewAddresses />)

        expect(
            screen.getByText("This part could not be read. The rest of the screen is still correct."),
        ).toBeInTheDocument()
    })

    it("keeps the surface loading until the domain read settles", () => {
        mocks.data.domains = null
        const { container } = render(<OverviewAddresses />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })

    it("names the exact expiry date once a domain carries one, over the auto-renew reading", () => {
        mocks.data.domains = {
            ok: true,
            data: [
                {
                    id: "domain-1",
                    name: "expiring.nivo.vn",
                    status: "expiring",
                    expiresAt: "2026-09-30T00:00:00.000Z",
                    autoRenew: true,
                },
            ],
        }
        render(<OverviewAddresses />)

        expect(screen.getByText("Expiring soon · expires Sep 30, 2026")).toBeInTheDocument()
    })

    it("reads auto-renew as off when a domain carries no expiry and is not set to renew", () => {
        mocks.data.domains = {
            ok: true,
            data: [{ id: "domain-1", name: "manual.nivo.vn", status: "active", expiresAt: null, autoRenew: false }],
        }
        render(<OverviewAddresses />)

        expect(screen.getByText("Held · No auto-renew")).toBeInTheDocument()
    })
})
