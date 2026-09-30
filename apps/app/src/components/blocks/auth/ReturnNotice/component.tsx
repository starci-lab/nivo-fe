import { Text } from "@starci/grammar/common"

/** Resolved unavailable-return notice shown at the default authenticated landing. */
type ReturnNoticeBaseProps = {
    readonly props: {
        /**
         * The notice sentence, or null on an ordinary landing. Null is not "the notice is late": it is
         * the arrival nobody had to explain, because no destination was refused.
         */
        readonly message: string | null
    }
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract above stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type ReturnNoticeProps = ReturnNoticeBaseProps

/**
 * Pure unavailable-return notice: one sentence, and no reason behind it.
 *
 * NOTHING HERE EXPLAINS ANYTHING. A destination the session could not honour is named as the place
 * somebody was heading to and never as the route itself, and no cause is attached to it - so the
 * landing cannot be turned into a probe for which routes exist, or for which of them a principal may
 * open. The sentence is what the address said and nothing more; a null message draws neither an
 * empty region nor a placeholder, because a landing that has nothing to report is not resting, it is
 * simply the landing.
 */
export const ReturnNoticeBase = (props: ReturnNoticeProps) => {
    const { message }: ReturnNoticeBaseProps["props"] = props.props
    return message === null ? null : <Text live="polite">{message}</Text>
}
