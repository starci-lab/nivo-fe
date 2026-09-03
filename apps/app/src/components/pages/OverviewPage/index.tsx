"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { OverviewDataProvider } from "@/modules/overview/context";
import { OverviewPageBase } from "./component";
/** Public API role for OverviewPageProps. */
export type OverviewPageProps = Record<string, never>;

/** Own the one settlement of every slice and hand the page its resolved copy. */
export const OverviewPage = (props: OverviewPageProps) => {
  void props;
  const t = useTranslations("console");
  const router = useRouter();
  const openApps = () => router.push("/apps");
  return <OverviewDataProvider content={OverviewPageBase} contentProps={{
    title: t("overview.title"),
    lede: t("overview.lede"),
    pathLabel: t("breadcrumbLabel"),
    consoleLabel: t("title"),
    buildAppLabel: t("overview.buildApp"),
    atAGlanceLabel: t("overview.atAGlance"),
    atAGlanceSummary: t("overview.atAGlanceSummary"),
    servicesLabel: t("servicesCaption"),
    accountLabel: t("accountCaption"),
    onBuildApp: openApps
  }} />;
};

/** Registry identity for the connected operations overview page. */
