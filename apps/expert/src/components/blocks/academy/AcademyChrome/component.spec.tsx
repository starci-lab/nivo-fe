import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AcademyChromeBase } from "./component"

const draw = () =>
    render(
        <AcademyChromeBase
            state={{ content: <p>Academy content</p>, toolbar: <button type="button">Theme</button> }}
            props={{ themeCss: "body {}", customCss: null, skipLabel: "Skip to content" }}
        />,
    )

describe("AcademyChromeBase", () => {
    it("opens with the skip link, the first focusable element, targeting the one main landmark", () => {
        draw()

        const skip = screen.getByRole("link", { name: "Skip to content" })
        const main = screen.getByRole("main")
        expect(skip).toHaveAttribute("href", "#main-content")
        expect(main).toHaveAttribute("id", "main-content")
        expect(main).toHaveAttribute("tabindex", "-1")
        expect(main).toHaveTextContent("Academy content")
        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(skip.compareDocumentPosition(screen.getByRole("button", { name: "Theme" }))).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        )
    })
})
