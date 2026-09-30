import { fireEvent, render, screen } from "@testing-library/react"
import { createFormatter } from "next-intl"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { matchMediaFixture } from "@/test-support/mock-result"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { ChatbotWorkbenchBlockBase, type ChatbotWorkbenchBlockBaseCopy } from "./component"

const copy: ChatbotWorkbenchBlockBaseCopy = {
    title: "copy.title",
    installation: "copy.installation",
    channels: "copy.channels",
    noChannels: "copy.noChannels",
    connectZalo: "copy.connectZalo",
    conversations: "copy.conversations",
    openConversations: "copy.openConversations",
    closeConversations: "copy.closeConversations",
    noConversations: "copy.noConversations",
    selectConversation: "copy.selectConversation",
    selected: "copy.selected",
    automated: "copy.automated",
    handoffPending: "copy.handoffPending",
    humanOwned: "copy.humanOwned",
    returnPending: "copy.returnPending",
    requestHandoff: "copy.requestHandoff",
    resolveHandoff: "copy.resolveHandoff",
    messages: "copy.messages",
    noMessages: "copy.noMessages",
    pending: "copy.pending",
    refused: "copy.refused",
    actionRefused: "copy.actionRefused",
    permissionDenied: "copy.permissionDenied",
    ambiguous: "copy.ambiguous",
    markDelivered: "copy.markDelivered",
    markFailed: "copy.markFailed",
    recorded: "copy.recorded",
    deliveryQueued: "copy.deliveryQueued",
    deliveryPossibleStart: "copy.deliveryPossibleStart",
    providerAccepted: "copy.providerAccepted",
    delivered: "copy.delivered",
    read: "copy.read",
    deliveryUnknown: "copy.deliveryUnknown",
    terminalNotDelivered: "copy.terminalNotDelivered",
    failedBeforeStart: "copy.failedBeforeStart",
    cancelled: "copy.cancelled",
}

const format: Formatter = createFormatter({ locale: "en" })

const on = {
    selectConversation: vi.fn(),
    connectZalo: vi.fn(),
    setHandoff: vi.fn(),
    resolveHandoff: vi.fn(),
    reconcile: vi.fn(),
    setRailOpen: vi.fn(),
}

describe("ChatbotWorkbenchBlockBase", () => {
    beforeAll(() => {
        window.matchMedia = matchMediaFixture(false)
    })

    it("draws the resolved version line and asks for a conversation when none is selected", () => {
        render(
            <ChatbotWorkbenchBlockBase
                state={{ isRailOpen: false }}
                props={{
                    installationId: "chatbot-1",
                    workbench: null,
                    selectedConversationId: null,
                    pending: false,
                    refusedCode: null,
                    copy,
                    versionLabel: "Approved v3",
                    format: format,
                }}
                on={on}
            />,
        )

        expect(screen.getByText("Approved v3")).toBeInTheDocument()
        expect(screen.getAllByText("copy.selectConversation").length).toBeGreaterThan(0)
    })

    it("forwards the connect command from the empty channel rail", () => {
        render(
            <ChatbotWorkbenchBlockBase
                state={{ isRailOpen: true }}
                props={{
                    installationId: "chatbot-1",
                    workbench: null,
                    selectedConversationId: null,
                    pending: false,
                    refusedCode: null,
                    copy,
                    versionLabel: "No approved context",
                    format: format,
                }}
                on={on}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "copy.connectZalo" }))
        expect(on.connectZalo).toHaveBeenCalledOnce()
    })
})
