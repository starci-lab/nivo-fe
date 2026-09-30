import { type Outcome } from "@nivo/api"
import { chatbotWorkbenchQueryKey, type SupportQueryIdentity } from "../queries/queries.shared"

/**
 * Decide whether an accepted API answer should refresh its cached projection.
 */
export const accepted = (answer: Outcome<unknown>) => answer.ok

/**
 * Build the chatbot projection key affected by a mutation.
 */
export const chatbotInvalidations = (identity: SupportQueryIdentity) => [chatbotWorkbenchQueryKey(identity)]
