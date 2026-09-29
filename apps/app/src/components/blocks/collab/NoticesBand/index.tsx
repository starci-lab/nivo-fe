import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import { GROUP_CHAT_NOTICE_ROW_CLASS_NAME } from "./classNames"
import { SurfaceCard, Text } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

/** Props for the outstanding turn-notice band above the conversation. */
type NoticesBandProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

/** Render the current outstanding turn notices. */
export const NoticesBand = (props: NoticesBandProps) => {
    const { view, on, labels } = props
    if (view.notices.length === 0) {
        return null
    }
    return (
        <SurfaceCard label={labels.notice.title} composition="joined" depth="nested">
            {view.notices.map((item) => {
                const outcome = view.noticeOutcomes[item.notice.noticeId]
                const text = item.notice.turnKind === "approval" ? labels.notice.approval : labels.notice.taskAssign()
                return (
                    <div key={item.notice.noticeId} className={GROUP_CHAT_NOTICE_ROW_CLASS_NAME}>
                        <Text size="sm" isSuperseded={outcome === "handled" || outcome === "ended"}>
                            {text}
                        </Text>
                        {outcome === undefined ? (
                            <Button size="sm" variant="secondary" onPress={() => on.openNotice(item.notice.noticeId)}>
                                {labels.notice.open}
                            </Button>
                        ) : (
                            <Text size="xs" tone="muted">
                                {outcome === "unavailable" ? labels.notice.unavailable : labels.notice.handled}
                            </Text>
                        )}
                    </div>
                )
            })}
        </SurfaceCard>
    )
}
