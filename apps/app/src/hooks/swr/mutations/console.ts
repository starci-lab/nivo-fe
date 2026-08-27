"use client"

import {
    answerAgentosCustomModuleIntake,
    configureAgentWorkspaceChannel,
    createExpertSite,
    finalizeAgentosModuleAttachment,
    installAgentosSolutionModule,
    issueAgentWorkspaceAppLaunch,
    manageAgentosModuleRuntime,
    orderAgentOs,
    prepareAgentosModuleAttachmentUpload,
    publishAgentosCustomModule,
    publishExpertSite,
    reindexAgentWorkspaceKnowledge,
    removeAgentosModuleIntegrationSecret,
    removeAgentosModuleAttachment,
    renewAgentWorkspaceAppLaunch,
    revokeAgentWorkspaceAppLaunch,
    runAgentosModuleTest,
    runAgentosAiReadinessTest,
    saveAgentosModuleIntegrationSecret,
    startAgentosCustomModuleIntake,
    uploadAgentosModuleAttachment,
    type ConfigureAgentWorkspaceChannelInput,
    type ManageAgentosModuleRuntimeInput,
    type RenewedAgentWorkspaceAppLaunch,
    type RunAgentosModuleTestInput,
} from "@/modules/api/console"
import { refreshSession } from "@/modules/api/auth"
import type { Result } from "@/modules/api/graphql"
import { useSession } from "@/modules/auth/session"
import { useNivoMutation } from "../use-nivo-mutation"
import {
    agentosAiKnowledgeQueryKey,
    agentosCustomModulesQueryKey,
    agentosModuleInstallationsQueryKey,
    agentosModuleStudioQueryKey,
    agentWorkspaceControlCenterQueryKey,
    agentWorkspacesQueryKey,
    catalogOrdersQueryKey,
    expertSiteDeploymentQueryKey,
    expertSitesQueryKey,
    invoicesQueryKey,
} from "../queries/console"

type AgentosModuleAttachmentUploadCommand = {
    readonly file: File
    readonly mediaType: string
}

type StartAgentosCustomModuleIntakeCommand = {
    readonly goal: string
    readonly idempotencyKey: string
}

type AnswerAgentosCustomModuleIntakeCommand = { readonly answer: string }
type SaveAgentosModuleIntegrationSecretCommand = { readonly providerKey: string, readonly secret: string }
type PublishAgentosCustomModuleCommand = { readonly acknowledgedVersion: number, readonly idempotencyKey: string }
type InstallAgentosSolutionModuleCommand = { readonly moduleKey: string, readonly idempotencyKey: string }

type OrderAgentosCommand = {
    readonly catalogItemSlug: string
    readonly catalogTierId?: string
}

type AcceptedAnswer = { readonly ok: boolean }

const accepted = (answer: AcceptedAnswer) => answer.ok

/** Create one durable custom-module intake and refresh its workspace collection. */
export const useMutateStartAgentosCustomModuleIntakeSwr = (workspaceId: string) => useNivoMutation(
    ["agentos", "custom-module-intake", workspaceId],
    (input: StartAgentosCustomModuleIntakeCommand) => startAgentosCustomModuleIntake({ agentWorkspaceId: workspaceId, ...input }),
    { invalidates: [agentosCustomModulesQueryKey(workspaceId)], shouldInvalidate: accepted },
)

/** Append one intake answer and refresh the exact Studio projection. */
export const useMutateAnswerAgentosCustomModuleIntakeSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "custom-module-answer", workspaceId, moduleId],
    (input: AnswerAgentosCustomModuleIntakeCommand) => answerAgentosCustomModuleIntake({ agentWorkspaceId: workspaceId, moduleId, ...input }),
    { invalidates: [agentosModuleStudioQueryKey(workspaceId, moduleId)], shouldInvalidate: accepted },
)

/** Replace one write-only module integration secret and refresh only its masked projection. */
export const useMutateSaveAgentosModuleIntegrationSecretSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "module-integration-save", workspaceId, moduleId],
    (input: SaveAgentosModuleIntegrationSecretCommand) => saveAgentosModuleIntegrationSecret({ agentWorkspaceId: workspaceId, moduleId, ...input }),
    { invalidates: [agentosModuleStudioQueryKey(workspaceId, moduleId)], shouldInvalidate: accepted },
)

