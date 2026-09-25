import { Button, Dialog, Input, Text } from "@starci/grammar/common";

/**
 * How far the request has got.
 *
 * `ready` asks who the ending is for, `confirm` restates the named target and the all-session
 * consequence before anything is sent, and the last three are the only three answers the request
 * has: the scope applied, the one generic refusal, or an authority that did not answer.
 */
export type AdministratorRevocationStage = "ready" | "confirm" | "pending" | "applied" | "refused" | "undecided";

/** Resolved scoped administrator session ending shown over the console. */
export type AdministratorRevocationDialogBaseProps = {
  readonly props: {
    readonly title: string;
    readonly description: string;
    readonly targetLabel: string;
    readonly target: string;
    readonly contextLabel: string;
    readonly context: string;
    readonly cancelLabel: string;
    readonly confirmLabel: string;
    readonly pendingLabel: string;
    readonly appliedLabel: string;
    readonly refusedLabel: string;
    readonly undecidedLabel: string;
    readonly retryLabel: string;
    readonly stage: AdministratorRevocationStage;
  };
  readonly on?: {
    readonly targetChange?: (target: string) => void;
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
 * Pure scoped administrator ending: the Dialog asks, the connected half sends the request.
 *
 * NOTHING HERE SPEAKS FOR AN AUTHORITY. The confirmation states what the request would do and that
 * authority is checked when it is sent; the applied sentence is one fixed sentence for any scope,
 * because naming how many sessions ended, or where they were, would report a session inventory this
 * surface must not have. The refusal is one sentence too: an unauthorized requester, an unknown
 * principal and a principal with nothing current are drawn identically, so the drawn dialog never
 * reveals principal existence, membership or session presence.
 *
 * The target field exists only while nothing has been sent. Once a target is named, the dialog's own
 * name carries it and the body stops offering an edit - the retry in the undecided state belongs to
 * the request identity already sent, not to a second, differently aimed one.
 */
export const AdministratorRevocationDialogBase = (props: AdministratorRevocationDialogProps) => {
  const {
    title,
    description,
    targetLabel,
    target,
    contextLabel,
    context,
    cancelLabel,
    confirmLabel,
    pendingLabel,
    appliedLabel,
    refusedLabel,
    undecidedLabel,
    retryLabel,
    stage
  }: AdministratorRevocationDialogBaseProps["props"] = props.props;
  const outcome = stage === "applied" ? appliedLabel : stage === "refused" ? refusedLabel : stage === "undecided" ? undecidedLabel : null;
  const isNaming = stage === "ready";
  const isPending = stage === "pending";
  return <Dialog
    title={title}
    description={description}
    isOpen={props.isOpen}
    onOpenChange={props.onOpenChange}
    footer={(close: () => void) => {
      if (stage === "undecided") {
        return <Button variant="primary" onPress={() => props.on?.retry?.()}>{retryLabel}</Button>;
      }
      if (outcome !== null) {
        return <Button variant="outline" onPress={close}>{cancelLabel}</Button>;
      }
      return <>
        <Button variant="outline" onPress={close}>{cancelLabel}</Button>
        <Button variant="primary" isPending={isPending} isDisabled={isPending || target.length === 0} onPress={() => props.on?.confirm?.()}>{confirmLabel}</Button>
      </>;
    }}
  >
    {isNaming ? <Input id="administrator-ending-target" name="administrator-ending-target" label={targetLabel} value={target} isRequired onValueChange={(next: string) => props.on?.targetChange?.(next)} /> : null}
    <Text tone="muted">{contextLabel}</Text>
    <Text>{context}</Text>
    {outcome === null ? isPending ? <Text live="polite">{pendingLabel}</Text> : null : <Text live="polite">{outcome}</Text>}
  </Dialog>;
};