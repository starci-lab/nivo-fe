"use client";

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AgentOSWorkspacePageBase, type AgentOSWorkspacePageState } from "./component";

/** Exact workspace route identity connected by the page. */
export type AgentOSWorkspacePageProps = {
  readonly workspaceId: string;
};
const workspacePageStates = new Set<AgentOSWorkspacePageState>(["overview", "solutions", "ai-knowledge", "applications", "infrastructure", "operations", "access"]);

/** Own the tab-driven page architecture and delegate the aggregate lifecycle to its connected block. */
export const AgentOSWorkspacePage = (props: AgentOSWorkspacePageProps) => {
  const {
    workspaceId
  }: AgentOSWorkspacePageProps = props;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedView = searchParams.get("view");
  const pageState: AgentOSWorkspacePageState = selectedView !== null && workspacePageStates.has(selectedView as AgentOSWorkspacePageState) ? selectedView as AgentOSWorkspacePageState : "overview";
  const selectPageState = (nextState: AgentOSWorkspacePageState) => {
    const next = new URLSearchParams(searchParams.toString());
    if (nextState === "overview") next.delete("view");else next.set("view", nextState);
    const query = next.toString();
    router.push(query.length === 0 ? pathname : `${pathname}?${query}`);
  };
  return <AgentOSWorkspacePageBase workspaceId={workspaceId} pageState={pageState} onSelectPageState={selectPageState} />;
};
