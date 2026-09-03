import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ModuleRouteShellBlock } from "./index"

describe("ModuleRouteShellBlock", () => {
    it("uses the human kind heading while retaining a machine key", () => {
        const html = renderToStaticMarkup(<ModuleRouteShellBlock workspaceLabel="Workspace" moduleName="custom:1234567890abcdef1234567890" moduleKind="generic-agent" lifecycleLabel="ready" contextVersion="not applied" channelLabel="Channel not connected" controllerLabel="Controller healthy" activeView="setup" content={() => <div>Setup</div>} contentProps={{}} onBackToModules={() => undefined} onNavigate={() => undefined} />)
        expect(html).toContain("Generic agent")
        expect(html).toContain("custom:1234567890abcdef1234567890")
    })
})
