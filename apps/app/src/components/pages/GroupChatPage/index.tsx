"use client";

import { useTranslations } from "next-intl";
import { GroupChatPageBase } from "./component";

/** This page has no route-controlled presentation state. */
export type GroupChatPageProps = Record<string, never>;

/** Connect localized copy to the contract-gated group-chat surface. */
export const GroupChatPage = (props: GroupChatPageProps) => {
  void props;
  const t = useTranslations("console.groupChat");
  return <GroupChatPageBase labels={{
    title: t("title"),
    description: t("description"),
    groups: t("groups"),
    groupsEmpty: t("groupsEmpty"),
    conversation: t("conversation"),
    unavailable: t("unavailable"),
    unavailableHint: t("unavailableHint"),
    composer: t("composer"),
    composerPlaceholder: t("composerPlaceholder"),
    members: t("members"),
    membersEmpty: t("membersEmpty"),
    openMembers: t("openMembers"),
    closeMembers: t("closeMembers")
  }} />;
};
