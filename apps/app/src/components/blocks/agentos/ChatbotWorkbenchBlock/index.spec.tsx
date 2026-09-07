import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatbotWorkbenchBlock, type ChatbotWorkbenchBlockCopy } from ".";

const copy: ChatbotWorkbenchBlockCopy = {
  title: "Chatbot workbench", installation: "Installation", approvedVersion: version => `Approved v${version}`,
  noApprovedVersion: "No approved context", channels: "Channels", noChannels: "No channel connected", connectZalo: "Connect Zalo",
  conversations: "Conversations", noConversations: "No conversations", selectConversation: "Select a conversation", automated: "Automated",
  humanHandoff: "Human handoff", requestHandoff: "Take over", resolveHandoff: "Return to automation", messages: "Messages", noMessages: "No messages",
  pending: "Waiting for confirmed readback", refused: "Could not load", permissionDenied: "Permission denied", ambiguous: "Delivery is ambiguous",
  markDelivered: "Mark delivered", markFailed: "Mark failed", recorded: "Recorded only", delivered: "Delivered", failed: "Failed"
};

const workbench = {
  installationId: "chatbot-1", lifecycleState: "active", approvedVersion: 3,
  channels: [{ id: "channel-1", installationId: "chatbot-1", provider: "zalo", accountRef: "oa:NIVO", state: "active", credentialRef: "sealed:1" }],
  conversations: [{ id: "conversation-1", installationId: "chatbot-1", participantRef: "customer-1", handoffState: "human", authorityEpoch: 2, approvedVersion: 3, lastMessageAt: "2026-09-06T00:00:00.000Z" }],
  messages: [{ id: "message-1", conversationId: "conversation-1", direction: "outbound", sequence: "1", body: "Xin chào", deliveryState: "ambiguous", providerOutboxId: "outbox-1", failureCode: null, occurredAt: "2026-09-06T00:00:00.000Z" }]
} as const;

describe("ChatbotWorkbenchBlock", () => {
  it("keeps installation identity, handoff and ambiguous delivery distinct", () => {
    const resolve = vi.fn(); const reconcile = vi.fn();
    render(<ChatbotWorkbenchBlock installationId="chatbot-1" workbench={workbench} selectedConversationId="conversation-1" pending={false} refusedCode={null} copy={copy} onSelectConversation={() => undefined} onConnectZalo={() => undefined} onSetHandoff={() => undefined} onResolveHandoff={resolve} onReconcile={reconcile} />);
    expect(screen.getByText("Installation: chatbot-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /customer-1.*Human handoff/u })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Return to automation" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark delivered" }));
    expect(resolve).toHaveBeenCalledWith("conversation-1");
    expect(reconcile).toHaveBeenCalledWith("outbox-1", true);
  });

  it("renders empty and permission states with lawful recovery", () => {
    const connect = vi.fn();
    render(<ChatbotWorkbenchBlock installationId="chatbot-2" workbench={{ ...workbench, installationId: "chatbot-2", approvedVersion: null, channels: [], conversations: [], messages: [] }} selectedConversationId={null} pending={false} refusedCode="WORKSPACE_CONTROLLER_REFUSED" copy={copy} onSelectConversation={() => undefined} onConnectZalo={connect} onSetHandoff={() => undefined} onResolveHandoff={() => undefined} onReconcile={() => undefined} />);
    expect(screen.getByText("Permission denied")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Connect Zalo" }));
    expect(connect).toHaveBeenCalledOnce();
  });
});
