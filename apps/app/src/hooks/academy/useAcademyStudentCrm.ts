import { createElement } from "react"
import { useTranslations } from "next-intl"
import { useMutateCreateAcademyStudentSwr } from "../swr/mutations/useMutateCreateAcademyStudentSwr"
import { useMutateGrantAcademyCourseAccessSwr } from "../swr/mutations/useMutateGrantAcademyCourseAccessSwr"
import {
    useMutateRevokeAcademyCourseAccessSwr,
} from "../swr/mutations/useMutateRevokeAcademyCourseAccessSwr"
import { useMutateSetAcademyStudentStatusSwr } from "../swr/mutations/useMutateSetAcademyStudentStatusSwr"
import { useQueryMyAcademyStudentDetailSwr } from "../swr/queries/useQueryMyAcademyStudentDetailSwr"
import { useQueryMyAcademyStudentsSwr } from "../swr/queries/useQueryMyAcademyStudentsSwr"
import { nivoQueryReading } from "../../modules/query"
import { QueryNotice } from "../../components/blocks/query/QueryNotice"
import type { AcademyStudentCrmViewProps } from "../../modules/academy/student-crm"
import { academyStudentDetailStateOf, academyStudentListStateOf } from "../../modules/academy/student-crm-state"
import { useAcademyStudentCrmInteraction } from "./useAcademyStudentCrmInteraction"

/** Own the student CRM's requests and targeted actions. */
export const useAcademyStudentCrm = (siteId: string): AcademyStudentCrmViewProps => {
    const t = useTranslations("console.academyControlCenter.students")
    const interaction = useAcademyStudentCrmInteraction()
    const studentsQuery = useQueryMyAcademyStudentsSwr(siteId)
    const studentsReading = nivoQueryReading(studentsQuery.data)
    const students = studentsReading.status === "ready" ? studentsReading.data.items : undefined
    const { selectedMemberId, pendingAction, actionMessage, name, email, password, courseSlug } = interaction.state
    const detailQuery = useQueryMyAcademyStudentDetailSwr(siteId, selectedMemberId)
    const createMutation = useMutateCreateAcademyStudentSwr(siteId)
    const statusMutation = useMutateSetAcademyStudentStatusSwr(siteId, selectedMemberId)
    const grantMutation = useMutateGrantAcademyCourseAccessSwr(siteId, selectedMemberId)
    const revokeMutation = useMutateRevokeAcademyCourseAccessSwr(siteId, selectedMemberId)
    const detailReading = selectedMemberId === undefined ? undefined : nivoQueryReading(detailQuery.data)
    const detail = detailReading?.status === "ready" ? detailReading.data : undefined
    const detailLoading = selectedMemberId !== undefined && detailQuery.isLoading
    const run = async (kind: string, operation: () => Promise<{ readonly ok: boolean }>) => {
        interaction.startAction(kind)
        const result = await operation()
        interaction.finishAction(result.ok ? t("saved") : t("actionFailed"))
    }
    return {
        state: academyStudentListStateOf(studentsReading, students?.length ?? 0),
        props: {
            students: students ?? [],
            detailState: academyStudentDetailStateOf(detailLoading, detailReading),
            detail,
            detailNotice:
                detailReading?.status === "failed" ? (
                    createElement(QueryNotice, {
                        props: { failure: detailReading },
                        on: { retry: () => void detailQuery.mutate() },
                    })
                ) : undefined,
            notice:
                studentsReading.status === "failed" ? (
                    createElement(QueryNotice, {
                        props: { failure: studentsReading },
                        on: { retry: () => void studentsQuery.mutate() },
                    })
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
            openStudent: interaction.openStudent,
            changeName: interaction.changeName,
            changeEmail: interaction.changeEmail,
            changePassword: interaction.changePassword,
            createStudent: () =>
                void run("create", () =>
                    createMutation.trigger({ siteId, name, email, ...(password === "" ? {} : { password }) }),
                ),
            changeCourseSlug: interaction.changeCourseSlug,
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
