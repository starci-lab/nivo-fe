import type { GroupChatPageLabels, GroupChatPageView } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_SHEET_ROSTER_CLASS_NAME,
    GROUP_CHAT_SHEET_SECTION_CLASS_NAME,
    GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME,
} from "./classNames"
import { Text } from "@starci/grammar/common"
import { ParticipantRows } from "../ParticipantRows"
import { partitionParticipants } from "../../../../modules/collab/group-chat/model"

/** Props for the roster the compact member sheet shows a viewer who may not invite. */
type MemberSheetRosterProps = { readonly view: GroupChatPageView; readonly labels: GroupChatPageLabels }

/** Render the roster groups inside the compact member sheet. */
export const MemberSheetRoster = (props: MemberSheetRosterProps) => {
    const { view, labels } = props
    const { humans, modules } = partitionParticipants(view.participants)
    return (
        <div className={GROUP_CHAT_SHEET_ROSTER_CLASS_NAME}>
            <div className={GROUP_CHAT_SHEET_SECTION_CLASS_NAME}>
                <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                    <Text size="xs" weight="semibold" tone="muted">
                        {labels.members.humans(humans.length)}
                    </Text>
                </div>
                <ParticipantRows
                    participants={humans}
                    labels={labels}
                    density="compact"
                    empty={
                        <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                            <Text size="sm" tone="muted">
                                {labels.members.empty}
                            </Text>
                        </div>
                    }
                />
            </div>
            <div className={GROUP_CHAT_SHEET_SECTION_CLASS_NAME}>
                <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                    <Text size="xs" weight="semibold" tone="muted">
                        {labels.members.modules(modules.length)}
                    </Text>
                </div>
                <ParticipantRows
                    participants={modules}
                    labels={labels}
                    density="compact"
                    empty={
                        <div className={GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME}>
                            <Text size="sm" tone="muted">
                                {labels.members.noModules}
                            </Text>
                        </div>
                    }
                />
            </div>
        </div>
    )
}
