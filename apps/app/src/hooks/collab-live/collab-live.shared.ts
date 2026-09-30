/** The closed set of change kinds the live namespace may announce. */
type CollabLiveHintKind = "message" | "card" | "task" | "membership" | "notice"

/** The only payload a `collab.changed` hint carries; never content, never truth. */
export type CollabLiveHint = {
    readonly workspaceId: string
    readonly kind: CollabLiveHintKind
    readonly cursor: string | null
}

const COLLAB_LIVE_HINT_KINDS: ReadonlySet<string> = new Set(["message", "card", "task", "membership", "notice"])

/** Whether a hint's kind word is one of the closed change kinds the namespace may announce. */
const isCollabLiveHintKind = (value: unknown): value is CollabLiveHintKind =>
    typeof value === "string" && COLLAB_LIVE_HINT_KINDS.has(value)

/**
 * Which cached collab domains of the workspace a hint kind can touch. A card and a
 * task each live in the conversation page and the task projections; a message is a
 * group page change; membership is the Office roster; a notice is the notice reads.
 */
export const COLLAB_HINT_DOMAINS: Record<CollabLiveHintKind, ReadonlyArray<string>> = {
    message: ["group"],
    card: ["group", "task", "tasks"],
    task: ["group", "task", "tasks"],
    membership: ["office"],
    notice: ["notices", "notice"],
}

/** Every cached collab query key of one workspace: `["NIVO_QUERY", viewer, "collab", domain, workspaceId, ...]`. */
export const collabWorkspaceKeys =
    (workspaceId: string) =>
    (key: unknown): boolean =>
        Array.isArray(key) && key[0] === "NIVO_QUERY" && key[2] === "collab" && key[4] === workspaceId

/** Match only the workspace's cached collab domains affected by an accepted hint. */
export const collabDomainKeys =
    (workspaceId: string, domains: ReadonlyArray<string>) =>
    (key: unknown): boolean =>
        Array.isArray(key) &&
        collabWorkspaceKeys(workspaceId)(key) &&
        typeof key[3] === "string" &&
        domains.includes(key[3])

/** Accept exactly the three hint fields; anything else is not a hint. */
export const readHint = (payload: unknown): CollabLiveHint | null => {
    if (
        typeof payload !== "object" ||
        payload === null ||
        !("workspaceId" in payload) ||
        typeof payload.workspaceId !== "string" ||
        !("kind" in payload) ||
        !isCollabLiveHintKind(payload.kind)
    ) {
        return null
    }
    const cursor = "cursor" in payload ? payload.cursor : null
    return {
        workspaceId: payload.workspaceId,
        kind: payload.kind,
        cursor: typeof cursor === "string" ? cursor : null,
    }
}

/** The subscribe acknowledgement; a denial is non-disclosing by design. */
export const readSubscribeAck = (payload: unknown): { ok: true } | { ok: false; reason: string } => {
    if (typeof payload === "object" && payload !== null && "ok" in payload && payload.ok === true) {
        return { ok: true }
    }
    const reasonValue =
        typeof payload === "object" && payload !== null && "reason" in payload ? payload.reason : undefined
    return { ok: false, reason: typeof reasonValue === "string" ? reasonValue : "unavailable" }
}
