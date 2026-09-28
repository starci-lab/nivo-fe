import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import viMessages from "@/messages/vi.json"

const replace = vi.fn()
const router = { replace }

/** The landing the notice is on and the address it is reading; each case sets what it needs. */
const address = { pathname: "/overview", search: "" }
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(address.search) }))
vi.mock("@/modules/i18n/navigation", () => ({
    navigation: {
        usePathname: () => address.pathname,
        useRouter: () => router,
    },
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

import { ReturnNotice } from "."

/** The copy key the connected half resolves, which is the text this fixture's translation echo draws. */
const NOTICE_KEY = "unavailableReturnNotice"

/** The sentence the catalog carries under that key, so the key is known to name real words. */
const NOTICE = viMessages.authentication[NOTICE_KEY]

/** What the signing-in person is told when a place it could not open was asked for. */
const MARKER = "returnNotice=unavailable"

describe("ReturnNotice", () => {
    beforeEach(() => {
        replace.mockClear()
        address.pathname = "/overview"
        address.search = ""
    })
    afterEach(cleanup)

    it("shows the reasonless notice on a landing reached with the marker", () => {
        address.search = MARKER
        render(<ReturnNotice />)

        expect(screen.getByText(NOTICE_KEY)).toBeInTheDocument()
        expect(NOTICE).not.toBe(NOTICE_KEY)
    })

    it("puts the address back without the marker, keeping what it does not own", () => {
        address.search = `${MARKER}&tab=members`
        render(<ReturnNotice />)

        expect(replace).toHaveBeenCalledExactlyOnceWith("/overview?tab=members")
    })

    it("draws nothing, and rewrites nothing, on an ordinary landing", () => {
        address.search = "tab=members"
        render(<ReturnNotice />)

        expect(screen.queryByText(NOTICE_KEY)).not.toBeInTheDocument()
        expect(replace).not.toHaveBeenCalled()
    })

    it("keeps the notice once the marker it read has been cleaned off the address", () => {
        address.search = MARKER
        const { rerender } = render(<ReturnNotice />)
        address.search = ""
        rerender(<ReturnNotice />)

        expect(screen.getByText(NOTICE_KEY)).toBeInTheDocument()
        expect(replace).toHaveBeenCalledOnce()
    })

    it("stops showing the notice once the person has left the landing it was handed to", () => {
        address.search = MARKER
        const { rerender } = render(<ReturnNotice />)
        address.pathname = "/wallet"
        address.search = ""
        rerender(<ReturnNotice />)

        expect(screen.queryByText(NOTICE_KEY)).not.toBeInTheDocument()
    })
})