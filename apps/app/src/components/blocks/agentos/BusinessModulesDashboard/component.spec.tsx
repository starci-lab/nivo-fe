import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BusinessModulesDashboardBase, type BusinessModulesDashboardLabels } from "./component";

const labels: BusinessModulesDashboardLabels = {
  workspaceLabel: "Operating workspace",
  workspaceReference: id => `Workspace ${id}`,
  loading: "Loading workspace",
  empty: "No workspace",
  create: "Choose package",
  unavailable: "Workspace unavailable",
  unavailableHint: "No workspace was selected automatically",
  retry: "Retry"
};

type StubModuleCenterProps = {
  readonly workspaceId: string;
  readonly layout: "ledger";
};

const StubModuleCenter = (props: StubModuleCenterProps) => <div>{`Module ledger ${props.workspaceId} ${props.layout}`}</div>;

describe("BusinessModulesDashboardBase", () => {
  it("keeps the empty and ambiguous states actionable without drawing a workspace list", () => {
    const create = vi.fn();
    const retry = vi.fn();
    const view = render(<BusinessModulesDashboardBase state="empty" labels={labels} onCreate={create} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose package" }));
    expect(create).toHaveBeenCalledOnce();
    view.rerender(<BusinessModulesDashboardBase state="refused" labels={labels} onRetry={retry} />);
    expect(screen.getByText("No workspace was selected automatically")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("shows exactly one resolved workspace beside its module content", () => {
    render(<BusinessModulesDashboardBase
      state="ready"
      labels={labels}
      workspace={{ id: "workspace-1", name: "Primary workspace", status: "active" }}
      moduleCenter={StubModuleCenter}
    />);
    expect(screen.getByText("Primary workspace")).toBeInTheDocument();
    expect(screen.getByText("Workspace workspace-1")).toBeInTheDocument();
    expect(screen.getByText("Module ledger workspace-1 ledger")).toBeInTheDocument();
  });
});
