"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { nivoQueryData, useMutateCreateAcademyStudentSwr, useMutateGrantAcademyCourseAccessSwr, useMutateRevokeAcademyCourseAccessSwr, useMutateSetAcademyStudentStatusSwr, useQueryMyAcademyStudentDetailSwr, useQueryMyAcademyStudentsSwr } from "@/hooks";
import type { AcademyStudent, AcademyStudentDetail } from "@/modules/api/console";
import { AcademyStudentCrmBase } from "./component";

/** Owner-scoped identity consumed by the student CRM. */
export type AcademyStudentCrmProps = {
  readonly siteId: string;
};

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
    return "resting" as const;
  }
  if (students === null) {
    return "refused" as const;
  }
  return students.length === 0 ? "empty" as const : "answered" as const;
};

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
    return "resting" as const;
  }
  if (detail === undefined) {
    return "idle" as const;
  }
  return detail === null ? "refused" as const : "answered" as const;
};

/** Own student requests and targeted action state. */
export const AcademyStudentCrm = (props: AcademyStudentCrmProps) => {
  const {
    siteId
  }: AcademyStudentCrmProps = props;
  const t = useTranslations("console.academyControlCenter.students");
  const studentsQuery = useQueryMyAcademyStudentsSwr(siteId);
  const studentPage = nivoQueryData(studentsQuery.data);
  const students = studentPage === null || studentPage === undefined ? studentPage : studentPage.items;
  const [selectedMemberId, setSelectedMemberId] = useState<string>();
  const detailQuery = useQueryMyAcademyStudentDetailSwr(siteId, selectedMemberId);
  const createMutation = useMutateCreateAcademyStudentSwr(siteId);
  const statusMutation = useMutateSetAcademyStudentStatusSwr(siteId, selectedMemberId);
  const grantMutation = useMutateGrantAcademyCourseAccessSwr(siteId, selectedMemberId);
  const revokeMutation = useMutateRevokeAcademyCourseAccessSwr(siteId, selectedMemberId);
  const detail = selectedMemberId === undefined ? undefined : nivoQueryData(detailQuery.data);
  const detailLoading = selectedMemberId !== undefined && detailQuery.isLoading;
  const [pendingAction, setPendingAction] = useState<string>();
  const [actionMessage, setActionMessage] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const run = async (kind: string, operation: () => Promise<{
    readonly ok: boolean;
  }>) => {
    setPendingAction(kind);
    setActionMessage(undefined);
    const result = await operation();
    setActionMessage(result.ok ? t("saved") : t("actionFailed"));
    setPendingAction(undefined);
  };
  return <AcademyStudentCrmBase state={listStateOf(students)} students={students ?? []} detailState={detailStateOf(detailLoading, detail)} detail={detail ?? undefined} pendingAction={pendingAction} actionMessage={actionMessage} labels={{
    section: t("section"),
    empty: t("empty"),
    refused: t("refused"),
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
    actionFailed: t("actionFailed")
  }} on={{
    openStudent: memberId => {
      setSelectedMemberId(memberId);
    },
    changeName: setName,
    changeEmail: setEmail,
    changePassword: setPassword,
    createStudent: () => void run("create", () => createMutation.trigger({
      siteId,
      name,
      email,
      ...(password === "" ? {} : {
        password
      })
    })),
    changeCourseSlug: setCourseSlug,
    setStatus: status => detail === null || detail === undefined ? undefined : void run("status", () => statusMutation.trigger({
      siteId,
      memberId: detail.member.id,
      status
    })),
    grantAccess: () => detail === null || detail === undefined ? undefined : void run("grant", () => grantMutation.trigger({
      siteId,
      email: detail.member.email,
      courseSlug
    })),
    revokeAccess: () => detail === null || detail === undefined ? undefined : void run("revoke", () => revokeMutation.trigger({
      siteId,
      email: detail.member.email,
      courseSlug
    }))
  }} />;
};
