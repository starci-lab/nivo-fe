import { expectNoA11yViolations } from "@/testing/axe"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import enMessages from "@/messages/en.json"

const replace = vi.fn()
const router = { replace }

/** The landing the notice is on and the address it is reading; each case sets what it needs. */
const address = { pathname: "/overview", search: "" }
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(address.search) }))
vi.mock("@/modules/i18n", () => ({
    navigation: {
        usePathname: () => address.pathname,
        useRouter: () => router,
    },
}))

import { ReturnNotice } from "."

/** The sentence the catalog carries for a place that could not be opened. */
const NOTICE = enMessages.authentication.unavailableReturnNotice

/** What the signing-in person is told when a place it could not open was asked for. */
const MARKER = "returnNotice=unavailable"

describe("ReturnNotice", () => {
    beforeEach(() => {
        replace.mockClear()
        address.pathname = "/overview"
        address.search = ""
    })
    afterEach(cleanup)

    it("shows the reasonless notice on a landing reached with the marker", async () => {
        address.search = MARKER
        const { container } = render(<ReturnNotice />)

        expect(screen.getByText(NOTICE)).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })

    it("puts the address back without the marker, keeping what it does not own", () => {
        address.search = `${MARKER}&tab=members`
        render(<ReturnNotice />)

        expect(replace).toHaveBeenCalledExactlyOnceWith("/overview?tab=members")
    })

    it("draws nothing, and rewrites nothing, on an ordinary landing", () => {
        address.search = "tab=members"
        render(<ReturnNotice />)

        expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
        expect(replace).not.toHaveBeenCalled()
    })

    it("keeps the notice once the marker it read has been cleaned off the address", () => {
        address.search = MARKER
        const { rerender } = render(<ReturnNotice />)
        address.search = ""
        rerender(<ReturnNotice />)

        expect(screen.getByText(NOTICE)).toBeInTheDocument()
        expect(replace).toHaveBeenCalledOnce()
    })

    it("stops showing the notice once the person has left the landing it was handed to", () => {
        address.search = MARKER
        const { rerender } = render(<ReturnNotice />)
        address.pathname = "/wallet"
        address.search = ""
        rerender(<ReturnNotice />)

        expect(screen.queryByText(NOTICE)).not.toBeInTheDocument()
    })
})
