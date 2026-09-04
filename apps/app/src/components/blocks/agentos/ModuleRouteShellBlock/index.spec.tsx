import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ModuleRouteShellBlock } from "./index"

afterEach(cleanup)

describe("ModuleRouteShellBlock", () => {
    it("returns to Modules while retaining the human kind heading and full machine key", () => {
        const onBackToModules = vi.fn()
        render(<ModuleRouteShellBlock workspaceLabel="Workspace with a long identity" moduleName="custom:1234567890abcdef1234567890" moduleKind="generic-agent" lifecycleLabel="ready" contextVersion="not applied" channelLabel="Channel not connected" controllerLabel="Controller healthy" activeView="setup" content={() => <div>Setup body</div>} contentProps={{}} onBackToModules={onBackToModules} onNavigate={() => undefined} />)
        expect(screen.getByRole("heading", { level: 1, name: "Generic agent" })).toBeTruthy()
        expect(screen.getByText("custom:1234567890abcdef1234567890")).toBeTruthy()
        expect(screen.getByText("Setup body")).toBeTruthy()
        fireEvent.click(screen.getByRole("link", { name: "Modules" }))
        expect(onBackToModules).toHaveBeenCalledTimes(1)
    })
})
