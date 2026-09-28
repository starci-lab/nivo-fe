import { describe, expect, it } from "vitest"
import Page from "./page"

describe("Page",
    () => {
        it("forwards workspace and module identities into the module pages",
            async () => {
                await expect(Page({
                    params: Promise.resolve({
                        workspaceId: "workspace-1",
                    }),
                })).resolves.toEqual(expect.objectContaining({
                    props: expect.objectContaining({
                        workspaceId: "workspace-1",
                    }),
                }))
            })
    })