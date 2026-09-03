import { describe, expect, it } from "vitest"
import { INFRASTRUCTURE_SUMMARY_FACT_COLUMN_CLASS_NAME, INFRASTRUCTURE_SUMMARY_FACT_ROW_CLASS_NAME } from "./classNames"

describe("infrastructure summary class strings", () => {
    it("lets a maximum-length DNS label shrink and break inside a narrow rail", () => {
        const column = String(INFRASTRUCTURE_SUMMARY_FACT_COLUMN_CLASS_NAME).split(" ")
        expect(column).toContain("min-w-0")
        expect(column).toContain("flex-1")
        expect(column).toContain("break-all")
    })

    it("lets the fact row wrap rather than overflow its rail", () => {
        const row = String(INFRASTRUCTURE_SUMMARY_FACT_ROW_CLASS_NAME).split(" ")
        expect(row).toContain("min-w-0")
        expect(row).toContain("flex-wrap")
    })
})
