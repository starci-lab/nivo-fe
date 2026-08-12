import { Icon } from "../../leaves/Icon"
import { Text } from "../../leaves/Text"
import type { IconName } from "../../leaves/Icon"
import type { CompositeProps } from "../../contracts/props"
import { Tree } from "../../branches/Tree"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/**
 * COMPOSITE - `StatRow`: one standing figure, as a glyph, its name and the number.
 *
 * The icon, label and figure keep independent meaning and loading behavior. This file fixes their
 * reusable arrangement; a fixed interior does not turn those values into one leaf.
 *
 * THE GLYPH LEADS because it identifies the row faster than the name does, and the name between
 * them takes the slack, because a long one must clip rather than push the figure off the end.
 *
 * THE NAME DOES NOT REST. It is copy the caller already holds, so shimmering it would hide a word
 * that is not waiting on anything and leave the row unnamed exactly while a reader is working out
 * what it is.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type StatRowData = {
    /** The meaning drawn on the plate. */
    readonly icon: IconName
    /** What the figure is called. Copy, so it survives a loading pass. */
    readonly label: string
    /** The figure itself, already interpolated. Absent while loading. */
    readonly value?: string
}

/** Props for {@link StatRow}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type StatRowProps = CompositeProps<StatRowData>

/**
 * Draw one standing figure.
 *
 * @param input - {@link StatRowProps}
 */
export const StatRow = ({ props, isLoading = false }: StatRowProps) => {
    const content = defineContractComponent("glyph-title-fact-row", {
        glyph: defineLeafComponent("icon", { size: "sm" }, () => <Icon props={{ name: props.icon, role: "leading" }} />),
        title: defineLeafComponent("text", { size: "md", tone: "default" }, () => <Text props={{ content: props.label, size: "md" }} />),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.value, size: "xs" }} isLoading={isLoading} />),
    })
    return <Tree contract="glyph-title-fact-row" render={content} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "composite", world: "pure" } as const
