"use client"

import {
    Button, ChoiceTabs, CollapsibleRail, Icon, SelectionList, Tree,
    defineContractComponent, defineLeafComponent, type SelectionListGroup,
} from "@nivo/ui"
import type { SupportCustomerConversation } from "@/modules/api/workspace-controlplane"

/** Customer-inbox projection owned by one workspace controller. */
export type SupportCustomerConversationRailBlockProps = {
    readonly conversations: ReadonlyArray<SupportCustomerConversation>
    readonly selectedId: string | null
    readonly pending: boolean
    readonly onSelect: (conversationId: string) => void
}

const groupsFor = (conversations: ReadonlyArray<SupportCustomerConversation>): ReadonlyArray<SelectionListGroup> => [{
    id: "support-customers",
    items: conversations.map((conversation) => ({
        id: conversation.id,
        label: conversation.customerName ?? conversation.displayHandle,
        icon: "agentos" as const,
        status: conversation.unreadCount > 0
            ? `${conversation.unreadCount} unread`
            : conversation.takeoverState === "operator"
                ? "Human takeover"
                : new Date(conversation.lastMessageAt).toLocaleString(),
    })),
}]

type CustomerSelectionProps = Pick<SupportCustomerConversationRailBlockProps, "conversations" | "selectedId" | "onSelect"> & {
    readonly presentation: "expanded" | "compact"
}

const CustomerSelection = ({ conversations, selectedId, onSelect, presentation }: CustomerSelectionProps) => (
    <SelectionList
        props={{ label: "Customer conversations", selectedKey: selectedId ?? "", presentation, groups: groupsFor(conversations) }}
        on={{ activate: onSelect }}
    />
)

const CustomerRailBody = (props: SupportCustomerConversationRailBlockProps) => (
    <Tree contract="agentos-session-rail-compact" render={defineContractComponent("agentos-session-rail-compact", {
        sessions: defineLeafComponent("selection-list", {}, () => <CustomerSelection {...props} presentation="expanded" />),
        create: defineLeafComponent("button", {}, () => <Button props={{ label: props.pending ? "Syncing inbox" : "Inbox synced", variant: "secondary", disabled: true }} />),
    })} />
)

const CustomerRailToggle = () => <Icon props={{ name: "sidebar", role: "leading" }} />

/** Show customer identities as a compact choice or persistent desktop rail. */
export const SupportCustomerConversationRailBlock = (props: SupportCustomerConversationRailBlockProps) => (
    <Tree contract="agentos-session-rail-responsive" render={defineContractComponent("agentos-session-rail-responsive", {
        compact: defineContractComponent("agentos-session-rail-compact", {
            sessions: defineLeafComponent("choice-tabs", {}, () => (
                <ChoiceTabs
                    props={{
                        label: props.pending ? "Loading customer conversations" : "Customer conversations",
                        selectedKey: props.selectedId ?? "",
                        tabs: props.conversations.map((conversation) => ({ id: conversation.id, label: conversation.customerName ?? conversation.displayHandle })),
                    }}
                    on={{ select: props.onSelect }}
                />
            )),
            create: defineLeafComponent("button", {}, () => <Button props={{ label: props.pending ? "Syncing inbox" : "Inbox synced", variant: "secondary", disabled: true }} />),
        }),
        expanded: defineLeafComponent("collapsible-rail", {}, () => (
            <CollapsibleRail
                ariaLabel="Customer conversations"
                title="Customer inbox"
                rail={CustomerRailBody}
                railProps={props}
                collapsedRail={CustomerSelection}
                collapsedRailProps={{ ...props, presentation: "compact" }}
                toggleControl={CustomerRailToggle}
                toggleControlProps={{}}
                collapseLabel="Collapse customer inbox"
                expandLabel="Expand customer inbox"
                storageKey="nivo:agentos:support-customers"
            />
        )),
    })} />
)

/** Source-level tier marker for the pure customer-conversation rail. */
export const meta = { shape: "block", world: "pure" } as const
