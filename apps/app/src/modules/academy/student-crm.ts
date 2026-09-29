import type { ReactNode } from "react"
import type { AcademyStudent, AcademyStudentDetail } from "@/modules/api/academy"

/** Resolved copy for the student CRM block. */
export type AcademyStudentCrmLabels = {
    readonly section: string
    readonly empty: string
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
}

/** Atoms the pure student CRM draws; the connected half owns the student requests. */
export type AcademyStudentCrmData = {
    readonly students: ReadonlyArray<AcademyStudent>
    readonly detailState: "idle" | "resting" | "failed" | "answered"
    readonly detail?: AcademyStudentDetail
    readonly detailNotice?: ReactNode
    readonly notice?: ReactNode
    readonly pendingAction?: string
    readonly actionMessage?: string
    readonly labels: AcademyStudentCrmLabels
}

/** Actions the pure student CRM emits; every argument is an atom. */
export type AcademyStudentCrmActions = {
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

/** Pure state for the student list, selected detail and targeted actions. */
export type AcademyStudentCrmViewProps = {
    readonly state: "resting" | "empty" | "failed" | "answered"
    readonly props: AcademyStudentCrmData
    readonly on: AcademyStudentCrmActions
}

/** Public data and action contract consumed by the pure student CRM block. */
export type AcademyStudentCrmProps = AcademyStudentCrmViewProps
