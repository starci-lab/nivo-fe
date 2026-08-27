import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { SupportCustomerChatBlock } from "./SupportCustomerChatBlock"
import { SupportCustomerConversationRailBlock } from "./SupportCustomerConversationRailBlock"
import { SupportQueueWorkbenchBlock } from "./SupportQueueWorkbenchBlock"

describe("Support customer operations cockpit", () => {
    const conversation = {
        id: "conversation-1", installationId: "installation-1", displayHandle: "starci183", customerName: "StarCi 183",
        takeoverState: "ai", unreadCount: 1, lastMessageAt: "2026-08-26T00:00:00.000Z",
    }

    it("keeps customer identity, Markdown transcript and queued evidence visible", () => {
        const rail = renderToStaticMarkup(<SupportCustomerConversationRailBlock conversations={[conversation]} selectedId={conversation.id} pending={false} onSelect={vi.fn()} />)
        const chat = renderToStaticMarkup(<SupportCustomerChatBlock
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
        const queue = renderToStaticMarkup(<SupportQueueWorkbenchBlock
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
        expect(queue).toContain("Evidence 1")
        expect(queue).toContain("A-1203")
    })
})
