"use client"

import {
    answerAgentosCustomModuleIntake,
    finalizeAgentosModuleAttachment,
    prepareAgentosModuleAttachmentUpload,
    publishAgentosCustomModule,
    removeAgentosModuleIntegrationSecret,
    removeAgentosModuleAttachment,
    saveAgentosModuleIntegrationSecret,
    startAgentosCustomModuleIntake,
    uploadAgentosModuleAttachment,
} from "@/modules/api/agentos-module-studio"
import {
    configureAgentWorkspaceChannel,
    manageAgentosModuleRuntime,
    type ConfigureAgentWorkspaceChannelInput,
    type ManageAgentosModuleRuntimeInput,
} from "@/modules/api/agentos-module-runtime"
import { createExpertSite, publishExpertSite } from "@/modules/api/expert-sites"
import { installAgentosSolutionModule } from "@/modules/api/agentos-modules"
import {
    issueAgentWorkspaceAppLaunch,
    renewAgentWorkspaceAppLaunch,
    revokeAgentWorkspaceAppLaunch,
    type RenewedAgentWorkspaceAppLaunch,
} from "@/modules/api/agentos-workspaces"
import { orderAgentOs } from "@/modules/api/commerce"
import { reindexAgentWorkspaceKnowledge, runAgentosAiReadinessTest } from "@/modules/api/agentos-knowledge"
import { runAgentosModuleTest, type RunAgentosModuleTestInput } from "@/modules/api/agentos-module-tests"
import { refreshSession } from "@/modules/api/auth"
import { failed, type Outcome } from "@/modules/api/outcome"
import { useSession } from "../../auth/useSession"
import { useNivoMutation } from "../useNivoMutation"
import {
    MUTATION_AGENTOS_AI_KNOWLEDGE_REINDEX_SWR_KEY,
    MUTATION_AGENTOS_AI_READINESS_TEST_SWR_KEY,
    MUTATION_AGENTOS_CATALOG_ORDER_SWR_KEY,
    MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY,
    MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY,
    MUTATION_AGENTOS_CUSTOM_MODULE_PUBLISH_SWR_KEY,
    MUTATION_AGENTOS_MODULE_ATTACHMENT_FINALIZE_SWR_KEY,
    MUTATION_AGENTOS_MODULE_ATTACHMENT_REMOVE_SWR_KEY,
    MUTATION_AGENTOS_MODULE_ATTACHMENT_UPLOAD_SWR_KEY,
    MUTATION_AGENTOS_MODULE_INTEGRATION_REMOVE_SWR_KEY,
    MUTATION_AGENTOS_MODULE_INTEGRATION_SAVE_SWR_KEY,
    MUTATION_AGENTOS_MODULE_RUNTIME_SWR_KEY,
    MUTATION_AGENTOS_MODULE_TEST_SWR_KEY,
    MUTATION_AGENTOS_SOLUTION_MODULE_INSTALL_SWR_KEY,
    MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_ISSUE_SWR_KEY,
    MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_RENEW_SWR_KEY,
    MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_REVOKE_SWR_KEY,
    MUTATION_AGENTOS_WORKSPACE_CHANNEL_SWR_KEY,
    MUTATION_EXPERT_SITE_CREATE_PUBLISH_SWR_KEY,
    QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY,
    QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY,
    QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY,
    QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY,
    QUERY_AGENT_WORKSPACES_SWR_KEY,
    QUERY_CATALOG_ORDERS_SWR_KEY,
    QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY,
    QUERY_EXPERT_SITES_SWR_KEY,
    QUERY_INVOICES_SWR_KEY,
} from "../swr.shared"
type AgentosModuleAttachmentUploadCommand = {
    readonly file: File
    readonly mediaType: string
}
type StartAgentosCustomModuleIntakeCommand = {
    readonly goal: string
    readonly idempotencyKey: string
}
type AnswerAgentosCustomModuleIntakeCommand = {
    readonly answer: string
}
type SaveAgentosModuleIntegrationSecretCommand = {
    readonly providerKey: string
    readonly secret: string
}
type PublishAgentosCustomModuleCommand = {
    readonly acknowledgedVersion: number
    readonly idempotencyKey: string
}
type InstallAgentosSolutionModuleCommand = {
    readonly moduleKey: string
    readonly idempotencyKey: string
}
type OrderAgentosCommand = {
    readonly catalogItemSlug: string
    readonly catalogTierId?: string
}
type AcceptedAnswer = {
    readonly ok: boolean
}
const accepted = (answer: AcceptedAnswer) => answer.ok

