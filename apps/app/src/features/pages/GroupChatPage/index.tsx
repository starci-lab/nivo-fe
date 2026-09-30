import { GroupChatPage as GroupChatPageBlock } from "@/components/blocks/collab/GroupChatPage"

/** Empty route input; the group chat resolves its workspace from session and address. */
type GroupChatPageProps = Record<string, never>

/** Compose the interactive group chat block below the server route. */
export const GroupChatPage = (props: GroupChatPageProps) => {
    void props
    return <GroupChatPageBlock />
}

export default GroupChatPage