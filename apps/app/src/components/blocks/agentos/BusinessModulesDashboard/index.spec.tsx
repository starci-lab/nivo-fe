import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type TranslationValues = { readonly id?: string };
type MockModuleProps = { readonly workspaceId: string };

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutate: vi.fn(),
  query: { data: undefined as unknown, error: undefined as unknown, isValidating: false }
}));

vi.mock("next-intl", () => ({ useTranslations: () => (key: string, values?: TranslationValues) => values?.id === undefined ? key : `${key}:${values.id}` }));
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/hooks", () => ({ useQueryMyAgentWorkspacesSwr: () => ({ ...mocks.query, mutate: mocks.mutate }) }));
vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({ AgentOSSolutionModuleCenter: (props: MockModuleProps) => <div>modules:{props.workspaceId}</div> }));

import { BusinessModulesDashboard } from ".";

describe("BusinessModulesDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.data = undefined;
    mocks.query.error = undefined;
    mocks.query.isValidating = false;
  });

  it("uses the only workspace and never selects the first of several", () => {
    mocks.query.data = { ok: true, data: [{ id: "only", name: "Only", status: "active" }] };
    const view = render(<BusinessModulesDashboard />);
    expect(screen.getByText("modules:only")).toBeInTheDocument();
    mocks.query.data = { ok: true, data: [{ id: "first", name: "First", status: "active" }, { id: "second", name: "Second", status: "active" }] };
    view.rerender(<BusinessModulesDashboard />);
    expect(screen.queryByText("modules:first")).not.toBeInTheDocument();
    expect(screen.getByText("unavailableHint")).toBeInTheDocument();
  });

  it("routes an empty binding to package selection", () => {
    mocks.query.data = { ok: true, data: [] };
    render(<BusinessModulesDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "create" }));
    expect(mocks.push).toHaveBeenCalledWith("/agentos/create");
  });
});
