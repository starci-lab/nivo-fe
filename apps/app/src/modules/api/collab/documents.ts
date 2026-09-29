import { COLLAB_GATEWAY_COMMAND_FIELD, COLLAB_GATEWAY_READ_FIELD } from "./fields"
import { COLLAB_READ_OPERATIONS } from "./operations"
import type { CollabOperation } from "./types"

/** Builds the tagged GraphQL document and field for one Collab operation. */
export const collabGatewayDocument = (op: CollabOperation) => {
    const field = COLLAB_READ_OPERATIONS.has(op) ? COLLAB_GATEWAY_READ_FIELD : COLLAB_GATEWAY_COMMAND_FIELD
    const document = COLLAB_READ_OPERATIONS.has(op)
        ? "query CollabGateway($request: CollabGatewayRequest!) { " + field + "(request: $request) }"
        : "mutation CollabGateway($request: CollabGatewayRequest!) { " + field + "(request: $request) }"
    return { field, document }
}
