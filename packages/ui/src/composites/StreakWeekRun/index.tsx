import { DayCell, type DayCellData } from "../../leaves/DayCell"
import { Tree } from "../../branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "../../contracts/props"

/**
 * COMPOSITE - `StreakWeekRun`: the last seven days, as one run of columns.
 *
 * Seven independent `DayCell` values form one fixed reusable week arrangement. Fixed count and
 * fixed interior make the composition stable; they do not collapse seven values into one leaf.
 *
 * SEVEN IS THIS FILE'S FACT. A week has seven days whatever the payload returns, so the count is
 * stated once here and the resting run is the loaded one rather than a second shape kept in step.
 *
 * The named `streak-week-run` branch owns the seam between the seven cells. This composite closes
 * those slots so callers can provide dates but cannot rearrange the week.
 */

/** How many columns a week is. Not a setting. */
const DAY_COUNT = 7

/** Placeholder columns, kept at the real count so the resting run is the loaded one. */
const RESTING_WEEK: ReadonlyArray<DayCellData> = Array.from(
    { length: DAY_COUNT },
    (_unused, index) => ({ id: `resting-${index}` }),
)

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type StreakWeekRunData = {
    /** The last seven days, oldest first. Absent while loading. */
    readonly days?: ReadonlyArray<DayCellData>
}

/** Props for {@link StreakWeekRun}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type StreakWeekRunProps = CompositeProps<StreakWeekRunData>

/**
 * Draw the week.
 *
 * @param input - {@link StreakWeekRunProps}
 */
export const StreakWeekRun = ({ props, isLoading = false }: StreakWeekRunProps) => (
    <Tree contract="streak-week-run" render={defineContractComponent("streak-week-run", {
        day: (isLoading ? RESTING_WEEK : (props.days ?? RESTING_WEEK)).map((day) => (
            defineLeafComponent("day-cell", {}, () => (
                <DayCell key={day.id} props={day} isLoading={isLoading} />
            ))
        )),
    })} />
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "composite", world: "pure" } as const
