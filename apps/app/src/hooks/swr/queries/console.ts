"use client";

import { useCallback } from "react";
import { catalogItems, myAcademyGrowthSnapshot, myAcademyIntegrations, myAcademyStudentDetail, myAcademyStudents, myAgentosAiKnowledgeReadiness, myAgentosCustomModuleStudio, myAgentosCustomModules, myAgentosModuleInstallation, myAgentosModuleInstallations, myAgentosModuleRuntime, myAgentosModuleTestRun, myAgentosModuleTestSurface, myAgentosSolutionModules, myAgentWorkspace, myAgentWorkspaceControlCenter, myCatalogOrders, myDomains, myExpertSiteDeployment, myExpertSiteLeads, myExpertSites, myInstances, myInvoices, myPodOpenclawStatus, myWallet, myWalletTransactions, type CatalogCategory } from "@/modules/api/console";
import { useNivoQuery } from "../use-nivo-query";

/** Stable resource keys shared by reads and the commands that invalidate them. */
export const agentWorkspacesQueryKey = ["agent-workspaces"] as const;
/** Cache identity for the signed-in viewer's durable catalog orders. */
export const catalogOrdersQueryKey = ["catalog-orders"] as const;
/** Cache identity for the signed-in viewer's invoice ledger. */
export const invoicesQueryKey = ["invoices"] as const;
/** Cache identity for the signed-in viewer's expert sites. */
export const expertSitesQueryKey = ["expert-sites"] as const;
/** Cache identity for one AgentOS workspace control-center projection. */
export const agentWorkspaceControlCenterQueryKey = (workspaceId: string) => ["agentos", "workspace-control-center", workspaceId] as const;
/** Cache identity for all module installations owned by one workspace. */
export const agentosModuleInstallationsQueryKey = (workspaceId: string) => ["agentos", "module-installations", workspaceId] as const;
/** Cache identity for the custom modules visible in one workspace. */
export const agentosCustomModulesQueryKey = (workspaceId: string) => ["agentos", "custom-modules", workspaceId] as const;
/** Cache identity for one custom module Studio projection. */
export const agentosModuleStudioQueryKey = (workspaceId: string, moduleId: string) => ["agentos", "module-studio", workspaceId, moduleId] as const;
/** Cache identity for one workspace-private AI knowledge projection. */
export const agentosAiKnowledgeQueryKey = (workspaceId: string) => ["agentos", "ai-knowledge", workspaceId] as const;
/** Cache identity for one expert-site deployment projection. */
export const expertSiteDeploymentQueryKey = (siteId: string) => ["expert-site-deployment", siteId] as const;

/** Account-level console reads. Each key names the resource, not the component displaying it. */
/** Read the signed-in owner's expert sites. */
export const useQueryMyExpertSitesSwr = () => useNivoQuery(expertSitesQueryKey, myExpertSites);
/** Read the signed-in owner's AgentOS workspaces when the consumer needs them. */
export const useQueryMyAgentWorkspacesSwr = (enabled = true) => useNivoQuery(enabled ? agentWorkspacesQueryKey : null, myAgentWorkspace);
/** Read infrastructure instances owned by the signed-in viewer. */
export const useQueryMyInstancesSwr = () => useNivoQuery(["instances"], myInstances);
/** Read domains owned by the signed-in viewer. */
export const useQueryMyDomainsSwr = () => useNivoQuery(["domains"], myDomains);
/** Read the signed-in viewer's wallet projection. */
export const useQueryMyWalletSwr = () => useNivoQuery(["wallet"], myWallet);
/** Read the signed-in viewer's wallet ledger. */
export const useQueryMyWalletTransactionsSwr = () => useNivoQuery(["wallet-transactions"], myWalletTransactions);
/** Read the signed-in viewer's invoices when the consumer needs settlement data. */
export const useQueryMyInvoicesSwr = (enabled = true) => useNivoQuery(enabled ? invoicesQueryKey : null, myInvoices);
/** Read the signed-in viewer's catalog orders when the consumer needs fulfillment data. */
export const useQueryMyCatalogOrdersSwr = (enabled = true) => useNivoQuery(enabled ? catalogOrdersQueryKey : null, myCatalogOrders);
/** Read one public catalog category behind a viewer-scoped cache key. */
export const useQueryCatalogItemsSwr = (category: CatalogCategory, enabled = true) => useNivoQuery(enabled ? ["catalog-items", category] : null, () => catalogItems(category));
/** Read the owner's OpenClaw pod status. */
export const useQueryMyPodOpenclawStatusSwr = () => useNivoQuery(["pod-openclaw-status"], myPodOpenclawStatus);

