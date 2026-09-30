import type { AcademyStudentDetail } from "../../../../modules/api/__generated__/core"

import type { ReactNode } from "react"
import { LabelledProgressRow } from "@nivo/ui"
import { Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import type { AcademyStudentCrmActions, AcademyStudentCrmLabels } from "../../../../modules/academy/student-crm"
import { ACADEMY_STUDENT_CRM_DETAIL_CLASS_NAME } from "./classNames"

type AcademyStudentCrmDetailProps = {
    readonly detailState: "idle" | "resting" | "failed" | "answered"
    readonly detail?: AcademyStudentDetail
    readonly detailNotice?: ReactNode
    readonly pendingAction?: string
    readonly actionMessage?: string
    readonly labels: AcademyStudentCrmLabels
    readonly on: AcademyStudentCrmActions
}

type CourseProgressProps = { readonly course: AcademyStudentDetail["courses"][number] }

const CourseProgress = ({ course }: CourseProgressProps) => (
    <LabelledProgressRow
        props={{
            id: course.slug,
            title: course.title,
            percent: course.total === 0 ? 0 : Math.round((course.completed / course.total) * 100),
            percentText: `${course.completed}/${course.total}`,
        }}
    />
)

const DetailCard = ({ detailState, detail, detailNotice, labels }: AcademyStudentCrmDetailProps) => {
    if (detailState === "idle") return null
    if (detailState === "answered" && detail !== undefined) {
        return (
            <SurfaceCard label={labels.detail}>
                <div>
                    {detail.courses.length === 0 ? (
                        <LabelledProgressRow props={{ id: "no-course", title: labels.courseSlug, percent: 0, percentText: "0/0" }} />
                    ) : detail.courses.map((course) => (
                        <CourseProgress key={course.slug} course={course} />
                    ))}
                </div>
            </SurfaceCard>
        )
    }
    if (detailState === "failed") return <SurfaceCard label={labels.detail}><div>{detailNotice}</div></SurfaceCard>
    return <SurfaceCard label={labels.detail}><div><Text size="sm" tone="muted">{labels.loadingDetail}</Text></div></SurfaceCard>
}

/** Render selected student progress and the actions that require a selected student. */
export const AcademyStudentCrmDetail = (props: AcademyStudentCrmDetailProps) => {
    const { detailState, detail, pendingAction, actionMessage, labels, on } = props
    const selected = detailState === "answered" && detail !== undefined
    return (
        <>
            <DetailCard {...props} />
            {selected ? (
                <>
                    <SurfaceCard>
                        <div className={ACADEMY_STUDENT_CRM_DETAIL_CLASS_NAME}>
                            <Input id="academy-course-slug" name="courseSlug" label={labels.courseSlug} isDisabled={pendingAction !== undefined} variant="secondary" onValueChange={on.changeCourseSlug} />
                            <Button variant="primary" isPending={pendingAction === "grant"} onPress={on.grantAccess}>{labels.grant}</Button>
                        </div>
                    </SurfaceCard>
                    <SurfaceCard>
                        <div>
                            <Button isPending={pendingAction === "status"} onPress={() => on.setStatus(detail.member.status === "active" ? "banned" : "active")}>
                                {detail.member.status === "active" ? labels.ban : labels.activate}
                            </Button>
                            <Button isPending={pendingAction === "revoke"} onPress={on.revokeAccess}>{labels.revoke}</Button>
                        </div>
                    </SurfaceCard>
                </>
            ) : null}
            {actionMessage === undefined ? null : <Text size="sm" tone="muted">{actionMessage}</Text>}
        </>
    )
}
