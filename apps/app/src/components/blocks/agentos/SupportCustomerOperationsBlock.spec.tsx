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
