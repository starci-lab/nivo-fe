"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import type { LeafProps } from "../../contracts/props"

/** One contribution day with its already-resolved accessible description. */
export type ContributionGridDay = {
    readonly date: string
    readonly count: number
    readonly label: string
}

/** The values needed by one intrinsic yearly contribution plot. */
export type ContributionGridData = {
    readonly year: number
    readonly monthLabels: ReadonlyArray<string>
    readonly weekdayLabels: ReadonlyArray<string>
    readonly days: ReadonlyArray<ContributionGridDay>
}

/** Props for the intrinsic contribution plot. */
export type ContributionGridProps = LeafProps<ContributionGridData>

type CalendarCell = ContributionGridDay & { readonly inYear: boolean }
type CalendarWeek = { readonly id: string; readonly monthLabel?: string; readonly cells: ReadonlyArray<CalendarCell> }

const CELL_CLASSES = [
    "size-3 shrink-0 rounded-sm bg-default",
    "size-3 shrink-0 rounded-sm bg-accent/20",
    "size-3 shrink-0 rounded-sm bg-accent/40",
    "size-3 shrink-0 rounded-sm bg-accent/60",
    "size-3 shrink-0 rounded-sm bg-accent",
] as const

const levelOf = (count: number) => count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4

const makeWeeks = (
    year: number,
    days: ReadonlyArray<ContributionGridDay>,
    monthLabels: ReadonlyArray<string>,
): ReadonlyArray<CalendarWeek> => {
    const byDate = new Map(days.map((day) => [day.date, day]))
    const first = new Date(Date.UTC(year, 0, 1))
    const cursor = new Date(first)
    cursor.setUTCDate(first.getUTCDate() - first.getUTCDay())
    const last = new Date(Date.UTC(year, 11, 31))
    const weeks: Array<CalendarWeek> = []
    let previousMonth = -1

    while (cursor <= last) {
        const cells: Array<CalendarCell> = []
        let monthLabel: string | undefined
        for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
            const date = cursor.toISOString().slice(0, 10)
            const inYear = cursor.getUTCFullYear() === year
            const source = byDate.get(date)
            if (inYear && cursor.getUTCMonth() !== previousMonth) {
                previousMonth = cursor.getUTCMonth()
                monthLabel = monthLabels[previousMonth]
            }
            cells.push({ date, count: source?.count ?? 0, label: source?.label ?? date, inYear })
            cursor.setUTCDate(cursor.getUTCDate() + 1)
        }
        weeks.push({ id: cells[0]?.date ?? String(weeks.length), monthLabel, cells })
    }
    return weeks
}

/** Draw the draggable, accessible contribution grid as one intrinsic visualization. */
export const ContributionGrid = ({ props, isLoading = false }: ContributionGridProps) => {
    const viewportRef = useRef<HTMLDivElement>(null)
    const weeks = makeWeeks(props.year, props.days, props.monthLabels)

    return (
        <div ref={viewportRef} className="cursor-grab overflow-hidden active:cursor-grabbing" data-part="calendar-viewport">
            <motion.div
                drag="x"
                dragConstraints={viewportRef}
                dragElastic={0.04}
                dragMomentum={false}
                className="flex w-max flex-row items-start gap-1"
                data-part="calendar-grid"
            >
                <span className="flex w-8 shrink-0 flex-col gap-1 pt-5 pr-1" aria-hidden="true">
                    {Array.from({ length: 7 }, (_unused, index) => (
                        <span key={index} className="h-3 text-xs leading-3 text-muted">{props.weekdayLabels[index] ?? ""}</span>
                    ))}
                </span>
                {weeks.map((week) => (
                    <span key={week.id} className="flex shrink-0 flex-col gap-1" data-part="calendar-week">
                        <span className="h-4 w-3 whitespace-nowrap text-xs text-muted" aria-hidden="true">{week.monthLabel ?? ""}</span>
                        {week.cells.map((cell) => (
                            <span
                                key={cell.date}
                                data-part="calendar-day"
                                data-date={cell.date}
                                data-count={cell.count}
                                aria-label={cell.inYear ? cell.label : undefined}
                                aria-hidden={cell.inYear ? undefined : true}
                                className={cell.inYear
                                    ? isLoading ? "size-3 shrink-0 animate-pulse rounded-sm bg-default" : CELL_CLASSES[levelOf(cell.count)]
                                    : "size-3 shrink-0"}
                            />
                        ))}
                    </span>
                ))}
            </motion.div>
        </div>
    )
}

/** Source-level tier marker for the intrinsic contribution plot. */
export const meta = { shape: "leaf", world: "pure" } as const