/** Remove one module integration secret and refresh only its masked projection. */
export const useMutateRemoveAgentosModuleIntegrationSecretSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "module-integration-remove", workspaceId, moduleId],
    (providerKey: string) => removeAgentosModuleIntegrationSecret({ agentWorkspaceId: workspaceId, moduleId, providerKey }),
    { invalidates: [agentosModuleStudioQueryKey(workspaceId, moduleId)], shouldInvalidate: accepted },
)

/** Publish one acknowledged custom-module specification and refresh its workspace projections. */
export const useMutatePublishAgentosCustomModuleSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "custom-module-publish", workspaceId, moduleId],
    (input: PublishAgentosCustomModuleCommand) => publishAgentosCustomModule({ agentWorkspaceId: workspaceId, moduleId, ...input }),
    {
        invalidates: [
            agentosModuleStudioQueryKey(workspaceId, moduleId),
            agentosCustomModulesQueryKey(workspaceId),
            agentosModuleInstallationsQueryKey(workspaceId),
        ],
        shouldInvalidate: accepted,
    },
)

/** Install one registry module and refresh the workspace installation/control-center projections. */
export const useMutateInstallAgentosSolutionModuleSwr = (workspaceId: string) => useNivoMutation(
    ["agentos", "solution-module-install", workspaceId],
    (input: InstallAgentosSolutionModuleCommand) => installAgentosSolutionModule({ agentWorkspaceId: workspaceId, ...input }),
    {
        invalidates: [
            agentosModuleInstallationsQueryKey(workspaceId),
            agentWorkspaceControlCenterQueryKey(workspaceId),
        ],
        shouldInvalidate: accepted,
    },
)

/** Issue one short-lived workspace application launch grant. */
export const useMutateIssueAgentWorkspaceAppLaunchSwr = (workspaceId: string) => useNivoMutation(
    ["agentos", "workspace-app-launch-issue", workspaceId],
    () => issueAgentWorkspaceAppLaunch(workspaceId),
)

/** Revoke one exact workspace application launch grant. */
export const useMutateRevokeAgentWorkspaceAppLaunchSwr = (workspaceId: string) => useNivoMutation(
    ["agentos", "workspace-app-launch-revoke", workspaceId],
    (launchId: string) => revokeAgentWorkspaceAppLaunch(launchId),
)

/** Refresh the Nivo session and renew one exact workspace launch without exposing transport to UI. */
export const useMutateRenewAgentWorkspaceAppLaunchSwr = (workspaceId: string) => {
    const session = useSession()
    return useNivoMutation(
        ["agentos", "workspace-app-launch-renew", workspaceId],
        async (launchId: string): Promise<Result<RenewedAgentWorkspaceAppLaunch>> => {
            const refreshed = await refreshSession()
            if (!refreshed.ok) return refreshed
            if (refreshed.data.accessToken === null || refreshed.data.requiresTwoFactor) {
                return { ok: false, reason: "session renewal requires authentication", code: "AUTH_REQUIRED" }
            }
            session.adopt(refreshed.data)
            return renewAgentWorkspaceAppLaunch(launchId)
        },
    )
}

/** Create the AgentOS catalog order and refresh every owner-scoped settlement projection. */
export const useMutateOrderAgentosSwr = () => useNivoMutation(
    ["agentos", "catalog-order"],
    ({ catalogItemSlug, catalogTierId }: OrderAgentosCommand) => orderAgentOs(catalogItemSlug, catalogTierId),
    {
        invalidates: [catalogOrdersQueryKey, invoicesQueryKey, agentWorkspacesQueryKey],
        shouldInvalidate: accepted,
    },
)

/** Create and publish one expert site as a single UI command with one invalidation boundary. */
export const useMutateCreateAndPublishExpertSiteSwr = () => useNivoMutation(
    ["apps", "expert-site-create-publish"],
    async (slug: string) => {
        const created = await createExpertSite(slug)
        if (!created.ok) return created
        const published = await publishExpertSite(created.data.id)
        if (!published.ok) return published
        return { ok: true as const, data: { ...published.data, id: created.data.id } }
    },
    {
        invalidates: (_slug, answer) => answer.ok
            ? [expertSitesQueryKey, expertSiteDeploymentQueryKey(answer.data.id)]
            : [],
        shouldInvalidate: accepted,
    },
)

