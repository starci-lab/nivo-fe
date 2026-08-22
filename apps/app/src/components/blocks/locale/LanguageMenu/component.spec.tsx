import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { LanguageMenuBase } from "./component"

describe("LanguageMenuBase", () => {
    afterEach(cleanup)

    it("reports the selected locale without owning routing", async () => {
        const select = vi.fn()
        render(
            <LanguageMenuBase
                props={{
                    label: "Language",
                    selectedLocale: "en",
                    options: [{ id: "vi", label: "Vietnamese" }, { id: "en", label: "English" }],
                }}
                on={{ select }}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Language" }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "Vietnamese" }))
        expect(select).toHaveBeenCalledWith("vi")
    })
})
