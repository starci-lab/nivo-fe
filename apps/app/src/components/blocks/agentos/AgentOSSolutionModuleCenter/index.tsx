"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutateInstallAgentosSolutionModuleSwr, useQueryMyAgentosModuleInstallationsSwr, useQueryMyAgentosSolutionModulesSwr } from "@/hooks";
import type { AgentosSolutionModule } from "@/modules/api/console";
import { nivoQueryData } from "@/modules/api/graphql";
import { useSession } from "@/modules/auth/session";
import useProvisioningRealtime from "@/modules/realtime/provisioning";
import { AgentOSSolutionModuleCenterBase, type AgentOSSolutionModuleCard } from "./component";

/** Exact owner workspace scope consumed by the connected module center. */
export type AgentOSSolutionModuleCenterProps = {
  readonly workspaceId: string;
};
const toneOf = (status: string): "neutral" | "success" | "warning" | "danger" => {
  if (status === "ready") return "success";
  if (status === "failed") return "danger";
  if (status === "provisioning" || status === "degraded") return "warning";
  return "neutral";
};

/** Own catalog/list/install calls and follow one exact installation Saga at a time. */
export const AgentOSSolutionModuleCenter = (props: AgentOSSolutionModuleCenterProps) => {
  const {
    workspaceId
  }: AgentOSSolutionModuleCenterProps = props;
  const t = useTranslations("console.agentos.workspace.solutions");
  const locale = useLocale();
  const session = useSession();
  const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null;
  const [mode, setMode] = useState<"catalog" | "installed">("catalog");
  const catalogQuery = useQueryMyAgentosSolutionModulesSwr();
  const installationsQuery = useQueryMyAgentosModuleInstallationsSwr(workspaceId);
  const {
    trigger: installModule
  } = useMutateInstallAgentosSolutionModuleSwr(workspaceId);
  const refreshCatalog = catalogQuery.mutate;
  const refreshInstallations = installationsQuery.mutate;
  const catalog = nivoQueryData(catalogQuery.data);
  const installations = nivoQueryData(installationsQuery.data);
  const [pendingKey, setPendingKey] = useState<string>();
  const [trackedInstallationId, setTrackedInstallationId] = useState<string>();
  const [outcome, setOutcome] = useState<string>();
  const refresh = useCallback(async () => {
    await Promise.all([refreshCatalog(), refreshInstallations()]);
  }, [refreshCatalog, refreshInstallations]);
  const realtime = useProvisioningRealtime({
    accessToken,
    target: accessToken === null || trackedInstallationId === undefined ? null : {
      kind: "module-installation",
      id: trackedInstallationId
    }
  });
  useEffect(() => {
    if (realtime.status !== "event" && realtime.status !== "connected") return;
    if (realtime.status === "event" && realtime.event.kind !== "module-installation") return;
    void refresh();
  }, [realtime, refresh]);
  const catalogByKey = useMemo(() => new Map(catalog?.map(item => [item.key, item])), [catalog]);
  const install = useCallback(async (moduleKey: AgentosSolutionModule["key"]) => {
    setPendingKey(moduleKey);
    setOutcome(undefined);
    try {
      const result = await installModule({
        moduleKey,
        idempotencyKey: `nivo-fe:${crypto.randomUUID()}`
      });
      setPendingKey(undefined);
      if (!result.ok) {
        setOutcome(t("installFailed"));
        return;
      }
      setTrackedInstallationId(result.data.id);
      setOutcome(t("installAccepted"));
      setMode("installed");
    } catch {
      setPendingKey(undefined);
      setOutcome(t("installFailed"));
    }
  }, [installModule, t]);
  const catalogCards: ReadonlyArray<AgentOSSolutionModuleCard> = (catalog ?? []).map(module => {
    const installed = installations?.filter(item => item.moduleKey === module.key) ?? [];
    return {
      id: module.key,
      title: module.name,
      description: module.summary,
      statusLabel: installed.length === 0 ? t("status.available") : `${installed.length} installed`,
      statusTone: installed.length === 0 ? "neutral" : "success",
      detail: t("catalogDetail", {
        agents: module.agentRoles.length,
        channels: module.channelRoles.length,
        safety: module.safetyMode
      }),
      actionLabel: t("install")
    };
  });
  const installedCards: ReadonlyArray<AgentOSSolutionModuleCard> = (installations ?? []).map(installation => {
    const module = catalogByKey.get(installation.moduleKey as AgentosSolutionModule["key"]);
    return {
      id: installation.id,
      title: installation.displayName || module?.name || installation.moduleKey,
      description: module?.summary ?? t("installedDescription"),
      statusLabel: t(`status.${installation.status}`),
      statusTone: toneOf(installation.status),
      detail: installation.failureCode ?? t("version", {
        version: installation.moduleVersion
      }),
      actionLabel: t("viewDetails"),
      actionHref: `/${locale}/agentos/workspaces/${workspaceId}/modules/${installation.id}`
    };
  });
  const refused = catalog === null || installations === null;
  const settledState = refused ? "refused" : "answered";
  return <AgentOSSolutionModuleCenterBase state={catalog === undefined || installations === undefined ? "resting" : settledState} mode={mode} sectionLabel={mode === "catalog" ? t("catalogSection") : t("installedSection")} modesLabel={t("modesLabel")} modes={[{
    id: "catalog",
    label: t("modes.catalog")
  }, {
    id: "installed",
    label: t("modes.installed")
  }]} refusedLabel={t("refused")} emptyLabel={t("empty")} emptyActionLabel={t("browse")} cards={mode === "catalog" ? catalogCards : installedCards} pendingId={pendingKey} outcome={outcome} onSelectMode={setMode} onPressCard={id => {
    if (mode === "catalog") void install(id as AgentosSolutionModule["key"]);
  }} />;
};
