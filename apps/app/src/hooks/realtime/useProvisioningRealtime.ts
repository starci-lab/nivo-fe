"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { CORE_API_BASE } from "@/modules/config"
import {
    terminalSagaStatus,
    unwrapMessage,
    type DeploymentMessage,
    type InstanceOperationMessage,
    type OrderMessage,
    type SagaMessage,
    type SocketEnvelope,
    type WorkspaceMessage,
    type WorkspaceRuntimeMessage,
} from "@/modules/realtime/provisioning"

/** Exact resource identity one provisioning listener is allowed to advance. */
export type ProvisioningTarget =
    | { readonly kind: "order"; readonly id: string }
    | { readonly kind: "deployment"; readonly id: string }
    | { readonly kind: "workspace"; readonly id: string }
    | { readonly kind: "module-installation"; readonly id: string }
    | { readonly kind: "instance"; readonly id: string }
    | { readonly kind: "saga"; readonly id: string }

/** One event after the hook has rejected unrelated owner-room traffic. */
export type ProvisioningEvent =
    | { readonly kind: "workspace"; readonly id: string; readonly status: string; readonly reason: string | null; readonly updatedAt: string }
    | { readonly kind: "workspace-runtime"; readonly id: string; readonly instanceId: string; readonly fingerprint: string; readonly probeStatus: string; readonly updatedAt: string }
    | { readonly kind: "deployment"; readonly id: string; readonly status: string; readonly reason: string | null; readonly updatedAt: string }
    | { readonly kind: "module-installation"; readonly id: string; readonly status: string; readonly stepKey: string | null; readonly reason: string | null; readonly updatedAt: string }
    | { readonly kind: "order"; readonly id: string; readonly status: string }
    | { readonly kind: "instance-operation"; readonly id: string; readonly instanceId: string; readonly phase: string; readonly componentKey: string | null; readonly reason: string | null; readonly updatedAt: string }
    | { readonly kind: "saga"; readonly id: string; readonly status: string; readonly direction: "forward" | "compensating"; readonly stepKey: string | null; readonly reason: string | null; readonly updatedAt: string }

/** Connection and event states visible to a provisioning block. */
export type ProvisioningRealtimeState =
    | { readonly status: "disconnected"; readonly reason: string | null }
    | { readonly status: "connecting"; readonly reason: null }
    | { readonly status: "connected"; readonly reason: null }
    | { readonly status: "event"; readonly reason: null; readonly event: ProvisioningEvent }

