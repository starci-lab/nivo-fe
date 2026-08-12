import { Text } from "../../leaves/Text"
import { Progress } from "../../leaves/Progress"
import type { CompositeProps } from "../../contracts/props"
import { Tree } from "../../branches/Tree"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"

/**
 * COMPOSITE - `LabelledProgressRow`: a name, how far along it is, and the bar that shows it.
 *
 * The title, figure and progress value remain independently meaningful. This component fixes their
 * reusable arrangement; fixed interior is not evidence that three values became one leaf.
 *
 * IT NAMES ITS SHAPE, NOT A DOMAIN, and that is the whole reason it is reusable. It was
 * `CourseProgressRow`, which was a lie the moment a weekly target needed the same three parts: a
 * leaf named for one caller either gets copied for the second or turns its own name into a
 * falsehood. What it fixes is the ARRANGEMENT - label, figure, bar - and every caller with those
 * three things belongs here.
 *
 * THE FIGURE SITS ON THE TITLE'S LINE, not under the bar. A reader scanning a column of these is
 * comparing figures, and a figure below its own bar is read after the bar rather than with it.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LabelledProgressRowData = {
    /** Identity of the row. Used as the key by whoever maps the list. */
    readonly id: string
    /** The already-resolved name of whatever is progressing. Absent while loading. */
    readonly title?: string
    /** Completion, 0 to 100, already clamped by whoever resolved it. Absent while loading. */
    readonly percent?: number
    /** The figure as words - "62%", "3/5" - already interpolated. Absent while loading. */
    readonly percentText?: string
}

/** Props for {@link LabelledProgressRow}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type LabelledProgressRowProps = CompositeProps<LabelledProgressRowData>

/**
 * Draw one named thing's progress.
 *
 * @param input - {@link LabelledProgressRowProps}
 */
export const LabelledProgressRow = ({ props, isLoading = false }: LabelledProgressRowProps) => {
    const line = defineContractComponent("label-with-muted-fact-row", {
        label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.percentText, size: "xs" }} isLoading={isLoading} />),
    })
    const content = defineContractComponent("label-fact-over-progress", {
        line,
        progress: defineLeafComponent("progress", {}, () => <Progress props={{ value: props.percent, label: props.title ?? "" }} isLoading={isLoading} />),
    })
    return <Tree contract="label-fact-over-progress" render={content} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "composite", world: "pure" } as const
