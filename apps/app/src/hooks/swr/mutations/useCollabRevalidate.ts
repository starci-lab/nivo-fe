import { useSWRConfig } from "swr"
import { type Outcome } from "@nivo/api"
import { collabDomainKeys } from "../swr.shared"

/**
 * Collab Office mutation ownership (`contract.collab.chat` press/post,
 * `contract.collab.member-invite`, `fr.collab.approval`).
 *
 * STABLE INTENT IS THE CALLER'S CONTRACT. A post names its `intentId` and a resend
 * MUST reuse it - a new intent is a new message, a reused intent is the same one,
 * and an uncertain transport is reconciled by `reconcileRequest`, never resent
 * blindly (`br.collab.intent-stability`).
 *
 * REVALIDATION COVERS EVERY CACHED VARIANT, NOT ONE KEY. The conversation pages by
 * cursor and the Tasks list by filter, so exact-key invalidation would leave a
 * cursored group page or a filtered Tasks list holding a stale card while the
 * unfiltered projection refreshes - two truths for one task (`br.collab.one-truth`).
 * Each mutation therefore revalidates every cached collab key of its workspace in the
 * affected domains through SWR's filter form, only after the boundary answered `ok`.
 * A refused or uncertain answer revalidates nothing the read didn't already prove.
 */

/** Revalidate the workspace's cached projections in `domains` after an accepted answer. */
export const useCollabRevalidate = (workspaceId: string | null, domains: ReadonlyArray<string>) => {
    const { mutate } = useSWRConfig()
    return async (answer: Outcome<unknown>) => {
        if (workspaceId !== null && answer.ok) {
            await mutate(collabDomainKeys(workspaceId, domains))
        }
        return answer
    }
}
