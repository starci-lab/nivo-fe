
import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { CORE_API_BASE } from "@/modules/config"
import {
    bindProvisioningSocket,
    type ProvisioningEvent,
    type ProvisioningRealtimeState,
    type ProvisioningTarget,
} from "./realtime.shared"

/** Inputs required to subscribe to exactly one provisioning subject. */
type UseProvisioningRealtimeInput = {
    readonly accessToken: string | null
    readonly target: ProvisioningTarget | null
}

/**
 * Follow one order, deployment, workspace, module installation, instance or saga in the
 * authenticated owner's room.
 *
 * A null target deliberately keeps the socket closed: before a request has an identity there is no
 * event this screen can safely claim. Re-entry snapshots choose the target before the connection is
 * made, and every handler compares that exact id again before publishing state.
 *
 * DISCONNECTED IS DERIVED, NOT SET. A missing token or target is a fact of the inputs, so that
 * answer is computed during render rather than pushed by an effect. While a subscription attempt
 * is live its phase is `connecting`; when the token or target changes, the channel key changes and
 * the render-phase comparison resets the channel before the new effect opens its socket. A socket
 * event reaching for a key that is no longer current is dropped instead of landing on the
 * successor channel.
 */
const useProvisioningRealtime = ({ accessToken, target }: UseProvisioningRealtimeInput): ProvisioningRealtimeState => {
    const targetKind = target?.kind
    const targetId = target?.id
    const channelKey =
        accessToken === null || targetKind === undefined || targetId === undefined
            ? null
            : `${accessToken} ${targetKind} ${targetId}`
    const [channel, setChannel] = useState<{ key: string | null; state: ProvisioningRealtimeState }>({
        key: null,
        state: { status: "connecting", reason: null },
    })
    if (channel.key !== channelKey) {
        setChannel({ key: channelKey, state: { status: "connecting", reason: null } })
    }

    const latestUpdatedAt = useRef<string | null>(null)
    const latestSequence = useRef<number | null>(null)

    useEffect(() => {
        latestUpdatedAt.current = null
        latestSequence.current = null
        if (channelKey === null || accessToken === null || targetKind === undefined || targetId === undefined) {
            return
        }

        const socket: Socket = io(`${CORE_API_BASE}/provisioning`, {
            auth: { token: accessToken },
            transports: ["websocket"],
            reconnection: true,
        })
        const publish = (state: ProvisioningRealtimeState) =>
            setChannel((current) => (current.key === channelKey ? { key: channelKey, state } : current))

        bindProvisioningSocket(
            socket,
            { kind: targetKind, id: targetId },
            {
                connected: () => publish({ status: "connected", reason: null }),
                disconnected: (reason) => publish({ status: "disconnected", reason }),
                unsequenced: (event: ProvisioningEvent) => publish({ status: "event", reason: null, event }),
                ordered: (updatedAt: string, event: ProvisioningEvent, sequence?: number) => {
                    if (sequence !== undefined) {
                        if (latestSequence.current !== null && latestSequence.current >= sequence) return
                        latestSequence.current = sequence
                    } else if (latestUpdatedAt.current !== null && latestUpdatedAt.current >= updatedAt) {
                        return
                    }
                    latestUpdatedAt.current = updatedAt
                    publish({ status: "event", reason: null, event })
                },
            },
        )

        return () => {
            socket.removeAllListeners()
            socket.disconnect()
        }
    }, [accessToken, targetId, targetKind, channelKey])

    if (channelKey === null) {
        return { status: "disconnected", reason: accessToken === null ? "anonymous" : null }
    }
    return channel.state
}

export default useProvisioningRealtime
