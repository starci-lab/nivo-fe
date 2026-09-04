import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations, createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { SupportCustomerChatBlock as ActualSupportCustomerChatBlock } from "./SupportCustomerChatBlock"
import { SupportCustomerConversationRailBlock as ActualSupportCustomerConversationRailBlock } from "./SupportCustomerConversationRailBlock"
import { SupportQueueWorkbenchBlock as ActualSupportQueueWorkbenchBlock } from "./SupportQueueWorkbenchBlock"

describe.each(["en", "vi"] as const)("Support customer operations cockpit %s", locale => {
    const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules" }))
    const conversation = {
        id: "conversation-1", installationId: "installation-1", displayHandle: "starci183", customerName: "StarCi 183",
        takeoverState: "ai", unreadCount: 1, lastMessageAt: "2026-08-26T00:00:00.000Z",
    }

    it("keeps customer identity, Markdown transcript and queued evidence visible", () => {
        const rail = renderToStaticMarkup(<SupportCustomerConversationRailBlock locale={locale} conversations={[conversation]} selectedId={conversation.id} pending={false} onSelect={vi.fn()} />)
        const chat = renderToStaticMarkup(<SupportCustomerChatBlock locale={locale}
            conversation={conversation}
            messages={[{
                id: "message-1", conversationId: conversation.id, direction: "inbound", senderType: "customer",
                body: "## Sự cố\n\nCăn hộ A-1203 mất điện toàn bộ.", sequence: 1, contextDigest: null, policyClass: null,
                decisionId: null, deliveryOutboxId: null, deliveryState: "received", failureCode: null,
                occurredAt: "2026-08-26T00:00:00.000Z",
            }]}
            pending={false}
            refused={false}
            onApprove={vi.fn()}
            onTakeover={vi.fn()}
            onReconcile={vi.fn()}
        />)
        const queue = renderToStaticMarkup(<SupportQueueWorkbenchBlock locale={locale}
            facts={[{
                id: "fact-1", conversationId: conversation.id, ticketId: "ticket-1", sourceMessageId: "message-1",
                factType: "apartment", value: "A-1203", confidence: "1.000", createdAt: "2026-08-26T00:00:00.000Z",
            }]}
            tickets={[{
                id: "ticket-1", conversationId: conversation.id, title: "Power outage A-1203",
                summary: "Customer reports a full apartment outage", priority: "urgent", state: "open", evidenceCount: 1,
                updatedAt: "2026-08-26T00:00:00.000Z",
            }]}
            selectedConversationId={conversation.id}
            pending={false}
        />)

        expect(rail).toContain("StarCi 183")
        expect(chat).toContain("Sự cố")
        expect(chat).toContain("mất điện toàn bộ")
        expect(queue).toContain("Power outage A-1203")
        expect(queue).toContain(copy.queue.ticketValue({ summary: "Customer reports a full apartment outage", count: 1, state: copy.shell.unknownStatus({ status: "open" }) }))
        expect(queue).toContain("A-1203")
    })
})
type SupportCustomerChatBlockFixtureProps = Omit<ComponentProps<typeof ActualSupportCustomerChatBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const SupportCustomerChatBlockCopyFixture = (props: SupportCustomerChatBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualSupportCustomerChatBlock {...props} copy={buildModulePageCopy(t)} />
}
const SupportCustomerChatBlock = ({ locale = "en", ...props }: SupportCustomerChatBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><SupportCustomerChatBlockCopyFixture {...props} /></NextIntlClientProvider>


type SupportCustomerConversationRailBlockFixtureProps = Omit<ComponentProps<typeof ActualSupportCustomerConversationRailBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const SupportCustomerConversationRailBlockCopyFixture = (props: SupportCustomerConversationRailBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualSupportCustomerConversationRailBlock {...props} copy={buildModulePageCopy(t)} />
}
const SupportCustomerConversationRailBlock = ({ locale = "en", ...props }: SupportCustomerConversationRailBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><SupportCustomerConversationRailBlockCopyFixture {...props} /></NextIntlClientProvider>


type SupportQueueWorkbenchBlockFixtureProps = Omit<ComponentProps<typeof ActualSupportQueueWorkbenchBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const SupportQueueWorkbenchBlockCopyFixture = (props: SupportQueueWorkbenchBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualSupportQueueWorkbenchBlock {...props} copy={buildModulePageCopy(t)} />
}
const SupportQueueWorkbenchBlock = ({ locale = "en", ...props }: SupportQueueWorkbenchBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><SupportQueueWorkbenchBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Customer transcript states %s", locale => {
 it.each([[false, false, "empty"], [true, false, "loading"], [true, true, "refused"]] as const)("keeps pending=%s refused=%s at its own transcript", (pending, refused, label) => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.customerChat
  const html = renderToStaticMarkup(<SupportCustomerChatBlock locale={locale} conversation={null} messages={[]} pending={pending} refused={refused} onApprove={vi.fn()} onTakeover={vi.fn()} onReconcile={vi.fn()} />)
  expect(html).toContain(copy[label])
 })
})


