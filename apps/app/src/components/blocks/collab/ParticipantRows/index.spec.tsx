import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { labels, PARTICIPANTS } from "../../../../modules/collab/group-chat/test-fixtures.fixture"
import { ParticipantRows } from "./index"

describe("ParticipantRows", () => {
    it("renders participant rows with the selected density", async () => {
        const { container } = render(
            <ParticipantRows participants={PARTICIPANTS} labels={labels} density="compact" empty="No members" />,
        )

        expect(screen.getByText("An Nguyen")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })

    it("renders the supplied empty state when no participants are present", () => {
        render(<ParticipantRows participants={[]} labels={labels} density="roomy" empty="No members" />)

        expect(screen.getByText("No members")).toBeInTheDocument()
    })
})
