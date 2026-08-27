"use client"

import {
    Button, Heading, MarkdownComponent, SurfaceCard, Text,
    defineContractComponent, defineContractProjection, defineLeafComponent,
} from "@nivo/ui"
import type { SupportCustomerConversation, SupportCustomerMessage } from "@/modules/api/workspace-controlplane"

/** Inputs for one selected durable channel conversation. */
export type SupportCustomerChatBlockProps = {
    readonly conversation: SupportCustomerConversation | null
    readonly messages: ReadonlyArray<SupportCustomerMessage>
    readonly pending: boolean
    readonly refused: boolean
    readonly onApprove: (decisionId: string) => void
    readonly onTakeover: (conversationId: string, takeover: boolean) => void
    readonly onReconcile: (outboxId: string, delivered: boolean) => void
}

const senderLabel = (message: SupportCustomerMessage): string => {
    if (message.direction === "inbound") return "Customer"
    return message.senderType === "operator" ? "Operator" : "Nivo AI"
}

const takeoverLabel = (conversation: SupportCustomerConversation): string => (
    conversation.takeoverState === "operator" ? "Return to Nivo AI" : "Take over conversation"
)

const transcriptNotice = (refused: boolean, pending: boolean, messageCount: number): string => {
    if (refused) return "The workspace controller refused or could not return this conversation."
    if (messageCount > 0) return "Customer history is workspace-local and separate from internal Execute chat."
    return pending ? "Loading customer history…" : "No messages in this conversation."
}

const contextLabel = (message: SupportCustomerMessage): string => [
    message.deliveryState,
    message.contextDigest === null ? "customer evidence" : `context ${message.contextDigest.slice(0, 8)}`,
    message.policyClass,
].filter((value): value is string => value !== null).join(" · ")

const messageWidget = (
    message: SupportCustomerMessage,
    pending: boolean,
    onApprove: (decisionId: string) => void,
    onReconcile: (outboxId: string, delivered: boolean) => void,
) => {
    if (message.deliveryState === "approval_required" && message.decisionId !== null) {
        return defineContractComponent("agentos-widget-panel", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Owner approval required", level: 4 }} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "This reply can create a risky commitment and has not been sent.", size: "xs", tone: "muted" }} />),
            }),
            action: defineContractComponent("inline-action-run", {
                action: [defineLeafComponent("button", {}, () => <Button props={{ label: "Approve & send", variant: "primary", isPending: pending }} on={{ press: () => onApprove(message.decisionId!) }} />)],
            }),
        })
    }
    if (message.deliveryState === "ambiguous" && message.deliveryOutboxId !== null) {
        return defineContractComponent("agentos-widget-panel", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Delivery needs reconciliation", level: 4 }} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "Telegram timed out after send. Confirm the observed result before retrying.", size: "xs", tone: "muted" }} />),
            }),
            action: defineContractComponent("inline-action-run", {
                action: [
                    defineLeafComponent("button", {}, () => <Button props={{ label: "Mark sent", variant: "primary", isPending: pending }} on={{ press: () => onReconcile(message.deliveryOutboxId!, true) }} />),
                    defineLeafComponent("button", {}, () => <Button props={{ label: "Mark failed", variant: "secondary", isPending: pending }} on={{ press: () => onReconcile(message.deliveryOutboxId!, false) }} />),
                ],
            }),
        })
    }
    return undefined
}

/** Durable customer transcript with explicit approval, takeover and ambiguous-delivery recovery. */
export const SupportCustomerChatBlock = ({ conversation, messages, pending, refused, onApprove, onTakeover, onReconcile }: SupportCustomerChatBlockProps) => (
    <SurfaceCard
        props={{ label: "Telegram history", fact: conversation?.customerName ?? conversation?.displayHandle ?? "Select a customer" }}
        contract="agentos-chat-body"
        render={defineContractComponent("agentos-chat-body", {
            message: messages.map((message) => defineContractComponent("agentos-execute-message", {
                actor: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: senderLabel(message), size: "xs", tone: "muted", weight: "semibold" }} />),
                content: defineContractProjection("agentos-markdown-content", () => <MarkdownComponent markdown={message.body} />),
                context: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: `${contextLabel(message)} · ${new Date(message.occurredAt).toLocaleString()}`, size: "xs", tone: "muted" }} />),
                widget: messageWidget(message, pending, onApprove, onReconcile),
            })),
            action: conversation === null ? undefined : defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: takeoverLabel(conversation), variant: "secondary", isPending: pending }}
                    on={{ press: () => onTakeover(conversation.id, conversation.takeoverState !== "operator") }}
                />
            )),
            notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{
                content: transcriptNotice(refused, pending, messages.length),
                size: "sm", tone: "muted", live: refused ? "assertive" : undefined,
            }} />),
        })}
    />
)

/** Source-level tier marker for the pure customer transcript. */
export const meta = { shape: "block", world: "pure" } as const
