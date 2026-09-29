import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { ChatbotWorkbenchBlock, type ChatbotWorkbenchBlockCopy } from "."

const copy: ChatbotWorkbenchBlockCopy = {
    title: "Chatbot workbench",
    installation: "Installation",
    approvedVersion: (version) => `Approved v${version}`,
    noApprovedVersion: "No approved context",
    channels: "Channels",
    noChannels: "No channel connected",
    connectZalo: "Connect Zalo",
    conversations: "Conversations",
    openConversations: "Open channels and conversations",
    closeConversations: "Close channels and conversations",
    noConversations: "No conversations",
    selectConversation: "Select a conversation",
    selected: "Selected",
    automated: "Automated",
    handoffPending: "Handoff pending",
    humanOwned: "Human-owned",
    returnPending: "Return pending",
    requestHandoff: "Take over",
    resolveHandoff: "Return to automation",
    messages: "Messages",
    noMessages: "No messages",
    pending: "Waiting for confirmed readback",
    refused: "Could not load",
    actionRefused: "Provider action refused",
    permissionDenied: "Permission denied",
    ambiguous: "Delivery is ambiguous",
    markDelivered: "Mark delivered",
    markFailed: "Mark failed",
    recorded: "Recorded only",
    deliveryQueued: "Queued, provider attempt not started",
    deliveryPossibleStart: "Provider attempt may have started",
    providerAccepted: "Accepted by provider",
    delivered: "Reached the recipient",
    read: "Read by the recipient",
    deliveryUnknown: "Provider outcome unknown",
    terminalNotDelivered: "Proven not delivered",
    failedBeforeStart: "Failed before provider start",
    cancelled: "Cancelled before provider start",
}

const workbench = {
    installationId: "chatbot-1",
    lifecycleState: "active",
    approvedVersion: 3,
    channels: [
        {
            id: "channel-1",
            installationId: "chatbot-1",
            provider: "zalo",
            accountRef: "oa:NIVO",
            state: "active",
            credentialRef: "sealed:1",
        },
    ],
    conversations: [
        {
            id: "conversation-1",
            installationId: "chatbot-1",
            participantRef: "customer-1",
            handoffState: "human",
            authorityEpoch: 2,
            approvedVersion: 3,
            lastMessageAt: "2026-09-06T00:00:00.000Z",
        },
    ],
    messages: [
        {
            id: "message-1",
            conversationId: "conversation-1",
            direction: "outbound",
            sequence: "1",
            body: "Xin chào",
            deliveryState: "ambiguous",
            providerOutboxId: "outbox-1",
            failureCode: null,
            occurredAt: "2026-09-06T00:00:00.000Z",
        },
    ],
} as const

const action = () => undefined

/** Every delivery state the read model can carry, each with the state label it must print. */
type DeliveryStateRow = { readonly state: string; readonly failureCode: string | null; readonly label: string }
const deliveryStates: Array<DeliveryStateRow> = [
    { state: "received", failureCode: null, label: copy.recorded },
    { state: "draft", failureCode: null, label: copy.recorded },
    { state: "queued", failureCode: null, label: copy.deliveryQueued },
    { state: "sending", failureCode: null, label: copy.deliveryPossibleStart },
    { state: "sent", failureCode: null, label: copy.providerAccepted },
    { state: "provider-accepted", failureCode: null, label: copy.providerAccepted },
    { state: "delivered", failureCode: null, label: copy.delivered },
    { state: "read", failureCode: null, label: copy.read },
    { state: "ambiguous", failureCode: null, label: copy.deliveryUnknown },
    { state: "terminal-not-delivered", failureCode: null, label: copy.terminalNotDelivered },
    { state: "failed", failureCode: "PROVIDER_TERMINAL_NOT_DELIVERED", label: copy.terminalNotDelivered },
    { state: "failed", failureCode: "CHATBOT_PROVIDER_REFUSED", label: copy.failedBeforeStart },
    { state: "failed", failureCode: null, label: copy.failedBeforeStart },
    { state: "failed-before-start", failureCode: null, label: copy.failedBeforeStart },
    { state: "cancelled", failureCode: null, label: copy.cancelled },
    { state: "state-this-record-does-not-know", failureCode: null, label: copy.recorded },
]

/** The four control states the direction poses, including the command still in flight. */
type ControlStateRow = {
    readonly handoffState: "automated" | "human"
    readonly pending: boolean
    readonly label: string
}
const controlStates: Array<ControlStateRow> = [
    { handoffState: "automated", pending: false, label: copy.automated },
    { handoffState: "automated", pending: true, label: copy.handoffPending },
    { handoffState: "human", pending: false, label: copy.humanOwned },
    { handoffState: "human", pending: true, label: copy.returnPending },
]

const printed = (value: string) => screen.queryAllByText((content: string) => content.includes(value)).length > 0

const deliveryWorkbench = (state: string, failureCode: string | null) => ({
    ...workbench,
    conversations: [{ ...workbench.conversations[0], handoffState: "automated" }],
    messages: [{ ...workbench.messages[0], deliveryState: state, failureCode, providerOutboxId: null }],
})

const controlWorkbench = (handoffState: "automated" | "human") => ({
    ...workbench,
    conversations: [{ ...workbench.conversations[0], handoffState }],
    messages: [],
})

