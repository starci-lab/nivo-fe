import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ExecuteChatBlock as ActualExecuteChatBlock, type ExecuteMessage } from "."

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
type ExecuteChatBlockFixtureProps = Omit<ComponentProps<typeof ActualExecuteChatBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const ExecuteChatBlockCopyFixture = (props: ExecuteChatBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualExecuteChatBlock {...props} copy={buildModulePageCopy(t)} />
}
const ExecuteChatBlock = ({ locale = "en", ...props }: ExecuteChatBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><ExecuteChatBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Execute widget copy %s", locale => {
 it.each(["support", "finance", "calendar", "knowledge"] as const)("localizes %s while preserving runtime values", family => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime
  const identities = { support: "nivo.support-task", finance: "nivo.finance-approval", calendar: "nivo.calendar-options", knowledge: "nivo.knowledge-evidence" }
  const titles = { support: copy.widgets.supportTitle, finance: copy.widgets.financeTitle, calendar: copy.widgets.calendarTitle, knowledge: copy.widgets.knowledgeTitle }
  const html = renderToStaticMarkup(<ExecuteChatBlock locale={locale} sessionTitle="Owner conversation" messages={[message(identities[family], { taskId: "raw-task", expectedVersion: 7, title: "Untranslated task" })]} onSend={vi.fn()} />)
  expect(html).toContain(titles[family])
  expect(html).toContain("Untranslated task")
  expect(html).toContain(copy.executeChat.acceptTask)
 })
})


describe.each(["en", "vi"] as const)("Execute action boundaries %s", locale => {
 const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
 it.each(["nivo.support-task", "nivo.finance-approval", "nivo.calendar-options", "nivo.knowledge-evidence"])("sends exact %s widget actions", component => {
  const onWidgetAction = vi.fn()
  const view = render(<ExecuteChatBlock locale={locale} sessionTitle="Raw session" messages={[message(component, { taskId: "task/raw", expectedVersion: 17, title: "Raw task" })]} onSend={vi.fn()} onWidgetAction={onWidgetAction} />)
  fireEvent.click(screen.getByRole("button", { name: copy.executeChat.openWorkbench }))
  fireEvent.click(screen.getByRole("button", { name: copy.executeChat.acceptTask }))
  expect(onWidgetAction.mock.calls).toEqual([[`widget-${component}`, "open-task", { taskId: "task/raw" }], [`widget-${component}`, "accept", { taskId: "task/raw", expectedVersion: 17 }, 17]])
  view.unmount()
 })
 it("renders structured raw fields, admits only no-input actions and refuses unknown versions", () => {
  const base = message("nivo.metric", { arbitrary_key: "Raw value" })
  const structured = { ...base, widget: { ...base.widget!, actions: [{ key: "refresh/raw", inputKeys: [] }, { key: "requires-input", inputKeys: ["secret"] }] } }
  const onWidgetAction = vi.fn()
  const view = render(<ExecuteChatBlock locale={locale} sessionTitle="Raw session" messages={[structured]} onSend={vi.fn()} onWidgetAction={onWidgetAction} />)
  expect(screen.getByText(copy.labels.field({ key: "arbitrary_key" }))).toBeInTheDocument()
  expect(screen.getByText("Raw value")).toBeInTheDocument()
  expect(screen.getByText(copy.executeChat.schema({ version: "1.0.0" }))).toBeInTheDocument()
  expect(screen.getByText(copy.executeChat.typedInput)).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: copy.labels.action({ key: "requires-input" }) })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: copy.labels.action({ key: "refresh/raw" }) }))
  expect(onWidgetAction).toHaveBeenCalledExactlyOnceWith("widget-nivo.metric", "refresh/raw", {})
  view.rerender(<ExecuteChatBlock locale={locale} sessionTitle="Raw session" messages={[{ ...structured, widget: { ...structured.widget, node: { ...structured.widget.node, version: "99.0.0" } } }]} onSend={vi.fn()} />)
  expect(screen.getByText(copy.executeChat.widgetRefused)).toBeInTheDocument()
  view.unmount()
 })
 it("uses raw Markdown fallback, trims a sent draft and disables pending composition", () => {
  const onSend = vi.fn()
  const rawMessage: ExecuteMessage = { id: "raw-message", role: "user", content: "**Raw fallback**", contextLabel: "Raw binding", messageTree: { schemaVersion: 1, nodes: [] } }
  const view = render(<ExecuteChatBlock locale={locale} sessionTitle="Raw session" messages={[rawMessage]} onSend={onSend} refused />)
  expect(screen.getByText("**Raw fallback**")).toHaveAttribute("data-component", "Text")
  expect(screen.getByText(copy.executeChat.you)).toBeInTheDocument()
  expect(screen.getByText(copy.executeChat.refused)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: copy.executeChat.send })).toBeDisabled()
  fireEvent.change(screen.getByRole("textbox", { name: copy.executeChat.messageLabel }), { target: { value: "  Owner input  " } })
  fireEvent.click(screen.getByRole("button", { name: copy.executeChat.send }))
  expect(onSend).toHaveBeenCalledExactlyOnceWith("Owner input")
  expect(screen.getByRole("textbox", { name: copy.executeChat.messageLabel })).toHaveValue("")
  view.rerender(<ExecuteChatBlock locale={locale} sessionTitle="Raw session" messages={[]} onSend={onSend} pending />)
  expect(screen.getByRole("textbox", { name: copy.executeChat.messageLabel })).toBeDisabled()
  view.unmount()
 })
})

