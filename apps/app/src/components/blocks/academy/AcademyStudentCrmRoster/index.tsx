import type { ReactNode } from "react"
import { Avatar } from "@nivo/ui"
import { SurfaceCard, Button, Button as CoreButton, Text, TextAction, Badge } from "@starci/grammar/common"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import type { AcademyStudent } from "../../../../modules/api/academy"
import { ACADEMY_STUDENT_CRM_ROSTER_CLASS_NAME } from "./classNames"

type AcademyStudentCrmRosterProps = {
    readonly state: "resting" | "empty" | "failed" | "answered"
    readonly students: ReadonlyArray<AcademyStudent>
    readonly notice?: ReactNode
    readonly labels: AcademyStudentCrmLabels
    readonly on: AcademyStudentCrmActions
}

const restingRows = (labels: AcademyStudentCrmLabels) =>
    [0, 1, 2].map((item) => (
        <div key={item}>
            <Avatar props={{ size: "md" }} isLoading />
            <div>
                <TextAction size="sm" isSkeleton>{""}</TextAction>
                <Text isSkeleton>{""}</Text>
            </div>
            <Button isSkeleton>{labels.open}</Button>
        </div>
    ))

const studentRows = (students: ReadonlyArray<AcademyStudent>, labels: AcademyStudentCrmLabels, on: AcademyStudentCrmActions) =>
    students.map((student, index) => (
        <div key={index}>
            <Avatar props={{ name: student.name, size: "md" }} />
            <div>
                <TextAction size="sm" onPress={() => on.openStudent(student.id)}>{student.name}</TextAction>
                <Text size="xs" tone="muted">{student.email}</Text>
            </div>
            <Badge tone={student.status === "active" ? "success" : "danger"}>
                {student.status === "active" ? labels.active : labels.banned}
            </Badge>
            <CoreButton size="sm" onPress={() => on.openStudent(student.id)}>{labels.open}</CoreButton>
        </div>
    ))

/** Draw the student roster and its empty, loading, and failure states. */
export const AcademyStudentCrmRoster = (props: AcademyStudentCrmRosterProps) => {
    const { state, students, notice, labels, on } = props
    if (state === "failed") {
        return <SurfaceCard label={labels.section}><div className={ACADEMY_STUDENT_CRM_ROSTER_CLASS_NAME}>{notice}</div></SurfaceCard>
    }
    if (state === "empty") {
        return <SurfaceCard label={labels.section}><div><Text size="sm" tone="muted">{labels.empty}</Text></div></SurfaceCard>
    }
    return (
        <SurfaceCard
            label={labels.section}
            labelEnd={state === "answered" ? <Text size="sm" tone="muted">{String(students.length)}</Text> : null}
        >
            <div className={ACADEMY_STUDENT_CRM_ROSTER_CLASS_NAME}>
                {state === "resting" ? restingRows(labels) : studentRows(students, labels, on)}
            </div>
        </SurfaceCard>
    )
}
