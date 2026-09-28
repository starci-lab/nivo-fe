import { renderToStaticMarkup } from "react-dom/server"
import { describe, it } from "vitest"
import { AgentOSModuleProfileBase } from "./component"

describe("AgentOSModuleProfileBase", () => {
    it("draws interview, profile, and specification states", () => {
        renderToStaticMarkup(<AgentOSModuleProfileBase
            props={{
                loading: true,
                refused: false,
                labels: { title: "Profile", progress: "Completeness", missing: "Missing: {fields}", refused: "Unavailable" }
            }}
        />)
    })
})
