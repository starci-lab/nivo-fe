import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { ExecuteChatBlockCopy, ChatWidgetPayload } from "../../../../modules/agentos/execute-chat"
import { ExecuteChatWidget } from "."

const copy: ExecuteChatBlockCopy = {
    executeChat: {
        acceptTask: "Accept task",
        ai: "AI",
        attachment: ({ label, mediaType }) => `${label} (${mediaType})`,
        messageLabel: "Message",
        openWorkbench: "Open in workbench",
        placeholder: "Write a message",
        refused: "Refused",
        schema: ({ version }) => `Schema ${version}`,
        send: "Send",
        system: "System",
        title: "Execute",
        typedInput: "Typed input required",
        widgetRefused: "Widget refused",
        you: "You",
    },
    fields: {
        amount: "Amount",
        approvalState: "Approval state",
        citations: "Citations",
        confidence: "Confidence",
        conflicts: "Conflicts",
        currency: "Currency",
        dateTime: "Date and time",
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
        calendarCaption: "Calendar details",
        calendarNotice: "Calendar notice",
        calendarTitle: "Calendar options",
        financeCaption: "Finance details",
        financeNotice: "Finance notice",
        financeTitle: "Finance approval",
        knowledgeCaption: "Knowledge details",
        knowledgeNotice: "Knowledge notice",
        knowledgeTitle: "Knowledge evidence",
        supportCaption: "Support details",
        supportNotice: "Support notice",
        supportTitle: "Support follow-up",
    },
}

const payload = (component: string, props: Readonly<Record<string, string | number>>) =>
    ({
        id: "widget-1",
        node: { component, version: "1.0.0", props },
        actions: [
            { key: "open-task", inputKeys: ["taskId"] },
            { key: "accept", inputKeys: ["taskId", "expectedVersion"] },
            { key: "refresh", inputKeys: [] },
        ],
    }) as ChatWidgetPayload

describe("ExecuteChatWidget", () => {
    it("keeps the structured widget read-only unless an action requires no input", async () => {
        const onAction = vi.fn()
        const { container } = render(<ExecuteChatWidget copy={copy} payload={payload("nivo.metric", { amount: 12 })} onAction={onAction} />)
        expect(screen.getByText("Schema 1.0.0")).toBeInTheDocument()
        expect(screen.getByText("amount")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "refresh" }))
        expect(onAction).toHaveBeenCalledExactlyOnceWith("widget-1", "refresh", {})
        await expectNoA11yViolations(container)
    })

    it("admits operation actions only with the required runtime values", () => {
        const onAction = vi.fn()
        render(
            <ExecuteChatWidget
                copy={copy}
                payload={payload("nivo.support-task", { taskId: "task-1", expectedVersion: 3, title: "Call back" })}
                onAction={onAction}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Open in workbench" }))
        fireEvent.click(screen.getByRole("button", { name: "Accept task" }))
        expect(onAction.mock.calls).toEqual([
            ["widget-1", "open-task", { taskId: "task-1" }],
            ["widget-1", "accept", { taskId: "task-1", expectedVersion: 3 }, 3],
        ])
    })
})
