import type { GroupChatPageLabels, GroupChatPageView } from "@/modules/collab/group-chat/types"
import {
    GROUP_CHAT_RAIL_SECTION_ROSTER_HEAD_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_ROSTER_PEOPLE_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_ROSTER_MODULES_CLASS_NAME,
    GROUP_CHAT_RAIL_LABEL_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_CLASS_NAME,
} from "./classNames"
import { EmptyNotice, SurfaceCard, Text } from "@starci/grammar/common"
import { MemberRow } from "../MemberRow"
import { partitionParticipants } from "@/modules/collab/group-chat/model"

/**
 * The roster-only rail the accepted decision composite draws while an approval
 * is held: members grouped by person or module, no invite section, no
 * presence dots or row menus.
 */
type RosterRailProps = { readonly view: GroupChatPageView; readonly labels: GroupChatPageLabels }

/** Render the decision-state member roster. */
export const RosterRail = (props: RosterRailProps) => {
    const { view, labels } = props
    const { humans, modules } = partitionParticipants(view.participants)
    return (
        <SurfaceCard composition="joined" depth="nested" ariaLabel={labels.members.title}>
            <div className={GROUP_CHAT_RAIL_SECTION_ROSTER_HEAD_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Text size="md" weight="semibold">
                        {labels.members.title}
                    </Text>
                </div>
            </div>
            <div className={GROUP_CHAT_RAIL_SECTION_ROSTER_PEOPLE_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Text size="md" weight="semibold">
                        {labels.members.humans(humans.length)}
                    </Text>
                </div>
                {humans.length === 0 ? (
                    <EmptyNotice message={labels.members.empty} />
                ) : (
                    humans.map((participant) => (
                        <MemberRow key={participant.memberId} participant={participant} labels={labels} roomy />
                    ))
                )}
            </div>
            <div className={GROUP_CHAT_RAIL_SECTION_ROSTER_MODULES_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Text size="md" weight="semibold">
                        {`${labels.members.moduleRole} (${modules.length})`}
                    </Text>
                </div>
                {modules.length === 0 ? (
                    <div className={GROUP_CHAT_MEMBER_ROW_CLASS_NAME}>
                        <Text size="sm" tone="muted">
                            {labels.members.noModules}
                        </Text>
                    </div>
                ) : (
                    modules.map((participant) => (
                        <MemberRow
                            key={participant.moduleInstallationId ?? participant.memberId}
                            participant={participant}
                            labels={labels}
                            roomy
                        />
                    ))
                )}
            </div>
        </SurfaceCard>
    )
}
