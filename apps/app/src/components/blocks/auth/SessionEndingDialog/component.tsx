import { Button, Dialog, Text } from "@starci/grammar/common";

/** Resolved every-browser confirmation shown over the console. */
export type SessionEndingDialogBaseProps = {
  readonly props: {
    readonly title: string;
    readonly description: string;
    readonly scopeNote: string;
    readonly cancelLabel: string;
    readonly confirmLabel: string;
    readonly pendingLabel: string;
    /** The ending request is in flight; the scope it was sent for is already fixed. */
    readonly isPending: boolean;
  };
  readonly on?: {
    readonly confirm?: () => void;
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
type SessionEndingDialogProps = SessionEndingDialogBaseProps;

/**
 * Pure every-browser confirmation: the Dialog asks, the connected half ends the sessions.
 *
 * The body carries the scope note and, while the request is in flight, one sentence saying so -
 * never a claim that anything was ended. The confirming control wears the pending state, which is
 * also what forbids a second submission while the first is unanswered.
 */
export const SessionEndingDialogBase = (props: SessionEndingDialogProps) => {
  const {
    title,
    description,
    scopeNote,
    cancelLabel,
    confirmLabel,
    pendingLabel,
    isPending
  }: SessionEndingDialogBaseProps["props"] = props.props;
  return <Dialog
    title={title}
    description={description}
    isOpen={props.isOpen}
    onOpenChange={props.onOpenChange}
    footer={(close: () => void) => <>
      <Button variant="outline" onPress={close}>{cancelLabel}</Button>
      <Button variant="primary" isPending={isPending} isDisabled={isPending} onPress={() => props.on?.confirm?.()}>{confirmLabel}</Button>
    </>}
  >
    <Text tone="muted">{scopeNote}</Text>
    {isPending ? <Text live="polite">{pendingLabel}</Text> : null}
  </Dialog>;
};