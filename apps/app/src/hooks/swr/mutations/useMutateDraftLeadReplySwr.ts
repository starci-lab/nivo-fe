import { draftLeadReply } from "@/modules/api/academy"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_ACADEMY_LEAD_DRAFT_SWR_KEY } from "../swr.shared"

/** Generate a reply draft without changing the durable lead collection. */
export const useMutateDraftLeadReplySwr = (siteId: string) =>
    useNivoMutation(MUTATION_ACADEMY_LEAD_DRAFT_SWR_KEY(siteId), draftLeadReply)
