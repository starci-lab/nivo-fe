import type {
    GroupChatPageLabels,
    GroupChatPageView,
    GroupChatPageActions,
} from "../../../../modules/collab/group-chat/types"
import { GROUP_CHAT_FORM_STACK_CLASS_NAME, GROUP_CHAT_FORM_STACK_COMPACT_CLASS_NAME } from "./classNames"
import { Button, Input, RadioGroup, Text } from "@starci/grammar/common"
import { COLLAB_HUMAN_ROLES } from "../../../../modules/collab/group-chat/model.guards"
import type { CollabHumanRole } from "../../../../modules/api/collab"

/** Props for the role-gated invitation form shared by the member rail and the compact sheet. */
type InviteFormProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /** The docked compact sheet keeps the email label off the surface - its a11y name stays. */
    readonly compact?: boolean
}

/** Render the role-aware invitation form for the current viewer. */
export const InviteForm = (props: InviteFormProps) => {
    const { view, on, labels, compact = false } = props
    return (
        <form
            className={compact ? GROUP_CHAT_FORM_STACK_COMPACT_CLASS_NAME : GROUP_CHAT_FORM_STACK_CLASS_NAME}
            onSubmit={(event) => {
                event.preventDefault()
                on.submitInvite()
            }}
        >
            <Input
                id="collab-invite-email"
                name="invite-email"
                kind="email"
                label={labels.invite.email}
                placeholder={labels.invite.emailPlaceholder}
                value={view.invite.email}
                isDisabled={view.invite.pending}
                isRequired
                onValueChange={on.changeInviteEmail}
            />
            <RadioGroup
                name="invite-role"
                label={labels.invite.role}
                options={COLLAB_HUMAN_ROLES.map((role) => ({ value: role, label: labels.roles[role] }))}
                value={view.invite.role}
                orientation="horizontal"
                isDisabled={view.invite.pending}
                onValueChange={(role) => on.changeInviteRole(role as CollabHumanRole)}
            />
            <Text size="xs" tone="muted">
                {labels.invite.hint}
            </Text>
            {view.invite.outcome === "created" && view.invite.invitedEmail !== null ? (
                <Text size="sm" tone="accent" live="polite">
                    {labels.invite.sent(view.invite.invitedEmail)}
                </Text>
            ) : null}
            {view.invite.outcome === "existing" ? (
                <Text size="sm" tone="muted" live="polite">
                    {labels.invite.existing}
                </Text>
            ) : null}
            {view.invite.outcome === "refused" ? (
                <Text size="sm" live="assertive">
                    {labels.invite.refused}
                </Text>
            ) : null}
            <Button
                type="submit"
                variant="primary"
                width="fill"
                isPending={view.invite.pending}
                isDisabled={view.invite.email.trim().length === 0}
            >
                {labels.invite.submit}
            </Button>
        </form>
    )
}
