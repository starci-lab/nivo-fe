import type { Outcome } from "@nivo/api"
import type { CollabGatewayRequest } from "./gateway"
import type { CollabOperation } from "./operation"

/** Credential and client request passed to the bound Collab transport. */
type CollabTransportCall = {
    readonly accessToken: string
    readonly request: CollabGatewayRequest
}

/** The result record extracted after the generated operation response was narrowed. */
export type CollabServed = {
    readonly op: CollabOperation
    readonly result: Record<string, unknown>
}

/** How one tagged member request travels; the app binds exactly one implementation. */
export type CollabTransport = (call: CollabTransportCall) => Promise<Outcome<CollabServed>>
