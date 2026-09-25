import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { AdministratorRevocationDialogBase, type AdministratorRevocationDialogBaseProps, type AdministratorRevocationStage } from "./component"

/** The words the connected half resolves out of `console.account`, as the pure twin receives them. */
const VIEW: AdministratorRevocationDialogBaseProps["props"] = {
    title: "End the sign-ins of linh@nivo.vn?",
    description: "This ends every current Nivo session of this person on every browser. Your authority is checked as you submit.",
    targetLabel: "Person to end sign-ins for",
    target: "linh@nivo.vn",
    contextLabel: "Scope you act in",
    context: "Workspace ws-support",
    cancelLabel: "Cancel",
    confirmLabel: "End sign-ins",
    pendingLabel: "Checking your authority and ending the sessions…",
    appliedLabel: "Sign-ins in the scope you act in have been ended for this person.",
    refusedLabel: "This action cannot be carried out.",
    undecidedLabel: "This action could not be completed. Please try again.",
    retryLabel: "Try again",
    stage: "confirm"
}

const OPEN_LABEL = "open the scoped confirmation"
const EN_ENDING = enMessages.console.account.administratorEnding
const VI_ENDING = viMessages.console.account.administratorEnding

/** Every line of the administrator copy in both catalogs, so absence is asserted on real words. */
const ENDING_COPY: ReadonlyArray<string> = [
    EN_ENDING.title,
    EN_ENDING.description,
    EN_ENDING.targetLabel,
    EN_ENDING.contextLabel,
    EN_ENDING.workspaceContext,
    EN_ENDING.confirm,
    EN_ENDING.pending,
    EN_ENDING.applied,
    EN_ENDING.refused,
    EN_ENDING.undecided,
    VI_ENDING.title,
    VI_ENDING.description,
    VI_ENDING.targetLabel,
    VI_ENDING.contextLabel,
    VI_ENDING.workspaceContext,
    VI_ENDING.confirm,
    VI_ENDING.pending,
    VI_ENDING.applied,
    VI_ENDING.refused,
    VI_ENDING.undecided
]

/** A session inventory, a device, a place or a count, named in either product locale. */
const INVENTORY_OR_PLACE = /thiết bị|\bnơi\b|danh sách phiên|\d|\bdevices?\b|\blocations?\b|\bplaces?\b|session list|principal|membership/i

/** The overlay's own backdrop, which owns the press-outside way out of the confirmation. */
const backdrop = (): Element => {
    const element = document.querySelector('[data-grammar-overlay-backdrop="Dialog"]')
    if (element === null) throw new Error("the confirmation's backdrop is not mounted")
    return element
}

/** What the harness reports up to the case that opened the confirmation. */
type AdministratorRevocationHarnessProps = {
    readonly props?: Partial<AdministratorRevocationDialogBaseProps["props"]>
    readonly onConfirm?: () => void
    readonly onRetry?: () => void
}

/**
 * The confirmation mounted the way the account menu mounts it: closed, with an opener that holds the
 * focus the dialog is expected to hand back.
 */
const AdministratorRevocationHarness = ({ props, onConfirm, onRetry }: AdministratorRevocationHarnessProps) => {
    const [isOpen, setIsOpen] = useState(false)
    return <>
        <button type="button" onClick={() => setIsOpen(true)}>{OPEN_LABEL}</button>
        <AdministratorRevocationDialogBase
            props={{ ...VIEW, ...props }}
            on={{ confirm: onConfirm, retry: onRetry }}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
        />
    </>
}

/** Reach the stage a case is about, through the opener, and answer with the dialog. */
const openAt = async (user: ReturnType<typeof userEvent.setup>, stage: AdministratorRevocationStage) => {
    render(<AdministratorRevocationHarness props={{ stage }} />)
    await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
    return screen.findByRole("dialog")
}

