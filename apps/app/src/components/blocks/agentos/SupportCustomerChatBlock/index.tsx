"use client";

import { Button, Heading, MarkdownComponent, SurfaceCard, Text } from "@nivo/ui";
import type { SupportCustomerConversation, SupportCustomerMessage } from "@/modules/api/workspace-controlplane";

/** Inputs for one selected durable channel conversation. */
export type SupportCustomerChatBlockProps = {
  readonly conversation: SupportCustomerConversation | null;
  readonly messages: ReadonlyArray<SupportCustomerMessage>;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly onApprove: (decisionId: string) => void;
  readonly onTakeover: (conversationId: string, takeover: boolean) => void;
  readonly onReconcile: (outboxId: string, delivered: boolean) => void;
};
const senderLabel = (message: SupportCustomerMessage): string => {
  if (message.direction === "inbound") return "Customer";
  return message.senderType === "operator" ? "Operator" : "Nivo AI";
};
const takeoverLabel = (conversation: SupportCustomerConversation): string => conversation.takeoverState === "operator" ? "Return to Nivo AI" : "Take over conversation";
const transcriptNotice = (refused: boolean, pending: boolean, messageCount: number): string => {
  if (refused) return "The workspace controller refused or could not return this conversation.";
  if (messageCount > 0) return "Customer history is workspace-local and separate from internal Execute chat.";
  return pending ? "Loading customer history…" : "No messages in this conversation.";
};
const contextLabel = (message: SupportCustomerMessage): string => [message.deliveryState, message.contextDigest === null ? "customer evidence" : `context ${message.contextDigest.slice(0, 8)}`, message.policyClass].filter((value): value is string => value !== null).join(" · ");
const messageWidget = (message: SupportCustomerMessage, pending: boolean, onApprove: (decisionId: string) => void, onReconcile: (outboxId: string, delivered: boolean) => void) => {
  if (message.deliveryState === "approval_required" && message.decisionId !== null) {
    return <div><div>

        <Heading props={{
          content: "Owner approval required",
          level: 4
        }} />
        <Text props={{
          content: "This reply can create a risky commitment and has not been sent.",
          size: "xs",
          tone: "muted"
        }} /></div><div><>


          <Button props={{
            label: "Approve & send",
            variant: "primary",
            isPending: pending
          }} on={{
            press: () => onApprove(message.decisionId!)
          }} /></></div></div>;
  }
  if (message.deliveryState === "ambiguous" && message.deliveryOutboxId !== null) {
    return <div><div>

        <Heading props={{
          content: "Delivery needs reconciliation",
          level: 4
        }} />
        <Text props={{
          content: "Telegram timed out after send. Confirm the observed result before retrying.",
          size: "xs",
          tone: "muted"
        }} /></div><div><>



          <Button props={{
            label: "Mark sent",
            variant: "primary",
            isPending: pending
          }} on={{
            press: () => onReconcile(message.deliveryOutboxId!, true)
          }} />
          <Button props={{
            label: "Mark failed",
            variant: "secondary",
            isPending: pending
          }} on={{
            press: () => onReconcile(message.deliveryOutboxId!, false)
          }} /></></div></div>;
  }
  return undefined;
};

/** Durable customer transcript with explicit approval, takeover and ambiguous-delivery recovery. */
export const SupportCustomerChatBlock = (props: SupportCustomerChatBlockProps) => {
  const {
    conversation,
    messages,
    pending,
    refused,
    onApprove,
    onTakeover,
    onReconcile
  }: SupportCustomerChatBlockProps = props;
  return <SurfaceCard props={{
    label: "Telegram history",
    fact: conversation?.customerName ?? conversation?.displayHandle ?? "Select a customer",
    isFrameless: true
  }}><div>{messages.map((message, index) => <div key={index}>
      <Text props={{
          content: senderLabel(message),
          size: "xs",
          tone: "muted",
          weight: "semibold"
        }} />
      <MarkdownComponent markdown={message.body} />
      <Text props={{
          content: `${contextLabel(message)} · ${new Date(message.occurredAt).toLocaleString()}`,
          size: "xs",
          tone: "muted"
        }} />{messageWidget(message, pending, onApprove, onReconcile)}</div>)}{conversation === null ? undefined : <Button props={{
        label: takeoverLabel(conversation),
        variant: "secondary",
        isPending: pending
      }} on={{
        press: () => onTakeover(conversation.id, conversation.takeoverState !== "operator")
      }} />}


    <Text props={{
        content: transcriptNotice(refused, pending, messages.length),
        size: "sm",
        tone: "muted",
        live: refused ? "assertive" : undefined
      }} /></div></SurfaceCard>;
};
