import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import { GROUP_CHAT_CARD_BAND_CLASS_NAME, GROUP_CHAT_FORM_STACK_CLASS_NAME } from "./classNames"
import { SurfaceCard, Text } from "@starci/grammar/common"
import { Badge, Button } from "@starci/grammar/common"

/** Props for the acceptance-only screen; no Office fact may render here. */
type AcceptanceSurfaceProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
}

/** Render the invitation-only state without exposing Office data. */
export const AcceptanceSurface = (props: AcceptanceSurfaceProps) => {
    const { view, on, labels } = props
    const acceptance = view.acceptance
    if (acceptance === null) {
        return null
    }
    return (
        <SurfaceCard label={labels.accept.title} composition="joined">
            <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                <div className={GROUP_CHAT_FORM_STACK_CLASS_NAME}>
                    {acceptance.invalidLink ? (
                        <Text size="sm" live="assertive">
                            {labels.accept.invalidLink}
                        </Text>
                    ) : (
                        <>
                            <Text size="sm">{labels.accept.body}</Text>
                            {acceptance.roleHint !== null ? (
                                <Badge tone="accent">{labels.accept.roleLine(labels.roles[acceptance.roleHint])}</Badge>
                            ) : null}
                            {acceptance.state === "refused" ? (
                                <Text size="sm" live="assertive">
                                    {labels.accept.refused}
                                </Text>
                            ) : null}
                            <Button
                                variant="primary"
                                width="fill"
                                isPending={acceptance.state === "pending"}
                                isDisabled={acceptance.state === "refused"}
                                onPress={on.acceptInvitation}
                            >
                                {labels.accept.action}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </SurfaceCard>
    )
}
