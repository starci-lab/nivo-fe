import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/collab/GroupChatPage", () => ({
    GroupChatPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { GroupChatPage } from "."

describe("GroupChatPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<GroupChatPage />)
        expect(screen.getByTestId("block")).toHaveTextContent("{}")
    })
})