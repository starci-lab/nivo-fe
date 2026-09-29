import { describe, expect, it } from "vitest"

import {
    salesOperationAddress
} from "./index"
import { salesSpec } from "./spec-helpers"
const { SCOPE, OPERATIONS_PATH, CORE_ORIGIN } = salesSpec

describe("salesOperationAddress", () => {
    it("builds the one registered address of each operation from the installation coordinates", () => {
        expect(salesOperationAddress(SCOPE, "sales.policy@1")).toBe(`${CORE_ORIGIN}${OPERATIONS_PATH}sales.policy@1`)
        expect(salesOperationAddress(SCOPE, "sales.recoverAction@1")).toBe(
            `${CORE_ORIGIN}${OPERATIONS_PATH}sales.recoverAction@1`,
        )
    })

    it("percent-encodes the caller-held coordinates", () => {
        expect(
            salesOperationAddress({ workspaceId: "a/b", instanceId: "c d", installationId: "e?f" }, "sales.handoff@1"),
        ).toBe(
            `${CORE_ORIGIN}/api/v1/agentos/workspaces/a%2Fb/instances/c%20d/installations/e%3Ff/operations/sales.handoff@1`,
        )
    })
})
