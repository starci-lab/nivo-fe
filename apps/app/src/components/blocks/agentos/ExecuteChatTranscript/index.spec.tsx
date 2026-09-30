import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { ExecuteChatBlockCopy, ExecuteMessage } from "../../../../modules/agentos/execute-chat"
import { ExecuteChatTranscript } from "."

const copy: ExecuteChatBlockCopy = {
    executeChat: {
        acceptTask: "Accept",
        ai: "AI",
        attachment: ({ label }) => label,
        messageLabel: "Message",
        openWorkbench: "Open",
        placeholder: "Write",
        refused: "Refused",
        schema: ({ version }) => version,
        send: "Send",
        system: "System",
        title: "Execute",
        typedInput: "Typed",
        widgetRefused: "Widget refused",
        you: "You",
    },
    fields: {
        amount: "Amount",
        approvalState: "Approval",
        citations: "Citations",
        confidence: "Confidence",
        conflicts: "Conflicts",
        currency: "Currency",
        dateTime: "Date",
        options: "Options",
        priority: "Priority",
        sla: "SLA",
        status: "Status",
        summary: "Summary",
        timeZone: "Time zone",
        title: "Title",
    },
    labels: { action: ({ key }) => key, field: ({ key }) => key },
    widgets: {
        calendarCaption: "Calendar",
        calendarNotice: "Notice",
        calendarTitle: "Calendar",
        financeCaption: "Finance",
        financeNotice: "Notice",
        financeTitle: "Finance",
        knowledgeCaption: "Knowledge",
        knowledgeNotice: "Notice",
        knowledgeTitle: "Knowledge",
        supportCaption: "Support",
        supportNotice: "Notice",
        supportTitle: "Support",
    },
}

const message: ExecuteMessage = {
    id: "message-1",
    role: "user",
    content: "Fallback",
    contextLabel: "Bound context",
    messageTree: { schemaVersion: 1, nodes: [{ type: "markdown", markdown: "Visible answer" }] },
}

describe("ExecuteChatTranscript", () => {
    it("uses the message tree and keeps its role and context labels", async () => {
        const { container } = render(<ExecuteChatTranscript copy={copy} messages={[message]} registry={{}} />)
        expect(screen.getByText("Visible answer")).toBeInTheDocument()
        expect(screen.getByText("You")).toBeInTheDocument()
        expect(screen.getByText("Bound context")).toBeInTheDocument()
        expect(screen.queryByText("Fallback")).toBeNull()
        await expectNoA11yViolations(container)
    })
})
