import { SalesHandoffBlock } from "@/components/blocks/agentos/SalesHandoffBlock";
import type { AgentOSSolutionModuleRouteProps } from "../../../page";

/** The handoff surface's own route: it mounts the surface for the installation the route names. */
const AgentOSModuleOperateSalesHandoffsRoute = async ({ params }: AgentOSSolutionModuleRouteProps) => {
  const { workspaceId, installationId } = await params;
  return <SalesHandoffBlock workspaceId={workspaceId} installationId={installationId} />;
};

export default AgentOSModuleOperateSalesHandoffsRoute;