/** Create one durable custom-module intake. */
export const useMutateStartAgentosCustomModuleIntakeSwr = (workspaceId: string) =>
    useNivoMutation(MUTATION_AGENTOS_CUSTOM_MODULE_INTAKE_SWR_KEY(workspaceId), (input: StartAgentosCustomModuleIntakeCommand) =>
        startAgentosCustomModuleIntake({
            agentWorkspaceId: workspaceId,
            ...input,
        }),
    )

/** Append one intake answer and refresh the exact Studio projection. */
export const useMutateAnswerAgentosCustomModuleIntakeSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_CUSTOM_MODULE_ANSWER_SWR_KEY(workspaceId, moduleId),
        (input: AnswerAgentosCustomModuleIntakeCommand) =>
            answerAgentosCustomModuleIntake({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

/** Replace one write-only module integration secret and refresh only its masked projection. */
export const useMutateSaveAgentosModuleIntegrationSecretSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_INTEGRATION_SAVE_SWR_KEY(workspaceId, moduleId),
        (input: SaveAgentosModuleIntegrationSecretCommand) =>
            saveAgentosModuleIntegrationSecret({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

/** Remove one module integration secret and refresh only its masked projection. */
export const useMutateRemoveAgentosModuleIntegrationSecretSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_INTEGRATION_REMOVE_SWR_KEY(workspaceId, moduleId),
        (providerKey: string) =>
            removeAgentosModuleIntegrationSecret({
                agentWorkspaceId: workspaceId,
                moduleId,
                providerKey,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

/** Publish one acknowledged custom-module specification and refresh its workspace projections. */
export const useMutatePublishAgentosCustomModuleSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_CUSTOM_MODULE_PUBLISH_SWR_KEY(workspaceId, moduleId),
        (input: PublishAgentosCustomModuleCommand) =>
            publishAgentosCustomModule({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
            }),
        {
            invalidates: [
                QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId),
                QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY(workspaceId),
            ],
            shouldInvalidate: accepted,
        },
    )

/** Install one registry module and refresh the workspace installation/control-center projections. */
export const useMutateInstallAgentosSolutionModuleSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_SOLUTION_MODULE_INSTALL_SWR_KEY(workspaceId),
        (input: InstallAgentosSolutionModuleCommand) =>
            installAgentosSolutionModule({
                agentWorkspaceId: workspaceId,
                ...input,
            }),
        {
            invalidates: [
                QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY(workspaceId),
                QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY(workspaceId),
            ],
            shouldInvalidate: accepted,
        },
    )

/** Issue one short-lived workspace application launch grant. */
export const useMutateIssueAgentWorkspaceAppLaunchSwr = (workspaceId: string) =>
    useNivoMutation(MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_ISSUE_SWR_KEY(workspaceId), () =>
        issueAgentWorkspaceAppLaunch(workspaceId),
    )

/** Revoke one exact workspace application launch grant. */
export const useMutateRevokeAgentWorkspaceAppLaunchSwr = (workspaceId: string) =>
    useNivoMutation(MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_REVOKE_SWR_KEY(workspaceId), (launchId: string) =>
        revokeAgentWorkspaceAppLaunch(launchId),
    )

/** Refresh the Nivo session and renew one exact workspace launch without exposing transport to UI. */
export const useMutateRenewAgentWorkspaceAppLaunchSwr = (workspaceId: string) => {
    const session = useSession()
    return useNivoMutation(
        MUTATION_AGENTOS_WORKSPACE_APP_LAUNCH_RENEW_SWR_KEY(workspaceId),
        async (launchId: string): Promise<Outcome<RenewedAgentWorkspaceAppLaunch>> => {
            const refreshed = await refreshSession()
            if (!refreshed.ok) return refreshed
            if (refreshed.data.accessToken === null || refreshed.data.requiresTwoFactor) {
                return failed("refused", { code: "AUTH_REQUIRED", reason: "session renewal requires authentication" })
            }
            session.adopt(refreshed.data)
            return renewAgentWorkspaceAppLaunch(launchId)
        },
    )
}

/** Create the AgentOS catalog order and refresh every owner-scoped settlement projection. */
export const useMutateOrderAgentosSwr = () =>
    useNivoMutation(
        MUTATION_AGENTOS_CATALOG_ORDER_SWR_KEY,
        ({ catalogItemSlug, catalogTierId }: OrderAgentosCommand) => orderAgentOs(catalogItemSlug, catalogTierId),
        {
            invalidates: [QUERY_CATALOG_ORDERS_SWR_KEY, QUERY_INVOICES_SWR_KEY, QUERY_AGENT_WORKSPACES_SWR_KEY],
            shouldInvalidate: accepted,
        },
    )

/** Create and publish one expert site as a single UI command with one invalidation boundary. */
export const useMutateCreateAndPublishExpertSiteSwr = () =>
    useNivoMutation(
        MUTATION_EXPERT_SITE_CREATE_PUBLISH_SWR_KEY,
        async (slug: string) => {
            const created = await createExpertSite(slug)
            if (!created.ok) return created
            const published = await publishExpertSite(created.data.id)
            if (!published.ok) return published
            return {
                ok: true as const,
                data: {
                    ...published.data,
                    id: created.data.id,
                },
            }
        },
        {
            invalidates: (_slug, answer) =>
                answer.ok ? [QUERY_EXPERT_SITES_SWR_KEY, QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY(answer.data.id)] : [],
            shouldInvalidate: accepted,
        },
    )

/** Execute one command against a module installation without sharing press state with neighbours. */
export const useMutateManageAgentosModuleRuntimeSwr = (installationId: string) =>
    useNivoMutation(MUTATION_AGENTOS_MODULE_RUNTIME_SWR_KEY(installationId), (input: ManageAgentosModuleRuntimeInput) =>
        manageAgentosModuleRuntime(input),
    )

/** Start one immutable module test run for the exact installation under test. */
export const useMutateRunAgentosModuleTestSwr = (installationId: string) =>
    useNivoMutation(MUTATION_AGENTOS_MODULE_TEST_SWR_KEY(installationId), (input: RunAgentosModuleTestInput) =>
        runAgentosModuleTest(input),
    )

/** Apply one channel credential set to the exact AgentOS workspace. */
export const useMutateConfigureAgentWorkspaceChannelSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_WORKSPACE_CHANNEL_SWR_KEY(workspaceId),
        (input: ConfigureAgentWorkspaceChannelInput) => configureAgentWorkspaceChannel(input),
        {
            // Channel configuration is rendered by the workspace control center as well as by
            // module settings. Keep both surfaces coherent for every consumer of this mutation;
            // callers may still apply an immediate response when they need optimistic UX.
            invalidates: [QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY(workspaceId)],
            shouldInvalidate: accepted,
        },
    )

/** Execute the three-step capability upload without exposing transport sequencing to a component. */
export const useMutateAgentosModuleAttachmentUploadSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_ATTACHMENT_UPLOAD_SWR_KEY(workspaceId, moduleId),
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
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

/** Retry ingestion for one quarantined module attachment. */
export const useMutateFinalizeAgentosModuleAttachmentSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_ATTACHMENT_FINALIZE_SWR_KEY(workspaceId, moduleId),
        (attachmentId: string) =>
            finalizeAgentosModuleAttachment({
                agentWorkspaceId: workspaceId,
                moduleId,
                attachmentId,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

/** Remove one module attachment through its exact workspace and module identity. */
export const useMutateRemoveAgentosModuleAttachmentSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_ATTACHMENT_REMOVE_SWR_KEY(workspaceId, moduleId),
        (attachmentId: string) =>
            removeAgentosModuleAttachment({
                agentWorkspaceId: workspaceId,
                moduleId,
                attachmentId,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

/** Start a bounded provider, vector-store and retrieval readiness test. */
export const useMutateRunAgentosAiReadinessTestSwr = (workspaceId?: string) =>
    useNivoMutation(
        workspaceId === undefined ? null : MUTATION_AGENTOS_AI_READINESS_TEST_SWR_KEY(workspaceId),
        (idempotencyKey: string) =>
            runAgentosAiReadinessTest({
                workspaceId: workspaceId ?? "",
                idempotencyKey,
            }),
        {
            invalidates: workspaceId === undefined ? [] : [QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY(workspaceId)],
            shouldInvalidate: accepted,
        },
    )

/** Start rebuilding the workspace-private knowledge index. */
export const useMutateReindexAgentWorkspaceKnowledgeSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_AI_KNOWLEDGE_REINDEX_SWR_KEY(workspaceId),
        (idempotencyKey: string) =>
            reindexAgentWorkspaceKnowledge({
                workspaceId,
                idempotencyKey,
            }),
        {
            invalidates: [QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY(workspaceId)],
            shouldInvalidate: accepted,
        },
    )
