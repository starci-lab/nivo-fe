import { RosterRail } from "./index"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildConversationItems } from "@/modules/collab/group-chat/model"
import {
    MODULE_MESSAGE,
    TASK_WAITING_APPROVAL,
    labels,
    baseView,
} from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("RosterRail", () => {
    it("lists an empty roster on the decision rail", () => {
        const items = buildConversationItems({
            messages: [MODULE_MESSAGE],
            cards: [],
            tasks: [TASK_WAITING_APPROVAL],
            participants: [],
            viewerMemberId: null,
            unknownAuthor: labels.conversation.unknownAuthor,
        })
        render(<RosterRail view={baseView({ items, participants: [] })} labels={labels} />)
        expect(screen.getByText(labels.members.empty)).toBeInTheDocument()
        expect(screen.getByText(labels.members.noModules)).toBeInTheDocument()
    })
})
