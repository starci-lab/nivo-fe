/*
 * The wire half of the provisioning listener (socket.io `/provisioning` namespace).
 *
 * The handlers here only translate: each socket message is unwrapped, checked against the exact
 * target identity the listener is allowed to advance, and handed to the sink as an event. Nothing
 * is stored and no answer is invented - an unrelated room message is simply not published.
 */

import type { Socket } from "socket.io-client"
import {
    unwrapMessage,
    type DeploymentMessage,
    type InstanceOperationMessage,
    type OrderMessage,
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
    | {
          readonly kind: "workspace"
          readonly id: string
          readonly status: string
          readonly reason: string | null
          readonly updatedAt: string
      }
    | {
          readonly kind: "workspace-runtime"
          readonly id: string
          readonly instanceId: string
          readonly fingerprint: string
          readonly probeStatus: string
          readonly updatedAt: string
      }
    | {
          readonly kind: "deployment"
          readonly id: string
          readonly status: string
          readonly reason: string | null
          readonly updatedAt: string
      }
    | {
          readonly kind: "module-installation"
          readonly id: string
          readonly status: string
          readonly stepKey: string | null
          readonly reason: string | null
          readonly updatedAt: string
      }
    | { readonly kind: "order"; readonly id: string; readonly status: string }
    | {
          readonly kind: "instance-operation"
          readonly id: string
          readonly instanceId: string
          readonly phase: string
          readonly componentKey: string | null
          readonly reason: string | null
          readonly updatedAt: string
      }
    | {
          readonly kind: "saga"
          readonly id: string
          readonly status: string
          readonly direction: "forward" | "compensating"
          readonly stepKey: string | null
          readonly reason: string | null
          readonly updatedAt: string
      }

/** Connection and event states visible to a provisioning block. */
export type ProvisioningRealtimeState =
    | { readonly status: "disconnected"; readonly reason: string | null }
    | { readonly status: "connecting"; readonly reason: null }
    | { readonly status: "connected"; readonly reason: null }
    | { readonly status: "event"; readonly reason: null; readonly event: ProvisioningEvent }

/**
 * How the listener publishes what the wire said.
 *
 * `ordered` events carry the message's own `updatedAt` and optional `sequence` so a late or
 * replayed message cannot overwrite a newer observation; `unsequenced` is reserved for the order
 * wire, which carries no clock of its own and is therefore applied as it arrives.
 */
interface ProvisioningSink {
    readonly ordered: (updatedAt: string, event: ProvisioningEvent, sequence?: number) => void
    readonly unsequenced: (event: ProvisioningEvent) => void
    readonly connected: () => void
    readonly disconnected: (reason: string | null) => void
}

/** The exact kind and id a socket subscription attaches to. */
type ProvisioningSocketTarget = { readonly kind: ProvisioningTarget["kind"]; readonly id: string }

/**
 * Attach resource message handlers of one target to one socket.
 *
 * @param socket - The live `/provisioning` socket of this subscription attempt.
 * @param target - The exact kind and id events must match before they may publish.
 * @param sink - Where matching events and connection changes go.
 */
export const bindProvisioningSocket = (
    socket: Socket,
    target: ProvisioningSocketTarget,
    sink: ProvisioningSink,
): void => {
    const { kind: targetKind, id: targetId } = target

    socket.on("connect", () => {
        socket.emit("provisioning.subscribe")
        sink.connected()
    })
    socket.on("disconnect", (reason: string) => sink.disconnected(reason))
    socket.on("connect_error", (error: Error) => sink.disconnected(error.message))
    socket.on("workspace.status", (payload: WorkspaceMessage | SocketEnvelope<WorkspaceMessage>) => {
        const message = unwrapMessage(payload)
        if (message === null) return
        if (targetKind !== "workspace" || message.workspaceId !== targetId) return
        sink.ordered(
            message.updatedAt,
            {
                kind: "workspace",
                id: message.workspaceId,
                status: message.status,
                reason: message.reason,
                updatedAt: message.updatedAt,
            },
            message.sequence,
        )
    })
    socket.on("workspace.runtime", (payload: WorkspaceRuntimeMessage | SocketEnvelope<WorkspaceRuntimeMessage>) => {
        const message = unwrapMessage(payload)
        if (message === null) return
        if (targetKind !== "workspace" || message.workspaceId !== targetId) return
        sink.ordered(
            message.observedAt,
            {
                kind: "workspace-runtime",
                id: message.workspaceId,
                instanceId: message.instanceId,
                fingerprint: message.fingerprint,
                probeStatus: message.probeStatus,
                updatedAt: message.observedAt,
            },
            message.sequence,
        )
    })
    socket.on("deployment.status", (payload: DeploymentMessage | SocketEnvelope<DeploymentMessage>) => {
        const message = unwrapMessage(payload)
        if (message === null) return
        if (targetKind !== "deployment" || message.deploymentId !== targetId) return
        sink.ordered(
            message.updatedAt,
            {
                kind: "deployment",
                id: message.deploymentId,
                status: message.status,
                reason: message.reason,
                updatedAt: message.updatedAt,
            },
            message.sequence,
        )
    })
    socket.on("order.fulfilling", (payload: OrderMessage | SocketEnvelope<OrderMessage>) => {
        const message = unwrapMessage(payload)
        if (message === null) return
        if (targetKind !== "order" || message.orderId !== targetId) return
        sink.unsequenced({ kind: "order", id: message.orderId, status: message.status })
    })
    socket.on("instance.operation", (payload: InstanceOperationMessage | SocketEnvelope<InstanceOperationMessage>) => {
        const message = unwrapMessage(payload)
        if (message === null) return
        if (targetKind !== "instance" || message.instanceId !== targetId) return
        sink.ordered(message.observedAt, {
            kind: "instance-operation",
            id: message.operationId,
            instanceId: message.instanceId,
            phase: message.phase,
            componentKey: message.componentKey ?? null,
            reason: message.reason ?? null,
            updatedAt: message.observedAt,
        })
    })
}
