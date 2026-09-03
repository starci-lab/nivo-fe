"use client";
import { SurfaceCard, Button, Heading, Text } from "@starci/grammar/core";

import { MarkdownComponent } from "@nivo/ui";
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

        <Heading level={4}>{"Owner approval required"}</Heading>
        <Text size="xs" tone="muted">{"This reply can create a risky commitment and has not been sent."}</Text></div><div><>


          <Button
            variant="primary"
            isPending={pending}
            onPress={() => onApprove(message.decisionId!)}
          >Approve & send</Button></></div></div>;
  }
  if (message.deliveryState === "ambiguous" && message.deliveryOutboxId !== null) {
    return <div><div>

        <Heading level={4}>{"Delivery needs reconciliation"}</Heading>
        <Text size="xs" tone="muted">{"Telegram timed out after send. Confirm the observed result before retrying."}</Text></div><div><>



          <Button
            variant="primary"
            isPending={pending}
            onPress={() => onReconcile(message.deliveryOutboxId!, true)}
          >Mark sent</Button>
          <Button
            variant="secondary"
            isPending={pending}
            onPress={() => onReconcile(message.deliveryOutboxId!, false)}
          >Mark failed</Button></></div></div>;
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
  return <SurfaceCard
    label="Telegram history"
    frame="frameless"
    fact={conversation?.customerName ?? conversation?.displayHandle ?? "Select a customer"}
  ><div>{messages.map((message, index) => <div key={index}>
      <Text size="xs" tone="muted" weight="semibold">{senderLabel(message)}</Text>
      <MarkdownComponent markdown={message.body} />
      <Text size="xs" tone="muted">{`${contextLabel(message)} · ${new Date(message.occurredAt).toLocaleString()}`}</Text>{messageWidget(message, pending, onApprove, onReconcile)}</div>)}{conversation === null ? undefined : <Button
          variant="secondary"
          isPending={pending}
          onPress={() => onTakeover(conversation.id, conversation.takeoverState !== "operator")}
        >{takeoverLabel(conversation)}</Button>}


    <Text size="sm" tone="muted" live={refused ? "assertive" : undefined}>{transcriptNotice(refused, pending, messages.length)}</Text></div></SurfaceCard>;
};
