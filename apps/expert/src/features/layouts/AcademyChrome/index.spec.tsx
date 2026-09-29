import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AcademyChrome } from "./index"

describe("academy chrome", () => {
    it("emits the document ground theme and preserves routed content", () => {
        const html = render(<AcademyChrome content={<main>Academy content</main>} />).container.innerHTML
        expect(html).toContain("background-color: var(--background)")
        expect(html).toContain("Academy content")
    })
})
