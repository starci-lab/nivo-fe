import { Button, Text, TextAction } from "@starci/grammar/common"
import type {
    PurchaseStatusActions as PurchaseStatusActionCallbacks,
    PurchaseStatusRail,
} from "@/modules/agentos/purchase-status/view-model"
import { ACTION_FOCUS_CLASS_NAME, CAPTION_CLASS_NAME, ESCAPE_CLASS_NAME } from "./classNames"

type PurchaseStatusActionsProps =
    | {
          readonly kind: "primary"
          readonly action: { readonly label: string; readonly pending?: boolean }
          readonly on: PurchaseStatusActionCallbacks
      }
    | {
          readonly kind: "rail"
          readonly rail: PurchaseStatusRail
          readonly on: PurchaseStatusActionCallbacks
      }
    | {
          readonly kind: "escape"
          readonly link: { readonly label: string; readonly href: string }
          readonly on: PurchaseStatusActionCallbacks
      }

/** Draw the distinct purchase, verification-rail and page-level actions. */
export const PurchaseStatusActions = (props: PurchaseStatusActionsProps) => {
    if (props.kind === "primary")
        return (
            <div className={ACTION_FOCUS_CLASS_NAME}>
                <Button variant="primary" type="button" isPending={props.action.pending} onPress={props.on.primary}>
                    {props.action.label}
                </Button>
            </div>
        )
    if (props.kind === "escape")
        return (
            <div className={ESCAPE_CLASS_NAME}>
                <TextAction href={props.link.href} size="sm" onFollow={props.on.returnToList}>
                    {props.link.label}
                </TextAction>
            </div>
        )
    const { rail, on } = props
    return (
        <>
            {rail.action === undefined ? null : (
                <div className={ACTION_FOCUS_CLASS_NAME}>
                    <Button
                        variant="primary"
                        size="lg"
                        width="fill"
                        type="button"
                        isPending={rail.action.pending}
                        onPress={on.primary}
                    >
                        {rail.action.label}
                    </Button>
                </div>
            )}
            {rail.actionCaption === undefined ? null : (
                <div className={CAPTION_CLASS_NAME}>
                    <Text size="xs" tone="muted" overflow="wrap">
                        {rail.actionCaption}
                    </Text>
                </div>
            )}
            {rail.refusalText === undefined ? null : (
                <Text size="sm" live="polite" overflow="wrap">
                    {rail.refusalText}
                </Text>
            )}
            {rail.secondaryLink === undefined ? null : (
                <TextAction href={rail.secondaryLink.href} size="sm" onFollow={on.returnToList}>
                    {rail.secondaryLink.label}
                </TextAction>
            )}
        </>
    )
}