/** Execute one command against a module installation without sharing press state with neighbours. */
export const useMutateManageAgentosModuleRuntimeSwr = (installationId: string) => useNivoMutation(
    ["agentos", "module-runtime", installationId],
    (input: ManageAgentosModuleRuntimeInput) => manageAgentosModuleRuntime(input),
)

/** Start one immutable module test run for the exact installation under test. */
export const useMutateRunAgentosModuleTestSwr = (installationId: string) => useNivoMutation(
    ["agentos", "module-test", installationId],
    (input: RunAgentosModuleTestInput) => runAgentosModuleTest(input),
)

/** Apply one channel credential set to the exact AgentOS workspace. */
export const useMutateConfigureAgentWorkspaceChannelSwr = (workspaceId: string) => useNivoMutation(
    ["agentos", "workspace-channel", workspaceId],
    (input: ConfigureAgentWorkspaceChannelInput) => configureAgentWorkspaceChannel(input),
)

/** Execute the three-step capability upload without exposing transport sequencing to a component. */
export const useMutateAgentosModuleAttachmentUploadSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "module-attachment-upload", workspaceId, moduleId],
    async ({ file, mediaType }: AgentosModuleAttachmentUploadCommand) => {
        const prepared = await prepareAgentosModuleAttachmentUpload({
            agentWorkspaceId: workspaceId,
            moduleId,
            fileName: file.name,
            mediaType,
            sizeBytes: file.size,
        })
        if (!prepared.ok) return prepared
        const uploaded = await uploadAgentosModuleAttachment(prepared.data, mediaType, file)
        if (!uploaded.ok) return uploaded
        return finalizeAgentosModuleAttachment({
            agentWorkspaceId: workspaceId,
            moduleId,
            attachmentId: prepared.data.attachmentId,
        })
    },
    { invalidates: [agentosModuleStudioQueryKey(workspaceId, moduleId)], shouldInvalidate: accepted },
)

/** Retry ingestion for one quarantined module attachment. */
export const useMutateFinalizeAgentosModuleAttachmentSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "module-attachment-finalize", workspaceId, moduleId],
    (attachmentId: string) => finalizeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId }),
    { invalidates: [agentosModuleStudioQueryKey(workspaceId, moduleId)], shouldInvalidate: accepted },
)

/** Remove one module attachment through its exact workspace and module identity. */
export const useMutateRemoveAgentosModuleAttachmentSwr = (workspaceId: string, moduleId: string) => useNivoMutation(
    ["agentos", "module-attachment-remove", workspaceId, moduleId],
    (attachmentId: string) => removeAgentosModuleAttachment({ agentWorkspaceId: workspaceId, moduleId, attachmentId }),
    { invalidates: [agentosModuleStudioQueryKey(workspaceId, moduleId)], shouldInvalidate: accepted },
)

/** Start a bounded provider, vector-store and retrieval readiness test. */
export const useMutateRunAgentosAiReadinessTestSwr = (workspaceId?: string) => useNivoMutation(
    workspaceId === undefined ? null : ["agentos", "ai-readiness-test", workspaceId],
    (idempotencyKey: string) => runAgentosAiReadinessTest({ workspaceId: workspaceId ?? "", idempotencyKey }),
    { invalidates: workspaceId === undefined ? [] : [agentosAiKnowledgeQueryKey(workspaceId)], shouldInvalidate: accepted },
)

/** Start rebuilding the workspace-private knowledge index. */
export const useMutateReindexAgentWorkspaceKnowledgeSwr = (workspaceId: string) => useNivoMutation(
    ["agentos", "ai-knowledge-reindex", workspaceId],
    (idempotencyKey: string) => reindexAgentWorkspaceKnowledge({ workspaceId, idempotencyKey }),
    { invalidates: [agentosAiKnowledgeQueryKey(workspaceId)], shouldInvalidate: accepted },
)