describe("ChatbotWorkbenchBlock", () => {
    beforeAll(() => {
        window.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }) as unknown as typeof window.matchMedia
    })

    it("keeps installation identity, handoff and ambiguous delivery distinct", () => {
        const resolve = vi.fn()
        const reconcile = vi.fn()
        render(
            <ChatbotWorkbenchBlock
                installationId="chatbot-1"
                workbench={workbench}
                selectedConversationId="conversation-1"
                pending={false}
                refusedCode={null}
                copy={copy}
                onSelectConversation={action}
                onConnectZalo={action}
                onSetHandoff={action}
                onResolveHandoff={resolve}
                onReconcile={reconcile}
            />,
        )
        expect(screen.getByText("Installation: chatbot-1")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /customer-1.*Human-owned.*Selected/u })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Return to automation" }))
        fireEvent.click(screen.getByRole("button", { name: "Mark delivered" }))
        expect(resolve).toHaveBeenCalledWith("conversation-1")
        expect(reconcile).toHaveBeenCalledWith("outbox-1", true)
    })

    it("renders empty and permission states with lawful recovery", () => {
        const connect = vi.fn()
        render(
            <ChatbotWorkbenchBlock
                installationId="chatbot-2"
                workbench={{
                    ...workbench,
                    installationId: "chatbot-2",
                    approvedVersion: null,
                    channels: [],
                    conversations: [],
                    messages: [],
                }}
                selectedConversationId={null}
                pending={false}
                refusedCode="WORKSPACE_CONTROLLER_REFUSED"
                copy={copy}
                onSelectConversation={action}
                onConnectZalo={connect}
                onSetHandoff={action}
                onResolveHandoff={action}
                onReconcile={action}
            />,
        )
        expect(screen.getByText("Permission denied")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Connect Zalo" }))
        expect(connect).toHaveBeenCalledOnce()
    })

    it("keeps the Zalo connection action available beside an active Telegram channel", () => {
        const connect = vi.fn()
        render(
            <ChatbotWorkbenchBlock
                installationId="chatbot-1"
                workbench={{
                    ...workbench,
                    channels: [{ ...workbench.channels[0], provider: "telegram", accountRef: "nivodeptrai_bot" }],
                }}
                selectedConversationId={null}
                pending={false}
                refusedCode={null}
                copy={copy}
                onSelectConversation={action}
                onConnectZalo={connect}
                onSetHandoff={action}
                onResolveHandoff={action}
                onReconcile={action}
            />,
        )

        expect(screen.getByText("nivodeptrai_bot")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Connect Zalo" }))
        expect(connect).toHaveBeenCalledOnce()
    })

    it("distinguishes provider action refusal from workbench read failure", () => {
        render(
            <ChatbotWorkbenchBlock
                installationId="chatbot-1"
                workbench={{ ...workbench, conversations: [], messages: [] }}
                selectedConversationId={null}
                pending={false}
                refusedCode="CHATBOT_ACTION_REFUSED"
                copy={copy}
                onSelectConversation={action}
                onConnectZalo={action}
                onSetHandoff={action}
                onResolveHandoff={action}
                onReconcile={action}
            />,
        )

        expect(screen.getByText("Provider action refused")).toBeInTheDocument()
        expect(screen.queryByText("Could not load")).not.toBeInTheDocument()
    })

    describe.each(deliveryStates)("delivery state $state (code $failureCode)", ({ state, failureCode, label }) => {
        it("prints its own catalog state, never another state's copy", () => {
            const view = render(
                <ChatbotWorkbenchBlock
                    installationId="chatbot-1"
                    workbench={deliveryWorkbench(state, failureCode)}
                    selectedConversationId="conversation-1"
                    pending={false}
                    refusedCode={null}
                    copy={copy}
                    onSelectConversation={action}
                    onConnectZalo={action}
                    onSetHandoff={action}
                    onResolveHandoff={action}
                    onReconcile={action}
                />,
            )

            expect(printed(label)).toBe(true)
            for (const other of new Set(deliveryStates.map((entry) => entry.label))) {
                if (other !== label)
                    expect(screen.queryAllByText((content: string) => content.includes(other))).toHaveLength(0)
            }
            view.unmount()
        })
    })

    describe.each(controlStates)(
        "control state $handoffState with pending=$pending",
        ({ handoffState, pending, label }) => {
            it("prints the in-flight control state and the durable control it does not replace", () => {
                const view = render(
                    <ChatbotWorkbenchBlock
                        installationId="chatbot-1"
                        workbench={controlWorkbench(handoffState)}
                        selectedConversationId="conversation-1"
                        pending={pending}
                        refusedCode={null}
                        copy={copy}
                        onSelectConversation={action}
                        onConnectZalo={action}
                        onSetHandoff={action}
                        onResolveHandoff={action}
                        onReconcile={action}
                    />,
                )

                expect(printed(label)).toBe(true)
                const durable = handoffState === "human" ? copy.humanOwned : copy.automated
                expect(printed(durable)).toBe(true)
                // The two in-flight states are mutually exclusive, and each is absent from the other durable axis.
                expect(printed(copy.handoffPending)).toBe(handoffState === "automated" && pending)
                expect(printed(copy.returnPending)).toBe(handoffState === "human" && pending)
                view.unmount()
            })
        },
    )
})
