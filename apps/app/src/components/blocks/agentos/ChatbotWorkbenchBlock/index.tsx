"use client";

import { Badge, Button, EmptyNotice, Heading, PrimaryRailLayout, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import type { ChatbotConversation, ChatbotMessage, ChatbotWorkbench } from "@/modules/api/workspace-controlplane";

/** Localized copy for the installed Chatbot workbench. */
export type ChatbotWorkbenchBlockCopy = {
  readonly title: string;
  readonly installation: string;
  readonly approvedVersion: (version: string) => string;
  readonly noApprovedVersion: string;
  readonly channels: string;
  readonly noChannels: string;
  readonly connectZalo: string;
  readonly conversations: string;
  readonly noConversations: string;
  readonly selectConversation: string;
  readonly automated: string;
  readonly humanHandoff: string;
  readonly requestHandoff: string;
  readonly resolveHandoff: string;
  readonly messages: string;
  readonly noMessages: string;
  readonly pending: string;
  readonly refused: string;
  readonly permissionDenied: string;
  readonly ambiguous: string;
  readonly markDelivered: string;
  readonly markFailed: string;
  readonly recorded: string;
  readonly delivered: string;
  readonly failed: string;
};

/** Pure, installation-qualified state and actions for the workbench surface. */
export type ChatbotWorkbenchBlockProps = {
  readonly installationId: string;
  readonly workbench: ChatbotWorkbench | null;
  readonly selectedConversationId: string | null;
  readonly pending: boolean;
  readonly refusedCode: string | null;
  readonly copy: ChatbotWorkbenchBlockCopy;
  readonly onSelectConversation: (conversationId: string) => void;
  readonly onConnectZalo: () => void;
  readonly onSetHandoff: (conversationId: string) => void;
  readonly onResolveHandoff: (conversationId: string) => void;
  readonly onReconcile: (providerOutboxId: string, delivered: boolean) => void;
};

const deliveryLabel = (message: ChatbotMessage, copy: ChatbotWorkbenchBlockCopy): string => {
  if (message.deliveryState === "ambiguous") return copy.ambiguous;
  if (message.deliveryState === "sent" || message.deliveryState === "delivered") return copy.delivered;
  if (message.deliveryState === "failed" || message.deliveryState === "cancelled") return copy.failed;
  if (message.deliveryState === "queued" || message.deliveryState === "sending") return copy.pending;
  return copy.recorded;
};

const conversationLabel = (conversation: ChatbotConversation, copy: ChatbotWorkbenchBlockCopy): string => conversation.handoffState === "human" ? copy.humanHandoff : copy.automated;

type WorkbenchRegionProps = { readonly props: ChatbotWorkbenchBlockProps };
type TranscriptProps = WorkbenchRegionProps & { readonly conversation: ChatbotConversation | null };

const ChannelRail = ({ props }: WorkbenchRegionProps) => {
  const channels = props.workbench?.channels ?? [];
  return <SurfaceCard label={props.copy.channels} composition="joined">
    {channels.length === 0 ? <EmptyNotice message={props.copy.noChannels} actionLabel={props.copy.connectZalo} actionVariant="secondary" isActionPending={props.pending} onAction={props.onConnectZalo} /> : <SurfaceListCard label={props.copy.channels} depth="nested">
      {channels.map(channel => <div key={channel.id}>
        <Text size="sm" weight="semibold">{channel.provider.toUpperCase()}</Text>
        <Text size="sm" tone="muted">{channel.accountRef}</Text>
        <Badge tone={channel.state === "active" ? "success" : "neutral"}>{channel.state}</Badge>
      </div>)}
    </SurfaceListCard>}
    <Text size="xs" tone="muted">{props.copy.installation}: {props.installationId}</Text>
  </SurfaceCard>;
};

const ConversationRail = ({ props }: WorkbenchRegionProps) => {
  const conversations = props.workbench?.conversations ?? [];
  return <SurfaceCard label={props.copy.conversations} composition="joined">
    {conversations.length === 0 ? <EmptyNotice message={props.copy.noConversations} /> : <SurfaceListCard label={props.copy.conversations} depth="nested">
      {conversations.map(conversation => <Button key={conversation.id} variant={conversation.id === props.selectedConversationId ? "primary" : "secondary"} width="fill" onPress={() => props.onSelectConversation(conversation.id)}>
        {conversation.participantRef} · {conversationLabel(conversation, props.copy)}
      </Button>)}
    </SurfaceListCard>}
  </SurfaceCard>;
};

const Transcript = ({ props, conversation }: TranscriptProps) => {
  const messages = conversation === null ? [] : (props.workbench?.messages ?? []).filter(message => message.conversationId === conversation.id);
  return <SurfaceCard label={props.copy.messages} frame="frameless" fact={conversation?.participantRef ?? props.copy.selectConversation}>
    {conversation === null ? <EmptyNotice message={props.copy.selectConversation} /> : <>
      {messages.length === 0 ? <EmptyNotice message={props.copy.noMessages} /> : <SurfaceListCard label={props.copy.messages} depth="nested">
        {messages.map(message => <div key={message.id}>
          <Text>{message.body}</Text>
          <Text size="xs" tone="muted">{deliveryLabel(message, props.copy)} · {new Date(message.occurredAt).toLocaleString()}</Text>
          {message.deliveryState === "ambiguous" && message.providerOutboxId !== null ? <div>
            <Text size="sm" live="assertive">{props.copy.ambiguous}</Text>
            <Button variant="primary" isPending={props.pending} onPress={() => props.onReconcile(message.providerOutboxId!, true)}>{props.copy.markDelivered}</Button>
            <Button variant="secondary" isPending={props.pending} onPress={() => props.onReconcile(message.providerOutboxId!, false)}>{props.copy.markFailed}</Button>
          </div> : null}
        </div>)}
      </SurfaceListCard>}
      <Button variant="secondary" isPending={props.pending} onPress={() => conversation.handoffState === "human" ? props.onResolveHandoff(conversation.id) : props.onSetHandoff(conversation.id)}>
        {conversation.handoffState === "human" ? props.copy.resolveHandoff : props.copy.requestHandoff}
      </Button>
    </>}
    {props.pending ? <Text size="sm" live="polite">{props.copy.pending}</Text> : null}
    {props.refusedCode === null ? null : <Text size="sm" live="assertive">{props.refusedCode === "WORKSPACE_CONTROLLER_REFUSED" ? props.copy.permissionDenied : props.copy.refused}</Text>}
  </SurfaceCard>;
};

/** Responsive console composition whose rail collapse is owned by the published Grammar. */
export const ChatbotWorkbenchBlock = (props: ChatbotWorkbenchBlockProps) => {
  const selected = props.workbench?.conversations.find(conversation => conversation.id === props.selectedConversationId) ?? null;
  return <section aria-label={props.copy.title}>
    <Heading level={2}>{props.copy.title}</Heading>
    <Text size="sm" tone="muted">{props.workbench?.approvedVersion === null || props.workbench === null ? props.copy.noApprovedVersion : props.copy.approvedVersion(String(props.workbench.approvedVersion))}</Text>
    <PrimaryRailLayout primary={<Transcript props={props} conversation={selected} />} rail={<div><ChannelRail props={props} /><ConversationRail props={props} /></div>} railWidth="standard" align="start" collapsedOrder="primary-first" />
  </section>;
};
