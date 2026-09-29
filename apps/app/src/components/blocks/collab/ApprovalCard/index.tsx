import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_ENTRY_CLASS_NAME,
    GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME,
    GROUP_CHAT_CARD_INSET_CLASS_NAME,
    GROUP_CHAT_FIELD_BODY_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME,
    GROUP_CHAT_BADGE_ROW_CLASS_NAME,
    GROUP_CHAT_WAITING_LINE_CLASS_NAME,
    GROUP_CHAT_BAND_ICON_CLASS_NAME,
    GROUP_CHAT_CARD_ACTIONS_CLASS_NAME,
    GROUP_CHAT_ACTION_PRIMARY_CLASS_NAME,
    GROUP_CHAT_ACTION_SECONDARY_CLASS_NAME,
} from "./classNames"
import { Icon, SurfaceCard, Text } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import { Badge, Button } from "@starci/grammar/common"
import type { CollabApprovalView } from "../../../../modules/api/collab"
import { mayPresentDecision, shortTaskRef } from "../../../../modules/collab/group-chat/model"
import type { ConversationItem } from "../../../../modules/collab/group-chat/model"

/** Props for one held-action card with its decision row. */
type ApprovalCardProps = {
    readonly item: Extract<ConversationItem, { kind: "approval-card" }>
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    readonly compact?: boolean
}

/** Render a held action and its eligible decision controls. */
export const ApprovalCard = (props: ApprovalCardProps) => {
    const { item, view, on, labels, compact = false } = props
    const { approval, task } = item
    const settled = view.settledApprovals[approval.approvalId]
    const effective: CollabApprovalView = settled ?? approval
    const isWaiting = effective.status === "waiting"
    const eligible = mayPresentDecision(view.viewer)
    const pending = view.pressingApprovalId === approval.approvalId
    const pressNotice = view.approvalNotices[approval.approvalId]
    const moduleName = task.owningModuleDisplayName ?? task.owningModuleKey
    const decisionTone =
        effective.status === "approved"
            ? "success"
            : effective.status === "rejected"
              ? "danger"
              : effective.status === "withdrawn"
                ? "neutral"
                : "warning"
    return (
        <div
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={`collab-approval-${approval.approvalId}`}
        >
            <div className={GROUP_CHAT_CARD_INSET_CLASS_NAME}>
                <div className={GROUP_CHAT_BADGE_ROW_CLASS_NAME}>
                    {isWaiting ? (
                        <>
                            <Badge tone="danger">{labels.approval.needed}</Badge>
                            <span className={GROUP_CHAT_WAITING_LINE_CLASS_NAME}>
                                <Icon source={IconSource("pending", "chip")} usage="chip" />
                                <Text as="span" size="sm" tone="muted">
                                    {labels.approval.waiting}
                                </Text>
                            </span>
                        </>
                    ) : (
                        <Badge tone={decisionTone}>
                            {
                                labels.statuses[
                                    effective.status === "approved"
                                        ? "done"
                                        : effective.status === "rejected"
                                          ? "rejected"
                                          : "cancelled"
                                ]
                            }
                        </Badge>
                    )}
                </div>
                <SurfaceCard composition="joined" depth="nested" ariaLabel={effective.action}>
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <span className={GROUP_CHAT_BAND_ICON_CLASS_NAME} aria-hidden="true">
                            <Icon source={IconSource("review", "leading")} usage="leading" />
                        </span>
                        <Text size={compact ? "sm" : "md"} weight="semibold">
                            {effective.action}
                        </Text>
                    </div>
                    {effective.consequence === null ? null : (
                        <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                            <span className={GROUP_CHAT_BAND_ICON_CLASS_NAME} aria-hidden="true">
                                i
                            </span>
                            <Text size={compact ? "sm" : "md"}>{effective.consequence}</Text>
                        </div>
                    )}
                    <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                        <span className={GROUP_CHAT_BAND_ICON_CLASS_NAME} aria-hidden="true">
                            <Icon source={IconSource("account", "leading")} usage="leading" />
                        </span>
                        <div className={GROUP_CHAT_FIELD_BODY_CLASS_NAME}>
                            <Text size={compact ? "sm" : "md"} weight="medium">
                                {labels.card.reference(shortTaskRef(task.taskId), moduleName)}
                                {task.askedByDisplayName
                                    ? ` · ${labels.card.requestedBy(task.askedByDisplayName)}`
                                    : ""}
                            </Text>
                            <Text size="xs" tone="muted">
                                {settled !== undefined &&
                                settled.decidedByDisplayName !== null &&
                                effective.decidedAt !== null
                                    ? labels.approval.decidedBy(
                                          settled.decidedByDisplayName,
                                          labels.formatTime(effective.decidedAt),
                                      )
                                    : effective.status === "withdrawn"
                                      ? labels.approval.withdrawn
                                      : labels.approval.deciderHint}
                            </Text>
                            {pressNotice === "denied" ? (
                                <Text size="xs" live="assertive">
                                    {labels.approval.denied}
                                </Text>
                            ) : pressNotice === "uncertain" ? (
                                <Text size="xs" live="assertive">
                                    {labels.approval.uncertain}
                                </Text>
                            ) : null}
                        </div>
                    </div>
                    {isWaiting ? (
                        <div className={GROUP_CHAT_CARD_ACTIONS_CLASS_NAME}>
                            <div className={GROUP_CHAT_ACTION_PRIMARY_CLASS_NAME}>
                                <Button
                                    variant="primary"
                                    width="fill"
                                    isDisabled={!eligible || pending}
                                    isPending={pending}
                                    onPress={() => on.pressApproval(approval.approvalId, "approve")}
                                >
                                    {labels.approval.approve}
                                </Button>
                            </div>
                            <div className={GROUP_CHAT_ACTION_SECONDARY_CLASS_NAME}>
                                <Button
                                    variant="outline"
                                    width="fill"
                                    isDisabled={!eligible || pending}
                                    isPending={pending}
                                    onPress={() => on.pressApproval(approval.approvalId, "reject")}
                                >
                                    {labels.approval.reject}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </SurfaceCard>
            </div>
        </div>
    )
}
