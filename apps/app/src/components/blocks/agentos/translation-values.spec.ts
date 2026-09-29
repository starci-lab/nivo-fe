import { describe, expect, it } from "vitest"
import { translationValuesForNextIntl } from "./translation-values"

describe("next-intl translation values", () => {
    it("omits undefined optional entries and keeps defined placeholders", () => {
        expect(translationValuesForNextIntl({ count: 2, name: "Nivo", optional: undefined })).toEqual({
            count: 2,
            name: "Nivo",
        })
    })

    it("preserves an absent values object", () => {
        expect(translationValuesForNextIntl(undefined)).toBeUndefined()
    })
})
