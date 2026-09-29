import { describe, expect, it } from "vitest"

import {
    isAgentosRuntimeRecord,
    isAgentosRuntimeValue,
    isAgentosRuntimeWidgetNode,
} from "./agentos-runtime-tree.guards"

describe("isAgentosRuntimeValue", () => {
    it("admits every JSON shape and refuses a non-JSON value", () => {
        expect(isAgentosRuntimeValue({ a: [1, "x", null, { b: true }] })).toBe(true)
        expect(isAgentosRuntimeValue({ rows: ["one", 2, true, null] })).toBe(true)
        expect(isAgentosRuntimeValue(undefined)).toBe(false)
        expect(isAgentosRuntimeValue({ nested: [undefined] })).toBe(false)
        expect(isAgentosRuntimeValue(Number.POSITIVE_INFINITY)).toBe(false)
        expect(isAgentosRuntimeValue(() => 1)).toBe(false)
    })
})

describe("isAgentosRuntimeRecord", () => {
    it("admits a record of runtime values and refuses a poisoned entry", () => {
        expect(isAgentosRuntimeRecord({ a: 1, b: [null] })).toBe(true)
        expect(isAgentosRuntimeRecord({ rows: ["one", 2] })).toBe(true)
        expect(isAgentosRuntimeRecord({ a: undefined })).toBe(false)
        expect(isAgentosRuntimeRecord(["not", "an object"])).toBe(false)
        expect(isAgentosRuntimeRecord([1])).toBe(false)
    })
})

describe("isAgentosRuntimeWidgetNode", () => {
    it("admits a nested widget tree and refuses a malformed child", () => {
        expect(
            isAgentosRuntimeWidgetNode({
                component: "panel",
                version: "1",
                props: {},
                children: [{ component: "text", version: "1", props: { body: "hi" } }],
            }),
        ).toBe(true)
        expect(isAgentosRuntimeWidgetNode({ component: "panel", version: "1" })).toBe(false)
        expect(
            isAgentosRuntimeWidgetNode({
                component: "panel",
                version: "1",
                props: {},
                children: [{ component: "text" }],
            }),
        ).toBe(false)
    })
})
