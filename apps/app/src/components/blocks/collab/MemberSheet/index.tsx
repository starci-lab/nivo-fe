import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "@/modules/collab/group-chat/types"
import {
    GROUP_CHAT_SHEET_PANEL_CLASS_NAME,
    GROUP_CHAT_SHEET_HANDLE_CLASS_NAME,
    GROUP_CHAT_SHEET_HEAD_CLASS_NAME,
    GROUP_CHAT_SHEET_BODY_CLASS_NAME,
} from "./classNames"
import { IconButton, Text } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import { MemberSheetRoster } from "../MemberSheetRoster"
import { InviteForm } from "../InviteForm"

/** Props for the compact member bottom sheet docked inside the workbench card. */
type MemberSheetProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /** The invitation form docks while no decision is pending; otherwise the sheet carries the plain roster. */
    readonly showInvite: boolean
}

/**
 * The compact member sheet the accepted direction draws as a docked lower band
 * of the workbench card: handle bar, title row with a close control, then the
 * invitation form for a viewer who may invite or the plain roster otherwise.
 * It lives in normal flow below the pinned composer, so the conversation keeps
 * a readable remainder instead of collapsing under an overlay.
 */
/** Render the compact member sheet and its close control. */
export const MemberSheet = (props: MemberSheetProps) => {
    const { view, on, labels, showInvite } = props
    return (
        <div
            className={GROUP_CHAT_SHEET_PANEL_CLASS_NAME}
            role="region"
            aria-label={showInvite ? labels.invite.title : labels.members.title}
            data-grammar-member-sheet="open"
        >
            <span className={GROUP_CHAT_SHEET_HANDLE_CLASS_NAME} aria-hidden="true" />
            <div className={GROUP_CHAT_SHEET_HEAD_CLASS_NAME}>
                <Text size="md" weight="semibold">
                    {showInvite ? labels.invite.title : labels.members.title}
                </Text>
                <IconButton
                    source={IconSource("close", "leading")}
                    label={labels.members.closeRail}
                    onPress={() => on.changeRailOpen(false)}
                />
            </div>
            <div className={GROUP_CHAT_SHEET_BODY_CLASS_NAME}>
                {showInvite ? (
                    <InviteForm view={view} on={on} labels={labels} compact />
                ) : (
                    <MemberSheetRoster view={view} labels={labels} />
                )}
            </div>
        </div>
    )
}
