import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemberRow } from "./index"
import { PARTICIPANTS, labels } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("MemberRow", () => {
    it("renders the current member roster", async () => {
        const { container } = render(<MemberRow participant={PARTICIPANTS[0]!} labels={labels} />)
        expect(screen.getByText("An Nguyen")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
