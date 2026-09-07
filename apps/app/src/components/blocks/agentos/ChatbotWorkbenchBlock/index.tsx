"use client";

import { useState } from "react";
import { Badge, Button, ChatWorkspace, EmptyNotice, Heading, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common";
import type { ChatbotConversation, ChatbotMessage, ChatbotWorkbench } from "@/modules/api/workspace-controlplane";
import {
  CHATBOT_ACTIONS_CLASS_NAME,
  CHATBOT_CHANNEL_ROW_CLASS_NAME,
  CHATBOT_DELIVERY_NOTICE_CLASS_NAME,
  CHATBOT_HEADER_CLASS_NAME,
  CHATBOT_MESSAGE_BODY_CLASS_NAME,
  CHATBOT_MESSAGE_ROW_CLASS_NAME,
  CHATBOT_OUTBOUND_MESSAGE_ROW_CLASS_NAME,
  CHATBOT_RAIL_CLASS_NAME,
  CHATBOT_TITLE_CLASS_NAME,
  CHATBOT_TRANSCRIPT_CLASS_NAME,
  CHATBOT_WORKSPACE_HOST_CLASS_NAME,
} from "./classNames";

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
  readonly openConversations: string;
  readonly closeConversations: string;
  readonly noConversations: string;
  readonly selectConversation: string;
  readonly selected: string;
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

const ChannelRail = ({ props }: WorkbenchRegionProps) => {
  const channels = props.workbench?.channels ?? [];
  const hasZaloChannel = channels.some(channel => channel.provider.toLowerCase() === "zalo" && channel.state !== "revoked");
  return <SurfaceCard label={props.copy.channels} composition="joined">
    {channels.length === 0 ? <EmptyNotice message={props.copy.noChannels} actionLabel={props.copy.connectZalo} actionVariant="secondary" isActionPending={props.pending} onAction={props.onConnectZalo} /> : <SurfaceListCard label={props.copy.channels} depth="nested">
      {channels.map(channel => <div className={CHATBOT_CHANNEL_ROW_CLASS_NAME} key={channel.id}>
        <Text size="sm" weight="semibold">{channel.provider.toUpperCase()}</Text>
        <Text size="sm" tone="muted">{channel.accountRef}</Text>
        <Badge tone={channel.state === "active" ? "success" : "neutral"}>{channel.state}</Badge>
      </div>)}
    </SurfaceListCard>}
    {channels.length > 0 && !hasZaloChannel ? <Button variant="secondary" width="fill" isPending={props.pending} onPress={props.onConnectZalo}>{props.copy.connectZalo}</Button> : null}
    <Text size="xs" tone="muted">{props.copy.installation}: {props.installationId}</Text>
  </SurfaceCard>;
};

const ConversationRail = ({ props }: WorkbenchRegionProps) => {
  const conversations = props.workbench?.conversations ?? [];
  return <SurfaceCard label={props.copy.conversations} composition="joined">
    {conversations.length === 0 ? <EmptyNotice message={props.copy.noConversations} /> : <SurfaceListCard label={props.copy.conversations} depth="nested">
      {conversations.map(conversation => <Button key={conversation.id} variant={conversation.id === props.selectedConversationId ? "primary" : "secondary"} width="fill" onPress={() => props.onSelectConversation(conversation.id)}>
        {conversation.participantRef} · {conversationLabel(conversation, props.copy)}{conversation.id === props.selectedConversationId ? ` · ${props.copy.selected}` : ""}
      </Button>)}
    </SurfaceListCard>}
  </SurfaceCard>;
};

/** Responsive console composition whose rail collapse is owned by the published Grammar. */
export const ChatbotWorkbenchBlock = (props: ChatbotWorkbenchBlockProps) => {
  const [isRailOpen, setRailOpen] = useState(false);
  const selected = props.workbench?.conversations.find(conversation => conversation.id === props.selectedConversationId) ?? null;
  const messages = selected === null ? [] : (props.workbench?.messages ?? []).filter(message => message.conversationId === selected.id);
  const ambiguousMessage = messages.find(message => message.deliveryState === "ambiguous" && message.providerOutboxId !== null) ?? null;
  const conversationRegion = selected === null ? <EmptyNotice message={props.copy.selectConversation} /> : messages.length === 0 ? <EmptyNotice message={props.copy.noMessages} /> : <div className={CHATBOT_TRANSCRIPT_CLASS_NAME}>
    {messages.map(message => <div className={message.direction === "outbound" ? CHATBOT_OUTBOUND_MESSAGE_ROW_CLASS_NAME : CHATBOT_MESSAGE_ROW_CLASS_NAME} key={message.id}>
      <div className={CHATBOT_MESSAGE_BODY_CLASS_NAME}><Text>{message.body}</Text></div>
      <Text size="xs" tone="muted">{deliveryLabel(message, props.copy)} · {new Date(message.occurredAt).toLocaleString()}</Text>
      {message.deliveryState === "ambiguous" ? <div className={CHATBOT_DELIVERY_NOTICE_CLASS_NAME}>
        <Badge tone="warning">{props.copy.ambiguous}</Badge>
      </div> : null}
    </div>)}
  </div>;
  const actionRegion = selected === null ? <div /> : <div className={CHATBOT_ACTIONS_CLASS_NAME}>
    <Button variant="primary" width="fill" isPending={props.pending} onPress={() => selected.handoffState === "human" ? props.onResolveHandoff(selected.id) : props.onSetHandoff(selected.id)}>
      {selected.handoffState === "human" ? props.copy.resolveHandoff : props.copy.requestHandoff}
    </Button>
    {ambiguousMessage === null ? null : <>
      <Button variant="secondary" width="fill" isPending={props.pending} onPress={() => props.onReconcile(ambiguousMessage.providerOutboxId!, true)}>{props.copy.markDelivered}</Button>
      <Button variant="outline" width="fill" isPending={props.pending} onPress={() => props.onReconcile(ambiguousMessage.providerOutboxId!, false)}>{props.copy.markFailed}</Button>
    </>}
  </div>;
  return <section aria-label={props.copy.title}>
    <div className={CHATBOT_TITLE_CLASS_NAME}>
      <Heading level={2}>{props.copy.title}</Heading>
      <Text size="sm" tone="muted">{props.workbench?.approvedVersion === null || props.workbench === null ? props.copy.noApprovedVersion : props.copy.approvedVersion(String(props.workbench.approvedVersion))}</Text>
    </div>
    <div className={CHATBOT_WORKSPACE_HOST_CLASS_NAME} data-contract="GAP-3 MEASURE-2 MEASURE-7">
      <ChatWorkspace
        label={props.copy.title}
        conversationLabel={props.copy.messages}
        header={<div className={CHATBOT_HEADER_CLASS_NAME}>
          <Heading level={3}>{selected?.participantRef ?? props.copy.selectConversation}</Heading>
          {selected === null ? null : <Badge tone={selected.handoffState === "human" ? "warning" : "success"}>{conversationLabel(selected, props.copy)}</Badge>}
        </div>}
        conversation={<>{conversationRegion}{props.pending ? <Text size="sm" live="polite">{props.copy.pending}</Text> : null}{props.refusedCode === null ? null : <Text size="sm" live="assertive">{props.refusedCode === "WORKSPACE_CONTROLLER_REFUSED" ? props.copy.permissionDenied : props.copy.refused}</Text>}</>}
        composer={actionRegion}
        rail={<div className={CHATBOT_RAIL_CLASS_NAME}><ChannelRail props={props} /><ConversationRail props={props} /></div>}
        railLabel={props.copy.conversations}
        railOpenLabel={props.copy.openConversations}
        railCloseLabel={props.copy.closeConversations}
        isRailOpen={isRailOpen}
        onRailOpenChange={setRailOpen}
        railWidth="standard"
      />
    </div>
  </section>;
};
