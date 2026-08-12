import { Link as HeroLink } from "@heroui/react"
import { Icon, type IconName } from "../Icon"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `QuickActionRow`: one shortcut on the rail.
 *
 * One navigation control. Its glyph is intrinsic to that single target, like a Button's icon;
 * it does not introduce a second independently actionable value.
 *
 * THE WHOLE ROW IS THE TARGET, not the words inside it. A rail of shortcuts is scanned and aimed
 * at quickly, and a target the width of its own label is a target that gets missed - so the row
 * carries the inset and the hover rather than the text.
 *
 * THE GLYPH TAKES THE ROW'S OWN COLOUR. An icon with a colour of its own is the one still bright
 * after the row it sits in turns muted.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type QuickActionRowData = {
    /** Identity of the row, used as the key by whoever maps the rail. */
    readonly id: string
    /** The already-resolved words. */
    readonly label: string
    /** The meaning drawn before the words. */
    readonly icon: IconName
}

/** Shortcut choice reported to the connected routing owner. */
export type QuickActionRowActions = {
    readonly press?: () => void
}

/** Props for {@link QuickActionRow}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type QuickActionRowProps = LeafProps<QuickActionRowData, QuickActionRowActions>

/** The row is the target: it carries the inset, the radius and the hover. */
const ROW_CLASSES = "flex flex-row items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-default"

/**
 * Draw one shortcut.
 *
 * @param input - {@link QuickActionRowProps}
 */
export const QuickActionRow = ({ props, on }: QuickActionRowProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="QuickActionRow"
        data-part="quick-action"
        onPress={on?.press}
        className={ROW_CLASSES}
    >
        <Icon props={{ name: props.icon, role: "leading" }} />
        {props.label}
    </HeroLink>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
