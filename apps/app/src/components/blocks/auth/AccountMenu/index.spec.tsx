import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { SessionEndReport } from "@/modules/auth/session"

/** An everywhere ending the identity authority confirmed. */
const APPLIED: SessionEndReport = { localCleared: true, remoteRevocation: "observed", authorityEnding: "confirmed" }
/** An everywhere ending nobody confirmed, which is never an applied scope. */
const UNCONFIRMED: SessionEndReport = { localCleared: true, remoteRevocation: "unknown", authorityEnding: "unconfirmed" }

/** The scope the connected half may ask an ending for, held here so the spy is typed as the session's. */
type EndingCall = (scope?: "thisBrowser" | "everywhere") => Promise<SessionEndReport>

const end = vi.fn<EndingCall>(() => Promise.resolve(APPLIED))
const replace = vi.fn()
vi.mock("@/modules/auth/session", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "token" }, end }),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({
    Link: "a",
    redirect: vi.fn(),
    usePathname: () => "/",
    useRouter: () => ({ push: vi.fn(), replace }),
}))

import { AccountMenu } from "."

/** An ending request that stays unanswered until the test releases it. */
const unansweredEnding = () => {
    let release: (report: SessionEndReport) => void = () => {}
    const promise = new Promise<SessionEndReport>((resolve) => { release = resolve })
    return { promise, release }
}

/** Open the account menu and choose sign out everywhere, answering with the confirmation. */
const openEveryBrowserConfirmation = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<AccountMenu />)
    fireEvent.click(screen.getByRole("button", { name: "account.label" }))
    await user.click(await screen.findByRole("menuitem", { name: "account.signOutEverywhere" }))
    return screen.findByRole("dialog")
}

describe("AccountMenu", () => {
    afterEach(() => {
        cleanup()
        end.mockClear()
        end.mockImplementation(() => Promise.resolve(APPLIED))
        replace.mockClear()
    })

    it("ends the real session from the account action", async () => {
        const user = userEvent.setup()
        render(<AccountMenu />)

        fireEvent.click(screen.getByRole("button", { name: "account.label" }))
        await user.click(await screen.findByRole("menuitem", { name: "account.signOut" }))
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith()
    })

    it("asks the every-browser scope in the console's own words, ends every session once, and leaves for Login", async () => {
        const user = userEvent.setup()
        const dialog = await openEveryBrowserConfirmation(user)

        expect(dialog).toHaveAccessibleName("account.sessionEnding.title")
        expect(within(dialog).getByText("account.sessionEnding.description")).toBeInTheDocument()
        expect(within(dialog).getByText("account.sessionEnding.scopeNote")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.confirm" }))
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith("everywhere")
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=applied"))
    })

    it("applies no ending when the every-browser confirmation is cancelled", async () => {
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.cancel" }))
        expect(end).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    })

    it("carries an unconfirmed authority-side ending on as unconfirmed, never as applied", async () => {
        end.mockResolvedValueOnce(UNCONFIRMED)
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.confirm" }))
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=unconfirmed"))
        expect(replace).not.toHaveBeenCalledWith("/authentication?sessionEnding=applied")
    })

    it("sends one ending when the confirmation is pressed twice in quick succession", async () => {
        const { promise, release } = unansweredEnding()
        end.mockReturnValueOnce(promise)
        const user = userEvent.setup()
        await openEveryBrowserConfirmation(user)
        const confirm = screen.getByRole("button", { name: "account.sessionEnding.confirm" })

        await user.click(confirm)
        await user.click(confirm)
        expect(end).toHaveBeenCalledOnce()

        await act(async () => { release(APPLIED) })
        await waitFor(() => expect(replace).toHaveBeenCalledOnce())
    })
})