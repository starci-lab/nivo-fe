import { renderToStaticMarkup } from "react-dom/server"
import { describe, it, vi } from "vitest"
import { AgentOSModuleSpecificationBase } from "./component"

describe("AgentOSModuleSpecificationBase", () => {
    it("draws interview, profile, and specification states", () => {
        renderToStaticMarkup(<AgentOSModuleSpecificationBase
            state="loading"
            acknowledged={false}
            pending={false}
            labels={{ title: "Specification", refused: "Unavailable", incomplete: "Finish the interview", version: "Version {version}", acknowledge: "I approve version {version}", publish: "Publish", publishing: "Publishing", published: "Published" }}
            onAcknowledge={vi.fn()}
            onPublish={vi.fn()}
        />)
    })
})