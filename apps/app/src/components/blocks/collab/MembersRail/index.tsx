import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_RAIL_SECTION_INVITE_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_INVITE_MODULES_CLASS_NAME,
    GROUP_CHAT_RAIL_SECTION_INVITE_FORM_CLASS_NAME,
    GROUP_CHAT_RAIL_HUMANS_BADGE_CLASS_NAME,
    GROUP_CHAT_RAIL_LABEL_CLASS_NAME,
    GROUP_CHAT_RAIL_LABEL_ICON_CLASS_NAME,
    GROUP_CHAT_RAIL_HEAD_ROW_CLASS_NAME,
    GROUP_CHAT_RAIL_FORM_CLASS_NAME,
    GROUP_CHAT_MEMBER_ROW_CLASS_NAME,
} from "./classNames"
import { EmptyNotice, Icon, IconButton, SurfaceCard, Text } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import { MemberRow } from "../MemberRow"
import { InviteForm } from "../InviteForm"
import { mayPresentInvite, partitionParticipants } from "../../../../modules/collab/group-chat/model"

/**
 * Props for the member rail: one joined card carrying the human roster, the
 * hired modules and the invite section the accepted direction draws as a
 * single right rail - separate member cards pushed the invite control past the
 * 1440x900 fold, so the sections share one surface with hairline dividers.
 */
type MembersRailProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

/** Render the member rail, invite action, and roster. */
export const MembersRail = (props: MembersRailProps) => {
    const { view, on, labels } = props
    const { humans, modules } = partitionParticipants(view.participants)
    const mayInvite = mayPresentInvite(view.viewer)
    const focusInviteEmail = () => {
        document.getElementById("collab-invite-email")?.focus()
    }
    return (
        <SurfaceCard composition="joined" depth="nested" ariaLabel={labels.members.title}>
            <div className={GROUP_CHAT_RAIL_SECTION_INVITE_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_HEAD_ROW_CLASS_NAME}>
                    <span className={GROUP_CHAT_RAIL_LABEL_ICON_CLASS_NAME}>
                        <Icon source={IconSource("community", "leading")} usage="leading" />
                        <Text as="span" size="md" weight="semibold">
                            {labels.members.countLabel(humans.length)}
                        </Text>
                    </span>
                    {mayInvite ? (
                        <IconButton
                            source={IconSource("signUp", "leading")}
                            label={labels.invite.title}
                            onPress={focusInviteEmail}
                        />
                    ) : null}
                </div>
                {humans.length === 0 ? (
                    <EmptyNotice message={labels.members.empty} />
                ) : (
                    <>
                        <span className={GROUP_CHAT_RAIL_HUMANS_BADGE_CLASS_NAME}>
                            <Text size="xs" weight="semibold" tone="muted">
                                {labels.members.humans(humans.length)}
                            </Text>
                        </span>
                        {humans.map((participant) => (
                            <MemberRow key={participant.memberId} participant={participant} labels={labels} detailed />
                        ))}
                    </>
                )}
            </div>
            <div className={GROUP_CHAT_RAIL_SECTION_INVITE_MODULES_CLASS_NAME}>
                <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                    <Icon source={IconSource("agentos", "leading")} usage="leading" />
                    <Text size="md" weight="semibold">
                        {labels.members.modules(modules.length)}
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
                            detailed
                        />
                    ))
                )}
            </div>
            {mayInvite ? (
                <div className={GROUP_CHAT_RAIL_SECTION_INVITE_FORM_CLASS_NAME}>
                    <div className={GROUP_CHAT_RAIL_LABEL_CLASS_NAME}>
                        <Icon source={IconSource("signUp", "leading")} usage="leading" />
                        <Text size="md" weight="semibold">
                            {labels.invite.title}
                        </Text>
                    </div>
                    <div className={GROUP_CHAT_RAIL_FORM_CLASS_NAME}>
                        <InviteForm view={view} on={on} labels={labels} />
                    </div>
                </div>
            ) : null}
        </SurfaceCard>
    )
}
