import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ActivityRow } from "./ActivityRow"
import { ProfileRow } from "./ProfileRow"
import { RequestSummary } from "./RequestSummary"
import { StatRow } from "./StatRow"
import { ReactionType } from "../leaves/ReactionPicker/reaction-type"

describe("ActivityRow", () => {
    it("opens actor and target links and allows reactions", () => {
        const openActor = vi.fn()
        const openTarget = vi.fn()
        const react = vi.fn()
        render(<ActivityRow props={{ id: "a", actor: "Ada", action: "completed", target: "Task", time: "today", reactionLabel: "React", reactionCount: 1, reactionChoices: [{ id: ReactionType.Like, label: "Like" }] }} on={{ openActor, openTarget, react }} />)
        fireEvent.click(screen.getByRole("link", { name: "Ada" }))
        fireEvent.click(screen.getByRole("link", { name: "Task" }))
        fireEvent.click(screen.getByRole("button", { name: "React" }))
        fireEvent.click(screen.getByRole("button", { name: "Like" }))
        expect(openActor).toHaveBeenCalledTimes(1)
        expect(openTarget).toHaveBeenCalledTimes(1)
        expect(react).toHaveBeenCalledWith(ReactionType.Like)
    })

    it("keeps a mine reaction read-only and omits absent target/reaction", () => {
        render(<ActivityRow props={{ id: "a", actor: "Ada", action: "joined", time: "today", isMine: true }} />)
        expect(screen.getByRole("link", { name: "Ada" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "React" })).not.toBeInTheDocument()
        expect(screen.getByText("joined")).toBeInTheDocument()
    })
})

describe("ProfileRow and RequestSummary", () => {
    it("presses a profile row with its accessible name", () => {
        const press = vi.fn()
        render(<ProfileRow props={{ displayName: "Ada", username: "ada" }} on={{ press }} />)
        fireEvent.click(screen.getByRole("button", { name: "Ada" }))
        expect(press).toHaveBeenCalledTimes(1)
    })

    it("renders request details with an optional action", () => {
        const press = vi.fn()
        render(<RequestSummary props={{ subject: "Access request", detail: "Needs review", actionLabel: "Review" }} on={{ press }} />)
        fireEvent.click(screen.getByRole("button", { name: "Review" }))
        expect(screen.getByText("Needs review")).toBeInTheDocument()
        expect(press).toHaveBeenCalledTimes(1)
    })
})

describe("StatRow", () => {
    it("keeps its label while loading the optional value", () => {
        render(<StatRow props={{ icon: "streak", label: "Streak", value: "12 days" }} isLoading />)
        expect(screen.getByText("Streak")).toBeInTheDocument()
        expect(screen.queryByText("12 days")).not.toBeInTheDocument()
        expect(document.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
    })
})