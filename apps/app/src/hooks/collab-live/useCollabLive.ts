"use client"

import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { io, type Socket } from "socket.io-client"
import type { CollabLiveStatus } from "@/modules/collab"
import { CORE_API_BASE } from "@/modules/config"
import { useAccessToken } from "../auth/useAccessToken"

/**
 * The Collab live door (`decision.collab.live-delivery` rev 2,
 * `sds.collab.chat-gateway` rev 4 Live ingress).
 *
 * THE HINT IS NEVER THE TRUTH. The `/collab` namespace emits only
 * `collab.changed` carrying `{workspaceId, kind, cursor}` - which workspace changed
 * and what kind of record, never the record itself. This hook answers every accepted
 * hint by revalidating the affected SWR domains so the authoritative read decides
 * what the view shows. A dropped, duplicated or out-of-order hint can therefore only
 * cost a redundant re-read, never a wrong screen.
 *
 * SUBSCRIBE IS A MEMBERSHIP CHECK. The handshake verifies the same Keycloak bearer as
 * the GraphQL door and `collab.subscribe` joins the workspace's Office channel plus
 * the caller's own member channel only when current membership holds; a denial is
 * non-disclosing and this hook surfaces it as connection state, nothing more.
 *
 * RECONNECT MEANS RE-READ. After any connect - first or regained - the hook
 * subscribes again and re-reads every collab domain of the workspace, because hints
 * that fired while the socket was down are unknowable.
 */

const COLLAB_SOCKET_URL = `${CORE_API_BASE}/collab`

/** The closed set of change kinds the live namespace may announce. */
export type CollabLiveHintKind = "message" | "card" | "task" | "membership" | "notice"

/** The only payload a `collab.changed` hint carries; never content, never truth. */
export type CollabLiveHint = {
    readonly workspaceId: string
    readonly kind: CollabLiveHintKind
    readonly cursor: string | null
}

/** Connection and subscription phase visible to a surface; never business data. */
export type CollabLiveState = {
    /**
     * `idle` mounts no socket (signed out or no workspace); `connecting` opened the
     * handshake; `subscribed` joined the workspace channels; `disconnected` lost the
     * socket or was refused, with `reason` carrying the closed reason when known.
     */
    readonly status: CollabLiveStatus
    readonly reason: string | null
    /** The most recent accepted hint - a re-read trigger, not content. */
    readonly lastHint: CollabLiveHint | null
}

const COLLAB_LIVE_HINT_KINDS: ReadonlySet<string> = new Set(["message", "card", "task", "membership", "notice"])

/**
 * Which cached collab domains of the workspace a hint kind can touch. A card and a
 * task each live in the conversation page and the task projections; a message is a
 * group page change; membership is the Office roster; a notice is the notice reads.
 */
const COLLAB_HINT_DOMAINS: Record<CollabLiveHintKind, ReadonlyArray<string>> = {
    message: ["group"],
    card: ["group", "task", "tasks"],
    task: ["group", "task", "tasks"],
    membership: ["office"],
    notice: ["notices", "notice"],
}

/** Every cached collab query key of one workspace: `["NIVO_QUERY", viewer, "collab", domain, workspaceId, ...]`. */
const collabWorkspaceKeys =
    (workspaceId: string) =>
    (key: unknown): boolean =>
        Array.isArray(key) && key[0] === "NIVO_QUERY" && key[2] === "collab" && key[4] === workspaceId

const collabDomainKeys =
    (workspaceId: string, domains: ReadonlyArray<string>) =>
    (key: unknown): boolean =>
        Array.isArray(key) && collabWorkspaceKeys(workspaceId)(key) && domains.includes(key[3] as string)

/** Accept exactly the three hint fields; anything else is not a hint. */
const readHint = (payload: unknown): CollabLiveHint | null => {
    if (typeof payload !== "object" || payload === null) {
        return null
    }
    const hint = payload as Record<string, unknown>
    if (
        typeof hint.workspaceId !== "string" ||
        typeof hint.kind !== "string" ||
        !COLLAB_LIVE_HINT_KINDS.has(hint.kind)
    ) {
        return null
    }
    return {
        workspaceId: hint.workspaceId,
        kind: hint.kind as CollabLiveHintKind,
        cursor: typeof hint.cursor === "string" ? hint.cursor : null,
    }
}

/** The subscribe acknowledgement; a denial is non-disclosing by design. */
const readSubscribeAck = (payload: unknown): { ok: true } | { ok: false; reason: string } => {
    if (typeof payload === "object" && payload !== null && (payload as Record<string, unknown>).ok === true) {
        return { ok: true }
    }
    const reasonValue =
        typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>).reason : undefined
    return { ok: false, reason: typeof reasonValue === "string" ? reasonValue : "unavailable" }
}

/**
 * Follow one workspace's Collab live channel: subscribe under the session bearer,
 * surface connection/subscription state, and answer each `collab.changed` hint by
 * revalidating the matching SWR domains - never by inserting pushed content.
 * A null workspace or signed-out session mounts no socket.
 */
export const useCollabLive = (workspaceId: string | null): CollabLiveState => {
    const accessToken = useAccessToken()
    const { mutate } = useSWRConfig()
    const [state, setState] = useState<CollabLiveState>({ status: "idle", reason: null, lastHint: null })

    useEffect(() => {
        if (accessToken === null || workspaceId === null || workspaceId === "") {
            setState({ status: "idle", reason: accessToken === null ? "signed-out" : "no-workspace", lastHint: null })
            return
        }

        const socket: Socket = io(COLLAB_SOCKET_URL, {
            auth: { token: accessToken },
            transports: ["websocket"],
            reconnection: true,
        })
        setState({ status: "connecting", reason: null, lastHint: null })

        const subscribe = () => {
            // Every connect - first or regained - subscribes and re-reads everything:
            // hints that fired while the socket was down are unknowable.
            socket.emit("collab.subscribe", { workspaceId }, (ack: unknown) => {
                const answer = readSubscribeAck(ack)
                if (!answer.ok) {
                    setState({ status: "disconnected", reason: answer.reason, lastHint: null })
                    return
                }
                setState({ status: "subscribed", reason: null, lastHint: null })
                void mutate(collabWorkspaceKeys(workspaceId))
            })
        }

        socket.on("connect", subscribe)
        socket.on("disconnect", (reason: string) => setState({ status: "disconnected", reason, lastHint: null }))
        socket.on("connect_error", (error: Error) =>
            setState({ status: "disconnected", reason: error.message, lastHint: null }),
        )
        socket.on("collab.changed", (payload: unknown) => {
            const hint = readHint(payload)
            if (hint === null || hint.workspaceId !== workspaceId) {
                return
            }
            setState({ status: "subscribed", reason: null, lastHint: hint })
            void mutate(collabDomainKeys(workspaceId, COLLAB_HINT_DOMAINS[hint.kind]))
        })

        return () => {
            socket.removeAllListeners()
            socket.disconnect()
        }
    }, [accessToken, workspaceId, mutate])

    return state
}

export default useCollabLive
