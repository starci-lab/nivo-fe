"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AgentosModuleStudio } from "@/modules/api/console";

/** One page-owned studio read shared by sibling connected blocks. */
export type AgentOSModuleStudioProjection = {
  readonly studio: AgentosModuleStudio | null | undefined;
  readonly refresh: () => Promise<void>;
};

/** Values and content owned by the studio projection boundary. */
export type AgentOSModuleStudioProjectionProviderProps = {
  readonly value: AgentOSModuleStudioProjection;
  readonly children: ReactNode;
};

const AgentOSModuleStudioProjectionContext = createContext<AgentOSModuleStudioProjection | null>(null);

/** Provide one studio query result without coupling lower blocks to a page module. */
export const AgentOSModuleStudioProjectionProvider = (props: AgentOSModuleStudioProjectionProviderProps) => (
  <AgentOSModuleStudioProjectionContext.Provider value={props.value}>
    {props.children}
  </AgentOSModuleStudioProjectionContext.Provider>
);

/** Read the shared studio projection or fail when its owning page boundary is absent. */
export const useAgentOSModuleStudioProjection = () => {
  const projection = useContext(AgentOSModuleStudioProjectionContext);
  if (projection === null) throw new Error("AgentOSModuleStudioProjectionProvider is required");
  return projection;
};
