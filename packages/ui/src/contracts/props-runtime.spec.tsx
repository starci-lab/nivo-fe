import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "./props"

describe("contract component helpers", () => {
    it("brands callable contract components and slot components", () => {
        const callable = defineContractComponent("inline-action-run", () => "content")
        const slots = defineContractComponent("inline-action-run", { action: [defineLeafComponent("button", {}, () => null)] })
        expect(callable.kind).toBe("component")
        expect(callable.meta.contract).toBe("inline-action-run")
        expect(slots.kind).toBe("slots")
        expect(slots.meta.contract).toBe("inline-action-run")
    })

    it("creates a projection that evaluates only when requested", () => {
        const render = vi.fn(() => "projected")
        const projection = defineContractProjection("inline-action-run", render)
        expect(projection.kind).toBe("projection")
        expect(render).not.toHaveBeenCalled()
        const { project: Project } = projection
        expect(renderToStaticMarkup(<Project />)).toBe("projected")
        expect(render).toHaveBeenCalledTimes(1)
    })
})
