import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { AdministratorRevocationDialogBase, type AdministratorRevocationDialogBaseProps, type AdministratorRevocationStage } from "./component"

/** The words the connected half resolves out of `console.account`, as the pure twin receives them. */
const VIEW: AdministratorRevocationDialogBaseProps["props"] = {
    title: "End Binh Tran's sign-ins?",
    contextLabel: "Workspace",
    context: "Support",
    memberLabel: "Member",
    memberPlaceholder: "Choose a member",
    members: [
        { memberId: "member-2", displayName: "Binh Tran" },
        { memberId: "member-3", displayName: "Chi Le" }
    ],
    memberId: "member-2",
    memberNotice: null,
    isMemberPending: false,
    consequence: "This request ends all sign-ins of Binh Tran, including in other workspaces, if your authority is confirmed.",
    cancelLabel: "Cancel",
    continueLabel: "Continue",
    confirmLabel: "End all sign-ins",
    pendingLabel: "Checking your authority and ending the sessions…",
    appliedLabel: "Sign-ins in the scope you act in have been ended for this person.",
    refusedLabel: "This action cannot be carried out.",
    undecidedLabel: "This action could not be completed. Please try again.",
    retryLabel: "Try again",
    stage: "confirm",
    isOpen: false
}

/** The asking face, before any member has been chosen. */
const CHOOSING: Partial<AdministratorRevocationDialogBaseProps["props"]> = {
    title: "End a member's sign-ins",
    description: "Choose a member of this workspace. Your authority is checked when you submit the request.",
    consequence: "All sign-ins of the selected member will be ended if the request is accepted.",
    memberId: null,
    stage: "ready"
}

const OPEN_LABEL = "open the scoped confirmation"
const EN_ENDING = enMessages.console.account.administratorEnding
const VI_ENDING = viMessages.console.account.administratorEnding

/** Every line of the administrator copy in both catalogs, so absence is asserted on real words. */
const ENDING_COPY: ReadonlyArray<string> = [
    EN_ENDING.chooseTitle,
    EN_ENDING.chooseDescription,
    EN_ENDING.workspaceLabel,
    EN_ENDING.memberLabel,
    EN_ENDING.memberPlaceholder,
    EN_ENDING.chooseConsequence,
    EN_ENDING.continue,
    EN_ENDING.confirmTitle,
    EN_ENDING.confirmConsequence,
    EN_ENDING.confirmAll,
    EN_ENDING.cancel,
    EN_ENDING.pending,
    EN_ENDING.applied,
    EN_ENDING.refused,
    EN_ENDING.undecided,
    EN_ENDING.retry,
    EN_ENDING.noMembers,
    EN_ENDING.rosterUnavailable,
    VI_ENDING.chooseTitle,
    VI_ENDING.chooseDescription,
    VI_ENDING.workspaceLabel,
    VI_ENDING.memberLabel,
    VI_ENDING.memberPlaceholder,
    VI_ENDING.chooseConsequence,
    VI_ENDING.continue,
    VI_ENDING.confirmTitle,
    VI_ENDING.confirmConsequence,
    VI_ENDING.confirmAll,
    VI_ENDING.cancel,
    VI_ENDING.pending,
    VI_ENDING.applied,
    VI_ENDING.refused,
    VI_ENDING.undecided,
    VI_ENDING.retry,
    VI_ENDING.noMembers,
    VI_ENDING.rosterUnavailable
]

/** A session inventory, a device, a place or a count, named in either product locale. */
const INVENTORY_OR_PLACE = /thiết bị|\bnơi\b|danh sách phiên|\d|\bdevices?\b|\blocations?\b|\bplaces?\b|session list|principal|membership/i

/** The overlay's own backdrop, which owns the press-outside way out of the confirmation. */
const backdrop = (): Element => {
    const element = document.querySelector('[data-grammar-overlay-backdrop="Dialog"]')
    if (element === null) throw new Error("the confirmation's backdrop is not mounted")
    return element
}

/** The picker's trigger, named by the field label the connected half resolved. */
const picker = (dialog: HTMLElement): HTMLElement => within(dialog).getByRole("button", { name: /Member/ })

/** What the harness reports up to the case that opened the confirmation. */
type AdministratorRevocationHarnessProps = {
    readonly props?: Partial<AdministratorRevocationDialogBaseProps["props"]>
    readonly onConfirm?: () => void
    readonly onMemberChange?: (memberId: string | null) => void
    readonly onRetry?: () => void
}

/**
 * The confirmation mounted the way the account menu mounts it: closed, with an opener that holds the
 * focus the dialog is expected to hand back.
 */
