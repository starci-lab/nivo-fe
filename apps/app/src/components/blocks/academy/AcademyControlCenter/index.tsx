"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { nivoQueryData, useQueryMyExpertSitesSwr } from "@/hooks";
import { ACADEMY_HOST_SUFFIX } from "@/modules/config";
import { AcademyControlCenterBase, type AcademyControlCenterMode } from "./component";

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterProps = {
  readonly siteId: string;
  readonly mode: AcademyControlCenterMode;
  readonly onSelectMode: (mode: AcademyControlCenterMode) => void;
};

/** Resolve ownership and page identity; each block resolves its own domain state. */
export const AcademyControlCenter = (props: AcademyControlCenterProps) => {
  const {
    siteId,
    mode,
    onSelectMode
  }: AcademyControlCenterProps = props;
  const t = useTranslations("console.academyControlCenter");
  const [mounted, setMounted] = useState(false);
  const answer = useQueryMyExpertSitesSwr();
  const sites = nivoQueryData(answer.data);
  const site = sites === null || sites === undefined ? sites : sites.find(item => item.id === siteId) ?? null;
  useEffect(() => {
    setMounted(true);
  }, []);
  const publicHost = site === null || site === undefined ? undefined : site.customDomain ?? `${site.slug}${ACADEMY_HOST_SUFFIX}`;
  if (!mounted) return null;
  const settledState = site === null ? "refused" : "ready";
  return <AcademyControlCenterBase state={site === undefined ? "restoring" : settledState} title={site?.slug ?? t("title")} siteId={siteId} publicHost={publicHost} mode={mode} labels={{
    loading: t("loading"),
    refused: t("refused"),
    openSite: t("openSite"),
    tabsLabel: t("tabsLabel"),
    tabs: (["growth", "system"] as const).map(id => ({
      id,
      label: t(`tabs.${id}`)
    }))
  }} onSelectMode={onSelectMode} onOpenPublicSite={() => {
    if (publicHost !== undefined) window.open(`https://${publicHost}`, "_blank", "noopener,noreferrer");
  }} />;
};