describe("AdministratorRevocationDialogBase", () => {
    afterEach(cleanup)

    it("names the target, the authority context and the all-session consequence from both catalogs", () => {
        expect(Object.keys(VI_ENDING).sort()).toEqual(Object.keys(EN_ENDING).sort())
        expect(EN_ENDING.title).toContain("{target}")
        expect(EN_ENDING.workspaceContext).toContain("{workspace}")
        expect(EN_ENDING.description).toContain("every browser")
        expect(EN_ENDING.description).toContain("checked as you submit")
        expect(VI_ENDING.description).toContain("mọi trình duyệt")
        for (const line of ENDING_COPY) expect(line).not.toMatch(INVENTORY_OR_PLACE)
    })

    it("asks who the ending is for, and withholds the confirmation until a target is named", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ stage: "ready", target: "" }} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(within(dialog).getByLabelText(VIEW.targetLabel)).toBeInTheDocument()
        expect(within(dialog).getByText(VIEW.contextLabel)).toBeInTheDocument()
        expect(within(dialog).getByText(VIEW.context)).toBeInTheDocument()
        const confirmButton = screen.getByRole("button", { name: VIEW.confirmLabel })
        expect(confirmButton).toBeDisabled()
        await user.click(confirmButton)
        expect(confirm).not.toHaveBeenCalled()
    })

    it("restates the named target and the scope without offering an edit once the target is named", async () => {
        const user = userEvent.setup()
        const dialog = await openAt(user, "confirm")

        expect(dialog).toHaveAccessibleName(VIEW.title)
        expect(within(dialog).getByText(VIEW.description)).toBeInTheDocument()
        expect(within(dialog).getByText(VIEW.context)).toBeInTheDocument()
        expect(within(dialog).queryByLabelText(VIEW.targetLabel)).not.toBeInTheDocument()
    })

    it("submits once per press and states only that the request is being applied while it is in flight", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ stage: "pending" }} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(within(dialog).getByText(VIEW.pendingLabel)).toBeInTheDocument()
        const confirmButton = screen.getByRole("button", { name: VIEW.confirmLabel })
        expect(confirmButton).toBeDisabled()
        await user.click(confirmButton)
        expect(confirm).not.toHaveBeenCalled()
    })

    it("draws the applied scope in one sentence that names no inventory and no per-scope count", async () => {
        const user = userEvent.setup()
        const dialog = await openAt(user, "applied")

        const applied = within(dialog).getByText(VIEW.appliedLabel)
        expect(applied).toBeInTheDocument()
        expect(applied.textContent).not.toMatch(INVENTORY_OR_PLACE)
        expect(within(dialog).queryByText(VIEW.undecidedLabel)).not.toBeInTheDocument()
        expect(within(dialog).queryByText(VIEW.pendingLabel)).not.toBeInTheDocument()
    })

    it("draws the one generic refusal and offers no retry of a refused request", async () => {
        const user = userEvent.setup()
        const retry = vi.fn()
        render(<AdministratorRevocationHarness props={{ stage: "refused" }} onRetry={retry} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(within(dialog).getByText(VIEW.refusedLabel)).toBeInTheDocument()
        expect(within(dialog).getByText(VIEW.refusedLabel).textContent).not.toMatch(/principal|membership|session/i)
        expect(within(dialog).queryByText(VIEW.appliedLabel)).not.toBeInTheDocument()
        expect(within(dialog).queryByRole("button", { name: VIEW.retryLabel })).not.toBeInTheDocument()
    })

    it("draws an unanswered authority as not completed, never as a refusal, and retries the same request", async () => {
        const retry = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ stage: "undecided" }} onRetry={retry} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(within(dialog).getByText(VIEW.undecidedLabel)).toBeInTheDocument()
        expect(within(dialog).queryByText(VIEW.refusedLabel)).not.toBeInTheDocument()
        expect(within(dialog).queryByText(VIEW.appliedLabel)).not.toBeInTheDocument()

        await user.click(within(dialog).getByRole("button", { name: VIEW.retryLabel }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("applies nothing when the confirmation is cancelled, and hands the focus back", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness onConfirm={confirm} />)
        const opener = screen.getByRole("button", { name: OPEN_LABEL })
        await user.click(opener)
        await screen.findByRole("dialog")

        await user.click(screen.getByRole("button", { name: VIEW.cancelLabel }))
        expect(confirm).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
        await waitFor(() => expect(document.activeElement).toBe(opener))
    })

    it("refuses cancel, Escape and an outside press while the authority answer is outstanding", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ stage: "pending" }} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        await screen.findByRole("dialog")

        expect(screen.getByRole("button", { name: VIEW.cancelLabel })).toBeDisabled()
        await user.click(screen.getByRole("button", { name: VIEW.cancelLabel }))
        await user.keyboard("{Escape}")
        await user.click(backdrop())

        expect(confirm).not.toHaveBeenCalled()
        expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("gives the way out back once an authority has answered", async () => {
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ stage: "refused" }} />)
        const opener = screen.getByRole("button", { name: OPEN_LABEL })
        await user.click(opener)
        await screen.findByRole("dialog")

        expect(screen.getByRole("button", { name: VIEW.cancelLabel })).not.toBeDisabled()
        await user.keyboard("{Escape}")
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
        await waitFor(() => expect(document.activeElement).toBe(opener))
    })
})