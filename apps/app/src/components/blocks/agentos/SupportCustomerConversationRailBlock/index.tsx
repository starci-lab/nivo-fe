"use client";

type RuntimeConversationsUnreadValues = { readonly count: number };

/** Settled display labels and typed formatters supplied by the page owner. */
export type SupportCustomerConversationRailBlockCopy = {
  readonly "conversations": {
    readonly "synced": string;
    readonly "syncing": string;
    readonly "takeover": string;
    readonly "title": string;
    readonly "unread": (values: RuntimeConversationsUnreadValues) => string;
  };
};




import { Button } from "@starci/grammar/common";

import { SelectionList, type SelectionListGroup } from "@nivo/ui";
import type { SupportCustomerConversation } from "@/modules/api/workspace-controlplane";

/** Customer-inbox projection owned by one workspace controller. */
export type SupportCustomerConversationRailBlockProps = {
  readonly copy: SupportCustomerConversationRailBlockCopy;
  readonly conversations: ReadonlyArray<SupportCustomerConversation>;
  readonly selectedId: string | null;
  readonly pending: boolean;
  readonly onSelect: (conversationId: string) => void;
};
const conversationStatus = (conversation: SupportCustomerConversation, copy: SupportCustomerConversationRailBlockCopy): string => {
  if (conversation.unreadCount > 0) return copy.conversations.unread({ count: conversation.unreadCount });
  if (conversation.takeoverState === "operator") return copy.conversations.takeover;
  return new Date(conversation.lastMessageAt).toLocaleString();
};
const groupsFor = (conversations: ReadonlyArray<SupportCustomerConversation>, copy: SupportCustomerConversationRailBlockCopy): ReadonlyArray<SelectionListGroup> => [{
  id: "support-customers",
  items: conversations.map(conversation => ({
    id: conversation.id,
    label: conversation.customerName ?? conversation.displayHandle,
    icon: "agentos" as const,
    status: conversationStatus(conversation, copy)
  }))
}];
type CustomerSelectionProps = Pick<SupportCustomerConversationRailBlockProps, "copy" | "conversations" | "selectedId" | "onSelect">;
const CustomerSelection = ({ copy,
  conversations,
  selectedId,
  onSelect
}: CustomerSelectionProps) => {
  
  return (<SelectionList props={{
  label: copy.conversations.title,
  selectedKey: selectedId ?? "",
  presentation: "expanded",
  groups: groupsFor(conversations, copy)
}} on={{
  activate: onSelect
}} />);
};
const CustomerRailBody = (props: SupportCustomerConversationRailBlockProps) => {
  const { copy } = props;
  return (<div>

  <CustomerSelection {...props} />
  <Button
    variant="secondary"
    isDisabled={true}
  >{props.pending ? copy.conversations.syncing : copy.conversations.synced}</Button></div>);
};

/** Keep the customer inbox as one stable list pane at every responsive size. */
export const SupportCustomerConversationRailBlock = (props: SupportCustomerConversationRailBlockProps) => <div>

  <CustomerRailBody {...props} />
  <CustomerRailBody {...props} /></div>;
