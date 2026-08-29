"use client";

import { Button, SelectionList, type SelectionListGroup } from "@nivo/ui";
import type { SupportCustomerConversation } from "@/modules/api/workspace-controlplane";

/** Customer-inbox projection owned by one workspace controller. */
export type SupportCustomerConversationRailBlockProps = {
  readonly conversations: ReadonlyArray<SupportCustomerConversation>;
  readonly selectedId: string | null;
  readonly pending: boolean;
  readonly onSelect: (conversationId: string) => void;
};
const conversationStatus = (conversation: SupportCustomerConversation): string => {
  if (conversation.unreadCount > 0) return `${conversation.unreadCount} unread`;
  if (conversation.takeoverState === "operator") return "Human takeover";
  return new Date(conversation.lastMessageAt).toLocaleString();
};
const groupsFor = (conversations: ReadonlyArray<SupportCustomerConversation>): ReadonlyArray<SelectionListGroup> => [{
  id: "support-customers",
  items: conversations.map(conversation => ({
    id: conversation.id,
    label: conversation.customerName ?? conversation.displayHandle,
    icon: "agentos" as const,
    status: conversationStatus(conversation)
  }))
}];
type CustomerSelectionProps = Pick<SupportCustomerConversationRailBlockProps, "conversations" | "selectedId" | "onSelect">;
const CustomerSelection = ({
  conversations,
  selectedId,
  onSelect
}: CustomerSelectionProps) => <SelectionList props={{
  label: "Customer conversations",
  selectedKey: selectedId ?? "",
  presentation: "expanded",
  groups: groupsFor(conversations)
}} on={{
  activate: onSelect
}} />;
const CustomerRailBody = (props: SupportCustomerConversationRailBlockProps) => <div>

  <CustomerSelection {...props} />
  <Button props={{
    label: props.pending ? "Syncing inbox" : "Inbox synced",
    variant: "secondary",
    disabled: true
  }} /></div>;

/** Keep the customer inbox as one stable list pane at every responsive size. */
export const SupportCustomerConversationRailBlock = (props: SupportCustomerConversationRailBlockProps) => <div>

  <CustomerRailBody {...props} />
  <CustomerRailBody {...props} /></div>;