describe.each(["en", "vi"] as const)("Execute attachment and closed admission %s", locale => {
 it("renders attachment copy beside Markdown and never substitutes fallback content", () => {
  const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
  const attachment: ExecuteMessage = { id: "message/raw", role: "system", content: "Unused fallback", contextLabel: "Raw binding", messageTree: { schemaVersion: 1, nodes: [{ type: "attachment", attachmentId: "attachment/raw", label: "Owner.pdf", mediaType: "application/pdf" }, { type: "markdown", markdown: "**Raw markdown**" }] } }
  const view = render(<ExecuteChatBlock locale={locale} sessionTitle="Owner session" messages={[attachment]} onSend={vi.fn()} />)
  expect(screen.getByText(copy.executeChat.attachment({ label: "Owner.pdf", mediaType: "application/pdf" }))).toBeInTheDocument()
  expect(screen.getByText("**Raw markdown**")).toHaveAttribute("data-component", "Text")
  expect(screen.getByText(copy.executeChat.system)).toBeInTheDocument()
  expect(screen.queryByText("Unused fallback")).toBeNull()
  const invalid = message("nivo.support-task", { taskId: 19, expectedVersion: "raw-version", title: "Raw task" })
  view.rerender(<ExecuteChatBlock locale={locale} sessionTitle="Owner session" messages={[invalid]} onSend={vi.fn()} />)
  expect(screen.queryByRole("button", { name: copy.executeChat.openWorkbench })).toBeNull()
  expect(screen.queryByRole("button", { name: copy.executeChat.acceptTask })).toBeNull()
  view.unmount()
 })
})



describe.each(["en", "vi"] as const)("Structured widget evidence shapes %s", locale => {
 it("preserves null, boolean and structured values and keeps an action-free widget inert", () => {
  const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
  const base = message("nivo.metric", {})
  const valueMessage: ExecuteMessage = { ...base, widget: { ...base.widget!, actions: [], node: { ...base.widget!.node, props: { absent: null, approved: true, count: 17, rows: ["raw", 2], detail: { raw: "value" } } } } }
  const view = render(<ExecuteChatBlock locale={locale} sessionTitle="Owner evidence" messages={[valueMessage]} onSend={vi.fn()} />)
  for (const rawValue of ["—", "true", "17", '["raw",2]', '{"raw":"value"}']) expect(screen.getByText(rawValue)).toBeInTheDocument()
  expect(screen.queryByText(copy.executeChat.typedInput)).toBeNull()
  view.rerender(<ExecuteChatBlock locale={locale} sessionTitle="Owner evidence" messages={[{ ...base, widget: { ...base.widget!, actions: [] } }]} onSend={vi.fn()} />)
  expect(screen.getByRole("heading", { name: "nivo.metric" })).toBeInTheDocument()
  expect(screen.queryByText(copy.labels.field({ key: "absent" }))).toBeNull()
  expect(screen.queryByText(copy.executeChat.typedInput)).toBeNull()
  view.unmount()
 })
 it("admits opening a task while withholding acceptance without a numeric version", () => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.executeChat
  const onWidgetAction = vi.fn()
  const view = render(<ExecuteChatBlock locale={locale} sessionTitle="Owner evidence" messages={[message("nivo.support-task", { taskId: "task/raw", expectedVersion: "unknown", title: "Owner task" })]} onSend={vi.fn()} onWidgetAction={onWidgetAction} />)
  expect(screen.queryByRole("button", { name: copy.acceptTask })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: copy.openWorkbench }))
  expect(onWidgetAction).toHaveBeenCalledExactlyOnceWith("widget-nivo.support-task", "open-task", { taskId: "task/raw" })
  view.unmount()
 })
})
