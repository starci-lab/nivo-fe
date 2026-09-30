import type { ChatbotConversationPayload } from "@/modules/api/__generated__/agentos-controlplane"

import { Badge, Button, EmptyNotice, SurfaceCard, SurfaceListCard, Text } from "@starci/grammar/common"
import type { ComponentProps } from "react"

import { CHATBOT_CHANNEL_ROW_CLASS_NAME } from "./classNames"
import type { ChatbotWorkbenchBlock } from "."

type ChatbotWorkbenchBlockCopy = ComponentProps<typeof ChatbotWorkbenchBlock>["copy"]
type ChatbotWorkbenchBlockProps = ComponentProps<typeof ChatbotWorkbenchBlock>
type WorkbenchRailProps = {
    readonly props: Pick<
        ChatbotWorkbenchBlockProps,
        "installationId" | "workbench" | "selectedConversationId" | "pending" | "copy"
    >
    readonly on: {
        readonly selectConversation: ChatbotWorkbenchBlockProps["onSelectConversation"]
        readonly connectZalo: ChatbotWorkbenchBlockProps["onConnectZalo"]
    }
}

const conversationLabel = (conversation: ChatbotConversationPayload, copy: ChatbotWorkbenchBlockCopy): string =>
    conversation.handoffState === "human" ? copy.humanOwned : copy.automated

/** Resolve the selected conversation's ownership label including an in-flight control action. */
export const chatbotControlLabel = (
    conversation: ChatbotConversationPayload,
    copy: ChatbotWorkbenchBlockCopy,
    pending: boolean,
): string => {
    if (conversation.handoffState === "human") return pending ? copy.returnPending : copy.humanOwned
    return pending ? copy.handoffPending : copy.automated
}

/** Props for the Chatbot channel rail unit. */
type ChatbotChannelRailProps = WorkbenchRailProps

/** Draw connected channels and keep the Zalo connection action available. */
export const ChatbotChannelRail = (props: ChatbotChannelRailProps) => {
    const { props: data, on } = props
    const channels = data.workbench?.channels ?? []
    const hasZaloChannel = channels.some(
        (channel) => channel.provider.toLowerCase() === "zalo" && channel.state !== "revoked",
    )
    return (
        <SurfaceCard label={data.copy.channels} composition="joined">
            {channels.length === 0 ? (
                <EmptyNotice
                    message={data.copy.noChannels}
                    actionLabel={data.copy.connectZalo}
                    actionVariant="secondary"
                    isActionPending={data.pending}
                    onAction={on.connectZalo}
                />
            ) : (
                <SurfaceListCard label={data.copy.channels} depth="nested">
                    {channels.map((channel) => (
                        <div className={CHATBOT_CHANNEL_ROW_CLASS_NAME} key={channel.id}>
                            <Text size="sm" weight="semibold">
                                {channel.provider.toUpperCase()}
                            </Text>
                            <Text size="sm" tone="muted">
                                {channel.accountRef}
                            </Text>
                            <Badge tone={channel.state === "active" ? "success" : "neutral"}>{channel.state}</Badge>
                        </div>
                    ))}
                </SurfaceListCard>
            )}
            {channels.length > 0 && !hasZaloChannel ? (
                <Button variant="secondary" width="fill" isPending={data.pending} onPress={on.connectZalo}>
                    {data.copy.connectZalo}
                </Button>
            ) : null}
            <Text size="xs" tone="muted">
                {data.copy.installation}: {data.installationId}
            </Text>
        </SurfaceCard>
    )
}

/** Props for the Chatbot conversation rail unit. */
type ChatbotConversationRailProps = WorkbenchRailProps

/** Draw selectable conversations with their durable ownership state. */
export const ChatbotConversationRail = (props: ChatbotConversationRailProps) => {
    const { props: data, on } = props
    const conversations = data.workbench?.conversations ?? []
    return (
        <SurfaceCard label={data.copy.conversations} composition="joined">
            {conversations.length === 0 ? (
                <EmptyNotice message={data.copy.noConversations} />
            ) : (
                <SurfaceListCard label={data.copy.conversations} depth="nested">
                    {conversations.map((conversation) => (
                        <Button
                            key={conversation.id}
                            variant={conversation.id === data.selectedConversationId ? "primary" : "secondary"}
                            width="fill"
                            onPress={() => on.selectConversation(conversation.id)}
                        >
                            {conversation.participantRef} · {conversationLabel(conversation, data.copy)}
                            {conversation.id === data.selectedConversationId ? ` · ${data.copy.selected}` : ""}
                        </Button>
                    ))}
                </SurfaceListCard>
            )}
        </SurfaceCard>
    )
}
