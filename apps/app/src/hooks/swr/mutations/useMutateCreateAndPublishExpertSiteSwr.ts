import { createExpertSite, publishExpertSite } from "@/modules/api/expert-sites"
import { useNivoMutation } from "../useNivoMutation"
import {
    MUTATION_EXPERT_SITE_CREATE_PUBLISH_SWR_KEY,
    QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY,
    QUERY_EXPERT_SITES_SWR_KEY,
} from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Create and publish one expert site as a single UI command with one invalidation boundary. */
export const useMutateCreateAndPublishExpertSiteSwr = () =>
    useNivoMutation(
        MUTATION_EXPERT_SITE_CREATE_PUBLISH_SWR_KEY,
        async (slug: string) => {
            const created = await createExpertSite(slug)
            if (!created.ok) {
                switch (created.kind) {
                    case "refused":
                    case "forbidden":
                    case "not-found":
                    case "invalid":
                    case "unavailable":
                        return created
                }
            }
            const published = await publishExpertSite(created.data.id)
            if (!published.ok) {
                switch (published.kind) {
                    case "refused":
                    case "forbidden":
                    case "not-found":
                    case "invalid":
                    case "unavailable":
                        return published
                }
            }
            return {
                ok: true as const,
                data: {
                    ...published.data,
                    id: created.data.id,
                },
            }
        },
        {
            invalidates: (_slug, answer) => {
                if (answer.ok) return [QUERY_EXPERT_SITES_SWR_KEY, QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY(answer.data.id)]
                switch (answer.kind) {
                    case "refused":
                    case "forbidden":
                    case "not-found":
                    case "invalid":
                    case "unavailable":
                        return []
                }
            },
            shouldInvalidate: accepted,
        },
    )
