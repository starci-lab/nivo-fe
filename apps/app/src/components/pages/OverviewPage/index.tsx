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
  const openWorkspacePurchase = () => router.push("/agentos/workspaces/new");
  return <OverviewDataProvider content={OverviewPageBase} contentProps={{
    title: t("overview.title"),
    lede: t("overview.lede"),
    pathLabel: t("breadcrumbLabel"),
    consoleLabel: t("title"),
    // The one next step on this page is the same Mua workspace purchase action the AgentOS
    // primary button opens, so it carries that action's label key. The prop keeps its former
    // name because page-twins.spec.tsx constructs OverviewPageProps outside this slice.
    buildAppLabel: t("agentos.purchase"),
    atAGlanceLabel: t("overview.atAGlance"),
    servicesLabel: t("servicesCaption"),
    accountLabel: t("accountCaption"),
    onBuildApp: openWorkspacePurchase
  }} />;
};

/** Registry identity for the connected operations overview page. */
