import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemberAvatar } from "./index"

describe("MemberAvatar", () => {
    it("shows the member initials", () => {
        render(<MemberAvatar name="An Nguyen" kind="human" />)
        expect(screen.getByText("AN")).toBeInTheDocument()
    })
})
