"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AgentOSPageBase, type AgentOSPageProps } from "./component";

/** Resolve page copy and route navigation while child blocks own every request. */
export const AgentOSPage = (props: AgentOSPageProps) => {
  const t = useTranslations("console");
  const router = useRouter();
  return <AgentOSPageBase {...props} labels={{
    path: t("navigationLabel"),
    agentos: t("agentos.title"),
    dashboardDescription: t("agentos.description"),
    createTitle: t("agentos.createTitle"),
    createDescription: t("agentos.createDescription"),
    orderTitle: t("agentos.orderTitle"),
    orderDescription: t("agentos.orderDescription"),
    createAction: t("agentos.create"),
    dashboardEyebrow: t("agentos.dashboardEyebrow"),
    createEyebrow: t("agentos.createEyebrow"),
    orderEyebrow: t("agentos.orderEyebrow")
  }} onOpenDashboard={() => router.push("/agentos")} onCreate={() => router.push("/agentos/create")} />;
};
