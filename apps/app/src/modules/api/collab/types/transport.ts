import type { Outcome } from '../../outcome'
import type { CollabGatewayRequest } from './gateway'
import type { CollabOperation } from './operation'

/** Credential and request passed to the bound Collab transport. */
export type CollabTransportCall = {
    readonly accessToken: string
    readonly request: CollabGatewayRequest
}

/** What the ingress answered for one request: the operation echoed and its own result record. */
export type CollabServed = {
    readonly op: CollabOperation
    readonly result: Record<string, unknown>
}

/** How one tagged member request travels; the app binds exactly one implementation. */
export type CollabTransport = (call: CollabTransportCall) => Promise<Outcome<CollabServed>>
