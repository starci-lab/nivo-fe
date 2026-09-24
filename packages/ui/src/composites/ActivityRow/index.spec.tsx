import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ReactionLike } from "../../leaves/ReactionPicker/reaction-type"
import { ActivityRow } from "./"

describe("ActivityRow", () => {
    it("opens actor and target links and allows reactions", () => {
        const openActor = vi.fn()
        const openTarget = vi.fn()
        const react = vi.fn()
        render(<ActivityRow props={{ id: "a", actor: "Ada", action: "completed", target: "Task", time: "today", reactionLabel: "React", reactionCount: 1, reactionChoices: [{ id: ReactionLike, label: "Like" }] }} on={{ openActor, openTarget, react }} />)
        fireEvent.click(screen.getByRole("button", { name: "Ada" }))
        fireEvent.click(screen.getByRole("button", { name: "Task" }))
        fireEvent.click(screen.getByRole("button", { name: "React" }))
        fireEvent.click(screen.getByRole("button", { name: "Like" }))
        expect(openActor).toHaveBeenCalledTimes(1)
        expect(openTarget).toHaveBeenCalledTimes(1)
        expect(react).toHaveBeenCalledWith(ReactionLike)
    })

    it("keeps a mine reaction read-only and omits absent target/reaction", () => {
        render(<ActivityRow props={{ id: "a", actor: "Ada", action: "joined", time: "today", isMine: true }} />)
        expect(screen.getByRole("button", { name: "Ada" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "React" })).not.toBeInTheDocument()
        expect(screen.getByText("joined")).toBeInTheDocument()
    })
})