/** Inputs required to subscribe to exactly one provisioning subject. */
export type UseProvisioningRealtimeInput = {
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
 */
const useProvisioningRealtime = ({
    accessToken,
    target,
}: UseProvisioningRealtimeInput) => {
    const [state, setState] = useState<ProvisioningRealtimeState>({ status: "disconnected", reason: null })
    const latestUpdatedAt = useRef<string | null>(null)
    const latestSequence = useRef<number | null>(null)
    const targetKind = target?.kind
    const targetId = target?.id

    useEffect(() => {
        latestUpdatedAt.current = null
        latestSequence.current = null
        if (accessToken === null || targetKind === undefined || targetId === undefined) {
            setState({ status: "disconnected", reason: accessToken === null ? "anonymous" : null })
            return
        }

        const socket: Socket = io(`${CORE_API_BASE}/provisioning`, {
            auth: { token: accessToken },
            transports: ["websocket"],
            reconnection: true,
        })
        setState({ status: "connecting", reason: null })

        const acceptOrdered = (updatedAt: string, event: ProvisioningEvent, sequence?: number) => {
            if (sequence !== undefined) {
                if (latestSequence.current !== null && latestSequence.current >= sequence) return
                latestSequence.current = sequence
            } else if (latestUpdatedAt.current !== null && latestUpdatedAt.current >= updatedAt) {
                return
            }
            latestUpdatedAt.current = updatedAt
            setState({ status: "event", reason: null, event })
        }

        socket.on("connect", () => {
            socket.emit("provisioning.subscribe")
            setState({ status: "connected", reason: null })
        })
        socket.on("disconnect", (reason: string) => setState({ status: "disconnected", reason }))
        socket.on("connect_error", (error: Error) => setState({ status: "disconnected", reason: error.message }))
        socket.on("workspace.status", (payload: WorkspaceMessage | SocketEnvelope<WorkspaceMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind !== "workspace" || message.workspaceId !== targetId) return
            acceptOrdered(message.updatedAt, {
                kind: "workspace",
                id: message.workspaceId,
                status: message.status,
                reason: message.reason,
                updatedAt: message.updatedAt,
            }, message.sequence)
        })
        socket.on("workspace.runtime", (payload: WorkspaceRuntimeMessage | SocketEnvelope<WorkspaceRuntimeMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind !== "workspace" || message.workspaceId !== targetId) return
            acceptOrdered(message.observedAt, {
                kind: "workspace-runtime",
                id: message.workspaceId,
                instanceId: message.instanceId,
                fingerprint: message.fingerprint,
                probeStatus: message.probeStatus,
                updatedAt: message.observedAt,
            }, message.sequence)
        })
        socket.on("deployment.status", (payload: DeploymentMessage | SocketEnvelope<DeploymentMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind !== "deployment" || message.deploymentId !== targetId) return
            acceptOrdered(message.updatedAt, {
                kind: "deployment",
                id: message.deploymentId,
                status: message.status,
                reason: message.reason,
                updatedAt: message.updatedAt,
            }, message.sequence)
        })
        socket.on("provisioning.saga.status", (payload: SagaMessage | SocketEnvelope<SagaMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind === "saga") {
                if (message.sagaId !== targetId) return
                acceptOrdered(message.updatedAt, {
                    kind: "saga",
                    id: message.sagaId,
                    status: message.status,
                    direction: message.direction,
                    stepKey: message.stepKey,
                    reason: message.reason,
                    updatedAt: message.updatedAt,
                }, message.sequence)
                return
            }
            const isWorkspace = targetKind === "workspace"
                && message.resourceKind === "agent_workspace"
            const isDeployment = targetKind === "deployment"
                && message.resourceKind === "expert_deployment"
            const isModuleInstallation = targetKind === "module-installation"
                && message.resourceKind === "agentos_module_installation"
            if ((!isWorkspace && !isDeployment && !isModuleInstallation) || message.resourceId !== targetId) return
            if (isModuleInstallation) {
                acceptOrdered(message.updatedAt, {
                    kind: "module-installation",
                    id: targetId,
                    status: terminalSagaStatus(message.status, "ready"),
                    stepKey: message.stepKey,
                    reason: message.reason,
                    updatedAt: message.updatedAt,
                }, message.sequence)
                return
            }
            const kind = isWorkspace ? "workspace" as const : "deployment" as const
            acceptOrdered(message.updatedAt, {
                kind,
                id: targetId,
                status: terminalSagaStatus(message.status, isWorkspace ? "active" : "running"),
                reason: message.reason,
                updatedAt: message.updatedAt,
            }, message.sequence)
        })
        socket.on("order.fulfilling", (payload: OrderMessage | SocketEnvelope<OrderMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind !== "order" || message.orderId !== targetId) return
            setState({ status: "event", reason: null, event: { kind: "order", id: message.orderId, status: message.status } })
        })
        socket.on("instance.operation", (payload: InstanceOperationMessage | SocketEnvelope<InstanceOperationMessage>) => {
            const message = unwrapMessage(payload)
            if (message === null) return
            if (targetKind !== "instance" || message.instanceId !== targetId) return
            acceptOrdered(message.observedAt, {
                kind: "instance-operation",
                id: message.operationId,
                instanceId: message.instanceId,
                phase: message.phase,
                componentKey: message.componentKey ?? null,
                reason: message.reason ?? null,
                updatedAt: message.observedAt,
            })
        })

        return () => {
            socket.removeAllListeners()
            socket.disconnect()
        }
    }, [accessToken, targetId, targetKind])

    return state
}

export default useProvisioningRealtime