import type { GroupChatPageLabels } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_MEMBER_ROW_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_ROOMY_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_TRAILING_CLASS_NAME,
    GROUP_CHAT_GROW_CLASS_NAME,
} from "./classNames"
import { Text } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import type { CollabOfficeParticipant } from "../../../../modules/api/collab"
import { isCollabHumanRole } from "../../../../modules/collab/group-chat/model.guards"
import { MemberAvatar } from "../MemberAvatar"

/** Props for one roster row. */
type MemberRowProps = {
    readonly participant: CollabOfficeParticipant
    readonly labels: GroupChatPageLabels
    /** The accepted growth rail draws the richer row: presence dot, module summary and trailing affordance. */
    readonly detailed?: boolean
    /** The compact member sheet keeps its existing type scale. */
    readonly compact?: boolean
    readonly roomy?: boolean
}

/** Render one human or module roster row. */
export const MemberRow = (props: MemberRowProps) => {
    const { participant, labels, detailed = false, compact = false, roomy = false } = props
    let subtitle: string
    if (participant.kind === "module") {
        subtitle = detailed
            ? (labels.members.moduleDescriptions[participant.displayName] ?? labels.members.moduleRole)
            : labels.members.moduleRole
    } else {
        subtitle = isCollabHumanRole(participant.role)
            ? (labels.roles[participant.role] ?? participant.role)
            : participant.role
    }
    return (
        <div
            className={roomy ? GROUP_CHAT_MEMBER_ROW_ROOMY_CLASS_NAME : GROUP_CHAT_MEMBER_ROW_CLASS_NAME}
            data-member-id={participant.memberId}
        >
            <MemberAvatar
                name={participant.displayName}
                kind={participant.kind}
                presence={detailed && participant.kind === "human" && participant.status === "active"}
            />
            <div className={GROUP_CHAT_GROW_CLASS_NAME}>
                <Text size={compact ? "sm" : "md"} weight="semibold" overflow="truncate">
                    {participant.displayName}
                </Text>
                <Text size={compact ? "xs" : "sm"} tone="muted">
                    {subtitle}
                </Text>
            </div>
            {participant.status === "invited" ? <Badge tone="warning">{labels.members.pending}</Badge> : null}
            {detailed && participant.kind === "human" ? (
                <span className={GROUP_CHAT_MEMBER_ROW_TRAILING_CLASS_NAME} aria-hidden="true">
                    ···
                </span>
            ) : null}
        </div>
    )
}
