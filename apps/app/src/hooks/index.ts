/**
 * The one door a component uses to reach data.
 *
 * A component imports `@/hooks`, never `@/hooks/swr/...`: `@/hooks/swr` is the
 * internal transport folder, and this file is its only public face. Every line
 * below names one hook, so a reader can see the whole surface without opening a
 * second file and a spec can mock the door in one `vi.mock("@/hooks", ...)`.
 * Hooks only: cache keys, request modules, response types and the helpers that
 * read a transport answer stay behind their own paths — `nivoQueryData` and
 * `NivoQueryAnswer` live in `@/modules/query`.
 */
export { useNivoQuery } from "./swr/use-nivo-query"
export { useNivoMutation } from "./swr/use-nivo-mutation"

export { useQueryCatalogItemsSwr } from "./swr/queries/console"
export { useQueryMyAcademyGrowthSnapshotSwr } from "./swr/queries/console"
export { useQueryMyAcademyIntegrationsSwr } from "./swr/queries/console"
export { useQueryMyAcademyStudentDetailSwr } from "./swr/queries/console"
export { useQueryMyAcademyStudentsSwr } from "./swr/queries/console"
export { useQueryMyAgentWorkspaceControlCenterSwr } from "./swr/queries/console"
export { useQueryMyAgentWorkspacesSwr } from "./swr/queries/console"
export { useQueryMyAgentosAiKnowledgeReadinessSwr } from "./swr/queries/console"
export { useQueryMyAgentosCustomModuleStudioSwr } from "./swr/queries/console"
export { useQueryMyAgentosCustomModulesSwr } from "./swr/queries/console"
export { useQueryMyAgentosModuleInstallationSwr } from "./swr/queries/console"
export { useQueryMyAgentosModuleInstallationsSwr } from "./swr/queries/console"
export { useQueryMyAgentosModuleRuntimeSwr } from "./swr/queries/console"
export { useQueryMyAgentosModuleTestRunSwr } from "./swr/queries/console"
export { useQueryMyAgentosModuleTestSurfaceSwr } from "./swr/queries/console"
export { useQueryMyAgentosSolutionModulesSwr } from "./swr/queries/console"
export { useQueryMyCatalogOrdersSwr } from "./swr/queries/console"
export { useQueryMyDomainsSwr } from "./swr/queries/console"
export { useQueryMyExpertSiteDeploymentSwr } from "./swr/queries/console"
export { useQueryMyExpertSiteLeadsSwr } from "./swr/queries/console"
export { useQueryMyExpertSitesSwr } from "./swr/queries/console"
export { useQueryMyInstancesSwr } from "./swr/queries/console"
export { useQueryMyInvoicesSwr } from "./swr/queries/console"
export { useQueryMyPodOpenclawStatusSwr } from "./swr/queries/console"
export { useQueryMyWalletSwr } from "./swr/queries/console"
export { useQueryMyWalletTransactionsSwr } from "./swr/queries/console"
export { useReadMyAgentosModuleTestRun } from "./swr/queries/console"

export { useQuerySupportCustomerConversationsSwr } from "./swr/queries/workspace-controlplane"
export { useQuerySupportCustomerMessagesSwr } from "./swr/queries/workspace-controlplane"
export { useQuerySupportImportantFactsSwr } from "./swr/queries/workspace-controlplane"
export { useQuerySupportTicketsSwr } from "./swr/queries/workspace-controlplane"

export { useMutateAcademyIntegrationSwr } from "./swr/mutations/academy"
export { useMutateCreateAcademyStudentSwr } from "./swr/mutations/academy"
export { useMutateDraftLeadReplySwr } from "./swr/mutations/academy"
export { useMutateGrantAcademyCourseAccessSwr } from "./swr/mutations/academy"
export { useMutateRevokeAcademyCourseAccessSwr } from "./swr/mutations/academy"
export { useMutateSetAcademyStudentStatusSwr } from "./swr/mutations/academy"
export { useMutateUpdateExpertSiteLeadSwr } from "./swr/mutations/academy"

export { useMutateForgotPasswordInitSwr } from "./swr/mutations/auth"
export { useMutateForgotPasswordResendSwr } from "./swr/mutations/auth"
export { useMutateForgotPasswordVerifyOtpSwr } from "./swr/mutations/auth"
export { useMutateSignInSwr } from "./swr/mutations/auth"
export { useMutateSignUpInitSwr } from "./swr/mutations/auth"
export { useMutateSignUpResendSwr } from "./swr/mutations/auth"
export { useMutateSignUpVerifyOtpSwr } from "./swr/mutations/auth"
export { useOauthReturnExchange } from "./swr/mutations/auth"

export { useMutateCreateWalletTopUpPayLinkSwr } from "./swr/mutations/commerce"
export { useMutatePayInvoiceSwr } from "./swr/mutations/commerce"

export { useMutateAgentosModuleAttachmentUploadSwr } from "./swr/mutations/console"
export { useMutateAnswerAgentosCustomModuleIntakeSwr } from "./swr/mutations/console"
export { useMutateConfigureAgentWorkspaceChannelSwr } from "./swr/mutations/console"
export { useMutateCreateAndPublishExpertSiteSwr } from "./swr/mutations/console"
export { useMutateFinalizeAgentosModuleAttachmentSwr } from "./swr/mutations/console"
export { useMutateInstallAgentosSolutionModuleSwr } from "./swr/mutations/console"
export { useMutateIssueAgentWorkspaceAppLaunchSwr } from "./swr/mutations/console"
export { useMutateManageAgentosModuleRuntimeSwr } from "./swr/mutations/console"
export { useMutateOrderAgentosSwr } from "./swr/mutations/console"
export { useMutatePublishAgentosCustomModuleSwr } from "./swr/mutations/console"
export { useMutateReindexAgentWorkspaceKnowledgeSwr } from "./swr/mutations/console"
export { useMutateRemoveAgentosModuleAttachmentSwr } from "./swr/mutations/console"
export { useMutateRemoveAgentosModuleIntegrationSecretSwr } from "./swr/mutations/console"
export { useMutateRenewAgentWorkspaceAppLaunchSwr } from "./swr/mutations/console"
export { useMutateRevokeAgentWorkspaceAppLaunchSwr } from "./swr/mutations/console"
export { useMutateRunAgentosAiReadinessTestSwr } from "./swr/mutations/console"
export { useMutateRunAgentosModuleTestSwr } from "./swr/mutations/console"
export { useMutateSaveAgentosModuleIntegrationSecretSwr } from "./swr/mutations/console"
export { useMutateStartAgentosCustomModuleIntakeSwr } from "./swr/mutations/console"

export { useMutateApproveSupportReplySwr } from "./swr/mutations/workspace-controlplane"
export { useMutateReconcileSupportDeliverySwr } from "./swr/mutations/workspace-controlplane"
export { useMutateSetSupportTakeoverSwr } from "./swr/mutations/workspace-controlplane"
