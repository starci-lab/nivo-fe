import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ContextVersionBlock, type ContextDraft } from "./index"

const draft: ContextDraft = { contextId: "context-1", setupSessionId: "setup-1", revision: 1, status: "completed", version: 1, digest: "a".repeat(64), summary: "Support context", facts: ["24/7 support"], gates: [{ key: "identity", label: "Business identity", passed: true }], exactTestPassed: true, isActive: false }

describe("ContextVersionBlock", () => {
    it("keeps Apply disabled until the existing immutable guard is ready", () => {
        const onApply = vi.fn()
        const html = renderToStaticMarkup(<ContextVersionBlock activeVersion={null} draft={{ ...draft, exactTestPassed: false }} pending={false} refused={false} onApply={onApply} />)
        expect(html).toContain("Required before Apply")
        expect(html).toContain("disabled")
        expect(onApply).not.toHaveBeenCalled()
    })
})
