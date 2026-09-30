import { type Outcome } from "@nivo/api"
import { beginAcademyZaloAuthorization, createAcademyWebhook, saveAcademyAnalytics, saveAcademyCredential, saveAcademyGoogleOAuth, setAcademyCustomDomain } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_INTEGRATION_SWR_KEY, QUERY_ACADEMY_INTEGRATIONS_SWR_KEY } from "../swr.shared"

/** Own every Academy integration transport while preserving the provider-specific UI command. */
export const useMutateAcademyIntegrationSwr = (siteId: string) =>
    useNivoMutation<AcademyIntegrationAnswer, AcademyIntegrationCommand>(
        MUTATION_ACADEMY_INTEGRATION_SWR_KEY(siteId),
        (command) => executeAcademyIntegrationCommand(siteId, command),
        {
            invalidates: [QUERY_ACADEMY_INTEGRATIONS_SWR_KEY(siteId)],
            shouldInvalidate: (answer) => answer.ok,
        },
    )

type AcademyIntegrationAnswer = Outcome<AcademyIntegrationData>

type AcademyIntegrationData = {
    readonly authorizationUrl?: string
    readonly signingSecret?: string
}

type AcademyIntegrationCommand =
    | {
          readonly kind: "domain"
          readonly domain: string | null
      }
    | {
          readonly kind: "google"
          readonly clientId: string
          readonly clientSecret: string
      }
    | {
          readonly kind: "credential"
          readonly key: string
          readonly value: string
      }
    | {
          readonly kind: "zalo"
      }
    | {
          readonly kind: "analytics"
          readonly provider: "ga4" | "meta_pixel"
          readonly identifier: string | null
          readonly consentMode: "required" | "granted" | "denied"
      }
    | {
          readonly kind: "webhook"
          readonly endpoint: string
          readonly events: ReadonlyArray<string>
      }

const executeAcademyIntegrationCommand = async (
    siteId: string,
    command: AcademyIntegrationCommand,
): Promise<AcademyIntegrationAnswer> => {
    if (command.kind === "domain") {
        const answer = await setAcademyCustomDomain({
            siteId,
            domain: command.domain,
        })
        return integrationAnswer(answer)
    }
    if (command.kind === "google") {
        const answer = await saveAcademyGoogleOAuth({
            siteId,
            clientId: command.clientId,
            clientSecret: command.clientSecret,
        })
        return integrationAnswer(answer)
    }
    if (command.kind === "credential") {
        const answer = await saveAcademyCredential({
            siteId,
            key: command.key,
            value: command.value,
        })
        return integrationAnswer(answer)
    }
    if (command.kind === "zalo") {
        const answer = await beginAcademyZaloAuthorization(siteId)
        return authorizationAnswer(answer)
    }
    if (command.kind === "analytics") {
        const answer = await saveAcademyAnalytics({
            siteId,
            provider: command.provider,
            identifier: command.identifier,
            consentMode: command.consentMode,
        })
        return integrationAnswer(answer)
    }
    const answer = await createAcademyWebhook({
        siteId,
        endpoint: command.endpoint,
        events: [...command.events],
    })
    return signingAnswer(answer)
}

const integrationAnswer = <T>(answer: Outcome<T>): AcademyIntegrationAnswer =>
    answer.ok
        ? {
              ok: true,
              data: {},
          }
        : answer

const authorizationAnswer = (
    answer: Awaited<ReturnType<typeof beginAcademyZaloAuthorization>>,
): AcademyIntegrationAnswer =>
    answer.ok
        ? {
              ok: true,
              data: { authorizationUrl: answer.data.authorizationUrl },
          }
        : answer

const signingAnswer = (answer: Awaited<ReturnType<typeof createAcademyWebhook>>): AcademyIntegrationAnswer =>
    answer.ok
        ? {
              ok: true,
              data: { signingSecret: answer.data.signingSecret },
          }
        : answer
