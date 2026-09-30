/**
 * The custom-module studio: intake, attachments and their byte uploads, integration secrets and publication.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one), returns an `Outcome` and
 * never throws. Runtime guards validate each generated operation result before it reaches a caller.
 */

import { send, parseBooleanAnswer, type Outcome } from "@nivo/api"
import { CORE_API_ORIGIN } from "@/modules/config"
import { graphql } from "./graphql"
import { parseModuleStudio, parseModuleUploadCapability } from "./agentos-module-studio.guards"
import {
    AnswerAgentosCustomModuleIntakeDocument,
    FinalizeAgentosModuleAttachmentDocument,
    MyAgentosCustomModuleStudioDocument,
    PrepareAgentosModuleAttachmentUploadDocument,
    PublishAgentosCustomModuleDocument,
    RemoveAgentosModuleAttachmentDocument,
    RemoveAgentosModuleIntegrationSecretDocument,
    SaveAgentosModuleIntegrationSecretDocument,
    StartAgentosCustomModuleIntakeDocument,
} from "./__generated__/core"
import type {
    AnswerAgentosCustomModuleIntakeMutationVariables,
    FinalizeAgentosModuleAttachmentMutationVariables,
    MyAgentosCustomModuleStudioQuery,
    PrepareAgentosModuleAttachmentUploadMutation,
    PrepareAgentosModuleAttachmentUploadMutationVariables,
    PublishAgentosCustomModuleMutationVariables,
    RemoveAgentosModuleAttachmentMutationVariables,
    RemoveAgentosModuleIntegrationSecretMutationVariables,
    SaveAgentosModuleIntegrationSecretMutationVariables,
    StartAgentosCustomModuleIntakeMutationVariables,
} from "./__generated__/core"

/** A byte upload may legitimately outlast an ordinary call. */
const UPLOAD_TIMEOUT_MS = 120_000

/** Resume the durable module studio for one owner-scoped module. */
export const myAgentosCustomModuleStudio = (
    agentWorkspaceId: string,
    moduleId: string,
): Promise<Outcome<NonNullable<MyAgentosCustomModuleStudioQuery["myAgentosCustomModuleStudio"]["data"]>>> =>
    graphql(
        MyAgentosCustomModuleStudioDocument,
        parseModuleStudio,
        { request: { agentWorkspaceId, moduleId } },
    )

/** Create the durable draft only after its first meaningful goal is submitted. */
export const startAgentosCustomModuleIntake = (input: StartAgentosCustomModuleIntakeMutationVariables["input"]) =>
    graphql(StartAgentosCustomModuleIntakeDocument, parseModuleStudio, { input })

/** Persist one accepted answer before asking the backend for the next unresolved question. */
export const answerAgentosCustomModuleIntake = (input: AnswerAgentosCustomModuleIntakeMutationVariables["input"]) =>
    graphql(AnswerAgentosCustomModuleIntakeDocument, parseModuleStudio, { input })

/** Resolve a backend-issued relative capability without exposing internal object-storage hosts. */
export const resolveCoreApiCapabilityUrl = (capabilityUrl: string): string => {
    return new URL(capabilityUrl, `${CORE_API_ORIGIN}/`).toString()
}

/** Register one quarantined file identity and return its bounded byte-transfer capability. */
export const prepareAgentosModuleAttachmentUpload = (
    input: PrepareAgentosModuleAttachmentUploadMutationVariables["input"],
): Promise<Outcome<NonNullable<PrepareAgentosModuleAttachmentUploadMutation["prepareAgentosModuleAttachmentUpload"]["data"]>>> =>
    graphql(PrepareAgentosModuleAttachmentUploadDocument, parseModuleUploadCapability, { input })

/** Transfer bytes through one backend-issued upload capability; UI never owns raw transport. */
export const uploadAgentosModuleAttachment = async (
    capability: Pick<
        NonNullable<PrepareAgentosModuleAttachmentUploadMutation["prepareAgentosModuleAttachmentUpload"]["data"]>,
        "uploadUrl" | "uploadMethod"
    >,
    mediaType: string,
    body: Blob,
): Promise<Outcome<boolean>> => {
    const sent = await send({
        url: resolveCoreApiCapabilityUrl(capability.uploadUrl),
        method: capability.uploadMethod,
        // The capability URL is signed and short-lived; it is the credential, so no cookie or token rides along.
        credentials: "omit",
        contentType: mediaType,
        body,
        reply: "none",
        timeoutMs: UPLOAD_TIMEOUT_MS,
    })
    return sent.ok ? { ok: true, data: true } : sent
}

/** Mark the prepared attachment ready for external scanner processing. */
export const finalizeAgentosModuleAttachment = (
    input: FinalizeAgentosModuleAttachmentMutationVariables["input"],
) => graphql(FinalizeAgentosModuleAttachmentDocument, parseModuleStudio, { input })

/** Replace one write-only integration secret and receive only masked configuration status. */
export const saveAgentosModuleIntegrationSecret = (
    input: SaveAgentosModuleIntegrationSecretMutationVariables["input"],
) => graphql(SaveAgentosModuleIntegrationSecretDocument, parseModuleStudio, { input })

/** Publish only the exact specification version the owner acknowledged. */
export const publishAgentosCustomModule = (input: PublishAgentosCustomModuleMutationVariables["input"]) =>
    graphql(PublishAgentosCustomModuleDocument, parseModuleStudio, { input })

/** Remove one owner-scoped attachment from the current module draft. */
export const removeAgentosModuleAttachment = (
    input: RemoveAgentosModuleAttachmentMutationVariables["input"],
): Promise<Outcome<boolean>> => graphql(RemoveAgentosModuleAttachmentDocument, parseBooleanAnswer, { input })

/** Remove one configured provider without ever reading its encrypted secret back. */
export const removeAgentosModuleIntegrationSecret = (
    input: RemoveAgentosModuleIntegrationSecretMutationVariables["input"],
): Promise<Outcome<boolean>> =>
    graphql(RemoveAgentosModuleIntegrationSecretDocument, parseBooleanAnswer, { input })
