import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

const end = vi.fn(() => Promise.resolve())
vi.mock("@/modules/auth/session", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "token" }, end }),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

import { AccountMenu } from "."

describe("AccountMenu", () => {
    afterEach(() => {
        cleanup()
        end.mockClear()
    })

    it("ends the real session from the account action", async () => {
        const user = userEvent.setup()
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "account.label" }))
        await user.click(await screen.findByRole("menuitem", { name: "account.signOut" }))
        expect(end).toHaveBeenCalledOnce()
    })
})
