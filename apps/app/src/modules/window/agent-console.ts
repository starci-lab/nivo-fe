"use client"

import { useEffect, useRef, useState } from "react"

const HEARTBEAT_MS = 1_500
const STALE_AFTER_MS = 4_500

/** Connection state shared by the host workspace and its auxiliary console window. */
export type AgentConsoleBridgeState = "connecting" | "connected" | "disconnected"

/** Bounded same-origin message exchanged through one workspace channel. */
type AgentConsoleBridgeMessage = {
    readonly kind: "host-heartbeat" | "popup-ready"
    readonly workspaceId: string
    readonly connected?: boolean
    readonly sentAt: number
}

const channelName = (workspaceId: string) => `nivo-agent-console:${workspaceId}`

/** Open a reusable OAuth-style auxiliary window for one exact workspace. */
export const openAgentConsolePopup = (path: string, workspaceId: string): void => {
    const destination = new URL(path, window.location.origin)
    if (destination.origin !== window.location.origin) return
    const width = Math.min(1180, window.screen.availWidth)
    const height = Math.min(820, window.screen.availHeight)
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))
    const popup = window.open(
        destination,
        `nivo-agent-console-${workspaceId}`,
        `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    )
    popup?.focus()
}

/** Publish the main Nivo session's liveness while its exact workspace remains mounted. */
export const useAgentConsoleHostBridge = (workspaceId: string, authenticated: boolean): void => {
    useEffect(() => {
        if (typeof BroadcastChannel === "undefined") return
        const channel = new BroadcastChannel(channelName(workspaceId))
        const publish = (connected: boolean) => channel.postMessage({
            kind: "host-heartbeat", workspaceId, connected, sentAt: Date.now(),
        } satisfies AgentConsoleBridgeMessage)
        const onMessage = (event: MessageEvent<AgentConsoleBridgeMessage>) => {
            if (event.data.kind === "popup-ready" && event.data.workspaceId === workspaceId) publish(authenticated)
        }
        channel.addEventListener("message", onMessage)
        publish(authenticated)
        const heartbeat = window.setInterval(() => publish(authenticated), HEARTBEAT_MS)
        const disconnect = () => publish(false)
        window.addEventListener("beforeunload", disconnect)
        return () => {
            disconnect()
            window.clearInterval(heartbeat)
            window.removeEventListener("beforeunload", disconnect)
            channel.removeEventListener("message", onMessage)
            channel.close()
        }
    }, [authenticated, workspaceId])
}

/** Observe main-window heartbeat and shared authentication from the auxiliary console. */
export const useAgentConsolePopupBridge = (workspaceId: string, authenticated: boolean): AgentConsoleBridgeState => {
    const [state, setState] = useState<AgentConsoleBridgeState>(authenticated ? "connecting" : "disconnected")
    const lastHeartbeat = useRef<number | null>(null)
    useEffect(() => {
        if (!authenticated || typeof BroadcastChannel === "undefined") {
            setState("disconnected")
            return
        }
        const channel = new BroadcastChannel(channelName(workspaceId))
        const onMessage = (event: MessageEvent<AgentConsoleBridgeMessage>) => {
            const message = event.data
            if (message.kind !== "host-heartbeat" || message.workspaceId !== workspaceId) return
            lastHeartbeat.current = message.sentAt
            setState(message.connected === true ? "connected" : "disconnected")
        }
        channel.addEventListener("message", onMessage)
        channel.postMessage({ kind: "popup-ready", workspaceId, sentAt: Date.now() } satisfies AgentConsoleBridgeMessage)
        const watchdog = window.setInterval(() => {
            const heartbeat = lastHeartbeat.current
            if (heartbeat === null || Date.now() - heartbeat > STALE_AFTER_MS) setState("disconnected")
        }, HEARTBEAT_MS)
        return () => {
            window.clearInterval(watchdog)
            channel.removeEventListener("message", onMessage)
            channel.close()
        }
    }, [authenticated, workspaceId])
    return state
}
