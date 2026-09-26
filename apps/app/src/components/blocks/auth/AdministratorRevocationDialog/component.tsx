import { Button, Dialog, Select, Text } from "@starci/grammar/common";

/**
 * How far the request has got.
 *
 * `ready` asks which current workspace member the ending is for, `confirm` restates that member and
 * the all-session consequence before anything is sent, and the last four are the only four answers
 * a sent request has: it is still with an authority, the scope applied, the one generic refusal, or
 * an authority that did not answer.
 */
export type AdministratorRevocationStage = "ready" | "confirm" | "pending" | "applied" | "refused" | "undecided";

/**
 * One roster member the picker may offer: the display name a reader reads, and the durable member
 * identity only the request carries and this surface never draws.
 */
export type AdministratorRevocationMember = {
    readonly memberId: string;
    readonly displayName: string;
};

/** Resolved scoped administrator session ending shown over the console. */
export type AdministratorRevocationDialogBaseProps = {
    readonly props: {
        readonly title: string;
        /** The stage's own explanatory sentence; absent where the stage states one consequence line. */
        readonly description?: string;
        readonly contextLabel: string;
        readonly context: string;
        readonly memberLabel: string;
        readonly memberPlaceholder: string;
        readonly members: ReadonlyArray<AdministratorRevocationMember>;
        readonly memberId: string | null;
        /**
         * Why no member can be chosen right now - the authorized roster could not be read, or every
         * current member is ineligible. Null whenever the picker is the honest control.
         */
        readonly memberNotice: string | null;
        /** The authorized roster is still arriving; the picker announces the wait and cannot open. */
        readonly isMemberPending: boolean;
        readonly consequence: string;
        readonly cancelLabel: string;
        readonly continueLabel: string;
        readonly confirmLabel: string;
        readonly pendingLabel: string;
        readonly appliedLabel: string;
        readonly refusedLabel: string;
        readonly undecidedLabel: string;
        readonly retryLabel: string;
        readonly stage: AdministratorRevocationStage;
    };
    readonly on?: {
        readonly memberChange?: (memberId: string | null) => void;
        readonly confirm?: () => void;
        readonly retry?: () => void;
    };
    readonly isOpen: boolean;
    readonly onOpenChange: (isOpen: boolean) => void;
};

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type AdministratorRevocationDialogProps = AdministratorRevocationDialogBaseProps;

/**
 * Pure scoped administrator ending: the Dialog asks, the connected half reads and sends.
 *
 * THE MEMBER IS CHOSEN FROM THE AUTHORIZED ROSTER BY DISPLAY NAME. The picker offers exactly the
 * options it is handed and shows the selected member's display name; the durable memberId the
 * connected half resolves travels in the props and is never drawn, so no raw identifier, email or
 * Login principal reaches this surface and none is typed by hand.
 *
 * NOTHING HERE SPEAKS FOR AN AUTHORITY. The consequence says what the request would do and that
 * authority is checked as it is sent - before the confirmation, and again while nothing is known
 * yet. The applied sentence is one fixed sentence for any scope, because naming how many sessions
 * ended, or where they were, would report a session inventory this surface must not have. The
 * refusal is one sentence too: an unauthorized requester, a member outside the scope and a member
 * with nothing current are drawn identically, so the drawn dialog never reveals membership or
 * session presence.
 *
 * THE PICKER EXISTS ONLY WHILE NOTHING HAS BEEN SENT. Once a member is named, the dialog's own name
 * carries them and the body stops offering a change - the retry in the undecided state belongs to
 * the request identity already sent, not to a second, differently aimed one.
 *
 * NOTHING MAY LEAVE WHILE THE ANSWER IS OUTSTANDING. An ending that has already reached the server
 * is not recalled by closing the confirmation: it applies anyway, and a reader who dismissed the
 * dialog would have been told they stopped it. So in the pending stage the footer's cancel is
 * disabled and the overlay's two ways out - Escape and a press outside - are refused, which keeps
 * the dialog on screen until an authority answers. The settled stages take them all back: an applied
 * or refused scope, and the undecided retry, are answers rather than a request in flight, so each
 * dismisses as before.
 */
export const AdministratorRevocationDialogBase = (props: AdministratorRevocationDialogProps) => {
    const {
        title,
        description,
        contextLabel,
        context,
        memberLabel,
        memberPlaceholder,
        members,
        memberId,
        memberNotice,
        isMemberPending,
        consequence,
        cancelLabel,
        continueLabel,
        confirmLabel,
        pendingLabel,
        appliedLabel,
        refusedLabel,
        undecidedLabel,
        retryLabel,
        stage
    }: AdministratorRevocationDialogBaseProps["props"] = props.props;
    const outcome = stage === "pending" ? pendingLabel : stage === "applied" ? appliedLabel : stage === "refused" ? refusedLabel : stage === "undecided" ? undecidedLabel : null;
    const isChoosing = stage === "ready";
    const isConfirming = stage === "confirm";
    const isPending = stage === "pending";
    const canChoose = isChoosing && !isMemberPending && memberNotice === null;
    return <Dialog
        title={title}
        description={description}
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
        isDismissable={!isPending}
        isKeyboardDismissDisabled={isPending}
        footer={(close: () => void) => {
            if (stage === "undecided") {
                return <Button variant="primary" onPress={() => props.on?.retry?.()}>{retryLabel}</Button>;
            }
            if (stage === "applied" || stage === "refused") {
                return <Button variant="outline" onPress={close}>{cancelLabel}</Button>;
            }
            return <>
                <Button variant="outline" isDisabled={isPending} onPress={close}>{cancelLabel}</Button>
                <Button variant="primary" isPending={isPending} isDisabled={isPending || (isChoosing && (!canChoose || memberId === null))} onPress={() => props.on?.confirm?.()}>{isConfirming || isPending ? confirmLabel : continueLabel}</Button>
            </>;
        }}
    >
        {isConfirming ? <Text>{consequence}</Text> : null}
        <Text tone="muted">{contextLabel}</Text>
        <Text>{context}</Text>
        {isChoosing ? <Select
            label={memberLabel}
            placeholder={memberPlaceholder}
            options={members.map((member: AdministratorRevocationMember) => ({ id: member.memberId, label: member.displayName }))}
            value={memberId}
            isPending={isMemberPending}
            isDisabled={memberNotice !== null}
            onValueChange={(next: string | null) => props.on?.memberChange?.(next)}
        /> : null}
        {isChoosing && memberNotice !== null ? <Text live="polite">{memberNotice}</Text> : null}
        {isConfirming ? null : outcome === null ? <Text>{consequence}</Text> : <Text live="polite">{outcome}</Text>}
    </Dialog>;
};