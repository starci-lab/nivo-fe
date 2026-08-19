"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
    createAcademyStudent,
    grantAcademyCourseAccess,
    myAcademyStudentDetail,
    myAcademyStudents,
    revokeAcademyCourseAccess,
    setAcademyStudentStatus,
    type AcademyStudent,
    type AcademyStudentDetail,
} from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { _AcademyStudentCrm } from "./component"

/** Owner-scoped identity consumed by the student CRM. */
export type AcademyStudentCrmProps = { readonly siteId: string }

/**
 * Which situation the student list is in.
 *
 * `undefined` is "not asked yet" and `null` is "asked and refused" -- two different sentences on
 * screen, which is why the request state is not collapsed into an empty array.
 *
 * @param students - The loaded students, `null` when the request refused, `undefined` before it ran.
 * @returns The state the list surface draws.
 */
const listStateOf = (students: ReadonlyArray<AcademyStudent> | null | undefined) => {
    if (students === undefined) {
        return "resting" as const
    }
    if (students === null) {
        return "refused" as const
    }
    return students.length === 0 ? "empty" as const : "answered" as const
}

/**
 * Which situation the student detail panel is in.
 *
 * An in-flight request outranks whatever the panel last held, so reopening a student does not show
 * the previous one's detail while the new one loads.
 *
 * @param detailLoading - Whether a detail request is in flight.
 * @param detail - The loaded detail, `null` when refused, `undefined` before any student was opened.
 * @returns The state the detail surface draws.
 */
const detailStateOf = (detailLoading: boolean, detail: AcademyStudentDetail | null | undefined) => {
    if (detailLoading) {
        return "resting" as const
    }
    if (detail === undefined) {
        return "idle" as const
    }
    return detail === null ? "refused" as const : "answered" as const
}

/** Own student requests and targeted action state. */
export const AcademyStudentCrm = ({ siteId }: AcademyStudentCrmProps) => {
    const t = useTranslations("console.academyControlCenter.students")
    const session = useSession()
    const [students, setStudents] = useState<ReadonlyArray<AcademyStudent> | null | undefined>(undefined)
    const [detail, setDetail] = useState<AcademyStudentDetail | null | undefined>(undefined)
    const [detailLoading, setDetailLoading] = useState(false)
    const [pendingAction, setPendingAction] = useState<string>()
    const [actionMessage, setActionMessage] = useState<string>()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [courseSlug, setCourseSlug] = useState("")

    const load = useCallback(async () => {
        const result = await myAcademyStudents({ siteId })
        setStudents(result.ok ? result.data.items : null)
    }, [siteId])
    useEffect(() => {
        if (session.state.status === "signed-in") void load()
    }, [load, session.state.status])

    const run = async (kind: string, operation: () => Promise<{ readonly ok: boolean }>) => {
        setPendingAction(kind)
        setActionMessage(undefined)
        const result = await operation()
        setActionMessage(result.ok ? t("saved") : t("actionFailed"))
        setPendingAction(undefined)
        if (result.ok) await load()
    }
    const openStudent = async (memberId: string) => {
        setDetailLoading(true)
        const result = await myAcademyStudentDetail(siteId, memberId)
        setDetail(result.ok ? result.data : null)
        setDetailLoading(false)
    }
    return (
        <_AcademyStudentCrm
            state={listStateOf(students)}
            students={students ?? []}
            detailState={detailStateOf(detailLoading, detail)}
            detail={detail ?? undefined}
            pendingAction={pendingAction}
            actionMessage={actionMessage}
            labels={{
                section: t("section"), empty: t("empty"), refused: t("refused"), open: t("open"), active: t("active"), banned: t("banned"),
                detail: t("detail"), create: t("create"), name: t("name"), email: t("email"), password: t("password"), saveStudent: t("saveStudent"),
                courseSlug: t("courseSlug"), grant: t("grant"), revoke: t("revoke"), ban: t("ban"), activate: t("activate"), loadingDetail: t("loadingDetail"), actionFailed: t("actionFailed"),
            }}
            on={{
                openStudent,
                changeName: setName,
                changeEmail: setEmail,
                changePassword: setPassword,
                createStudent: () => void run("create", () => createAcademyStudent({ siteId, name, email, ...(password === "" ? {} : { password }) })),
                changeCourseSlug: setCourseSlug,
                setStatus: (status) => detail === null || detail === undefined ? undefined : void run("status", () => setAcademyStudentStatus({ siteId, memberId: detail.member.id, status })),
                grantAccess: () => detail === null || detail === undefined ? undefined : void run("grant", () => grantAcademyCourseAccess({ siteId, email: detail.member.email, courseSlug })),
                revokeAccess: () => detail === null || detail === undefined ? undefined : void run("revoke", () => revokeAcademyCourseAccess({ siteId, email: detail.member.email, courseSlug })),
            }}
        />
    )
}

/** Source-level tier marker for the connected Academy student CRM block. */
export const meta = { shape: "block", world: "connected" } as const
