import { describe, expect, it } from "vitest"

import { parseInstanceRows, parsePodStatusRow } from "./instances.guards"

describe("parseInstanceRows", () => {
    it("parses one well-formed row and refuses a malformed payload", () => {
        expect(
            parseInstanceRows([{ id: "i-1", appKey: "app", detailId: null, name: null, plan: null, ram: null, vcpu: 2, status: "running" }]),
        ).toHaveLength(1)
        expect(parseInstanceRows({})).toBeNull()
        expect(parseInstanceRows([{ id: "i-1" }])).toBeNull()
        expect(parseInstanceRows([{ id: "i-1", appKey: "app", detailId: null, name: null, plan: null, ram: null, vcpu: "two", status: "running" }])).toBeNull()
    })
})

describe("parsePodStatusRow", () => {
    it("parses one well-formed check and refuses a malformed payload", () => {
        expect(
            parsePodStatusRow({ reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: "ab12", checkedAt: "t" }),
        ).toEqual({ reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: "ab12", checkedAt: "t" })
        expect(parsePodStatusRow(null)).toBeNull()
        expect(parsePodStatusRow({ reachable: "yes", httpStatus: 200, tokenConfigured: true, tokenHint: null, checkedAt: "t" })).toBeNull()
    })
})