/** AgentOS workspace and module reads. */
export const useQueryMyAgentWorkspaceControlCenterSwr = (workspaceId: string, enabled = true) => useNivoQuery(enabled ? agentWorkspaceControlCenterQueryKey(workspaceId) : null, () => myAgentWorkspaceControlCenter(workspaceId));
/** Read the module-kind registry offered to the current viewer. */
export const useQueryMyAgentosSolutionModulesSwr = () => useNivoQuery(["agentos", "solution-modules"], myAgentosSolutionModules);
/** Read all module installations in one workspace. */
export const useQueryMyAgentosModuleInstallationsSwr = (workspaceId: string) => useNivoQuery(agentosModuleInstallationsQueryKey(workspaceId), () => myAgentosModuleInstallations(workspaceId));
/** Read one module installation while retaining its workspace identity in the cache key. */
export const useQueryMyAgentosModuleInstallationSwr = (workspaceId: string, installationId: string) => useNivoQuery(["agentos", "module-installation", workspaceId, installationId], () => myAgentosModuleInstallation(installationId));
/** Read the operational runtime projection for one module installation. */
export const useQueryMyAgentosModuleRuntimeSwr = (workspaceId: string, installationId: string, includeDiagnostics: boolean) => useNivoQuery(["agentos", "module-runtime", workspaceId, installationId, includeDiagnostics], () => myAgentosModuleRuntime(installationId, includeDiagnostics));
/** Read the immutable test surface for one module installation. */
export const useQueryMyAgentosModuleTestSurfaceSwr = (installationId: string, enabled = true) => useNivoQuery(enabled ? ["agentos", "module-test-surface", installationId] : null, () => myAgentosModuleTestSurface(installationId));
/** Read one durable module test run only after its identity exists. */
export const useQueryMyAgentosModuleTestRunSwr = (installationId: string, runId?: string) => useNivoQuery(runId === undefined ? null : ["agentos", "module-test-run", installationId, runId], () => myAgentosModuleTestRun(installationId, runId ?? ""));
/** Read one exact durable test run imperatively while a bounded poll is active. */
export const useReadMyAgentosModuleTestRun = (installationId: string) => useCallback((runId: string) => myAgentosModuleTestRun(installationId, runId), [installationId]);
/** Read custom modules visible in one AgentOS workspace. */
export const useQueryMyAgentosCustomModulesSwr = (workspaceId: string) => useNivoQuery(agentosCustomModulesQueryKey(workspaceId), () => myAgentosCustomModules(workspaceId));
/** Read the Studio projection for one custom module. */
export const useQueryMyAgentosCustomModuleStudioSwr = (workspaceId: string, moduleId: string) => useNivoQuery(agentosModuleStudioQueryKey(workspaceId, moduleId), () => myAgentosCustomModuleStudio(workspaceId, moduleId));
/** Read and, while an operation is active, poll workspace AI-knowledge readiness. */
export const useQueryMyAgentosAiKnowledgeReadinessSwr = (workspaceId?: string, operationInFlight = false) => useNivoQuery(workspaceId === undefined ? null : agentosAiKnowledgeQueryKey(workspaceId), () => myAgentosAiKnowledgeReadiness(workspaceId ?? ""), {
  refreshInterval: latest => operationInFlight || latest?.ok === true && latest.data.readinessStatus === "testing" ? 2_000 : 0
});

/** Provisioning and Academy reads. */
/** Read one expert-site deployment and optionally poll its durable projection. */
export const useQueryMyExpertSiteDeploymentSwr = (siteId?: string, polling = false) => useNivoQuery(siteId === undefined ? null : expertSiteDeploymentQueryKey(siteId), () => myExpertSiteDeployment(siteId ?? ""), {
  refreshInterval: polling ? 4_000 : 0
});
/** Read the Academy growth projection for one site. */
export const useQueryMyAcademyGrowthSnapshotSwr = (siteId: string) => useNivoQuery(["academy", "growth", siteId], () => myAcademyGrowthSnapshot(siteId));
/** Read the Academy student collection for one site. */
export const useQueryMyAcademyStudentsSwr = (siteId: string) => useNivoQuery(["academy", "students", siteId], () => myAcademyStudents({
  siteId
}));
/** Read one Academy student projection after a member is selected. */
export const useQueryMyAcademyStudentDetailSwr = (siteId: string, memberId?: string) => useNivoQuery(memberId === undefined ? null : ["academy", "student", siteId, memberId], () => myAcademyStudentDetail(siteId, memberId ?? ""));
/** Read configured Academy integrations for one site. */
export const useQueryMyAcademyIntegrationsSwr = (siteId: string) => useNivoQuery(["academy", "integrations", siteId], () => myAcademyIntegrations(siteId));
/** Read captured leads for one expert site. */
export const useQueryMyExpertSiteLeadsSwr = (siteId: string) => useNivoQuery(["academy", "leads", siteId], () => myExpertSiteLeads(siteId));