const AdministratorRevocationHarness = ({ props, onConfirm, onMemberChange, onRetry }: AdministratorRevocationHarnessProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [memberId, setMemberId] = useState<AdministratorRevocationDialogBaseProps["props"]["memberId"]>(props !== undefined && "memberId" in props ? props.memberId ?? null : VIEW.memberId)
    return <>
        <button type="button" onClick={() => setIsOpen(true)}>{OPEN_LABEL}</button>
        <AdministratorRevocationDialogBase
            props={{ ...VIEW, ...props, memberId, isOpen }}
            on={{
                confirm: onConfirm,
                memberChange: (next: string | null) => {
                    setMemberId(next)
                    onMemberChange?.(next)
                },
                retry: onRetry,
                onOpenChange: setIsOpen
            }}
        />
    </>
}

/** One case's overrides: the resolved props it is about, and the stage it opens on. */
type AdministratorRevocationCase = Partial<AdministratorRevocationDialogBaseProps["props"]> & {
    readonly stage: AdministratorRevocationStage
}

/** Reach the stage a case is about, through the opener, and answer with the dialog. */
const openAt = async (user: ReturnType<typeof userEvent.setup>, props: AdministratorRevocationCase) => {
    render(<AdministratorRevocationHarness props={props} />)
    await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
    return screen.findByRole("dialog")
}

describe("AdministratorRevocationDialogBase", () => {
    afterEach(cleanup)

    it("names the member, the workspace scope and the all-session consequence from both catalogs", () => {
        expect(Object.keys(VI_ENDING).sort()).toEqual(Object.keys(EN_ENDING).sort())
        expect(EN_ENDING.confirmTitle).toContain("{member}")
        expect(EN_ENDING.confirmConsequence).toContain("{member}")
        expect(EN_ENDING.chooseDescription).toContain("Your authority is checked")
        expect(VI_ENDING.chooseDescription).toContain("kiểm tra")
        for (const line of ENDING_COPY) expect(line).not.toMatch(INVENTORY_OR_PLACE)
    })

    it("asks which member the ending is for from the roster, and withholds the continuation until one is chosen", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={CHOOSING} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(picker(dialog)).toBeInTheDocument()
        const contextLabel = within(dialog).getByText(VIEW.contextLabel)
        expect(within(dialog).getByText(VIEW.context)).toBeInTheDocument()
        expect(contextLabel.compareDocumentPosition(within(dialog).getByText(CHOOSING.consequence as string)) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
        const continueButton = screen.getByRole("button", { name: VIEW.continueLabel })
        expect(continueButton).toBeDisabled()
        await user.click(continueButton)
        expect(confirm).not.toHaveBeenCalled()
    })

    it("offers only the roster's display names, and lets one be chosen without naming an identity", async () => {
        const memberChange = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={CHOOSING} onMemberChange={memberChange} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        await user.click(picker(dialog))
        const options = await screen.findAllByRole("option")
        expect(options.map((option) => option.textContent)).toEqual(VIEW.members.map((member) => member.displayName))
        expect(within(dialog).queryByText("member-2")).not.toBeInTheDocument()

        await user.click(screen.getByRole("option", { name: "Chi Le" }))
        expect(memberChange).toHaveBeenCalledWith("member-3")
        expect(picker(dialog).textContent).toContain("Chi Le")
        expect(document.body.textContent).not.toContain("member-3")
    })

    it("restates the chosen member and the workspace without offering the picker once a member is named", async () => {
        const user = userEvent.setup()
        const dialog = await openAt(user, { stage: "confirm" })

        expect(dialog).toHaveAccessibleName(VIEW.title)
        const consequence = within(dialog).getByText(VIEW.consequence)
        const contextLabel = within(dialog).getByText(VIEW.contextLabel)
        expect(within(dialog).getByText(VIEW.context)).toBeInTheDocument()
        expect(consequence.compareDocumentPosition(contextLabel) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
        expect(within(dialog).queryByRole("button", { name: /Member/ })).not.toBeInTheDocument()
    })

    it("says the roster could not be read instead of drawing an empty picker", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ ...CHOOSING, members: [], memberNotice: EN_ENDING.rosterUnavailable }} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(within(dialog).getByText(EN_ENDING.rosterUnavailable)).toBeInTheDocument()
        await user.click(screen.getByRole("button", { name: VIEW.continueLabel }))
        expect(confirm).not.toHaveBeenCalled()
    })

    it("says nobody else can be chosen instead of drawing an empty picker", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ ...CHOOSING, members: [], memberNotice: EN_ENDING.noMembers }} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        const dialog = await screen.findByRole("dialog")

        expect(within(dialog).getByText(EN_ENDING.noMembers)).toBeInTheDocument()
        await user.click(screen.getByRole("button", { name: VIEW.continueLabel }))
        expect(confirm).not.toHaveBeenCalled()
    })

    it("withholds the continuation while the roster is still arriving", async () => {
        const confirm = vi.fn()
        const user = userEvent.setup()
        render(<AdministratorRevocationHarness props={{ ...CHOOSING, members: [], isMemberPending: true }} onConfirm={confirm} />)
        await user.click(screen.getByRole("button", { name: OPEN_LABEL }))
        await screen.findByRole("dialog")

        expect(screen.getByRole("button", { name: VIEW.continueLabel })).toBeDisabled()
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
        const dialog = await openAt(user, { stage: "applied" })

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