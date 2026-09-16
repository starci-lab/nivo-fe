import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { GroupChatPageBase, type GroupChatPageProps } from "./component";

const labels: GroupChatPageProps["labels"] = {
  title: "Group chat",
  description: "Humans and agents",
  groups: "Conversations",
  groupsEmpty: "No groups",
  conversation: "Messages",
  unavailable: "Unavailable",
  unavailableHint: "Permissions are not ready",
  composer: "Message",
  composerPlaceholder: "Choose a group",
  members: "Members",
  membersEmpty: "No members",
  openMembers: "Open members",
  closeMembers: "Close members"
};

describe("GroupChatPageBase", () => {
  beforeAll(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }) as unknown as typeof window.matchMedia;
  });

  it("renders the accepted chat anatomy while unsupported actions fail closed", () => {
    const changeRailOpen = vi.fn();
    const { container } = render(<GroupChatPageBase isRailOpen={false} on={{ changeRailOpen }} labels={labels} />);
    expect(screen.getByRole("heading", { name: "Group chat" })).toBeInTheDocument();
    expect(screen.getByText("Permissions are not ready")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeDisabled();
    expect(container.querySelector('[data-grammar-chat-workspace="true"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open members" }));
    expect(changeRailOpen).toHaveBeenCalledWith(true);
  });
});
