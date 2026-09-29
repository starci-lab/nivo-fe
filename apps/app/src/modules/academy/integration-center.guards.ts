import type { AcademyIntegrationProviderId } from "./integration-center"

const ACADEMY_INTEGRATION_PROVIDER_IDS: ReadonlyArray<AcademyIntegrationProviderId> = [
    "domain",
    "google",
    "smtp",
    "payment",
    "zalo",
    "ga4",
    "meta_pixel",
    "webhook",
]

/** Narrow one provider selection to the Integration Center's closed provider vocabulary. */
export const isAcademyIntegrationProviderId = (value: unknown): value is AcademyIntegrationProviderId =>
    typeof value === "string" && ACADEMY_INTEGRATION_PROVIDER_IDS.some((id) => id === value)
