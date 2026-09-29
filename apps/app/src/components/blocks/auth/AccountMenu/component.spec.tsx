import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { AdministratorRevocationDialogProps } from "@/components/blocks/auth/AdministratorRevocationDialog"
import type { SessionEndingDialogProps } from "@/components/blocks/auth/SessionEndingDialog"
import { AccountMenuBase, type AccountMenuBaseProps } from "./component"

const ADMIN_LABEL = "End the sign-ins of a person"
const SESSION_ENDING_COPY = "every-browser confirmation"
const ADMINISTRATOR_ENDING_COPY = "scoped administrator ending"
const RETURN_NOTICE_COPY = "the landing's unavailable-return notice"

/** The confirmation the connected half hands in: drawn here only when it was told to be open. */
const SessionEndingStub = ({ isOpen }: SessionEndingDialogProps) => (isOpen ? <span>{SESSION_ENDING_COPY}</span> : null)

/** The scoped administrator ending the connected half hands in, drawn on the same terms. */
const AdministratorRevocationStub = ({ isOpen }: AdministratorRevocationDialogProps) =>
    isOpen ? <span>{ADMINISTRATOR_ENDING_COPY}</span> : null

/** The landing notice the connected half hands in; it reads the address itself, so it takes nothing. */
const ReturnNoticeStub = () => <span>{RETURN_NOTICE_COPY}</span>

/** One case's overrides, split the way the contract is: resolved controls in state, words in props. */
type AccountMenuCase = {
    readonly state?: Partial<AccountMenuBaseProps["state"]>
    readonly props?: Partial<AccountMenuBaseProps["props"]>
}

/** The resolved words the account menu draws, as the connected half resolves them. */
const viewProps = (overrides: AccountMenuCase = {}): AccountMenuBaseProps => ({
    state: {
        sessionEndingControl: SessionEndingStub,
        sessionEndingControlProps: { isOpen: false, onOpenChange: () => {} },
        administratorRevocationControl: AdministratorRevocationStub,
        administratorRevocationControlProps: { isOpen: false, onOpenChange: () => {} },
        returnNoticeControl: ReturnNoticeStub,
        returnNoticeControlProps: {},
        ...overrides.state,
    },
    props: {
        label: "Account",
        signOutLabel: "Sign out",
        signOutEverywhereLabel: "Sign out everywhere",
        ...overrides.props,
    },
})

/** Open the account menu and answer with it. */
const openMenu = async () => {
    fireEvent.click(screen.getByRole("button", { name: "Account" }))
    return screen.findByRole("menu")
}

describe("AccountMenuBase", () => {
    afterEach(cleanup)

    it("reports sign out without owning session behavior", async () => {
        const signOut = vi.fn()
        render(<AccountMenuBase {...viewProps()} on={{ signOut }} />)

        await openMenu()
        fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))
        expect(signOut).toHaveBeenCalledOnce()
    })

    it("offers both endings and reports the every-browser one to the connected half", async () => {
        const signOut = vi.fn()
        const signOutEverywhere = vi.fn()
        render(<AccountMenuBase {...viewProps()} on={{ signOut, signOutEverywhere }} />)

        await openMenu()
        fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out everywhere" }))
        expect(signOutEverywhere).toHaveBeenCalledOnce()
        expect(signOut).not.toHaveBeenCalled()
    })

    it("draws the confirmation it was handed, in the state it was told", async () => {
        const { rerender } = render(<AccountMenuBase {...viewProps()} />)
        expect(screen.queryByText(SESSION_ENDING_COPY)).not.toBeInTheDocument()

        rerender(
            <AccountMenuBase
                {...viewProps({ state: { sessionEndingControlProps: { isOpen: true, onOpenChange: () => {} } } })}
            />,
        )
        expect(screen.getByText(SESSION_ENDING_COPY)).toBeInTheDocument()
    })

    it("draws the scoped administrator ending it was handed, in the state it was told", async () => {
        const { rerender } = render(<AccountMenuBase {...viewProps()} />)
        expect(screen.queryByText(ADMINISTRATOR_ENDING_COPY)).not.toBeInTheDocument()

        rerender(
            <AccountMenuBase
                {...viewProps({
                    state: { administratorRevocationControlProps: { isOpen: true, onOpenChange: () => {} } },
                })}
            />,
        )
        expect(screen.getByText(ADMINISTRATOR_ENDING_COPY)).toBeInTheDocument()
    })

    it("draws the landing's notice beside the session controls, which is where a landing notice rides", () => {
        render(<AccountMenuBase {...viewProps()} />)

        expect(screen.getByText(RETURN_NOTICE_COPY)).toBeInTheDocument()
    })

    it("keeps the administrator ending entry out of the menu until an eligibility answer supplies it", async () => {
        const administratorEnding = vi.fn()
        render(<AccountMenuBase {...viewProps()} on={{ administratorEnding }} />)

        await openMenu()
        expect(screen.getAllByRole("menuitem")).toHaveLength(2)
        expect(screen.queryByRole("menuitem", { name: ADMIN_LABEL })).not.toBeInTheDocument()
        expect(administratorEnding).not.toHaveBeenCalled()
    })

    it("reports the administrator ending entry the eligibility answer supplied", async () => {
        const administratorEnding = vi.fn()
        render(
            <AccountMenuBase
                {...viewProps({ props: { administratorEnding: { label: ADMIN_LABEL } } })}
                on={{ administratorEnding }}
            />,
        )

        await openMenu()
        expect(screen.getAllByRole("menuitem")).toHaveLength(3)
        fireEvent.click(await screen.findByRole("menuitem", { name: ADMIN_LABEL }))
        expect(administratorEnding).toHaveBeenCalledOnce()
    })
})
