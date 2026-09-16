import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgentOSModuleStudioProjectionProvider, useAgentOSModuleStudioProjection } from "./module-studio-projection";

type ProjectionWrapperProps = { readonly children: React.ReactNode };

describe("useAgentOSModuleStudioProjection", () => {
  it("shares the page-owned projection with sibling connected blocks", () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const wrapper = (props: ProjectionWrapperProps) => (
      <AgentOSModuleStudioProjectionProvider value={{ studio: null, refresh }}>
        {props.children}
      </AgentOSModuleStudioProjectionProvider>
    );
    const { result } = renderHook(() => useAgentOSModuleStudioProjection(), { wrapper });
    expect(result.current).toEqual({ studio: null, refresh });
  });

  it("fails closed outside the page-owned boundary", () => {
    expect(() => renderHook(() => useAgentOSModuleStudioProjection())).toThrow("AgentOSModuleStudioProjectionProvider is required");
  });
});
