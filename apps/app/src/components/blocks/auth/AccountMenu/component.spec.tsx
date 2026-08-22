import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AccountMenuBase } from "./component"

describe("AccountMenuBase", () => {
    afterEach(cleanup)

    it("reports sign out without owning session behavior", async () => {
        const signOut = vi.fn()
        render(<AccountMenuBase props={{ label: "Account", signOutLabel: "Sign out" }} on={{ signOut }} />)

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))
        expect(signOut).toHaveBeenCalledOnce()
    })
})
