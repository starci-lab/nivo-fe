import type { AcademyStudentDetail } from "../api/academy"
import type { nivoQueryReading } from "../query"

/** Derive the student roster's presentation from its settled query and item count. */
export const academyStudentListStateOf = (
    reading: ReturnType<typeof nivoQueryReading<{ readonly items: ReadonlyArray<unknown> }>>,
    count: number,
) => {
    if (reading.status === "resting") return "resting" as const
    if (reading.status === "failed") return "failed" as const
    return count === 0 ? ("empty" as const) : ("answered" as const)
}

/** Keep an in-flight or failed student detail distinct from an unanswered selection. */
export const academyStudentDetailStateOf = (
    detailLoading: boolean,
    reading: ReturnType<typeof nivoQueryReading<AcademyStudentDetail>> | undefined,
) => {
    if (detailLoading) return "resting" as const
    if (reading === undefined) return "idle" as const
    if (reading.status === "resting") return "resting" as const
    return reading.status === "failed" ? ("failed" as const) : ("answered" as const)
}
