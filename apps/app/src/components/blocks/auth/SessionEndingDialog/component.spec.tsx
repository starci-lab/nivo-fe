import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { SessionEndingDialogBase, type SessionEndingDialogBaseProps } from "./component"

/** The words the connected half resolves out of `console.account`, as the pure twin receives them. */
const VIEW: SessionEndingDialogBaseProps["props"] = {
    title: "Sign out everywhere",
    description: "End your current Nivo sessions on every browser. Your login stays available for a fresh sign-in.",
    scopeNote: "This includes this browser.",
    cancelLabel: "Cancel",
    confirmLabel: "Sign out everywhere",
    pendingLabel: "Ending your sessions on every browser…",
    isPending: false
}

const OPEN_LABEL = "open the confirmation"
const EN_ENDING = enMessages.console.account.sessionEnding
const VI_ENDING = viMessages.console.account.sessionEnding

/** Every line of the every-browser copy in both catalogs, so absence is asserted on real words. */
const ENDING_COPY: ReadonlyArray<string> = [
    VI_ENDING.title,
    VI_ENDING.description,
    VI_ENDING.scopeNote,
    VI_ENDING.confirm,
    VI_ENDING.pending,
    EN_ENDING.title,
    EN_ENDING.description,
    EN_ENDING.scopeNote,
    EN_ENDING.confirm,
    EN_ENDING.pending
]

/** A session inventory, a device or a place, named in either product locale. */
const INVENTORY_OR_PLACE = /thiết bị|\bnơi\b|danh sách phiên|\bdevices?\b|\blocations?\b|\bplaces?\b|session list/i

/** What the harness reports up to the case that opened the confirmation. */
type SessionEndingHarnessProps = { readonly onConfirm: () => void }

/**
 * The confirmation mounted the way the account menu mounts it: closed, with an opener that holds the
 * focus the dialog is expected to hand back.
 */
const SessionEndingHarness = ({ onConfirm }: SessionEndingHarnessProps) => {
    const [isOpen, setIsOpen] = useState(false)
    return <>
        <button type="button" onClick={() => setIsOpen(true)}>{OPEN_LABEL}</button>
        <SessionEndingDialogBase props={VIEW} on={{ confirm: onConfirm }} isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
}

describe("SessionEndingDialogBase", () => {
    afterEach(cleanup)

    it("states the every-browser scope from both catalogs and names no device, place or session inventory", () => {
        expect(Object.keys(VI_ENDING).sort()).toEqual(Object.keys(EN_ENDING).sort())
        expect(VI_ENDING.description).toContain("trình duyệt")
        expect(EN_ENDING.description).toContain("browser")
        for (const line of ENDING_COPY) expect(line).not.toMatch(INVENTORY_OR_PLACE)
    })

    it("draws the asked scope as the dialog's own name and supporting sentence", async () => {
        const user = userEvent.setup()
        render(<SessionEndingHarness onConfirm={vi.fn()} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(dialog).toHaveAccessibleName(VIEW.title)
        expect(within(dialog).getByText(VIEW.description)).toBeInTheDocument()
        expect(within(dialog).getByText(VIEW.scopeNote)).toBeInTheDocument()
    })

    it("reports one confirmation per press and states only that the request is being applied", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<SessionEndingHarness onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        await screen.findByRole("dialog")

        await user.click(screen.getByRole("button", { name: VIEW.confirmLabel }))
        expect(confirm).toHaveBeenCalledOnce()
    })

    it("withholds a second submission while the ending is in flight", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<SessionEndingDialogBase props={{ ...VIEW, isPending: true }} on={{ confirm }} isOpen onOpenChange={() => {}} />)

        const dialog = await screen.findByRole("dialog")
        expect(within(dialog).getByText(VIEW.pendingLabel)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: VIEW.confirmLabel })).toBeDisabled()
        await user.click(screen.getByRole("button", { name: VIEW.confirmLabel }))
        expect(confirm).not.toHaveBeenCalled()
    })

    it("applies nothing when the confirmation is cancelled, and hands the focus back", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<SessionEndingHarness onConfirm={confirm} />)
        const opener = screen.getByRole("button", { name: OPEN_LABEL })
        await user.click(opener)
        await screen.findByRole("dialog")

        await user.click(screen.getByRole("button", { name: VIEW.cancelLabel }))
        expect(confirm).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
        await waitFor(() => expect(document.activeElement).toBe(opener))
    })

    it("applies nothing when the confirmation is dismissed with Escape, and hands the focus back", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<SessionEndingHarness onConfirm={confirm} />)
        const opener = screen.getByRole("button", { name: OPEN_LABEL })
        await user.click(opener)
        await screen.findByRole("dialog")

        await user.keyboard("{Escape}")
        expect(confirm).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
        await waitFor(() => expect(document.activeElement).toBe(opener))
    })
})
