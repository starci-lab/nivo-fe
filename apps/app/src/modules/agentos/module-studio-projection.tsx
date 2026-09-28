"use client";

import { createContext, type ReactNode } from "react";
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

/** The page-scoped studio projection context consumed by its hook under `src/hooks/agentos`. */
export const AgentOSModuleStudioProjectionContext = createContext<AgentOSModuleStudioProjection | null>(null);

/** Provide one studio query result without coupling lower blocks to a page module. */
export const AgentOSModuleStudioProjectionProvider = (props: AgentOSModuleStudioProjectionProviderProps) => (
  <AgentOSModuleStudioProjectionContext.Provider value={props.value}>
    {props.children}
  </AgentOSModuleStudioProjectionContext.Provider>
);
