import { getGroupChatAvatarClassName, GROUP_CHAT_AVATAR_PRESENCE_CLASS_NAME } from "./classNames"
import { Icon } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import type { CollabOfficeParticipant } from "@/modules/api/collab"
import { initialsOf, avatarTintClassName } from "@/modules/collab/group-chat/model"

/** Props for the tinted member avatar shared by message authors and roster rows. */
type MemberAvatarProps = {
    readonly name: string
    readonly kind: CollabOfficeParticipant["kind"] | null
    readonly presence?: boolean
    /** The compact slot rows use the smaller avatar so two messages fit above the sheet. */
    readonly compact?: boolean
}

/** Render a member's stable initials avatar and presence mark. */
export const MemberAvatar = (props: MemberAvatarProps) => {
    const { name, kind, presence = false, compact = false } = props
    return (
        <span className={getGroupChatAvatarClassName(compact, avatarTintClassName(name))} aria-hidden="true">
            {kind === "module" ? <Icon source={IconSource("agentos", "leading")} usage="leading" /> : initialsOf(name)}
            {presence ? <span className={GROUP_CHAT_AVATAR_PRESENCE_CLASS_NAME} /> : null}
        </span>
    )
}
