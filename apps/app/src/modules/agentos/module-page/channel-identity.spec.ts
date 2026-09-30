import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"
import enMessages from "../../../messages/en.json"
import { TIME_ZONE } from "@/modules/i18n"
import type { AgentWorkspaceControlCenter } from "../../api/agentos-workspaces"
import type { NivoQueryAnswer } from "../../query"
import { buildModulePageCopy } from "../module-page-copy"
import { channelLabelFor, controllerHostnameForWorkspace } from "./channel-identity"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
    }),
)

const controlCenterAnswer = (
    workspaceId: string,
    hostname: string | null,
): NivoQueryAnswer<AgentWorkspaceControlCenter> => ({
    ok: true,
    data: {
        workspace: { id: workspaceId, name: "WS", status: "ready", externalWorkspaceRef: null },
        instance:
            hostname === null
                ? null
                : {
                      id: "inst-1",
                      name: "instance",
                      hostname,
                      status: "running",
                      chartVersion: "1",
                      ramMb: 512,
                      vcpu: 1,
                      planCode: null,
                      planRamGb: null,
                      planVcpu: null,
                  },
        apps: [],
        runtime: null,
    },
})

describe("channelLabelFor", () => {
    it("reads a disconnected, telegram, and generic channel ref", () => {
        expect(channelLabelFor(null, copy)).toBe(copy.shell.channelDisconnected)
        expect(channelLabelFor("telegram:acc-1", copy)).toBe(copy.shell.telegramConnected)
        expect(channelLabelFor("zalo:acc-2", copy)).toBe(copy.shell.channelConnected)
    })
})

describe("controllerHostnameForWorkspace", () => {
    it("names the controller of the owned workspace only", () => {
        expect(controllerHostnameForWorkspace(controlCenterAnswer("ws", "box-1.internal"), "ws")).toBe(
            "box-1.internal",
        )
        expect(controllerHostnameForWorkspace(controlCenterAnswer("ws", null), "ws")).toBeNull()
        expect(controllerHostnameForWorkspace(controlCenterAnswer("other", "box-2"), "ws")).toBeNull()
        expect(
            controllerHostnameForWorkspace(
                { ok: false, kind: "unavailable", code: "", reason: "", retryable: true },
                "ws",
            ),
        ).toBeNull()
        expect(controllerHostnameForWorkspace(undefined, "ws")).toBeNull()
    })
})
