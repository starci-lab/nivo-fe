"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const API_ENDPOINT = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3067/graphql"
const SOCKET_ENDPOINT = API_ENDPOINT.replace(/\/graphql\/?$/, "")

/** Minimal owner-safe identity carried by AgentOS console invalidations. */
type AgentTasksWorkspaceMessage = { readonly podId?: string }

/** Browser-visible state of the authenticated AgentOS event stream. */
export type AgentTasksRealtimeState = "connecting" | "connected" | "disconnected"

/** Refresh one exact workspace when its Nivo-owned OpenClaw projection changes. */
export const useAgentTasksRealtime = (accessToken: string | null, workspaceId: string, refresh: () => void): AgentTasksRealtimeState => {
    const [state, setState] = useState<AgentTasksRealtimeState>(accessToken === null ? "disconnected" : "connecting")
    useEffect(() => {
        if (accessToken === null) {
            setState("disconnected")
            return
        }
        setState("connecting")
        const socket = io(`${SOCKET_ENDPOINT}/agent-tasks`, {
            auth: { token: accessToken },
            transports: ["websocket"],
            reconnection: true,
        })
        socket.on("connect", () => {
            setState("connected")
            socket.emit("agent-tasks.subscribe")
        })
        socket.on("disconnect", () => setState("disconnected"))
        socket.on("connect_error", () => setState("disconnected"))
        socket.on("agent.replied", (message: AgentTasksWorkspaceMessage) => {
            if (message.podId === workspaceId) refresh()
        })
        socket.on("pod.stream.gapped", (message: AgentTasksWorkspaceMessage) => {
            if (message.podId === workspaceId) refresh()
        })
        return () => {
            socket.disconnect()
        }
    }, [accessToken, refresh, workspaceId])
    return state
}

export default useAgentTasksRealtime
