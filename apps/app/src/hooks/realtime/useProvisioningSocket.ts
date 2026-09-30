import { useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { CORE_API_BASE } from "@/modules/config"
import {
    terminalSagaStatus,
    unwrapMessage,
    type SagaMessage,
    type SocketEnvelope,
} from "@/modules/realtime/provisioning"
import {
    bindProvisioningSocket,
    type ProvisioningTarget,
    type ProvisioningRealtimeState,
    type ProvisioningEvent,
} from "./realtime.shared"

type ProvisioningSocketInput = {
    readonly accessToken: string | null
    readonly channelKey: string | null
    readonly targetKind: ProvisioningTarget["kind"] | undefined
    readonly targetId: string | undefined
    readonly onState: (state: ProvisioningRealtimeState) => void
}

/** Own one provisioning subscription, its event ordering and its socket lifetime. */
export const useProvisioningSocket = ({
    accessToken,
    channelKey,
    targetKind,
    targetId,
    onState,
}: ProvisioningSocketInput) => {
    useEffect(() => {
        let latestUpdatedAt: string | null = null
        let latestSequence: number | null = null
        if (channelKey === null || accessToken === null || targetKind === undefined || targetId === undefined) {
            return
        }

        const socket: Socket = io(`${CORE_API_BASE}/provisioning`, {
            auth: { token: accessToken },
            transports: ["websocket"],
            reconnection: true,
        })
        let active = true
        const publish = (state: ProvisioningRealtimeState) => {
            if (active) onState(state)
        }

        const sink = {
            connected: () => publish({ status: "connected", reason: null }),
            disconnected: (reason: string | null) => publish({ status: "disconnected", reason }),
            unsequenced: (event: ProvisioningEvent) => publish({ status: "event", reason: null, event }),
            ordered: (updatedAt: string, event: ProvisioningEvent, sequence?: number) => {
                if (sequence !== undefined) {
                    if (latestSequence !== null && latestSequence >= sequence) return
                    latestSequence = sequence
                } else if (latestUpdatedAt !== null && latestUpdatedAt >= updatedAt) {
                    return
                }
                latestUpdatedAt = updatedAt
                publish({ status: "event", reason: null, event })
            },
        }
        bindProvisioningSocket(socket, { kind: targetKind, id: targetId }, sink)
        socket.on("provisioning.saga.status", (payload: SagaMessage | SocketEnvelope<SagaMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind === "saga") {
                if (message.sagaId !== targetId) return
                sink.ordered(
                    message.updatedAt,
                    {
                        kind: "saga",
                        id: message.sagaId,
                        status: message.status,
                        direction: message.direction,
                        stepKey: message.stepKey,
                        reason: message.reason,
                        updatedAt: message.updatedAt,
                    },
                    message.sequence,
                )
                return
            }
            const isWorkspace = targetKind === "workspace" && message.resourceKind === "agent_workspace"
            const isDeployment = targetKind === "deployment" && message.resourceKind === "expert_deployment"
            const isModuleInstallation =
                targetKind === "module-installation" && message.resourceKind === "agentos_module_installation"
            if ((!isWorkspace && !isDeployment && !isModuleInstallation) || message.resourceId !== targetId) return
            if (isModuleInstallation) {
                sink.ordered(
                    message.updatedAt,
                    {
                        kind: "module-installation",
                        id: targetId,
                        status: terminalSagaStatus(message.status, "ready"),
                        stepKey: message.stepKey,
                        reason: message.reason,
                        updatedAt: message.updatedAt,
                    },
                    message.sequence,
                )
                return
            }
            const kind = isWorkspace ? ("workspace" as const) : ("deployment" as const)
            sink.ordered(
                message.updatedAt,
                {
                    kind,
                    id: targetId,
                    status: terminalSagaStatus(message.status, isWorkspace ? "active" : "running"),
                    reason: message.reason,
                    updatedAt: message.updatedAt,
                },
                message.sequence,
            )
        })

        return () => {
            active = false
            socket.off()
            socket.disconnect()
        }
    }, [accessToken, targetId, targetKind, channelKey, onState])
}
