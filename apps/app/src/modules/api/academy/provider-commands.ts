import { graphql } from "../graphql"
import type { Outcome } from "../outcome"
import type { AcademyCustomDomainState } from "../../academy"
import {
    parseAcademyCredentialSaveResult,
    parseAcademyCustomDomainState,
    parseAcademyProviderStatus,
    parseAcademyWebhookSecretResult,
    parseAcademyWebhookStatus,
    parseAcademyZaloAuthorization,
} from "./payload.guards"
import type {
    AcademyCredentialSaveResult,
    AcademyProviderStatus,
    AcademyWebhookSecretResult,
    AcademyWebhookStatus,
    AcademyZaloAuthorization,
    CreateAcademyWebhookInput,
    RotateAcademyWebhookSecretInput,
    SaveAcademyAnalyticsInput,
    SaveAcademyCredentialInput,
    SaveAcademyGoogleOAuthInput,
    SetAcademyCustomDomainInput,
} from "./types"

/** Store one Academy credential and return delivery status, never its value. */
export const saveAcademyCredential = (
    input: SaveAcademyCredentialInput,
): Promise<Outcome<AcademyCredentialSaveResult>> =>
    graphql(
        `
            mutation SaveAcademyCredential($input: SaveAcademyCredentialInput!) {
                saveAcademyCredential(request: $input) {
                    data {
                        credential {
                            key
                            configured
                            hint
                            syncedAt
                            verification
                            verificationReason
                            verifiedAt
                        }
                        delivery
                        detail
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyCredentialSaveResult,
        {
            input,
        },
    )

/** Store or clear one Academy custom domain. */
export const setAcademyCustomDomain = (
    input: SetAcademyCustomDomainInput,
): Promise<Outcome<AcademyCustomDomainState>> =>
    graphql(
        `
            mutation SetAcademyCustomDomain($input: SetAcademyCustomDomainInput!) {
                setAcademyCustomDomain(request: $input) {
                    data {
                        domain
                        target
                        dnsReady
                        delivery
                        detail
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyCustomDomainState,
        {
            input,
        },
    )

/** Save write-only Google OAuth credentials. */
export const saveAcademyGoogleOAuth = (input: SaveAcademyGoogleOAuthInput): Promise<Outcome<AcademyProviderStatus>> =>
    graphql(
        `
            mutation SaveAcademyGoogleOAuth($input: SaveAcademyGoogleOAuthInput!) {
                saveAcademyGoogleOAuth(request: $input) {
                    data {
                        provider
                        status
                        clientId
                        identifier
                        consentMode
                        reason
                        deliveredAt
                        verifiedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyProviderStatus,
        {
            input,
        },
    )

/** Disconnect the Academy Google login provider. */
export const disconnectAcademyGoogleOAuth = (siteId: string): Promise<Outcome<AcademyProviderStatus>> =>
    graphql(
        `
            mutation DisconnectAcademyGoogleOAuth($request: DisconnectAcademyGoogleOAuthRequest!) {
                disconnectAcademyGoogleOAuth(request: $request) {
                    data {
                        provider
                        status
                        clientId
                        identifier
                        consentMode
                        reason
                        deliveredAt
                        verifiedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyProviderStatus,
        {
            request: { siteId },
        },
    )

/** Begin a short-lived Zalo OA authorization flow. */
export const beginAcademyZaloAuthorization = (siteId: string): Promise<Outcome<AcademyZaloAuthorization>> =>
    graphql(
        `
            mutation BeginAcademyZaloAuthorization($input: BeginAcademyZaloAuthorizationInput!) {
                beginAcademyZaloAuthorization(request: $input) {
                    data {
                        authorizationUrl
                        expiresAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyZaloAuthorization,
        {
            input: {
                siteId,
            },
        },
    )

/** Save one analytics identifier and consent mode. */
export const saveAcademyAnalytics = (input: SaveAcademyAnalyticsInput): Promise<Outcome<AcademyProviderStatus>> =>
    graphql(
        `
            mutation SaveAcademyAnalytics($input: SaveAcademyAnalyticsInput!) {
                saveAcademyAnalytics(request: $input) {
                    data {
                        provider
                        status
                        clientId
                        identifier
                        consentMode
                        reason
                        deliveredAt
                        verifiedAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyProviderStatus,
        {
            input,
        },
    )

/** Create a signed Academy webhook and reveal its signing secret once. */
export const createAcademyWebhook = (input: CreateAcademyWebhookInput): Promise<Outcome<AcademyWebhookSecretResult>> =>
    graphql(
        `
            mutation CreateAcademyWebhook($input: CreateAcademyWebhookInput!) {
                createAcademyWebhook(request: $input) {
                    data {
                        id
                        endpoint
                        events
                        enabled
                        version
                        lastDeliveryStatus
                        lastDeliveredAt
                        signingSecret
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyWebhookSecretResult,
        {
            input,
        },
    )

/** Rotate a webhook secret with optimistic version fencing. */
export const rotateAcademyWebhookSecret = (
    input: RotateAcademyWebhookSecretInput,
): Promise<Outcome<AcademyWebhookSecretResult>> =>
    graphql(
        `
            mutation RotateAcademyWebhookSecret($input: RotateAcademyWebhookSecretInput!) {
                rotateAcademyWebhookSecret(request: $input) {
                    data {
                        id
                        endpoint
                        events
                        enabled
                        version
                        lastDeliveryStatus
                        lastDeliveredAt
                        signingSecret
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyWebhookSecretResult,
        {
            input,
        },
    )

/** Disable one Academy webhook. */
export const disableAcademyWebhook = (siteId: string, webhookId: string): Promise<Outcome<AcademyWebhookStatus>> =>
    graphql(
        `
            mutation DisableAcademyWebhook($input: DisableAcademyWebhookInput!) {
                disableAcademyWebhook(request: $input) {
                    data {
                        id
                        endpoint
                        events
                        enabled
                        version
                        lastDeliveryStatus
                        lastDeliveredAt
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseAcademyWebhookStatus,
        {
            input: {
                siteId,
                webhookId,
            },
        },
    )
