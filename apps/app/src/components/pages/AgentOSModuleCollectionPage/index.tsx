"use client";

import { AgentOSModuleCollectionPageBase } from "./component";
import { projectAgentOSShellView, type AgentOSShellView, type AgentOSShellViewLabels } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter/component";
import { useAgentOSShell, useQueryMyAgentosModuleInstallationsSwr, useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
type AgentOSModuleCollectionPageProps = {
  readonly workspaceId: string;
};

/** Connect module-management copy, the connected shell and route navigation for one workspace. */
export const AgentOSModuleCollectionPage = (props: AgentOSModuleCollectionPageProps) => {
  const {
    workspaceId
  }: AgentOSModuleCollectionPageProps = props;
  const t = useTranslations("console.agentos.modules.page");
  const s = useTranslations("console.agentos.shell");
  const format = useFormatter();
  const locale = useLocale();
  const router = useRouter();
  // The connected shell reads one exact selection; the console aggregate names the instance and the
  // installation inventory names the siblings, so the page opens no path the shell does not own.
  const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId);
  const installations = useQueryMyAgentosModuleInstallationsSwr(workspaceId);
  const instanceId = controlCenter.data?.ok === true ? controlCenter.data.data.runtime?.instanceId ?? controlCenter.data.data.instance?.id ?? null : null;
  const installationIds = installations.data?.ok === true ? installations.data.data.map(installation => installation.id) : [];
  const shell = useAgentOSShell({ workspaceId, instanceId: instanceId ?? "", installationIds });
  /** Retry exactly the facets that did not answer with a current observation. */
  const retryShell = useCallback(() => {
    const limited = shell.sources.filter(source => source.state !== "available" || source.freshness === "stale");
    if (limited.length === 0) {
      shell.readSelection();
      return;
    }
    for (const source of limited)
      shell.retrySource(source.identity);
  }, [shell]);
  const shellLabels: AgentOSShellViewLabels = {
    headingFallback: s("headingFallback"),
    eyebrow: s("eyebrow"),
    description: s("description"),
    signInRequired: s("signInRequired"),
    signInAction: s("signInAction"),
    accessDenied: s("accessDenied"),
    accessUnverified: s("accessUnverified"),
    retry: s("retry"),
    loading: s("loading"),
    sourceTime: s("sourceTime"),
    identityInstance: s("identityInstance"),
    inventorySection: s("inventory.section"),
    inventoryEmpty: s("inventory.empty"),
    inventoryEmptyDescription: s("inventory.emptyDescription"),
    inventoryLimitPartial: s("inventory.limitPartial"),
    inventoryLimitStale: s("inventory.limitStale"),
    inventoryLimitUnavailable: s("inventory.limitUnavailable"),
    inventoryLimitUnsupported: s("inventory.limitUnsupported"),
    inventoryLimitRefused: s("inventory.limitRefused"),
    inventoryLimitLoading: s("inventory.limitLoading"),
    lastKnown: s("lastKnown"),
    retrying: s("retrying"),
    runtimeSection: s("runtime.section"),
    runtimeProvisioned: s("runtime.provisioned"),
    runtimeNotProvisioned: s("runtime.notProvisioned"),
    runtimeUnavailable: s("runtime.unavailable"),
    runtimeUnknown: s("runtime.unknown"),
    configurationSection: s("configuration.section"),
    configurationCurrent: s("configuration.current"),
    configurationAbsent: s("configuration.absent"),
    configurationUnsupported: s("configuration.unsupported"),
    attentionSection: s("attention.section"),
    attentionUnsupported: s("attention.unsupported"),
    resultSection: s("result.section"),
    resultUnavailable: s("result.unavailable"),
    installEntry: s("installEntry")
  };
  const shellView: AgentOSShellView = projectAgentOSShellView(shell, shellLabels);
  return <AgentOSModuleCollectionPageBase workspaceId={workspaceId} shell={shellView} shellLabels={shellLabels} labels={{
    path: t("path"),
    workspace: t("workspace"),
    title: t("title"),
    description: t("description"),
    eyebrow: t("eyebrow"),
    create: t("create")
  }} formatDate={value => format.dateTime(new Date(value), {
    dateStyle: "medium",
    timeStyle: "short"
  })} createHref={`/${locale}/agentos/workspaces/${workspaceId}/modules/create`} onBack={() => router.push(`/agentos/workspaces/${workspaceId}`)} onRetryShell={retryShell} shellRetrying={shellView.state === "retrying"}/>;
};