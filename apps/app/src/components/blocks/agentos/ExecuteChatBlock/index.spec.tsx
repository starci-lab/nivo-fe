import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ExecuteChatBlock, type ExecuteMessage } from "."

const message = (component: string, props: Readonly<Record<string, string | number>>): ExecuteMessage => ({
    id: component,
    role: "assistant",
    content: "Fallback content",
    contextLabel: "Bound to context v1",
    messageTree: {
        schemaVersion: 1,
        nodes: [
            { type: "markdown", markdown: "## Proactive update\n\n- Evidence accepted\n- No external mutation" },
            { type: "widget", widget: { component, version: "1.0.0", props } },
        ],
    },
    widget: {
        id: `widget-${component}`,
        node: { component, version: "1.0.0", props },
        actions: [
            { key: "open-task", inputKeys: ["taskId"] },
            { key: "accept", inputKeys: ["taskId", "expectedVersion"] },
        ],
    },
})

describe("ExecuteChatBlock", () => {
    it.each([
        ["nivo.support-task", "Support follow-up", { taskId: "task-1", expectedVersion: 1, title: "Customer waiting", sla: "18 minutes" }],
        ["nivo.finance-approval", "Finance approval", { taskId: "task-2", expectedVersion: 2, title: "Invoice review", amount: 24_800_000, currency: "VND" }],
        ["nivo.calendar-options", "Scheduling options", { taskId: "task-3", expectedVersion: 1, title: "Confirm meeting", timeZone: "Asia/Bangkok" }],
        ["nivo.knowledge-evidence", "Knowledge evidence", { taskId: "task-4", expectedVersion: 3, title: "Grounded answer", confidence: "high" }],
    ])("renders trusted %s through its distinct component", (component, expectedTitle, props) => {
        const html = renderToStaticMarkup(
            <ExecuteChatBlock sessionTitle="Primary Operations" messages={[message(component, props)]} onSend={vi.fn()} onWidgetAction={vi.fn()} />,
        )
        expect(html).toContain("Proactive update")
        expect(html).toContain("Evidence accepted")
        expect(html).toContain(expectedTitle)
        expect(html).toContain("Open in workbench")
        expect(html).toContain("Accept task")
        expect(html).not.toContain("Widget refused")
    })

    it("fails closed for an unregistered widget identity", () => {
        const html = renderToStaticMarkup(
            <ExecuteChatBlock sessionTitle="Primary Operations" messages={[message("untrusted.widget", { taskId: "task-x" })]} onSend={vi.fn()} />,
        )
        expect(html).toContain("Widget refused")
        expect(html).toContain("No trusted ComponentType is registered")
    })
})