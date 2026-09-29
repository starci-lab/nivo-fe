import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    useMutateCreateAcademyStudentSwr,
    useMutateGrantAcademyCourseAccessSwr,
    useMutateRevokeAcademyCourseAccessSwr,
    useMutateSetAcademyStudentStatusSwr,
    useQueryMyAcademyStudentDetailSwr,
    useQueryMyAcademyStudentsSwr,
} from ".."
import { nivoQueryReading } from "../../modules/query"
import { QueryNotice } from "../../components/blocks/query/QueryNotice"
import type { AcademyStudentCrmViewProps } from "../../modules/academy/student-crm"
import { academyStudentDetailStateOf, academyStudentListStateOf } from "../../modules/academy/student-crm-state"

/** Own the student CRM's requests and targeted actions. */
export const useAcademyStudentCrm = (siteId: string): AcademyStudentCrmViewProps => {
    const t = useTranslations("console.academyControlCenter.students")
    const studentsQuery = useQueryMyAcademyStudentsSwr(siteId)
    const studentsReading = nivoQueryReading(studentsQuery.data)
    const students = studentsReading.status === "ready" ? studentsReading.data.items : undefined
    const [selectedMemberId, setSelectedMemberId] = useState<string>()
    const detailQuery = useQueryMyAcademyStudentDetailSwr(siteId, selectedMemberId)
    const createMutation = useMutateCreateAcademyStudentSwr(siteId)
    const statusMutation = useMutateSetAcademyStudentStatusSwr(siteId, selectedMemberId)
    const grantMutation = useMutateGrantAcademyCourseAccessSwr(siteId, selectedMemberId)
    const revokeMutation = useMutateRevokeAcademyCourseAccessSwr(siteId, selectedMemberId)
    const detailReading = selectedMemberId === undefined ? undefined : nivoQueryReading(detailQuery.data)
    const detail = detailReading?.status === "ready" ? detailReading.data : undefined
    const detailLoading = selectedMemberId !== undefined && detailQuery.isLoading
    const [pendingAction, setPendingAction] = useState<string>()
    const [actionMessage, setActionMessage] = useState<string>()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [courseSlug, setCourseSlug] = useState("")
    const run = async (kind: string, operation: () => Promise<{ readonly ok: boolean }>) => {
        setPendingAction(kind)
        setActionMessage(undefined)
        const result = await operation()
        setActionMessage(result.ok ? t("saved") : t("actionFailed"))
        setPendingAction(undefined)
    }
    return {
        state: academyStudentListStateOf(studentsReading, students?.length ?? 0),
        props: {
            students: students ?? [],
            detailState: academyStudentDetailStateOf(detailLoading, detailReading),
            detail,
            detailNotice:
                detailReading?.status === "failed" ? (
                    <QueryNotice props={{ failure: detailReading }} on={{ retry: () => void detailQuery.mutate() }} />
                ) : undefined,
            notice:
                studentsReading.status === "failed" ? (
                    <QueryNotice props={{ failure: studentsReading }} on={{ retry: () => void studentsQuery.mutate() }} />
                ) : undefined,
            pendingAction,
            actionMessage,
            labels: {
                section: t("section"),
                empty: t("empty"),
                open: t("open"),
                active: t("active"),
                banned: t("banned"),
                detail: t("detail"),
                create: t("create"),
                name: t("name"),
                email: t("email"),
                password: t("password"),
                saveStudent: t("saveStudent"),
                courseSlug: t("courseSlug"),
                grant: t("grant"),
                revoke: t("revoke"),
                ban: t("ban"),
                activate: t("activate"),
                loadingDetail: t("loadingDetail"),
            },
        },
        on: {
            openStudent: setSelectedMemberId,
            changeName: setName,
            changeEmail: setEmail,
            changePassword: setPassword,
            createStudent: () =>
                void run("create", () =>
                    createMutation.trigger({ siteId, name, email, ...(password === "" ? {} : { password }) }),
                ),
            changeCourseSlug: setCourseSlug,
            setStatus: (status) =>
                detail === undefined
                    ? undefined
                    : void run("status", () => statusMutation.trigger({ siteId, memberId: detail.member.id, status })),
            grantAccess: () =>
                detail === undefined
                    ? undefined
                    : void run("grant", () => grantMutation.trigger({ siteId, email: detail.member.email, courseSlug })),
            revokeAccess: () =>
                detail === undefined
                    ? undefined
                    : void run("revoke", () => revokeMutation.trigger({ siteId, email: detail.member.email, courseSlug })),
        },
    }
}
