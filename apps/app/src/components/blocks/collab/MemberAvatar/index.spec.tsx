import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemberAvatar } from "./index"

describe("MemberAvatar", () => {
    it("shows the member initials", async () => {
        const { container } = render(<MemberAvatar name="An Nguyen" kind="human" />)
        expect(screen.getByText("AN")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
