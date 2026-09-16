"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GroupChatPageBase } from "./component";

/** This page has no route-controlled inputs. */
export type GroupChatPageProps = Record<string, never>;

/** Connect localized copy and transient rail state to the group-chat surface. */
export const GroupChatPage = (props: GroupChatPageProps) => {
  void props;
  const t = useTranslations("console.groupChat");
  const [isRailOpen, setRailOpen] = useState(false);
  return <GroupChatPageBase isRailOpen={isRailOpen} on={{ changeRailOpen: setRailOpen }} labels={{
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
