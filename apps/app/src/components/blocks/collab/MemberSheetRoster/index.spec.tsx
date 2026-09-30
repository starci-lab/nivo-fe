import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemberSheetRoster } from "./index"
import { labels, baseView } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("MemberSheetRoster", () => {
    it("renders the current member roster", async () => {
        const { container } = render(<MemberSheetRoster view={baseView()} labels={labels} />)
        expect(screen.getByText("An Nguyen")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
