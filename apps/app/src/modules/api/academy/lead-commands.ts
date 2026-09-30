import { type Outcome } from "@nivo/api"
import { DraftLeadReplyDocument, UpdateExpertSiteLeadDocument } from "../__generated__/core"
import type {
    DraftLeadReplyInput,
    DraftedLeadReplyType,
    ExpertSiteLeadFieldsFragment,
    UpdateExpertSiteLeadInput,
} from "../__generated__/core"
import { graphql } from "../graphql"
import { parseDraftedLeadReply, parseExpertSiteLead } from "./payload.guards"

/** Update the follow-up state of one Academy lead. */
export const updateExpertSiteLead = (
    input: UpdateExpertSiteLeadInput,
): Promise<Outcome<ExpertSiteLeadFieldsFragment>> =>
    graphql(
        UpdateExpertSiteLeadDocument,
        parseExpertSiteLead,
        { input },
    )

/** Draft a reply for one Academy lead without sending it. */
export const draftLeadReply = (input: DraftLeadReplyInput): Promise<Outcome<DraftedLeadReplyType>> =>
    graphql(
        DraftLeadReplyDocument,
        parseDraftedLeadReply,
        { input },
    )
