/**
 * Transport layer of one provisioning realtime subscription: the
 * wire-message shapes each room emits and the pure folds that read them. The React binding
 * that subscribes lives in `@/hooks/realtime/useProvisioningRealtime`.
 */

/** One `workspace.status` wire message from the provisioning room. */
export type WorkspaceMessage = {
    readonly eventId?: string
    readonly sequence?: number
    readonly workspaceId: string
    readonly status: string
    readonly reason: string | null
    readonly updatedAt: string
}

/** One `workspace.runtime` wire message carrying an instance runtime probe. */
export type WorkspaceRuntimeMessage = {
    readonly sequence: number
    readonly workspaceId: string
    readonly instanceId: string
    readonly fingerprint: string
    readonly probeStatus: string
    readonly observedAt: string
}

/** One `deployment.status` wire message from the provisioning room. */
export type DeploymentMessage = {
    readonly eventId?: string
    readonly sequence?: number
    readonly deploymentId: string
    readonly status: string
    readonly reason: string | null
    readonly updatedAt: string
}

/** One `order.fulfilling` wire message from the provisioning room. */
export type OrderMessage = { readonly orderId: string; readonly status: string }

/** The success/error envelope a provisioning socket reply may wrap its payload in. */
export type SocketEnvelope<T> =
    | { readonly success: true; readonly data: T }
    | { readonly success: false; readonly error: string; readonly message: string }

/** One `provisioning.saga.status` wire message describing a saga step transition. */
export type SagaMessage = {
    readonly eventId: string
    readonly sequence: number
    readonly sagaId: string
    readonly resourceKind: string
    readonly resourceId: string
    readonly status: string
    readonly direction: "forward" | "compensating"
    readonly stepKey: string | null
    readonly reason: string | null
    readonly updatedAt: string
}

/** One `instance.operation` wire message from the provisioning room. */
export type InstanceOperationMessage = {
    readonly operationId: string
    readonly instanceId: string
    readonly phase: string
    readonly componentKey?: string
    readonly reason?: string | null
    readonly observedAt: string
}

/** Unwraps a socket payload that may arrive bare or inside a `SocketEnvelope`. */
export const unwrapMessage = <T>(payload: T | SocketEnvelope<T>): T | null => {
    if (typeof payload !== "object" || payload === null || !("success" in payload)) return payload
    return payload.success ? payload.data : null
}

/** Folds a saga wire status into the status the affected resource should display. */
export const terminalSagaStatus = (status: string, readyStatus: string): string => {
    if (status === "completed") return readyStatus
    if (status === "compensated" || status === "compensation_failed") return "failed"
    return status
}
