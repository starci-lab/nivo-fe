import { fireEvent, render, screen } from "@testing-library/react"
import { createTranslator } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import { OperateSurface } from "."
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import type { OperateSurfaceProps } from "../../../../modules/agentos/module-page/surface-types"
import { TIME_ZONE } from "../../../../modules/i18n/config"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
        onError: (error) => {
            throw error
        },
    }),
)
const props: OperateSurfaceProps = {
    installationId: "installation-1",
    kindKey: "accounting",
    workbenchKey: "accounting-sheet",
    workbenchVersion: "1.0.0",
    sessions: [],
    selectedSessionId: null,
    selectedSessionTitle: "Primary Operations",
    messages: [],
    tasks: [],
    events: [],
    operationTarget: "internal-chat",
    isChatbot: false,
    chatbotWorkbench: null,
    chatbotRefusedCode: null,
    supportInbox: { selectedConversationId: null, pending: false },
    pending: false,
    refused: false,
    onSelectSession: vi.fn(),
    onSelectTarget: vi.fn(),
    onCreateSession: vi.fn(),
    onSend: vi.fn(),
    onWidgetAction: vi.fn(),
    onSelectSupportConversation: vi.fn(),
    onConnectChatbotZalo: vi.fn(),
    onSetChatbotHandoff: vi.fn(),
    onResolveChatbotHandoff: vi.fn(),
    onReconcileChatbotDelivery: vi.fn(),
}

describe("OperateSurface", () => {
    it.each([
        ["internal-chat", "internal-workbench"],
        ["internal-workbench", "internal-chat"],
    ] as const)("forwards %s selection to %s", (operationTarget, destination) => {
        const onSelectTarget = vi.fn()
        render(
            <OperateSurface copy={copy} {...props} operationTarget={operationTarget} onSelectTarget={onSelectTarget} />,
        )

        fireEvent.click(
            screen.getByRole("tab", {
                name: destination === "internal-chat" ? copy.operate.chat : copy.operate.workbench,
            }),
        )

        expect(onSelectTarget).toHaveBeenCalledExactlyOnceWith(destination)
    })
})
