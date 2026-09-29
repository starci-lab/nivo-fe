import { graphql } from "../graphql"
import type { Outcome } from "../outcome"
import type {
    DraftLeadReplyInput,
    DraftedLeadReply,
    ExpertSiteLead,
    UpdateExpertSiteLeadInput
} from "./types"

/** Update the follow-up state of one Academy lead. */
export const updateExpertSiteLead = (input: UpdateExpertSiteLeadInput): Promise<Outcome<ExpertSiteLead>> =>
    graphql(
        `
            mutation UpdateExpertSiteLead($input: UpdateExpertSiteLeadInput!) {
                updateExpertSiteLead(request: $input) {
                    data {
                        id
                        name
                        contact
                        message
                        status
                        note
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Draft a reply for one Academy lead without sending it. */
export const draftLeadReply = (input: DraftLeadReplyInput): Promise<Outcome<DraftedLeadReply>> =>
    graphql(
        `
            mutation DraftLeadReply($input: DraftLeadReplyInput!) {
                draftLeadReply(request: $input) {
                    data {
                        reply
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input,
        },
    )

/** Store one Academy credential and return delivery status, never its value. */
