import { type Outcome } from "@nivo/api"
import {
    BeginAcademyZaloAuthorizationDocument,
    CreateAcademyWebhookDocument,
    DisableAcademyWebhookDocument,
    DisconnectAcademyGoogleOAuthDocument,
    RotateAcademyWebhookSecretDocument,
    SaveAcademyAnalyticsDocument,
    SaveAcademyCredentialDocument,
    SaveAcademyGoogleOAuthDocument,
    SetAcademyCustomDomainDocument,
} from "../__generated__/core"
import type {
    AcademyCredentialSaveResultType,
    AcademyCustomDomainStateType,
    AcademyProviderStatusType,
    AcademyWebhookSecretResultType,
    AcademyWebhookStatusType,
    BeginAcademyZaloAuthorizationInput,
    BeginAcademyZaloAuthorizationResult,
    CreateAcademyWebhookInput,
    DisableAcademyWebhookInput,
    DisconnectAcademyGoogleOAuthRequest,
    RotateAcademyWebhookSecretInput,
    SaveAcademyAnalyticsInput,
    SaveAcademyCredentialInput,
    SaveAcademyGoogleOAuthInput,
    SetAcademyCustomDomainInput,
} from "../__generated__/core"
import { graphql } from "../graphql"
import {
    parseAcademyCredentialSaveResult,
    parseAcademyCustomDomainState,
    parseAcademyProviderStatus,
    parseAcademyWebhookSecretResult,
    parseAcademyWebhookStatus,
    parseAcademyZaloAuthorization,
} from "./payload.guards"

/** Store one Academy credential and return delivery status, never its value. */
export const saveAcademyCredential = (
    input: SaveAcademyCredentialInput,
): Promise<Outcome<AcademyCredentialSaveResultType>> =>
    graphql(
        SaveAcademyCredentialDocument,
        parseAcademyCredentialSaveResult,
        { input },
    )

/** Store or clear one Academy custom domain. */
export const setAcademyCustomDomain = (
    input: SetAcademyCustomDomainInput,
): Promise<Outcome<AcademyCustomDomainStateType>> =>
    graphql(
        SetAcademyCustomDomainDocument,
        parseAcademyCustomDomainState,
        { input },
    )

/** Save write-only Google OAuth credentials. */
export const saveAcademyGoogleOAuth = (
    input: SaveAcademyGoogleOAuthInput,
): Promise<Outcome<AcademyProviderStatusType>> =>
    graphql(
        SaveAcademyGoogleOAuthDocument,
        parseAcademyProviderStatus,
        { input },
    )

/** Disconnect the Academy Google login provider. */
export const disconnectAcademyGoogleOAuth = (
    siteId: string,
): Promise<Outcome<AcademyProviderStatusType>> =>
    graphql(
        DisconnectAcademyGoogleOAuthDocument,
        parseAcademyProviderStatus,
        { request: { siteId } satisfies DisconnectAcademyGoogleOAuthRequest },
    )

/** Begin a short-lived Zalo OA authorization flow. */
export const beginAcademyZaloAuthorization = (
    siteId: string,
): Promise<Outcome<BeginAcademyZaloAuthorizationResult>> =>
    graphql(
        BeginAcademyZaloAuthorizationDocument,
        parseAcademyZaloAuthorization,
        { input: { siteId } satisfies BeginAcademyZaloAuthorizationInput },
    )

/** Save one analytics identifier and consent mode. */
export const saveAcademyAnalytics = (
    input: SaveAcademyAnalyticsInput,
): Promise<Outcome<AcademyProviderStatusType>> =>
    graphql(
        SaveAcademyAnalyticsDocument,
        parseAcademyProviderStatus,
        { input },
    )

/** Create a signed Academy webhook and reveal its signing secret once. */
export const createAcademyWebhook = (
    input: CreateAcademyWebhookInput,
): Promise<Outcome<AcademyWebhookSecretResultType>> =>
    graphql(
        CreateAcademyWebhookDocument,
        parseAcademyWebhookSecretResult,
        { input },
    )

/** Rotate a webhook secret with optimistic version fencing. */
export const rotateAcademyWebhookSecret = (
    input: RotateAcademyWebhookSecretInput,
): Promise<Outcome<AcademyWebhookSecretResultType>> =>
    graphql(
        RotateAcademyWebhookSecretDocument,
        parseAcademyWebhookSecretResult,
        { input },
    )

/** Disable one Academy webhook. */
export const disableAcademyWebhook = (
    siteId: string,
    webhookId: string,
): Promise<Outcome<AcademyWebhookStatusType>> =>
    graphql(
        DisableAcademyWebhookDocument,
        parseAcademyWebhookStatus,
        { input: { siteId, webhookId } satisfies DisableAcademyWebhookInput },
    )
