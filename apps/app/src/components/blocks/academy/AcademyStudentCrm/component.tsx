import {
    Avatar,
    Badge,
    Button,
    Field,
    LabelledProgressRow,
    SurfaceCard,
    Text,
    TextLink,
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import type { AcademyStudent, AcademyStudentDetail } from "@/modules/api/console"

/** Resolved copy for the student CRM block. */
export type AcademyStudentCrmLabels = {
    readonly section: string
    readonly empty: string
    readonly refused: string
    readonly open: string
    readonly active: string
    readonly banned: string
    readonly detail: string
    readonly create: string
    readonly name: string
    readonly email: string
    readonly password: string
    readonly saveStudent: string
    readonly courseSlug: string
    readonly grant: string
    readonly revoke: string
    readonly ban: string
    readonly activate: string
    readonly loadingDetail: string
    readonly actionFailed: string
}

/** Pure state for the student list, selected detail and targeted actions. */
export type AcademyStudentCrmViewProps = {
    readonly state: "resting" | "empty" | "refused" | "answered"
    readonly students: ReadonlyArray<AcademyStudent>
    readonly detailState: "idle" | "resting" | "refused" | "answered"
    readonly detail?: AcademyStudentDetail
    readonly pendingAction?: string
    readonly actionMessage?: string
    readonly labels: AcademyStudentCrmLabels
    readonly on: {
        readonly openStudent: (memberId: string) => void
        readonly changeName: (value: string) => void
        readonly changeEmail: (value: string) => void
        readonly changePassword: (value: string) => void
        readonly createStudent: () => void
        readonly changeCourseSlug: (value: string) => void
        readonly setStatus: (status: "active" | "banned") => void
        readonly grantAccess: () => void
        readonly revokeAccess: () => void
    }
}

/** Render student CRM state without owning requests or secrets. */
export const _AcademyStudentCrm = ({ state, students, detailState, detail, pendingAction, actionMessage, labels, on }: AcademyStudentCrmViewProps) => {
    const rows = state === "resting"
        ? [0, 1, 2].map(() => defineContractComponent("avatar-identity-badge-action-row", {
            avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ size: "md" }} isLoading />),
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: "", size: "sm" }} isLoading />),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "" }} isLoading />),
            }),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.open }} isLoading />),
        }))
        : students.map((student) => defineContractComponent("avatar-identity-badge-action-row", {
            avatar: defineLeafComponent("avatar", {}, () => <Avatar props={{ name: student.name, size: "md" }} />),
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: student.name, size: "sm" }} on={{ press: () => on.openStudent(student.id) }} />),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: student.email, size: "xs", tone: "muted" }} />),
            }),
            badge: defineLeafComponent("badge", {}, () => <Badge props={{ content: student.status === "active" ? labels.active : labels.banned, tone: student.status === "active" ? "success" : "danger" }} />),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: labels.open, size: "sm" }} on={{ press: () => on.openStudent(student.id) }} />),
        }))
    const note = state === "empty" ? labels.empty : state === "refused" ? labels.refused : undefined
    return (
        <>
            {note === undefined ? (
                <SurfaceCard
                    props={{ label: labels.section, fact: state === "answered" ? String(students.length) : undefined }}
                    contract="identity-action-list"
                    render={defineContractComponent("identity-action-list", { item: rows })}
                    isLoading={state === "resting"}
                />
            ) : (
                <SurfaceCard props={{ label: labels.section }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", {
                    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
                })} />
            )}
            <SurfaceCard
                props={{ label: labels.create }}
                contract="form-column"
                render={defineContractComponent("form-column", {
                    field: [
                        defineContractProjection("label-field-hint", () => <Field props={{ id: "academy-student-name", name: "name", label: labels.name, disabled: pendingAction === "create" }} on={{ change: on.changeName }} />),
                        defineContractProjection("label-field-hint", () => <Field props={{ id: "academy-student-email", name: "email", kind: "email", label: labels.email, disabled: pendingAction === "create" }} on={{ change: on.changeEmail }} />),
                        defineContractProjection("label-field-hint", () => <Field props={{ id: "academy-student-password", name: "password", kind: "newPassword", label: labels.password, disabled: pendingAction === "create" }} on={{ change: on.changePassword }} />),
                    ],
                    submit: defineLeafComponent("button", {}, () => <Button props={{ label: labels.saveStudent, variant: "primary", isPending: pendingAction === "create" }} on={{ press: on.createStudent }} />),
                })}
            />
            {detailState === "idle" ? null : (
                detailState === "answered" && detail !== undefined ? (
                    <SurfaceCard
                        props={{ label: labels.detail }}
                        contract="progress-row-stack"
                        render={defineContractComponent("progress-row-stack", {
                            row: detail.courses.length === 0
                                ? [defineCompositeComponent("labelled-progress-row", {}, () => <LabelledProgressRow props={{ id: "no-course", title: labels.courseSlug, percent: 0, percentText: "0/0" }} />)]
                                : detail.courses.map((course) => defineCompositeComponent("labelled-progress-row", {}, () => (
                                    <LabelledProgressRow props={{ id: course.slug, title: course.title, percent: course.total === 0 ? 0 : Math.round((course.completed / course.total) * 100), percentText: `${course.completed}/${course.total}` }} />
                                ))),
                        })}
                    />
                ) : (
                    <SurfaceCard
                        props={{ label: labels.detail }}
                        contract="body-with-refusal-note"
                        render={defineContractComponent("body-with-refusal-note", {
                            note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: detailState === "resting" ? labels.loadingDetail : labels.actionFailed, size: "sm", tone: "muted" }} />),
                        })}
                    />
                )
            )}
            {detailState !== "answered" || detail === undefined ? null : (
                <SurfaceCard
                    contract="form-column"
                    render={defineContractComponent("form-column", {
                        field: [defineContractProjection("label-field-hint", () => <Field props={{ id: "academy-course-slug", name: "courseSlug", label: labels.courseSlug, disabled: pendingAction !== undefined }} on={{ change: on.changeCourseSlug }} />)],
                        submit: defineLeafComponent("button", {}, () => <Button props={{ label: labels.grant, variant: "primary", isPending: pendingAction === "grant" }} on={{ press: on.grantAccess }} />),
                    })}
                />
            )}
            {detailState !== "answered" || detail === undefined ? null : (
                <SurfaceCard
                    contract="inline-action-run"
                    render={defineContractComponent("inline-action-run", {
                        action: [
                            defineLeafComponent("button", {}, () => <Button props={{ label: detail.member.status === "active" ? labels.ban : labels.activate, isPending: pendingAction === "status" }} on={{ press: () => on.setStatus(detail.member.status === "active" ? "banned" : "active") }} />),
                            defineLeafComponent("button", {}, () => <Button props={{ label: labels.revoke, isPending: pendingAction === "revoke" }} on={{ press: on.revokeAccess }} />),
                        ],
                    })}
                />
            )}
            {actionMessage === undefined ? null : <Text props={{ content: actionMessage, size: "sm", tone: "muted" }} />}
        </>
    )
}

/** Source-level tier marker for the pure Academy student CRM block. */
export const meta = { shape: "block", world: "pure" } as const
