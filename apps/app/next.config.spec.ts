import { describe, expect, it } from "vitest"
import { legacyRedirects } from "./next.config"

describe("legacy route redirects", () => {
    it("keeps locale prefixes canonical for old app creation paths", async () => {
        await expect(legacyRedirects()).resolves.toEqual([
            { source: "/apps/new/:templateKey", destination: "/apps/create/:templateKey", permanent: false },
            { source: "/agentos/create", destination: "/agentos/workspaces/new", permanent: false },
            { source: "/vi/apps/new/:templateKey", destination: "/apps/create/:templateKey", permanent: false },
            { source: "/vi/agentos/create", destination: "/agentos/workspaces/new", permanent: false },
            { source: "/en/apps/new/:templateKey", destination: "/en/apps/create/:templateKey", permanent: false },
            { source: "/en/agentos/create", destination: "/en/agentos/workspaces/new", permanent: false },
        ])
    })
})
