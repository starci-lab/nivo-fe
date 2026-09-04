"use client";

type RuntimeCustomerChatContextValues = { readonly digest: string };
type RuntimeLabelsPolicyValues = { readonly policy: string };
type ShellUnknownStatusValues = { readonly status: string };

/** Settled display labels and typed formatters supplied by the page owner. */
export type SupportCustomerChatBlockCopy = {
  readonly "customerChat": {
    readonly "ai": string;
    readonly "approval": string;
    readonly "approvalNotice": string;
    readonly "approve": string;
    readonly "context": (values: RuntimeCustomerChatContextValues) => string;
    readonly "customer": string;
    readonly "empty": string;
    readonly "evidence": string;
    readonly "historyNotice": string;
    readonly "loading": string;
    readonly "markFailed": string;
    readonly "markSent": string;
    readonly "operator": string;
    readonly "reconciliation": string;
    readonly "reconciliationNotice": string;
    readonly "refused": string;
    readonly "return": string;
    readonly "select": string;
    readonly "takeover": string;
    readonly "title": string;
  };
  readonly "deliveryStatus": {
    readonly "ambiguous": string;
    readonly "approval_required": string;
    readonly "received": string;
  };
  readonly "labels": {
    readonly "policy": (values: RuntimeLabelsPolicyValues) => string;
  };
  readonly "shell": {
    readonly "unknownStatus": (values: ShellUnknownStatusValues) => string;
  };
};




import { SurfaceCard, Button, Heading, Text } from "@starci/grammar/common";

import { MarkdownComponent } from "@nivo/ui";
import type { SupportCustomerConversation, SupportCustomerMessage } from "@/modules/api/workspace-controlplane";

/** Inputs for one selected durable channel conversation. */
export type SupportCustomerChatBlockProps = {
  readonly copy: SupportCustomerChatBlockCopy;
  readonly conversation: SupportCustomerConversation | null;
  readonly messages: ReadonlyArray<SupportCustomerMessage>;
  readonly pending: boolean;
  readonly refused: boolean;
  readonly onApprove: (decisionId: string) => void;
  readonly onTakeover: (conversationId: string, takeover: boolean) => void;
  readonly onReconcile: (outboxId: string, delivered: boolean) => void;
};
const senderLabel = (message: SupportCustomerMessage, copy: SupportCustomerChatBlockCopy): string => {
  if (message.direction === "inbound") return copy.customerChat.customer;
  return message.senderType === "operator" ? copy.customerChat.operator : copy.customerChat.ai;
};
const takeoverLabel = (conversation: SupportCustomerConversation, copy: SupportCustomerChatBlockCopy): string => conversation.takeoverState === "operator" ? copy.customerChat.return : copy.customerChat.takeover;
const transcriptNotice = (refused: boolean, pending: boolean, messageCount: number, copy: SupportCustomerChatBlockCopy): string => {
  if (refused) return copy.customerChat.refused;
  if (messageCount > 0) return copy.customerChat.historyNotice;
  return pending ? copy.customerChat.loading : copy.customerChat.empty;
};
const contextLabel = (message: SupportCustomerMessage, copy: SupportCustomerChatBlockCopy): string => [deliveryStateLabel(message.deliveryState, copy), message.contextDigest === null ? copy.customerChat.evidence : copy.customerChat.context({ digest: message.contextDigest.slice(0, 8) }), message.policyClass === null ? null : copy.labels.policy({ policy: message.policyClass })].filter((value): value is string => value !== null).join(" · ");
const messageWidget = (message: SupportCustomerMessage, pending: boolean, onApprove: (decisionId: string) => void, onReconcile: (outboxId: string, delivered: boolean) => void, copy: SupportCustomerChatBlockCopy) => {
  if (message.deliveryState === "approval_required" && message.decisionId !== null) {
    return <div><div>

        <Heading level={4}>{copy.customerChat.approval}</Heading>
        <Text size="xs" tone="muted">{copy.customerChat.approvalNotice}</Text></div><div><>


          <Button
            variant="primary"
            isPending={pending}
            onPress={() => onApprove(message.decisionId!)}
          >{copy.customerChat.approve}</Button></></div></div>;
  }
  if (message.deliveryState === "ambiguous" && message.deliveryOutboxId !== null) {
    return <div><div>

        <Heading level={4}>{copy.customerChat.reconciliation}</Heading>
        <Text size="xs" tone="muted">{copy.customerChat.reconciliationNotice}</Text></div><div><>



          <Button
            variant="primary"
            isPending={pending}
            onPress={() => onReconcile(message.deliveryOutboxId!, true)}
          >{copy.customerChat.markSent}</Button>
          <Button
            variant="secondary"
            isPending={pending}
            onPress={() => onReconcile(message.deliveryOutboxId!, false)}
          >{copy.customerChat.markFailed}</Button></></div></div>;
  }
  return undefined;
};

/** Durable customer transcript with explicit approval, takeover and ambiguous-delivery recovery. */
export const SupportCustomerChatBlock = (props: SupportCustomerChatBlockProps) => {
  const { copy } = props;
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
    label={copy.customerChat.title}
    frame="frameless"
    fact={conversation?.customerName ?? conversation?.displayHandle ?? copy.customerChat.select}
  ><div>{messages.map((message, index) => <div key={index}>
      <Text size="xs" tone="muted" weight="semibold">{senderLabel(message, copy)}</Text>
      <MarkdownComponent markdown={message.body} />
      <Text size="xs" tone="muted">{`${contextLabel(message, copy)} · ${new Date(message.occurredAt).toLocaleString()}`}</Text>{messageWidget(message, pending, onApprove, onReconcile, copy)}</div>)}{conversation === null ? undefined : <Button
          variant="secondary"
          isPending={pending}
          onPress={() => onTakeover(conversation.id, conversation.takeoverState !== "operator")}
        >{takeoverLabel(conversation, copy)}</Button>}


    <Text size="sm" tone="muted" live={refused ? "assertive" : undefined}>{transcriptNotice(refused, pending, messages.length, copy)}</Text></div></SurfaceCard>;
};

/** Localize observed delivery states without changing protocol values. */
const deliveryStateLabel = (status: string, copy: SupportCustomerChatBlockCopy): string => status === "approval_required" || status === "ambiguous" || status === "received" ? copy.deliveryStatus[status] : copy.shell.unknownStatus({ status });
