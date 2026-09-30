import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { ExecuteChatBlockCopy } from "../../../../modules/agentos/execute-chat"
import { ExecuteChatComposer } from "."

const copy = {
    executeChat: { messageLabel: "Message", placeholder: "Write a message", send: "Send", refused: "Refused" },
} as ExecuteChatBlockCopy

describe("ExecuteChatComposer", () => {
    it("enables sending only after a draft is present and passes the submit action", async () => {
        const onSubmit = vi.fn()
        const view = render(
            <ExecuteChatComposer
                copy={copy}
                draft=""
                composerKey={0}
                pending={false}
                refused={false}
                onDraft={vi.fn()}
                onSubmit={onSubmit}
            />,
        )
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
        view.rerender(
            <ExecuteChatComposer
                copy={copy}
                draft="hello"
                composerKey={0}
                pending={false}
                refused={false}
                onDraft={vi.fn()}
                onSubmit={onSubmit}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Send" }))
        expect(onSubmit).toHaveBeenCalledOnce()
        await expectNoA11yViolations(view.container)
    })
})
