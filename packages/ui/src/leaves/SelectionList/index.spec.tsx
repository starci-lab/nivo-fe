import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SelectionList } from "."

describe("SelectionList", () => {
    it("keeps one selected destination and refuses disabled activation", async () => {
        const activate = vi.fn()
        const user = userEvent.setup()
        render(<SelectionList props={{
            label: "Console navigation",
            selectedKey: "overview",
            groups: [{ id: "main", items: [
                { id: "overview", label: "Overview", icon: "overview" },
                { id: "apps", label: "Apps", icon: "apps" },
                { id: "servers", label: "Servers", icon: "servers", status: "Unavailable", isDisabled: true },
            ] }],
        }} on={{ activate }} />)

        expect(screen.getByRole("group")).toHaveClass("first:sticky", "first:top-0")
        expect(screen.getByRole("option", { name: "Overview" })).toHaveAttribute("aria-selected", "true")
        await user.click(screen.getByRole("option", { name: "Servers" }))
        expect(activate).not.toHaveBeenCalled()
        await user.click(screen.getByRole("option", { name: "Apps" }))
        expect(activate).toHaveBeenCalledWith("apps")
    })

    it("keeps compact destinations labelled while the circular glyph surface owns state paint", () => {
        render(<SelectionList props={{
            label: "Console navigation",
            selectedKey: "agentos",
            presentation: "compact",
            groups: [{
                id: "services",
                label: "Services",
                items: [
                    { id: "apps", label: "Apps", icon: "apps" },
                    { id: "agentos", label: "AgentOS", icon: "agentos" },
                ],
            }],
        }} />)

        const list = screen.getByRole("listbox", { name: "Console navigation" })
        const selected = screen.getByRole("option", { name: "AgentOS" })
        const glyphSurface = selected.querySelector("span[title='AgentOS']")

        expect(list).toHaveAttribute("data-presentation", "compact")
        expect(selected).toHaveAttribute("aria-selected", "true")
        expect(selected).toHaveClass("size-11", "rounded-full")
        expect(glyphSurface).toHaveClass("size-10", "rounded-full", "group-data-[selected=true]:bg-accent-soft")
        expect(glyphSurface?.querySelector("svg")).toHaveClass("size-5", "shrink-0")
        expect(screen.getByText("Services")).toHaveClass("sr-only")
    })

    it("preserves HeroUI keyboard traversal and activation in compact presentation", async () => {
        const activate = vi.fn()
        const user = userEvent.setup()
        render(<SelectionList props={{
            label: "Console navigation",
            selectedKey: "overview",
            presentation: "compact",
            groups: [{ id: "main", items: [
                { id: "overview", label: "Overview", icon: "overview" },
                { id: "apps", label: "Apps", icon: "apps" },
            ] }],
        }} on={{ activate }} />)

        await user.tab()
        await user.keyboard("{ArrowDown}{Enter}")

        expect(activate).toHaveBeenCalledWith("apps")
    })
})