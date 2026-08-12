import { Text } from "../Text"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `Divider`: the line that says two things above and below it are alternatives.
 *
 * THE LABEL IS THE POINT. A bare rule says "these are separate"; a rule reading OR says "pick one
 * or the other", which is the whole reason it sits between a set of shortcuts and a form. A
 * divider without a word is decoration, so the word is required here rather than optional.
 *
 * IT IS `role="separator"` AND THE WORD IS PART OF IT, so a screen reader announces the boundary
 * rather than reading a stray syllable between two groups of controls.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type DividerData = {
    /** The already-resolved word that names the choice. */
    readonly label: string
}

/** Props for {@link Divider}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type DividerProps = LeafProps<DividerData>

/** A rule either side of the word, with the word holding them apart. */
const DIVIDER_CLASSES = "flex flex-row items-center gap-3"

/** Each rule takes the room the word leaves. */
const RULE_CLASSES = "h-px grow bg-border"

/**
 * Draw a labelled boundary.
 *
 * @param input - {@link DividerProps}
 */
export const Divider = ({ props }: DividerProps) => (
    <div data-tier="leaf" data-component="Divider" role="separator" aria-label={props.label} className={DIVIDER_CLASSES}>
        <span aria-hidden="true" className={RULE_CLASSES} />
        <Text props={{ content: props.label, size: "sm", tone: "muted" }} />
        <span aria-hidden="true" className={RULE_CLASSES} />
    </div>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
