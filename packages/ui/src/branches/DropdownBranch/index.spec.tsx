import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { defineLeafComponent } from "../../contracts/props"
import { Icon } from "../../leaves/Icon"
import { Text } from "../../leaves/Text"
import { DropdownBranch } from "."

describe("DropdownBranch", () => {
    afterEach(cleanup)

    it("reports a typed item action through complete dropdown mechanics", async () => {
        const action = vi.fn()
        render(
            <DropdownBranch
                props={{ label: "Account", sections: [{ items: [{ id: "sign-out", label: "Sign out" }] }] }}
                on={{ action }}
                trigger={defineLeafComponent("icon", {}, () => <Icon props={{ name: "account" }} />)}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Account" }))
        fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))
        expect(action).toHaveBeenCalledWith("sign-out")
    })

    it("renders the optional typed header and complete item states", async () => {
        render(
            <DropdownBranch
                props={{
                    label: "Workspace",
                    placement: "top left",
                    selectionMode: "single",
                    selectedId: "current",
                    sections: [{ items: [
                        { id: "current", label: "Current", icon: "complete", showsIndicator: true },
                        { id: "remove", label: "Remove", tone: "danger", isDisabled: true },
                    ] }],
                }}
                trigger={defineLeafComponent("icon", {}, () => <Icon props={{ name: "account" }} />)}
                header={defineLeafComponent("text", {}, () => <Text props={{ content: "Workspace menu" }} />)}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Workspace" }))

        expect(await screen.findByText("Workspace menu")).toBeInTheDocument()
        expect(screen.getByRole("menuitemradio", { name: "Current" })).toHaveAttribute("aria-checked", "true")
        expect(screen.getByRole("menuitemradio", { name: "Remove" })).toHaveAttribute("aria-disabled", "true")
    })
})
