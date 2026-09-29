import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "../../../messages/en.json"
import TrustPage from "."

describe("TrustPage", () => {
    it("preserves the seven-stage Trust progression without invented security evidence", () => {
        const { container } = render(<TrustPage />)
        const html = container.innerHTML
        const anchors = [
            "future-worth-earning",
            "trust-starts-small",
            "human-ai-governance",
            "evidence-before-scale",
            "transformation-journey",
            "what-becomes-possible",
            "truth-before-promise",
        ]
        let previousIndex = -1
        for (const anchor of anchors) {
            const currentIndex = html.indexOf(`id="${anchor}"`)
            expect(currentIndex).toBeGreaterThan(previousIndex)
            previousIndex = currentIndex
        }
        expect(html).toContain("Autonomy must be earned")
        expect(html).not.toContain("enterprise-grade")
        expect(screen.getByText(en.explore.trust.governance.noticeBody)).toBeInTheDocument()
    })
})
