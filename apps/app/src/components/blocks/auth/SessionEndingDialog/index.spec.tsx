import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react"
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
const openChange = vi.fn()
vi.mock("@/hooks", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "token" }, end }),
    useRouter: () => ({ replace }),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/modules/i18n/navigation", () => ({ navigation: { useRouter: () => ({ replace }) } }))

import { SessionEndingDialog } from "."

/** An ending request that stays unanswered until the test releases it. */
const unansweredEnding = () => {
    let release: (report: SessionEndReport) => void = () => {}
    const promise = new Promise<SessionEndReport>((resolve) => { release = resolve })
    return { promise, release }
}

describe("SessionEndingDialog", () => {
    afterEach(() => {
        cleanup()
        end.mockClear()
        end.mockImplementation(() => Promise.resolve(APPLIED))
        replace.mockClear()
        openChange.mockClear()
    })

    it("keeps its pending face mounted while the ending request is in flight, and sends one ending", async () => {
        /*
         * The defect this guards: custody used to clear the moment the press landed, unmounting the
         * confirmation before its pending face could paint. The session now answers first, so the
         * dialog - pending words and all - must still be standing while the request is unanswered.
         */
        const { promise, release } = unansweredEnding()
        end.mockReturnValueOnce(promise)
        const user = userEvent.setup()
        render(<SessionEndingDialog isOpen onOpenChange={openChange} />)
        const dialog = await screen.findByRole("dialog")

        const confirm = within(dialog).getByRole("button", { name: "account.sessionEnding.confirm" })
        await user.click(confirm)
        expect(end).toHaveBeenCalledOnce()
        expect(end).toHaveBeenCalledWith("everywhere")

        // the request is unanswered: the confirmation still stands, wearing its pending face
        expect(within(dialog).getByText("account.sessionEnding.pending")).toBeInTheDocument()
        expect(confirm).toBeDisabled()
        await user.click(confirm)
        expect(end).toHaveBeenCalledOnce()

        await act(async () => { release(APPLIED) })
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=applied"))
        expect(openChange).toHaveBeenCalledWith(false)
    })

    it("carries an unconfirmed authority answer on the address, never an applied one", async () => {
        end.mockResolvedValueOnce(UNCONFIRMED)
        const user = userEvent.setup()
        render(<SessionEndingDialog isOpen onOpenChange={openChange} />)
        await screen.findByRole("dialog")

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.confirm" }))
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=unconfirmed"))
        expect(replace).not.toHaveBeenCalledWith("/authentication?sessionEnding=applied")
    })

    it("carries an ending nobody observed on as unconfirmed", async () => {
        /*
         * A request that threw confirmed nothing: the person still lands on the sign-in surface and
         * the answer travelling on the address states no more than was seen - unconfirmed.
         */
        end.mockRejectedValueOnce(new Error("offline"))
        const user = userEvent.setup()
        render(<SessionEndingDialog isOpen onOpenChange={openChange} />)
        await screen.findByRole("dialog")

        await user.click(screen.getByRole("button", { name: "account.sessionEnding.confirm" }))
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?sessionEnding=unconfirmed"))
    })
})
