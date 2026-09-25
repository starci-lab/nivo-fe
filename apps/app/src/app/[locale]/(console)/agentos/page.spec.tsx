import { describe, expect, it } from "vitest"
import AgentOSRoute from "./page"

describe("AgentOSRoute", () => {
    it("mounts the AgentOS dashboard route with its exact mode",
        () => {
            expect(AgentOSRoute()).toEqual(expect.objectContaining({
                props: expect.objectContaining({
                    mode: "dashboard",
                }),
            }))
        })
})