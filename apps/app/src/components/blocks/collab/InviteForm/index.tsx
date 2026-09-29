import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_FIELD_BODY_CLASS_NAME,
    GROUP_CHAT_ROLE_CHOICES_CLASS_NAME,
    GROUP_CHAT_ROLE_CHOICE_CLASS_NAME,
    GROUP_CHAT_ROLE_RADIO_CLASS_NAME,
    GROUP_CHAT_FORM_STACK_CLASS_NAME,
    GROUP_CHAT_FORM_STACK_COMPACT_CLASS_NAME,
} from "./classNames"
import { Input, Text } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { GROUP_CHAT_HUMAN_ROLES } from "../../../../modules/collab/group-chat/model"

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
            <fieldset className={GROUP_CHAT_FIELD_BODY_CLASS_NAME}>
                <Text as="span" size="sm" weight="semibold">
                    {labels.invite.role}
                </Text>
                <div className={GROUP_CHAT_ROLE_CHOICES_CLASS_NAME} role="radiogroup" aria-label={labels.invite.role}>
                    {GROUP_CHAT_HUMAN_ROLES.map((role) => (
                        <label key={role} className={GROUP_CHAT_ROLE_CHOICE_CLASS_NAME}>
                            <input
                                type="radio"
                                name="invite-role"
                                value={role}
                                className={GROUP_CHAT_ROLE_RADIO_CLASS_NAME}
                                checked={view.invite.role === role}
                                disabled={view.invite.pending}
                                onChange={() => on.changeInviteRole(role)}
                            />
                            <Text as="span" size="sm">
                                {labels.roles[role]}
                            </Text>
                        </label>
                    ))}
                </div>
            </fieldset>
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
