import { Button, Dialog, Text } from "@starci/grammar/common"
import { SlotView } from "@nivo/ui"

/** Resolved every-browser confirmation shown over the console. */
export type SessionEndingDialogBaseProps = {
    readonly props: {
        readonly title: string
        readonly description: string
        readonly scopeNote: string
        readonly cancelLabel: string
        readonly confirmLabel: string
        readonly pendingLabel: string
        /** The ending request is in flight; the scope it was sent for is already fixed. */
        readonly isPending: boolean
        readonly isOpen: boolean
    }
    readonly on: {
        readonly confirm?: () => void
        readonly onOpenChange: (isOpen: boolean) => void
    }
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type SessionEndingDialogProps = SessionEndingDialogBaseProps

/**
 * Pure every-browser confirmation: the Dialog asks, the connected half ends the sessions.
 *
 * The body carries the scope note and, while the request is in flight, one sentence saying so -
 * never a claim that anything was ended. The confirming control wears the pending state, which is
 * also what forbids a second submission while the first is unanswered.
 *
 * NOTHING MAY LEAVE WHILE THE ANSWER IS OUTSTANDING. A destructive request that has already reached
 * the backend cannot be taken back by closing the confirmation: the sessions end anyway, and a
 * reader who dismissed the dialog would have been told they stopped it. So while `isPending` holds,
 * the footer's cancel is disabled and the two ways out the overlay owns - Escape and a press outside
 * - are refused as well, which is what keeps the confirmation on screen until the request settles.
 * Every one of them returns the moment the answer does, because the answer is what re-enables this
 * half's state or closes the dialog outright.
 */
export const SessionEndingDialogBase = (props: SessionEndingDialogProps) => {
    const {
        title,
        description,
        scopeNote,
        cancelLabel,
        confirmLabel,
        pendingLabel,
        isPending,
        isOpen,
    }: SessionEndingDialogBaseProps["props"] = props.props
    return (
        <Dialog
            title={title}
            description={description}
            isOpen={isOpen}
            onOpenChange={props.on.onOpenChange}
            isDismissable={!isPending}
            isKeyboardDismissDisabled={isPending}
            footer={(close: () => void) => (
                <>
                    <Button variant="outline" isDisabled={isPending} onPress={close}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="primary"
                        isPending={isPending}
                        isDisabled={isPending}
                        onPress={() => props.on?.confirm?.()}
                    >
                        {confirmLabel}
                    </Button>
                </>
            )}
        >
            <Text tone="muted">{scopeNote}</Text>
            <SlotView
                slot={{ items: isPending }}
                placeholder={false}
                labels={{ empty: pendingLabel, forbidden: pendingLabel, error: pendingLabel, retry: pendingLabel }}
            >
                {(requestIsPending) => (requestIsPending ? <Text live="polite">{pendingLabel}</Text> : null)}
            </SlotView>
        </Dialog>
    )
}