describe.each(["en", "vi"] as const)("Customer action payloads %s", locale => {
 const copy = buildModulePageCopy(createTranslator({ locale, messages: locale === "en" ? enMessages : viMessages, namespace: "console.agentos.modules", timeZone: TIME_ZONE, onError: error => { throw error } }))
 const conversation = { id: "conversation/raw", installationId: "installation/raw", customerName: null, displayHandle: "Raw handle", takeoverState: "ai", unreadCount: 0, lastMessageAt: "2026-08-26T00:00:00.000Z" }
 const baseMessage = { id: "message/raw", conversationId: conversation.id, direction: "outbound", senderType: "operator", body: "**Owner reply**", sequence: 1, contextDigest: "abcdef0123456789", policyClass: "policy/raw", decisionId: "decision/raw", deliveryOutboxId: "outbox/raw", deliveryState: "approval_required", failureCode: null, occurredAt: "2026-08-26T00:00:00.000Z" }
 it("preserves approval, takeover and reconciliation IDs and booleans", () => {
  const onApprove = vi.fn(); const onTakeover = vi.fn(); const onReconcile = vi.fn()
  const props = { locale, conversation, messages: [baseMessage], pending: false, refused: false, onApprove, onTakeover, onReconcile }
  const view = render(<SupportCustomerChatBlock {...props} />)
  expect(screen.getByText("Raw handle")).toBeInTheDocument()
  expect(screen.getByText("**Owner reply**")).toHaveAttribute("data-component", "Text")
  expect(screen.getByText(copy.customerChat.operator)).toBeInTheDocument()
  expect(screen.getByText(copy.customerChat.context({ digest: "abcdef01" }), { exact: false })).toHaveTextContent(copy.labels.policy({ policy: "policy/raw" }))
  expect(screen.getByText(copy.customerChat.context({ digest: "abcdef01" }), { exact: false })).toHaveTextContent(copy.deliveryStatus.approval_required)
  fireEvent.click(screen.getByRole("button", { name: copy.customerChat.approve }))
  fireEvent.click(screen.getByRole("button", { name: copy.customerChat.takeover }))
  expect(onApprove).toHaveBeenCalledExactlyOnceWith("decision/raw")
  expect(onTakeover).toHaveBeenCalledExactlyOnceWith("conversation/raw", true)
  view.rerender(<SupportCustomerChatBlock {...props} conversation={{ ...conversation, takeoverState: "operator" }} messages={[{ ...baseMessage, deliveryState: "ambiguous", senderType: "ai" }]} />)
  fireEvent.click(screen.getByRole("button", { name: copy.customerChat.return }))
  fireEvent.click(screen.getByRole("button", { name: copy.customerChat.markSent }))
  fireEvent.click(screen.getByRole("button", { name: copy.customerChat.markFailed }))
  expect(onTakeover.mock.calls).toEqual([["conversation/raw", true], ["conversation/raw", false]])
  expect(onReconcile.mock.calls).toEqual([["outbox/raw", true], ["outbox/raw", false]])
  view.rerender(<SupportCustomerChatBlock {...props} pending refused messages={[{ ...baseMessage, decisionId: null, deliveryState: "constructor" }]} />)
  expect(screen.queryByRole("button", { name: copy.customerChat.approve })).toBeNull()
  expect(screen.getByText(copy.shell.unknownStatus({ status: "constructor" }), { exact: false })).toBeInTheDocument()
  expect(screen.getByText(copy.customerChat.refused)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: copy.customerChat.takeover })).toBeDisabled()
  view.unmount()
 })
 it.each(["low", "normal", "high", "urgent", "constructor", "__proto__"])("keeps %s priority and queue selection as raw data", priority => {
  const ticket = { id: "ticket/raw", conversationId: conversation.id, title: "Owner incident", summary: "Raw summary", priority, state: "raw-state", evidenceCount: 2, updatedAt: "2026-08-26T00:00:00.000Z" }
  const view = render(<SupportQueueWorkbenchBlock locale={locale} facts={[]} tickets={[ticket]} selectedConversationId={null} pending={false} />)
  const priorityLabel = priority === "low" || priority === "normal" || priority === "high" || priority === "urgent" ? copy.priority[priority] : copy.labels.priority({ priority })
  expect(screen.getByText(`${priorityLabel} · Owner incident`)).toBeInTheDocument()
  expect(screen.getByText(copy.queue.ticketValue({ summary: "Raw summary", count: 2, state: copy.shell.unknownStatus({ status: "raw-state" }) }))).toBeInTheDocument()
  view.rerender(<SupportQueueWorkbenchBlock locale={locale} facts={[]} tickets={[ticket]} selectedConversationId="other" pending />)
  expect(screen.getByText(copy.queue.loadingTasks)).toBeInTheDocument()
  expect(screen.getByText(copy.queue.loadingFacts)).toBeInTheDocument()
  view.rerender(<SupportQueueWorkbenchBlock locale={locale} facts={[]} tickets={[ticket]} selectedConversationId="other" pending={false} />)
  expect(screen.getByText(copy.queue.noTasks)).toBeInTheDocument()
  expect(screen.getByText(copy.queue.noFacts)).toBeInTheDocument()
  view.unmount()
 })
})




describe.each(["en", "vi"] as const)("Customer rail read states %s", locale => {
 it("preserves handle fallback and distinguishes operator takeover from a read timestamp", () => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.conversations
  const conversation = { id: "read/raw", installationId: "installation/raw", customerName: null, displayHandle: "Owner handle", takeoverState: "operator", unreadCount: 0, lastMessageAt: "2026-08-26T00:00:00.000Z" }
  const view = render(<SupportCustomerConversationRailBlock locale={locale} conversations={[conversation]} selectedId={null} pending onSelect={vi.fn()} />)
  expect(screen.getAllByText("Owner handle")).toHaveLength(2)
  expect(screen.getAllByText(copy.takeover)).toHaveLength(2)
  for (const button of screen.getAllByRole("button", { name: copy.syncing })) expect(button).toBeDisabled()
  view.rerender(<SupportCustomerConversationRailBlock locale={locale} conversations={[{ ...conversation, takeoverState: "ai" }]} selectedId={conversation.id} pending={false} onSelect={vi.fn()} />)
  expect(screen.getAllByText(new Date(conversation.lastMessageAt).toLocaleString())).toHaveLength(2)
  expect(screen.queryByText(copy.takeover)).toBeNull()
  view.unmount()
 })
})
