import { Icon, type IconName } from "../Icon"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `Label`: the name of a box, tied to it.
 *
 * `htmlFor` IS REQUIRED. A label not tied to a control is decoration: the click does not focus the
 * box, and a screen reader announces an unnamed field. That is the whole reason this leaf exists
 * rather than a `Text` beside an `Input`.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LabelData = {
    /** The id of the control this names. */
    readonly htmlFor: string
    /** The already-resolved words. Copy, so it never rests. */
    readonly content: string
    /** The meaning drawn before the words. It inherits the label's colour, never its own. */
    readonly icon?: IconName
}

/** Props for {@link Label}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type LabelProps = LeafProps<LabelData>

/** The glyph sits on the label's baseline without the label learning it is in a row. */
const LABEL_CLASSES = "inline-flex items-center gap-2 text-sm font-medium"

/**
 * Draw a control's name.
 *
 * @param input - {@link LabelProps}
 */
export const Label = ({ props }: LabelProps) => (
    <label data-tier="leaf" data-component="Label" htmlFor={props.htmlFor} className={LABEL_CLASSES}>
        {props.icon === undefined ? null : <Icon props={{ name: props.icon, role: "chip" }} />}
        {props.content}
    </label>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
