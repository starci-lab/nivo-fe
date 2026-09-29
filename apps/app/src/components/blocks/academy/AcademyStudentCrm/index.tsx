"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    useMutateCreateAcademyStudentSwr,
    useMutateGrantAcademyCourseAccessSwr,
    useMutateRevokeAcademyCourseAccessSwr,
    useMutateSetAcademyStudentStatusSwr,
    useQueryMyAcademyStudentDetailSwr,
    useQueryMyAcademyStudentsSwr,
} from "@/hooks"
import type { AcademyStudentDetail } from "@/modules/api/academy"
import { nivoQueryReading } from "@/modules/query"
import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import { AcademyStudentCrmBase } from "./component"

/** Owner-scoped identity consumed by the student CRM. */
export type AcademyStudentCrmProps = {
    readonly siteId: string
}

/**
 * Which situation the student list is in.
 *
 * "Not asked yet", "asked and failed" and "answered" are different sentences on screen, which is
 * why the request settlement is not collapsed into an empty array.
 */
const listStateOf = (
    reading: ReturnType<typeof nivoQueryReading<{ readonly items: ReadonlyArray<unknown> }>>,
    count: number,
) => {
    if (reading.status === "resting") {
        return "resting" as const
    }
    if (reading.status === "failed") {
        return "failed" as const
    }
    return count === 0 ? ("empty" as const) : ("answered" as const)
}

/**
 * Which situation the student detail panel is in.
 *
 * An in-flight request outranks whatever the panel last held, so reopening a student does not show
 * the previous one's detail while the new one loads.
 */
const detailStateOf = (
    detailLoading: boolean,
    reading: ReturnType<typeof nivoQueryReading<AcademyStudentDetail>> | undefined,
) => {
    if (detailLoading) {
        return "resting" as const
    }
    if (reading === undefined) {
        return "idle" as const
    }
    if (reading.status === "resting") {
        return "resting" as const
    }
    return reading.status === "failed" ? ("failed" as const) : ("answered" as const)
}

/** Own student requests and targeted action state. */
export const AcademyStudentCrm = (props: AcademyStudentCrmProps) => {
    const { siteId }: AcademyStudentCrmProps = props
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
    const run = async (
        kind: string,
        operation: () => Promise<{
            readonly ok: boolean
        }>,
    ) => {
        setPendingAction(kind)
        setActionMessage(undefined)
        const result = await operation()
        setActionMessage(result.ok ? t("saved") : t("actionFailed"))
        setPendingAction(undefined)
    }
    return (
        <AcademyStudentCrmBase
            state={listStateOf(studentsReading, students?.length ?? 0)}
            props={{
                students: students ?? [],
                detailState: detailStateOf(detailLoading, detailReading),
                detail,
                detailNotice:
                    detailReading?.status === "failed" ? (
                        <QueryNotice props={{ failure: detailReading }} on={{ retry: () => void detailQuery.mutate() }} />
                    ) : undefined,
                notice:
                    studentsReading.status === "failed" ? (
                        <QueryNotice
                            props={{ failure: studentsReading }}
                            on={{ retry: () => void studentsQuery.mutate() }}
                        />
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
            }}
            on={{
                openStudent: (memberId) => {
                    setSelectedMemberId(memberId)
                },
                changeName: setName,
                changeEmail: setEmail,
                changePassword: setPassword,
                createStudent: () =>
                    void run("create", () =>
                        createMutation.trigger({
                            siteId,
                            name,
                            email,
                            ...(password === ""
                                ? {}
                                : {
                                      password,
                                  }),
                        }),
                    ),
                changeCourseSlug: setCourseSlug,
                setStatus: (status) =>
                    detail === undefined
                        ? undefined
                        : void run("status", () =>
                              statusMutation.trigger({
                                  siteId,
                                  memberId: detail.member.id,
                                  status,
                              }),
                          ),
                grantAccess: () =>
                    detail === undefined
                        ? undefined
                        : void run("grant", () =>
                              grantMutation.trigger({
                                  siteId,
                                  email: detail.member.email,
                                  courseSlug,
                              }),
                          ),
                revokeAccess: () =>
                    detail === undefined
                        ? undefined
                        : void run("revoke", () =>
                              revokeMutation.trigger({
                                  siteId,
                                  email: detail.member.email,
                                  courseSlug,
                              }),
                          ),
            }}
        />
    )
}
